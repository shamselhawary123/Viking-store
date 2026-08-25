import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

const migrationName = readdirSync("supabase/migrations").find((file) =>
  /variant_checkout_inventory\.sql$/.test(file),
);
const phase1MigrationName = readdirSync("supabase/migrations").find((file) =>
  /create_product_variants_phase1\.sql$/.test(file),
);
const sql = migrationName ? readFileSync(`supabase/migrations/${migrationName}`, "utf8") : "";
const phase1Sql = phase1MigrationName
  ? readFileSync(`supabase/migrations/${phase1MigrationName}`, "utf8")
  : "";
const productPage = readFileSync("pages/shop/[slug].vue", "utf8");
const adminOrders = readFileSync("pages/admin/orders.vue", "utf8");
const checkoutOrder = readFileSync("utils/checkoutOrder.ts", "utf8");

describe("variant checkout inventory migration", () => {
  it("adds nullable order_items.variant_id without rewriting historical rows", () => {
    assert.ok(migrationName, "expected Phase 4 variant checkout migration");
    assert.match(sql, /alter table public\.order_items\s+add column if not exists variant_id bigint/i);
    assert.match(sql, /conname = 'order_items_variant_id_fkey'[\s\S]*conrelid = 'public\.order_items'::regclass/i);
    assert.match(sql, /foreign key \(variant_id\)\s+references public\.product_variants\(id\)\s+on delete set null/i);
    assert.doesNotMatch(sql, /update public\.order_items\s+set variant_id/i);
    assert.doesNotMatch(sql, /alter table public\.order_items[\s\S]{0,120}alter column product_id[\s\S]{0,80}type/i);
  });

  it("uses auth.uid as the authoritative checkout ownership source", () => {
    assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
    assert.match(sql, /v_requested_guest boolean := coalesce\(\(p_customer->>'is_guest'\)::boolean, true\)/i);
    assert.match(
      sql,
      /if v_user_id is not null then[\s\S]*v_is_guest := false;[\s\S]*elsif v_requested_guest = false then[\s\S]*raise exception 'Please login first\.'[\s\S]*else[\s\S]*v_is_guest := true;/i,
    );
    assert.match(sql, /case when v_is_guest then null else v_user_id end/i);
    assert.doesNotMatch(sql, /p_customer\s*->>\s*'user_id'/i);
  });

  it("keeps parent price sync off stock-only variant updates", () => {
    assert.ok(phase1MigrationName, "expected Phase 1 variant migration");
    assert.match(
      phase1Sql,
      /create trigger sync_product_variant_parent_price\s+after insert or update of product_id, price, is_active or delete on public\.product_variants/i,
    );
    assert.doesNotMatch(phase1Sql, /update of[\s\S]*stock_quantity/i);
    assert.doesNotMatch(phase1Sql, /after insert or update or delete on public\.product_variants/i);
  });

  it("drops the legacy checkout helper chain before changing build_checkout_items return shape", () => {
    const helperDropBlock = sql.match(
      /drop function if exists public\.preview_checkout_coupon\(text, jsonb\);[\s\S]*?drop function if exists public\.build_checkout_items\(jsonb\);/i,
    )?.[0] || "";
    assert.match(helperDropBlock, /drop function if exists public\.preview_checkout_coupon\(text, jsonb\);/i);
    assert.match(helperDropBlock, /drop function if exists public\.create_checkout_order\(uuid, jsonb, jsonb, text\);/i);
    assert.match(helperDropBlock, /drop function if exists public\.calculate_checkout_coupon_discount\(public\.coupons, jsonb, uuid\);/i);
    assert.match(helperDropBlock, /drop function if exists public\.build_checkout_items\(jsonb\);/i);
    assert.doesNotMatch(helperDropBlock, /cascade/i);
    assert.ok(
      sql.indexOf("drop function if exists public.build_checkout_items(jsonb);") <
        sql.indexOf("create or replace function public.build_checkout_items"),
      "expected legacy helper drop before recreating changed return table",
    );
  });

  it("rebuilds checkout item pricing with authoritative variant prices", () => {
    assert.match(sql, /create or replace function public\.build_checkout_items/i);
    assert.match(sql, /variant_id bigint/i);
    assert.match(sql, /left join public\.product_variants variant/i);
    assert.match(sql, /when variant\.id is not null then variant\.price::numeric/i);
    assert.match(sql, /else product\.price::numeric/i);
    assert.match(sql, /product\.inventory_model = 'variants'/i);
    assert.match(sql, /variant\.is_active = true/i);
  });

  it("derives variant snapshots from trusted variant option rows", () => {
    assert.match(sql, /left join public\.product_colors variant_color/i);
    assert.match(sql, /left join public\.product_sizes variant_size/i);
    assert.match(sql, /left join lateral[\s\S]*from public\.product_images/i);
    assert.match(sql, /variant_image\.image_url/i);
    assert.match(sql, /when variant\.id is not null then coalesce\(variant_color\.name, ''\)/i);
    assert.match(sql, /when variant\.id is not null then coalesce\(variant_size\.size, ''\)/i);
    assert.match(sql, /when variant\.id is not null then coalesce\(variant_image\.image_url, product\.cover_image\)/i);
    assert.match(sql, /else coalesce\(item->>'image', product\.cover_image\)/i);
  });

  it("locks variant inventory deterministically and prevents duplicate-line oversell", () => {
    assert.match(sql, /for update/i);
    assert.match(sql, /order by variant_id/i);
    assert.match(sql, /sum\(item\.quantity\)/i);
    assert.match(sql, /v_available_stock < v_locked_item\.requested_quantity/i);
    assert.match(sql, /stock_quantity = stock_quantity - v_locked_item\.requested_quantity/i);
    assert.match(sql, /raise exception 'Not enough stock/i);
  });

  it("locks products and variants before authoritative subtotal and snapshots are built", () => {
    assert.match(sql, /v_product_id bigint/i);
    assert.match(sql, /for v_product_id in[\s\S]*order by product_id[\s\S]*for update/i);
    assert.match(sql, /for v_locked_item in[\s\S]*order by variant_id[\s\S]*for update/i);

    const createOrderBody = sql.match(/create or replace function public\.create_checkout_order[\s\S]*?end;\s*\$\$;/i)?.[0] || "";
    const productLockIndex = createOrderBody.indexOf("for v_product_id in");
    const variantLockIndex = createOrderBody.indexOf("for v_locked_item in");
    const subtotalIndex = createOrderBody.indexOf("into v_item_count, v_subtotal");
    const couponIndex = createOrderBody.indexOf("v_coupon_result := public.calculate_checkout_coupon_discount");
    const insertItemsIndex = createOrderBody.indexOf("insert into public.order_items");

    assert.ok(productLockIndex > -1, "expected deterministic product locks");
    assert.ok(variantLockIndex > productLockIndex, "expected variant locks after product locks");
    assert.ok(subtotalIndex > variantLockIndex, "expected subtotal after all inventory locks");
    assert.ok(couponIndex > subtotalIndex, "expected coupon calculation after locked subtotal");
    assert.ok(insertItemsIndex > couponIndex, "expected item snapshots after coupon calculation");
  });

  it("stores variant snapshots and redeems coupons only after order creation", () => {
    assert.match(sql, /insert into public\.orders/i);
    assert.match(sql, /insert into public\.order_items/i);
    assert.match(sql, /variant_id/i);
    assert.match(sql, /product_price/i);
    assert.match(sql, /insert into public\.coupon_redemptions/i);
  });

  it("adds an idempotent inventory movement ledger for cancellation restock", () => {
    assert.match(sql, /create table if not exists public\.variant_inventory_movements/i);
    assert.match(sql, /order_item_id uuid not null/i);
    assert.match(sql, /foreign key \(order_item_id\)\s+references public\.order_items\(id\)\s+on delete cascade/i);
    assert.match(sql, /quantity_delta integer not null/i);
    assert.match(sql, /reason text not null/i);
    assert.match(sql, /unique \(order_item_id, reason\)/i);
    assert.match(sql, /cancelled/i);
    assert.doesNotMatch(sql, /order_item_id text/i);
    assert.doesNotMatch(sql, /item\.id::text/i);
    assert.doesNotMatch(sql, /v_item\.id::text/i);
  });

  it("preserves free shipping, cash payment, unpaid payment status, and order_number identity generation", () => {
    assert.match(sql, /v_shipping_cost numeric\(12, 2\) := 0/i);
    assert.match(sql, /v_total := round\(greatest\(v_subtotal - v_discount, 0\) \+ v_shipping_cost, 2\)/i);
    assert.match(sql, /'cash'/i);
    assert.match(sql, /'unpaid'/i);
    assert.match(sql, /orders\.order_number is identity by default/i);

    const ordersInsert = sql.match(/insert into public\.orders \(([\s\S]*?)\)\s+values/i)?.[1] || "";
    assert.doesNotMatch(ordersInsert, /order_number/i);
    assert.doesNotMatch(ordersInsert, /guest_email/i);
  });

  it("validates current required checkout customer fields server-side", () => {
    for (const field of ["full_name", "phone", "city", "address"]) {
      assert.match(sql, new RegExp(`nullif\\(btrim\\(p_customer->>'${field}'\\), ''\\) is null`, "i"));
    }
    assert.match(sql, /Customer name is required/i);
    assert.match(sql, /Phone is required/i);
    assert.match(sql, /City is required/i);
    assert.match(sql, /Address is required/i);
    assert.doesNotMatch(sql, /guest_email is required/i);
  });

  it("creates an admin-only atomic order status RPC for cancellation restock", () => {
    assert.match(sql, /create or replace function public\.admin_update_order_status/i);
    assert.match(sql, /security definer/i);
    assert.match(sql, /public\.is_admin\(\) is not true/i);
    assert.match(sql, /v_previous_status = 'cancelled' and p_status <> 'cancelled'/i);
    assert.match(sql, /Cancelled orders cannot be reopened/i);
    assert.match(sql, /coalesce\(v_previous_status, ''\) <> 'cancelled'/i);
    assert.match(sql, /p_status = 'cancelled'/i);
    assert.match(sql, /grant execute on function public\.admin_update_order_status\(uuid, text\) to authenticated/i);
    assert.doesNotMatch(sql, /grant execute on function public\.admin_update_order_status\(uuid, text\) to anon/i);
  });

  it("does not expose inventory movement sequence privileges to authenticated users", () => {
    assert.doesNotMatch(sql, /grant usage, select on sequence public\.variant_inventory_movements_id_seq to authenticated/i);
  });

  it("casts product_id explicitly for text order item snapshots", () => {
    assert.match(sql, /insert into public\.order_items[\s\S]*item\.product_id::text/i);
    assert.doesNotMatch(sql, /alter table public\.order_items[\s\S]{0,120}alter column product_id[\s\S]{0,80}type/i);
  });

  it("keeps checkout callable by guests and authenticated users while admin status is authenticated only", () => {
    assert.match(sql, /revoke execute on function public\.build_checkout_items\(jsonb\) from anon, authenticated/i);
    assert.match(sql, /revoke execute on function public\.calculate_checkout_coupon_discount\(public\.coupons, jsonb, uuid\) from anon, authenticated/i);
    assert.match(sql, /grant execute on function public\.create_checkout_order\(uuid, jsonb, jsonb, text\) to anon, authenticated/i);
    assert.match(sql, /grant execute on function public\.preview_checkout_coupon\(text, jsonb\) to anon, authenticated/i);
  });
});

describe("variant checkout wiring", () => {
  it("passes variant_id through checkout payloads", () => {
    assert.match(checkoutOrder, /variant_id/);
    assert.match(checkoutOrder, /variantId/);
  });

  it("allows exact selected variant add-to-cart instead of the Phase 3 block", () => {
    assert.match(productPage, /cartStore\.addToCart[\s\S]*selectedVariant\.value/);
    assert.doesNotMatch(productPage, /variantCartPhase4Blocked/);
  });

  it("uses the admin status RPC instead of direct status updates", () => {
    assert.match(adminOrders, /admin_update_order_status/);
    assert.doesNotMatch(adminOrders, /\.from\("orders"\)\s*[\s\S]{0,120}\.update\(\{ status: nextStatus \}\)/);
  });
});

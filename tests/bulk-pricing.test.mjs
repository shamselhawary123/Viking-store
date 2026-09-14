import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdirSync, readFileSync } from "node:fs";

const migrations = readdirSync("supabase/migrations");
const migrationName = migrations.find((file) =>
  /bulk_price_management\.sql$/.test(file),
);
const sql = migrationName ? readFileSync(`supabase/migrations/${migrationName}`, "utf8") : "";
const productsPage = readFileSync("pages/admin/products.vue", "utf8");
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));
const checkoutMigration = readFileSync("supabase/migrations/20260830120000_instapay_payments.sql", "utf8");
const couponMigration = readFileSync("supabase/migrations/20260812170000_create_coupons.sql", "utf8");

describe("bulk price management migration", () => {
  it("creates private admin-only operation history without touching prices on migration", () => {
    assert.ok(migrationName, "expected bulk price management migration");
    assert.match(sql, /create table if not exists public\.bulk_price_operations/i);
    assert.match(sql, /create table if not exists public\.bulk_price_operation_items/i);
    assert.match(sql, /alter table public\.bulk_price_operations enable row level security/i);
    assert.match(sql, /alter table public\.bulk_price_operation_items enable row level security/i);
    assert.match(sql, /using \(public\.is_admin\(\)\)/i);
    assert.match(sql, /with check \(public\.is_admin\(\)\)/i);
    assert.doesNotMatch(sql.split(/create or replace function public\.apply_bulk_price_update/i)[0], /update public\.products\s+set\s+price/i);
    assert.doesNotMatch(sql.split(/create or replace function public\.apply_bulk_price_update/i)[0], /update public\.product_variants\s+set\s+price/i);
  });

  it("defines admin-only preview, apply, and undo RPCs with safe grants", () => {
    for (const fn of [
      "preview_bulk_price_update",
      "apply_bulk_price_update",
      "undo_bulk_price_operation",
    ]) {
      assert.match(sql, new RegExp(`create or replace function public\\.${fn}`, "i"));
      assert.match(sql, new RegExp(`revoke execute on function public\\.${fn}`, "i"));
      assert.match(sql, new RegExp(`grant execute on function public\\.${fn}[\\s\\S]*to authenticated`, "i"));
    }
    assert.match(sql, /security definer/i);
    assert.match(sql, /set search_path = public, extensions/i);
    assert.match(sql, /if public\.is_admin\(\) is not true then/i);
  });

  it("uses database-authoritative formulas and nearest-whole EGP rounding", () => {
    assert.match(sql, /public\.round_bulk_price_egp\(p_value numeric\)/i);
    assert.match(sql, /round\(p_value\)/i);
    assert.match(sql, /current_price \* \(1 \+ v_adjustment_value \/ 100\)/i);
    assert.match(sql, /current_price \* \(1 - v_adjustment_value \/ 100\)/i);
    assert.match(sql, /current_price \+ v_adjustment_value/i);
    assert.match(sql, /current_price - v_adjustment_value/i);
    assert.match(sql, /cost_price \* \(1 \+ v_adjustment_value \/ 100\)/i);
    assert.match(sql, /199[\s\S]*20[\s\S]*239|239[\s\S]*199[\s\S]*20/i);
    assert.match(sql, /150[\s\S]*180/i);
    assert.match(sql, /170[\s\S]*204/i);
    assert.match(sql, /210[\s\S]*252/i);
  });

  it("updates legacy and variant selling prices independently while preserving private costs and old_price", () => {
    assert.match(sql, /update public\.products[\s\S]*set price = item\.new_price[\s\S]*where item\.variant_id is null/i);
    assert.match(sql, /update public\.product_variants[\s\S]*set price = item\.new_price[\s\S]*where item\.variant_id is not null/i);
    assert.match(sql, /perform public\.sync_product_variant_parent_price\(v_sync_product_id\)/i);
    assert.doesNotMatch(sql, /update public\.product_costs/i);
    assert.doesNotMatch(sql, /update public\.product_variant_costs/i);
    assert.doesNotMatch(sql, /set old_price/i);
  });

  it("blocks missing-cost cost-markup updates unless explicitly excluded", () => {
    assert.match(sql, /exclude_missing_cost/i);
    assert.match(sql, /cost_missing/i);
    assert.match(sql, /Missing Cost Price/i);
    assert.match(sql, /raise exception 'Missing cost prices must be excluded before applying.'/i);
  });

  it("guards stale previews and safe undo conflicts atomically", () => {
    assert.match(sql, /Prices or pricing targets changed since preview\. Refresh the preview before applying\./i);
    assert.match(sql, /current_price = preview\.current_price/i);
    assert.match(sql, /Undo blocked because prices changed after this operation\./i);
    assert.match(sql, /status = 'undone'/i);
    assert.match(sql, /Operation has already been undone\./i);
  });

  it("keeps operation item history durable after product or variant deletion", () => {
    const itemsTable = sql.match(/create table if not exists public\.bulk_price_operation_items \([\s\S]*?\n\);/i)?.[0] || "";

    assert.match(itemsTable, /operation_id uuid not null references public\.bulk_price_operations\(id\) on delete cascade/i);
    assert.match(itemsTable, /product_id bigint not null/i);
    assert.match(itemsTable, /variant_id bigint/i);
    assert.doesNotMatch(itemsTable, /product_id bigint not null references public\.products/i);
    assert.doesNotMatch(itemsTable, /variant_id bigint references public\.product_variants/i);
    assert.doesNotMatch(itemsTable, /public\.products\(id\) on delete cascade/i);
    assert.doesNotMatch(itemsTable, /public\.product_variants\(id\) on delete cascade/i);
  });

  it("enforces NULL-safe operation item uniqueness for legacy and variant targets", () => {
    assert.doesNotMatch(sql, /unique \(operation_id, product_id, variant_id\)/i);
    assert.match(sql, /create unique index if not exists bulk_price_operation_items_legacy_target_uidx[\s\S]*on public\.bulk_price_operation_items \(operation_id, product_id\)[\s\S]*where variant_id is null/i);
    assert.match(sql, /create unique index if not exists bulk_price_operation_items_variant_target_uidx[\s\S]*on public\.bulk_price_operation_items \(operation_id, variant_id\)[\s\S]*where variant_id is not null/i);
  });

  it("requires exact stale-preview target-set equality before apply", () => {
    assert.match(sql, /create temporary table tmp_bulk_expected/i);
    assert.match(sql, /create temporary table tmp_bulk_preview_targets/i);
    assert.match(sql, /not exists \([\s\S]*from tmp_bulk_expected expected[\s\S]*expected\.product_id = preview\.product_id/i);
    assert.match(sql, /not exists \([\s\S]*from tmp_bulk_preview_targets preview[\s\S]*preview\.product_id = expected\.product_id/i);
    assert.match(sql, /expected\.current_price = preview\.current_price/i);
    assert.match(sql, /expected\.new_price = preview\.new_price/i);
  });

  it("blocks undo when any original pricing target no longer exists", () => {
    assert.match(sql, /Undo blocked because one or more pricing targets no longer exist\./i);
    assert.match(sql, /left join public\.products product on product\.id = item\.product_id/i);
    assert.match(sql, /left join public\.product_variants variant on variant\.id = item\.variant_id/i);
    assert.match(sql, /variant\.product_id is distinct from item\.product_id/i);
    assert.match(sql, /raise exception 'Undo blocked because one or more pricing targets no longer exist\.'/i);
  });

  it("does not modify checkout or coupon pricing paths", () => {
    assert.doesNotMatch(checkoutMigration, /bulk_price|bulk pricing|bulk_price_operations/i);
    assert.doesNotMatch(couponMigration, /bulk_price|bulk pricing|bulk_price_operations/i);
  });
});

describe("bulk price management admin UI", () => {
  it("adds a preview-first bulk pricing modal and recent history controls", () => {
    assert.match(productsPage, /openBulkPricing/);
    assert.match(productsPage, /bulkActiveTab/);
    assert.match(productsPage, /admin\.updatePrices/);
    assert.match(productsPage, /admin\.priceUpdateHistory/);
    assert.match(productsPage, /previewBulkPricing/);
    assert.match(productsPage, /applyBulkPricing/);
    assert.match(productsPage, /undoBulkPricingOperation/);
    assert.match(productsPage, /preview_bulk_price_update/);
    assert.match(productsPage, /apply_bulk_price_update/);
    assert.match(productsPage, /undo_bulk_price_operation/);
    assert.match(productsPage, /bulk_price_operations/);
    assert.match(productsPage, /window\.confirm/);
  });

  it("uses a searchable checkbox product picker instead of a raw multi-select", () => {
    assert.match(productsPage, /bulkProductSearch/);
    assert.match(productsPage, /filteredBulkProducts/);
    assert.match(productsPage, /toggleBulkProductSelection/);
    assert.match(productsPage, /clearBulkProductSelection/);
    assert.match(productsPage, /bulkSelectedProductIds\.includes\(String\(product\.id\)\)/);
    assert.doesNotMatch(productsPage, /<select[^>]*multiple[^>]*v-model="bulkSelectedProductIds"/);
  });

  it("shows only relevant pricing controls for each pricing method", () => {
    assert.match(productsPage, /bulkForm\.method === 'current_price'/);
    assert.match(productsPage, /bulkForm\.method === 'cost_markup'/);
    assert.match(productsPage, /admin\.targetMarkupPercent/);
    assert.match(productsPage, /admin\.adjustmentValue/);
  });

  it("renders desktop bulk price preview table and mobile preview cards", () => {
    assert.match(productsPage, /class="hidden min-w-0 overflow-hidden rounded-2xl border border-white\/10 md:block"/);
    assert.match(productsPage, /<table class="w-full min-w-\[820px\] text-sm"/);
    assert.match(productsPage, /class="grid gap-3 md:hidden"/);
    assert.match(productsPage, /v-for="row in bulkPreviewRows"/);
    assert.match(productsPage, /admin\.bulkPricingNoPreview/);
  });

  it("separates update and history tabs with visible undo states", () => {
    assert.match(productsPage, /bulkActiveOperations/);
    assert.match(productsPage, /bulkUndoneOperations/);
    assert.match(productsPage, /undoingBulkOperationId/);
    assert.match(productsPage, /operation\.status !== "undone"/);
    assert.match(productsPage, /operation\.status === "undone"/);
    assert.match(productsPage, /@click="undoBulkPricingOperation\(operation\.id\)"/);
    assert.match(productsPage, /admin\.undoPriceUpdate/);
    assert.match(productsPage, /admin\.noPriceUpdateHistory/);
  });

  it("defines English and Arabic admin labels for the bulk pricing flow", () => {
    for (const key of [
      "bulkPriceUpdate",
      "updatePrices",
      "productScope",
      "allProducts",
      "selectedCategory",
      "selectedProducts",
      "selectedProductsCount",
      "clearSelection",
      "adjustCurrentSellingPrice",
      "setSellingPriceFromCost",
      "adjustmentValue",
      "targetMarkupPercent",
      "previewChanges",
      "confirmPriceUpdate",
      "priceUpdateHistory",
      "undoPriceUpdate",
      "undone",
      "bulkPricingNoPreview",
      "noPriceUpdateHistory",
      "undo",
      "costUnavailable",
    ]) {
      assert.equal(typeof en.admin[key], "string", `missing en.admin.${key}`);
      assert.equal(typeof ar.admin[key], "string", `missing ar.admin.${key}`);
    }
  });
});

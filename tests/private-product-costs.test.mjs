import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdirSync, readFileSync } from "node:fs";

import {
  applyLoadedVariantCosts,
  buildVariantProductRpcPayload,
  buildProductCostLookup,
  getLoadedCostPrice,
  validateVariantProduct,
} from "../utils/adminProductVariants.ts";

const migrations = readdirSync("supabase/migrations");
const migrationName = migrations.find((file) =>
  /private_product_costs\.sql$/.test(file),
);
const sql = migrationName ? readFileSync(`supabase/migrations/${migrationName}`, "utf8") : "";
const preRpcSql = sql.split(/create or replace function public\.save_admin_variant_product/i)[0] || sql;
const productsPage = readFileSync("pages/admin/products.vue", "utf8");
const adminVariantUtils = readFileSync("utils/adminProductVariants.ts", "utf8");
const shopProducts = readFileSync("utils/shopProducts.ts", "utf8");
const productPage = readFileSync("pages/shop/[slug].vue", "utf8");
const checkoutPage = readFileSync("pages/checkout.vue", "utf8");
const checkoutOrder = readFileSync("utils/checkoutOrder.ts", "utf8");
const checkoutMigration = readFileSync("supabase/migrations/20260830120000_instapay_payments.sql", "utf8");
const couponMigration = readFileSync("supabase/migrations/20260812170000_create_coupons.sql", "utf8");
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

describe("private product cost migration", () => {
  it("creates separate private cost tables without altering public price columns", () => {
    assert.ok(migrationName, "expected private product costs migration");
    assert.match(sql, /create table if not exists public\.product_costs/i);
    assert.match(sql, /product_id bigint primary key/i);
    assert.match(sql, /references public\.products\(id\)\s+on delete cascade/i);
    assert.match(sql, /create table if not exists public\.product_variant_costs/i);
    assert.match(sql, /variant_id bigint primary key/i);
    assert.match(sql, /references public\.product_variants\(id\)\s+on delete cascade/i);
    assert.match(sql, /cost_price numeric/i);
    assert.match(sql, /check \(cost_price is null or cost_price >= 0\)/i);
    assert.doesNotMatch(sql, /alter table public\.products[\s\S]*cost_price/i);
    assert.doesNotMatch(sql, /alter table public\.product_variants[\s\S]*cost_price/i);
    assert.doesNotMatch(preRpcSql, /update public\.products\s+set/i);
    assert.doesNotMatch(preRpcSql, /update public\.product_variants\s+set/i);
  });

  it("protects cost tables with admin-only RLS and no anon access", () => {
    assert.match(sql, /alter table public\.product_costs enable row level security/i);
    assert.match(sql, /alter table public\.product_variant_costs enable row level security/i);
    assert.match(sql, /on public\.product_costs[\s\S]*for all[\s\S]*to authenticated[\s\S]*using \(public\.is_admin\(\)\)[\s\S]*with check \(public\.is_admin\(\)\)/i);
    assert.match(sql, /on public\.product_variant_costs[\s\S]*for all[\s\S]*to authenticated[\s\S]*using \(public\.is_admin\(\)\)[\s\S]*with check \(public\.is_admin\(\)\)/i);
    assert.match(sql, /revoke all on public\.product_costs from anon, authenticated/i);
    assert.match(sql, /revoke all on public\.product_variant_costs from anon, authenticated/i);
    assert.match(sql, /grant select, insert, update, delete on public\.product_costs to authenticated/i);
    assert.match(sql, /grant select, insert, update, delete on public\.product_variant_costs to authenticated/i);
    assert.doesNotMatch(sql, /grant .*product_costs .* to anon/i);
    assert.doesNotMatch(sql, /grant .*product_variant_costs .* to anon/i);
  });

  it("extends variant save RPC to persist costs without changing selling-price sync", () => {
    assert.match(sql, /create or replace function public\.save_admin_variant_product\(\s*p_product jsonb,\s*p_colors jsonb default '\[\]'::jsonb,\s*p_variants jsonb default '\[\]'::jsonb\s*\)/i);
    assert.match(sql, /v_cost_price numeric/i);
    assert.match(sql, /v_has_cost_price_key boolean/i);
    assert.match(sql, /insert into public\.product_variant_costs \(variant_id, cost_price\)/i);
    assert.match(sql, /delete from public\.product_variant_costs[\s\S]*variant_id = v_variant_id/i);
    assert.match(sql, /perform public\.sync_product_variant_parent_price\(v_product_id\)/i);
    assert.doesNotMatch(sql, /sync_product_variant_parent_price[\s\S]*cost_price/i);
  });

  it("preserves variant costs for old-client payloads that omit cost_price", () => {
    const applyExplicitCostMutation = (currentCost, variant) => {
      if (!Object.hasOwn(variant, "cost_price")) return currentCost;
      if (variant.cost_price === "" || variant.cost_price === null || variant.cost_price === undefined) return null;
      const nextCost = Number(variant.cost_price);
      if (!Number.isFinite(nextCost) || nextCost < 0) return "rejected";
      return nextCost;
    };

    assert.equal(applyExplicitCostMutation(650, { price: 900 }), 650);
    assert.equal(applyExplicitCostMutation(650, { price: 900, cost_price: "" }), null);
    assert.equal(applyExplicitCostMutation(650, { price: 900, cost_price: null }), null);
    assert.equal(applyExplicitCostMutation(650, { price: 900, cost_price: 700 }), 700);
    assert.equal(applyExplicitCostMutation(650, { price: 900, cost_price: -1 }), "rejected");

    assert.match(sql, /v_has_cost_price_key := v_variant \? 'cost_price';/i);
    assert.match(sql, /if v_has_cost_price_key then\s+v_cost_price := nullif\(btrim\(coalesce\(v_variant->>'cost_price', ''\)\), ''\)::numeric;[\s\S]*?if v_has_cost_price_key and v_cost_price is not null and v_cost_price < 0 then/i);
    assert.match(sql, /if v_has_cost_price_key then\s+if v_cost_price is null then\s+delete from public\.product_variant_costs[\s\S]*?else\s+insert into public\.product_variant_costs \(variant_id, cost_price\)/i);
  });

  it("keeps checkout and coupon pricing paths untouched by private costs", () => {
    assert.doesNotMatch(checkoutMigration, /cost_price/i);
    assert.doesNotMatch(checkoutPage, /cost_price|product_costs|product_variant_costs/i);
    assert.doesNotMatch(checkoutOrder, /cost_price|product_costs|product_variant_costs/i);
    assert.doesNotMatch(couponMigration, /cost_price|product_costs|product_variant_costs/i);
  });
});

describe("private product cost admin UI wiring", () => {
  it("loads cost rows only in the admin product page and not storefront selectors", () => {
    assert.match(productsPage, /\.from\("product_costs"\)[\s\S]*\.select\("product_id, cost_price"\)/);
    assert.match(productsPage, /\.from\("product_variant_costs"\)[\s\S]*\.select\("variant_id, cost_price"\)/);
    assert.match(productsPage, /applyLoadedVariantCosts\(product\.product_variants \|\| \[\], variantCostRows\)/);
    assert.doesNotMatch(shopProducts, /product_costs|product_variant_costs|cost_price/i);
    assert.doesNotMatch(productPage, /product_costs|product_variant_costs|cost_price/i);
  });

  it("adds optional legacy and variant cost fields without replacing selling prices", () => {
    assert.match(productsPage, /form\.cost_price/);
    assert.match(productsPage, /saveProductCost/);
    assert.match(productsPage, /variant\.cost_price/);
    assert.match(productsPage, /admin\.costPrice/);
    assert.match(productsPage, /admin\.costPriceInvalid/);
    assert.match(productsPage, /v-model\.number="form\.price"/);
    assert.match(productsPage, /v-model\.number="variant\.price"/);
  });

  it("maps loaded variant costs by stable variant id without changing selling fields", () => {
    const loaded = applyLoadedVariantCosts(
      [
        { id: 84, price: 900, stock_quantity: 4, is_active: true },
        { id: 91, price: 950, stock_quantity: 7, is_active: true },
        { id: 96, price: 1000, stock_quantity: 0, is_active: false },
      ],
      [
        { variant_id: 96, cost_price: 300 },
        { variant_id: 84, cost_price: 120 },
      ],
    );

    assert.equal(loaded[0].cost_price, 120);
    assert.equal(loaded[1].cost_price, null);
    assert.equal(loaded[2].cost_price, 300);
    assert.equal(loaded[0].price, 900);
    assert.equal(loaded[1].stock_quantity, 7);
    assert.equal(loaded[2].is_active, false);
  });

  it("maps loaded legacy costs by product id and leaves missing costs blank", () => {
    const lookup = buildProductCostLookup([
      { product_id: 42, cost_price: 700 },
      { product_id: 99, cost_price: 1200 },
    ]);

    assert.equal(getLoadedCostPrice(lookup, 42), 700);
    assert.equal(getLoadedCostPrice(lookup, 43), null);
  });

  it("validates optional cost prices and preserves selling prices in variant payloads", () => {
    assert.equal(validateVariantProduct({
      colors: [],
      variants: [{ key: "m", colorKey: null, size: "M", price: 900, cost_price: "", stock_quantity: 1, is_active: true }],
    }), "");

    assert.equal(validateVariantProduct({
      colors: [],
      variants: [{ key: "m", colorKey: null, size: "M", price: 900, cost_price: -1, stock_quantity: 1, is_active: true }],
    }), "admin.costPriceInvalid");

    const payload = buildVariantProductRpcPayload({
      form: {
        id: null,
        name: "Variant Gloves",
        slug: "variant-gloves",
        description: "",
        badge: null,
        old_price: null,
        category_id: 1,
        cover_image: "",
      },
      colors: [],
      variants: [{ key: "m", colorKey: null, size: "M", price: 900, cost_price: 650, stock_quantity: 1, is_active: true }],
    });

    assert.equal(payload.p_variants[0].price, 900);
    assert.equal(payload.p_variants[0].cost_price, 650);
    assert.equal(payload.p_product.price, 900);
  });

  it("defines cost price labels in both admin locales", () => {
    assert.equal(en.admin.costPrice, "Cost Price");
    assert.equal(en.admin.costPriceInvalid, "Cost price must be zero or more.");
    assert.equal(ar.admin.costPrice, "سعر التكلفة");
    assert.equal(ar.admin.costPriceInvalid, "سعر التكلفة لازم يكون صفر أو أكتر.");
    assert.match(adminVariantUtils, /cost_price/);
  });
});

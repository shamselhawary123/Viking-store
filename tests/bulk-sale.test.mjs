import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdirSync, readFileSync } from "node:fs";

const migrations = readdirSync("supabase/migrations");
const migrationName = migrations.find((file) =>
  /bulk_sale_management\.sql$/.test(file),
);
const sql = migrationName ? readFileSync(`supabase/migrations/${migrationName}`, "utf8") : "";
const productsPage = readFileSync("pages/admin/products.vue", "utf8");
const productCard = readFileSync("components/shop/ProductCard.vue", "utf8");
const productDetail = readFileSync("pages/shop/[slug].vue", "utf8");
const storefrontVariants = readFileSync("utils/storefrontProductVariants.ts", "utf8");
const localizationFormat = readFileSync("utils/localizationFormat.ts", "utf8");
const shopProducts = readFileSync("utils/shopProducts.ts", "utf8");
const bulkPricingMigration = readFileSync("supabase/migrations/20260915100000_bulk_price_management.sql", "utf8");
const checkoutMigration = readFileSync("supabase/migrations/20260830120000_instapay_payments.sql", "utf8");
const couponMigration = readFileSync("supabase/migrations/20260812170000_create_coupons.sql", "utf8");
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

describe("bulk sale migration", () => {
  it("adds variant compare price and private durable sale history without repricing on migration", () => {
    assert.ok(migrationName, "expected bulk sale migration");
    assert.match(sql, /alter table public\.product_variants[\s\S]*add column if not exists old_price numeric/i);
    assert.match(sql, /product_variants_old_price_nonnegative/i);
    assert.match(sql, /create table if not exists public\.bulk_sale_operations/i);
    assert.match(sql, /create table if not exists public\.bulk_sale_operation_items/i);
    assert.match(sql, /create table if not exists public\.bulk_sale_product_snapshots/i);
    assert.match(sql, /sale_parent_price numeric/i);

    const itemsTable = sql.match(/create table if not exists public\.bulk_sale_operation_items \([\s\S]*?\n\);/i)?.[0] || "";
    assert.match(itemsTable, /operation_id uuid not null references public\.bulk_sale_operations\(id\) on delete cascade/i);
    assert.match(itemsTable, /product_id bigint not null/i);
    assert.match(itemsTable, /variant_id bigint/i);
    assert.doesNotMatch(itemsTable, /references public\.products\(id\)/i);
    assert.doesNotMatch(itemsTable, /references public\.product_variants\(id\)/i);
    assert.doesNotMatch(sql.split(/create or replace function public\.apply_bulk_sale/i)[0], /update public\.products\s+set\s+price/i);
    assert.doesNotMatch(sql.split(/create or replace function public\.apply_bulk_sale/i)[0], /update public\.product_variants\s+set\s+price/i);
  });

  it("defines admin-only preview, apply, and end sale RPCs", () => {
    for (const fn of ["preview_bulk_sale", "apply_bulk_sale", "end_bulk_sale"]) {
      assert.match(sql, new RegExp(`create or replace function public\\.${fn}`, "i"));
      assert.match(sql, new RegExp(`revoke execute on function public\\.${fn}`, "i"));
      assert.match(sql, new RegExp(`grant execute on function public\\.${fn}[\\s\\S]*to authenticated`, "i"));
    }

    assert.match(sql, /security definer/i);
    assert.match(sql, /set search_path = public, extensions/i);
    assert.match(sql, /if public\.is_admin\(\) is not true then/i);
    assert.match(sql, /alter table public\.bulk_sale_operations enable row level security/i);
    assert.match(sql, /using \(public\.is_admin\(\)\)/i);
  });

  it("uses DB-side percentage sale formulas and nearest whole EGP rounding", () => {
    assert.match(sql, /current_price \* \(1 - v_discount_percent \/ 100\)/i);
    assert.match(sql, /public\.round_bulk_price_egp/i);
    assert.match(sql, /v_discount_percent <= 0 or v_discount_percent >= 100/i);
    assert.match(sql, /199[\s\S]*30[\s\S]*139|139[\s\S]*199[\s\S]*30/i);
    assert.match(sql, /old 180[\s\S]*new 135/i);
    assert.match(sql, /old 220[\s\S]*new 165/i);
    assert.match(sql, /old 280[\s\S]*new 210/i);
  });

  it("applies legacy and variant sales independently while preserving cost prices", () => {
    assert.match(sql, /update public\.products[\s\S]*old_price = item\.sale_old_price[\s\S]*price = item\.sale_price[\s\S]*where item\.variant_id is null/i);
    assert.match(sql, /update public\.product_variants[\s\S]*old_price = item\.sale_old_price[\s\S]*price = item\.sale_price[\s\S]*where item\.variant_id is not null/i);
    assert.match(sql, /perform public\.sync_product_variant_parent_price\(v_sync_product_id\)/i);
    assert.match(sql, /update public\.products[\s\S]*old_price = snapshot\.sale_parent_old_price/i);
    assert.match(sql, /order by variant\.price asc, variant\.id asc/i);
    assert.doesNotMatch(sql, /update public\.product_costs/i);
    assert.doesNotMatch(sql, /update public\.product_variant_costs/i);
  });

  it("blocks or explicitly excludes missing-cost and below-cost rows", () => {
    assert.match(sql, /exclude_missing_cost/i);
    assert.match(sql, /exclude_below_cost/i);
    assert.match(sql, /Cost unavailable/i);
    assert.match(sql, /Below Cost/i);
    assert.match(sql, /Missing cost sale rows must be excluded before applying\./i);
    assert.match(sql, /Below-cost sale rows must be excluded before applying\./i);
    assert.doesNotMatch(sql, /force_below_cost/i);
  });

  it("guards stale apply previews by exact full preview set before deriving mutation targets", () => {
    const applyBody = sql.match(/create or replace function public\.apply_bulk_sale[\s\S]*?\n\$\$;/i)?.[0] || "";
    const staleCheckIndex = applyBody.indexOf("Prices, costs, or Sale targets changed since preview");
    const targetsIndex = applyBody.indexOf("create temporary table tmp_bulk_sale_targets");

    assert.match(sql, /create temporary table tmp_bulk_sale_expected/i);
    assert.match(sql, /create temporary table tmp_bulk_sale_targets/i);
    assert.match(sql, /Prices, costs, or Sale targets changed since preview\. Refresh the preview before applying\./i);
    assert.match(sql, /\(expected->>'is_active'\)::boolean as is_active/i);
    assert.match(sql, /\(expected->>'is_valid'\)::boolean as is_valid/i);
    assert.match(sql, /\(expected->>'excluded'\)::boolean as excluded/i);
    assert.match(sql, /preview\.is_active,/i);
    assert.match(sql, /preview\.excluded/i);
    assert.match(sql, /expected\.is_active is not distinct from preview\.is_active/i);
    assert.match(sql, /expected\.current_price = preview\.current_price/i);
    assert.match(sql, /expected\.current_old_price is not distinct from preview\.current_old_price/i);
    assert.match(sql, /expected\.cost_price is not distinct from preview\.cost_price/i);
    assert.match(sql, /expected\.sale_price = preview\.sale_price/i);
    assert.match(sql, /expected\.sale_old_price = preview\.sale_old_price/i);
    assert.match(sql, /expected\.is_valid is not distinct from preview\.is_valid/i);
    assert.match(sql, /expected\.excluded is not distinct from preview\.excluded/i);
    assert.ok(staleCheckIndex > -1, "expected stale-preview error");
    assert.ok(targetsIndex > staleCheckIndex, "expected mutation targets to be derived after full-preview stale check");
  });

  it("locks cost rows before final sale revalidation", () => {
    const applyBody = sql.match(/create or replace function public\.apply_bulk_sale[\s\S]*?\n\$\$;/i)?.[0] || "";
    const productLockIndex = applyBody.indexOf("from public.products product");
    const variantLockIndex = applyBody.indexOf("from public.product_variants variant");
    const productCostLockIndex = applyBody.indexOf("from public.product_costs product_cost");
    const variantCostLockIndex = applyBody.indexOf("from public.product_variant_costs variant_cost");
    const recomputeIndex = applyBody.indexOf("truncate table tmp_bulk_sale_preview");

    assert.ok(productLockIndex > -1, "expected product row lock");
    assert.ok(variantLockIndex > productLockIndex, "expected variant lock after product lock");
    assert.ok(productCostLockIndex > variantLockIndex, "expected legacy cost rows locked after variant lock");
    assert.ok(variantCostLockIndex > productCostLockIndex, "expected variant cost rows locked after legacy cost lock");
    assert.ok(recomputeIndex > variantCostLockIndex, "expected final preview recompute after cost locks");
    assert.match(applyBody, /from public\.product_costs product_cost[\s\S]*order by product_cost\.product_id[\s\S]*for update/i);
    assert.match(applyBody, /from public\.product_variant_costs variant_cost[\s\S]*order by variant_cost\.variant_id[\s\S]*for update/i);
  });

  it("derives variant parent sale old_price from the actual cheapest active variant, including excluded variants", () => {
    const applyBody = sql.match(/create or replace function public\.apply_bulk_sale[\s\S]*?\n\$\$;/i)?.[0] || "";
    assert.match(applyBody, /product\.old_price,\s*null::numeric,\s*null::numeric,\s*null::bigint/i);
    assert.match(applyBody, /left join lateral \(\s*select variant\.id as variant_id,\s*variant\.price as price,\s*variant\.old_price as old_price[\s\S]*from public\.product_variants variant[\s\S]*where variant\.product_id = product\.id[\s\S]*and variant\.is_active[\s\S]*order by variant\.price asc, variant\.id asc[\s\S]*limit 1[\s\S]*\) cheapest_variant on true/i);
    assert.match(applyBody, /set sale_parent_price = cheapest_variant\.price,\s*sale_parent_old_price = cheapest_variant\.old_price,\s*sale_parent_variant_id = cheapest_variant\.variant_id/i);
    assert.doesNotMatch(applyBody, /set sale_parent_old_price = matched\.sale_old_price/i);
  });

  it("locks all snapshot product variants before End Sale parent validation", () => {
    const endBody = sql.match(/create or replace function public\.end_bulk_sale[\s\S]*?\n\$\$;/i)?.[0] || "";
    const allVariantLockIndex = endBody.indexOf("variant.product_id in");
    const parentValidationIndex = endBody.indexOf("cheapest_variant.variant_id is distinct from snapshot.sale_parent_variant_id");

    assert.ok(allVariantLockIndex > -1, "expected all snapshot-product variants to be locked");
    assert.ok(parentValidationIndex > allVariantLockIndex, "expected parent validation after snapshot-product variant lock");
    assert.match(endBody, /from public\.product_variants variant[\s\S]*variant\.product_id in \(\s*select snapshot\.product_id[\s\S]*from public\.bulk_sale_product_snapshots snapshot[\s\S]*where snapshot\.operation_id = p_operation_id[\s\S]*\)[\s\S]*order by variant\.product_id, variant\.id[\s\S]*for update/i);
  });

  it("ends sale by restoring exact snapshots and rejecting changed or missing targets", () => {
    assert.match(sql, /End Sale blocked because pricing changed after this Sale was created\./i);
    assert.match(sql, /Bulk Sale has already ended\./i);
    assert.match(sql, /Undo blocked because one or more Sale pricing targets no longer exist\./i);
    assert.match(sql, /variant\.product_id is distinct from item\.product_id/i);
    assert.match(sql, /variant\.is_active is distinct from item\.was_active/i);
    assert.match(sql, /product\.old_price is distinct from item\.sale_old_price/i);
    assert.match(sql, /variant\.old_price is distinct from item\.sale_old_price/i);
    assert.match(sql, /cheapest_variant\.variant_id is distinct from snapshot\.sale_parent_variant_id/i);
    assert.match(sql, /product\.price is distinct from snapshot\.sale_parent_price/i);
    assert.match(sql, /cheapest_variant\.price is distinct from snapshot\.sale_parent_price/i);
    assert.match(sql, /cheapest_variant\.old_price is distinct from snapshot\.sale_parent_old_price/i);
    assert.match(sql, /set price = item\.previous_price[\s\S]*old_price = item\.previous_old_price/i);
    assert.match(sql, /old_price = snapshot\.previous_parent_old_price/i);
  });

  it("does not modify checkout, coupons, historical orders, or existing bulk pricing SQL", () => {
    assert.doesNotMatch(checkoutMigration, /bulk_sale|sale operation|product_variants\.old_price/i);
    assert.doesNotMatch(couponMigration, /bulk_sale|sale operation|product_variants\.old_price/i);
    assert.doesNotMatch(bulkPricingMigration, /bulk_sale|sale operation|product_variants\.old_price/i);
  });
});

describe("bulk sale admin and storefront UI", () => {
  it("adds a separate Create Sale flow in Admin Products without replacing Bulk Price Update", () => {
    assert.match(productsPage, /openBulkSale/);
    assert.match(productsPage, /previewBulkSale/);
    assert.match(productsPage, /applyBulkSale/);
    assert.match(productsPage, /endBulkSale/);
    assert.match(productsPage, /saleActiveTab/);
    assert.match(productsPage, /admin\.activeSales/);
    assert.match(productsPage, /preview_bulk_sale/);
    assert.match(productsPage, /apply_bulk_sale/);
    assert.match(productsPage, /end_bulk_sale/);
    assert.match(productsPage, /bulk_sale_operations/);
    assert.match(productsPage, /openBulkPricing/);
  });

  it("sends every approved sale preview row to Apply, including excluded rows", () => {
    const applyBlock = productsPage.match(/const applyBulkSale = async \(\) => \{[\s\S]*?^};/m)?.[0] || "";
    assert.match(applyBlock, /const expectedItems = salePreviewRows\.value\.map\(\(row\) => \(\{/);
    assert.doesNotMatch(applyBlock, /const expectedItems = saleEligibleRows\.value\.map/);
    assert.match(applyBlock, /is_active: row\.is_active/);
    assert.match(applyBlock, /is_valid: row\.is_valid/);
    assert.match(applyBlock, /excluded: row\.excluded/);
  });

  it("uses a searchable checkbox product picker instead of a raw multi-select", () => {
    assert.match(productsPage, /saleProductSearch/);
    assert.match(productsPage, /filteredSaleProducts/);
    assert.match(productsPage, /toggleSaleProductSelection/);
    assert.match(productsPage, /clearSaleProductSelection/);
    assert.match(productsPage, /saleSelectedProductIds\.includes\(String\(product\.id\)\)/);
    assert.doesNotMatch(productsPage, /<select[^>]*multiple[^>]*v-model="saleSelectedProductIds"/);
  });

  it("renders desktop sale preview table and mobile sale preview cards", () => {
    assert.match(productsPage, /class="hidden min-w-0 overflow-hidden rounded-2xl border border-white\/10 md:block"/);
    assert.match(productsPage, /<table class="w-full min-w-\[860px\] text-sm"/);
    assert.match(productsPage, /class="grid gap-3 md:hidden"/);
    assert.match(productsPage, /v-for="row in salePreviewRows"/);
    assert.match(productsPage, /admin\.saleNoPreview/);
  });

  it("separates active and ended Sales with clear End Sale actions", () => {
    assert.match(productsPage, /saleActiveOperations/);
    assert.match(productsPage, /saleEndedOperations/);
    assert.match(productsPage, /endingSaleId/);
    assert.match(productsPage, /operation\.status !== "ended"/);
    assert.match(productsPage, /operation\.status === "ended"/);
    assert.match(productsPage, /@click="endBulkSale\(operation\.id\)"/);
    assert.match(productsPage, /admin\.noActiveSales/);
  });

  it("defines English and Arabic labels for Create Sale", () => {
    for (const key of [
      "createSale",
      "activeSales",
      "endSale",
      "discountPercent",
      "excludeBelowCost",
      "saleHistory",
      "saleNoPreview",
      "noActiveSales",
      "selectedProductsCount",
      "searchProducts",
      "applySaleConfirm",
      "saleApplied",
      "saleEnded",
    ]) {
      assert.equal(typeof en.admin[key], "string", `missing en.admin.${key}`);
      assert.equal(typeof ar.admin[key], "string", `missing ar.admin.${key}`);
    }
  });

  it("uses a shared customer discount helper from actual displayed prices", () => {
    assert.match(localizationFormat, /export const getDiscountPercent/i);
    assert.match(localizationFormat, /oldAmount <= currentAmount/i);
    assert.match(localizationFormat, /\(\(oldAmount - currentAmount\) \/ oldAmount\) \* 100/i);
    assert.match(productCard, /getDiscountPercent/);
    assert.match(productDetail, /getDiscountPercent/);
  });

  it("shows a distinct sale badge without removing the marketing badge", () => {
    assert.match(productCard, /product\.badge/);
    assert.match(productCard, /saleDiscountPercent/);
    assert.match(productCard, /shop\.discountOff/);
    assert.match(productCard, /formatStorePrice\(displayOldPrice/i);
  });

  it("uses selected variant old_price for product detail discounts and keeps fallback compatibility", () => {
    assert.match(shopProducts, /product_variants\(\*\)/);
    assert.match(storefrontVariants, /old_price\?: number \| string \| null/i);
    assert.match(storefrontVariants, /oldPrice/i);
    assert.match(productDetail, /selectedVariantOldPrice/);
    assert.match(productDetail, /selectedVariant\.value\?\.old_price/);
    assert.match(productDetail, /product\.value\?\.old_price/);
    assert.match(productDetail, /discountPercent/);
  });
});

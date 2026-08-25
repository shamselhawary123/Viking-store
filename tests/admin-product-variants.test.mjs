import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

import {
  buildVariantProductRpcPayload,
  getVariantInventorySummary,
  validateVariantProduct,
} from "../utils/adminProductVariants.ts";

const migrations = readdirSync("supabase/migrations");
const rpcMigrationName = migrations.find((file) =>
  /save_admin_variant_product\.sql$/.test(file),
);
const rpcSql = rpcMigrationName
  ? readFileSync(`supabase/migrations/${rpcMigrationName}`, "utf8")
  : "";
const productsPage = readFileSync("pages/admin/products.vue", "utf8");
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

const baseForm = {
  id: null,
  name: "Variant Gloves",
  slug: "variant-gloves",
  description: "Training gloves",
  badge: "New",
  old_price: null,
  category_id: 3,
  cover_image: "https://example.com/gloves.png",
};

describe("admin product variant helpers", () => {
  it("builds color and size variant payloads with explicit variant inventory model", () => {
    const payload = buildVariantProductRpcPayload({
      form: baseForm,
      colors: [
        {
          key: "red",
          name: "Red",
          value: "#ff0000",
          images: [{ preview: "https://example.com/red.png" }],
        },
      ],
      variants: [
        { key: "red-l", colorKey: "red", size: "L", price: 850, stock_quantity: 4, is_active: true },
        { key: "red-xl", colorKey: "red", size: "XL", price: 900, stock_quantity: 2, is_active: true },
      ],
    });

    assert.equal(payload.p_product.inventory_model, "variants");
    assert.equal(payload.p_product.price, 850);
    assert.equal(payload.p_product.cover_image, "https://example.com/red.png");
    assert.equal(payload.p_product.badge, "New");
    assert.deepEqual(payload.p_colors[0], {
      key: "red",
      id: null,
      name: "Red",
      value: "#ff0000",
      images: ["https://example.com/red.png"],
    });
    assert.deepEqual(payload.p_variants.map((variant) => [variant.color_key, variant.size, variant.price, variant.stock_quantity]), [
      ["red", "L", 850, 4],
      ["red", "XL", 900, 2],
    ]);
  });

  it("derives variant product cover image from the first color image and preserves size-only covers", () => {
    const withColors = buildVariantProductRpcPayload({
      form: { ...baseForm, cover_image: "https://example.com/manual-cover.png" },
      colors: [
        { key: "red", name: "Red", value: "#ff0000", images: [{ preview: "blob:red" }, { image_url: "https://example.com/red-first.png" }] },
        { key: "black", name: "Black", value: "#000000", images: [{ image_url: "https://example.com/black-first.png" }] },
      ],
      variants: [
        { key: "red-l", colorKey: "red", size: "L", price: 850, stock_quantity: 4, is_active: true },
      ],
    });
    assert.equal(withColors.p_product.cover_image, "https://example.com/red-first.png");

    const sizeOnly = buildVariantProductRpcPayload({
      form: { ...baseForm, cover_image: "https://example.com/size-cover.png" },
      colors: [],
      variants: [
        { key: "m", colorKey: null, size: "M", price: 700, stock_quantity: 2, is_active: true },
      ],
    });
    assert.equal(sizeOnly.p_product.cover_image, "https://example.com/size-cover.png");
  });

  it("supports size-only, color-only, and simple/default variant payloads", () => {
    const sizeOnly = buildVariantProductRpcPayload({
      form: baseForm,
      colors: [],
      variants: [
        { key: "m", colorKey: null, size: "M", price: 700, stock_quantity: 0, is_active: true },
      ],
    });
    assert.equal(sizeOnly.p_variants[0].color_key, null);
    assert.equal(sizeOnly.p_variants[0].size, "M");
    assert.equal(sizeOnly.p_variants[0].stock_quantity, 0);

    const colorOnly = buildVariantProductRpcPayload({
      form: baseForm,
      colors: [{ key: "black", name: "Black", value: "#000000", images: [] }],
      variants: [
        { key: "black", colorKey: "black", size: "", price: 650, stock_quantity: 3, is_active: true },
      ],
    });
    assert.equal(colorOnly.p_variants[0].color_key, "black");
    assert.equal(colorOnly.p_variants[0].size, null);

    const simple = buildVariantProductRpcPayload({
      form: baseForm,
      colors: [],
      variants: [
        { key: "simple", colorKey: null, size: "", price: 500, stock_quantity: 9, is_active: true },
      ],
    });
    assert.equal(simple.p_variants[0].color_key, null);
    assert.equal(simple.p_variants[0].size, null);
    assert.equal(simple.p_product.price, 500);
  });

  it("validates duplicate combinations, price, and stock while allowing zero stock", () => {
    assert.equal(validateVariantProduct({
      colors: [],
      variants: [{ key: "zero", colorKey: null, size: "M", price: 10, stock_quantity: 0, is_active: true }],
    }), "");

    assert.equal(validateVariantProduct({
      colors: [],
      variants: [{ key: "bad-stock", colorKey: null, size: "M", price: 10, stock_quantity: -1, is_active: true }],
    }), "admin.variantStockInvalid");

    assert.equal(validateVariantProduct({
      colors: [],
      variants: [{ key: "bad-price", colorKey: null, size: "M", price: -1, stock_quantity: 1, is_active: true }],
    }), "admin.variantPriceInvalid");

    assert.equal(validateVariantProduct({
      colors: [],
      variants: [
        { key: "a", colorKey: null, size: "M", price: 10, stock_quantity: 1, is_active: true },
        { key: "b", colorKey: null, size: "m", price: 11, stock_quantity: 1, is_active: false },
      ],
    }), "admin.duplicateVariants");

    assert.equal(validateVariantProduct({
      colors: [
        { key: "dup", name: "Red", value: "#ff0000" },
        { key: "dup", name: "Black", value: "#000000" },
      ],
      variants: [{ key: "red", colorKey: "dup", size: "L", price: 10, stock_quantity: 1, is_active: true }],
    }), "admin.duplicateColorKeys");
  });

  it("summarizes variant product inventory without using legacy product_sizes", () => {
    assert.deepEqual(getVariantInventorySummary({
      inventory_model: "variants",
      product_variants: [
        { is_active: true, stock_quantity: 2 },
        { is_active: true, stock_quantity: 0 },
        { is_active: false, stock_quantity: 99 },
      ],
    }), { variantCount: 2, totalStock: 2 });
  });
});

describe("admin variant product RPC migration", () => {
  it("defines an admin-only atomic save RPC without touching checkout or order tables", () => {
    assert.ok(rpcMigrationName, "expected save_admin_variant_product migration");
    assert.match(rpcSql, /create or replace function public\.save_admin_variant_product/i);
    assert.match(rpcSql, /security definer/i);
    assert.match(rpcSql, /set search_path = public/i);
    assert.match(rpcSql, /public\.is_admin\(\) is not true/i);
    assert.match(rpcSql, /inventory_model[\s\S]*variants/i);
    assert.match(rpcSql, /insert into public\.product_variants/i);
    assert.match(rpcSql, /update public\.product_variants/i);
    assert.match(rpcSql, /p_colors is null or jsonb_typeof\(p_colors\) <> 'array'/i);
    assert.match(rpcSql, /Duplicate color key/i);
    assert.match(rpcSql, /Submitted color key could not be resolved/i);
    assert.match(rpcSql, /is not distinct from v_color_id/i);
    assert.match(rpcSql, /is not distinct from v_size_id/i);
    assert.match(rpcSql, /v_target_variant_id bigint/i);
    assert.match(rpcSql, /where id = v_variant_id\s+and product_id = v_product_id[\s\S]*for update/i);
    assert.match(rpcSql, /into v_target_variant_id[\s\S]*color_id is not distinct from v_color_id[\s\S]*size_id is not distinct from v_size_id[\s\S]*for update/i);
    assert.match(rpcSql, /v_target_variant_id is not null and \(v_variant_id is null or v_target_variant_id <> v_variant_id\)/i);
    assert.match(rpcSql, /where id = v_target_variant_id\s+and product_id = v_product_id/i);
    assert.match(rpcSql, /update public\.product_variants\s+set is_active = false[\s\S]*not \(id = any\(v_saved_variant_ids\)\)/i);
    assert.doesNotMatch(rpcSql, /update public\.product_sizes\s+set size/i);
    assert.match(rpcSql, /lower\(v_existing_size_label\) <> v_size_key/i);
    assert.match(rpcSql, /v_variant_mode text/i);
    assert.match(rpcSql, /v_mode text/i);
    assert.match(rpcSql, /v_variant_mode := 'color_size'/i);
    assert.match(rpcSql, /v_variant_mode := 'color_only'/i);
    assert.match(rpcSql, /v_variant_mode := 'size_only'/i);
    assert.match(rpcSql, /v_variant_mode := 'simple'/i);
    assert.match(rpcSql, /jsonb_array_length\(p_variants\) <> 1/i);
    assert.match(rpcSql, /v_mode <> v_variant_mode/i);
    assert.match(rpcSql, /badge/i);
    assert.match(rpcSql, /revoke all on function public\.save_admin_variant_product\(jsonb, jsonb, jsonb\) from public/i);
    assert.match(rpcSql, /revoke execute on function public\.save_admin_variant_product\(jsonb, jsonb, jsonb\) from anon/i);
    assert.match(rpcSql, /grant execute on function public\.save_admin_variant_product\(jsonb, jsonb, jsonb\) to authenticated/i);
    assert.doesNotMatch(rpcSql, /alter table public\.order_items/i);
    assert.doesNotMatch(rpcSql, /alter table public\.orders/i);
  });
});

describe("admin product variant UI source", () => {
  it("loads variants and saves variant products through the atomic admin RPC", () => {
    assert.match(productsPage, /product_variants\(\*\)/);
    assert.match(productsPage, /inventory_model/);
    assert.match(productsPage, /save_admin_variant_product/);
    assert.match(productsPage, /buildVariantProductRpcPayload/);
  });

  it("keeps legacy products on the existing editor path and adds mobile-safe variant sections", () => {
    assert.match(productsPage, /isVariantEditor/);
    assert.match(productsPage, /admin-variant-card/);
    assert.match(productsPage, /grid gap-3 lg:grid-cols-\[minmax\(10rem,1fr\)_10rem_10rem_8rem_auto\]/);
    assert.match(productsPage, /legacy/i);
  });

  it("uses a full-width desktop product modal with a sticky action footer", () => {
    assert.match(productsPage, /max-w-\[92rem\]/);
    assert.match(productsPage, /flex max-h-\[calc\(100dvh-1rem\)\] w-full max-w-\[92rem\] flex-col overflow-hidden/);
    assert.match(productsPage, /class="flex-1 overflow-y-auto/);
    assert.match(productsPage, /class="sticky bottom-0/);
    assert.match(productsPage, /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(0,1fr\)\]/);
    assert.match(productsPage, /lg:grid-cols-\[minmax\(10rem,1fr\)_10rem_10rem_8rem_auto\]/);
    assert.doesNotMatch(productsPage, /lg:grid-cols-\[1fr_0\.9fr\]/);
  });

  it("limits variant image upload concurrency and exposes save-stage progress", () => {
    assert.match(productsPage, /const maxVariantImageUploadConcurrency = 3/);
    assert.match(productsPage, /runWithConcurrency/);
    assert.match(productsPage, /saveProgressMessage/);
    assert.match(productsPage, /admin\.uploadingImagesProgress/);
    assert.match(productsPage, /admin\.savingProductStage/);
    assert.match(productsPage, /save_admin_variant_product[\s\S]*rpcDurationMs/);
    assert.match(productsPage, /uploadRequests/);
    assert.doesNotMatch(productsPage, /for \(const color of colors\.value\)[\s\S]{0,260}await supabase\.storage\.from\("products"\)\.upload/);
  });

  it("defines required English and Arabic admin variant keys", () => {
    for (const key of [
      "variantInventory",
      "variantEditor",
      "legacyEditor",
      "variantsCount",
      "totalUnits",
      "addVariant",
      "addSimpleVariant",
      "stockQuantity",
      "variantPrice",
      "variantRequired",
      "variantPriceInvalid",
      "variantStockInvalid",
      "duplicateVariants",
    ]) {
      assert.equal(typeof en.admin[key], "string", `missing en.admin.${key}`);
      assert.equal(typeof ar.admin[key], "string", `missing ar.admin.${key}`);
    }
  });
});

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migrationName = readdirSync("supabase/migrations").find((file) =>
  /variant_public_keys\.sql$/.test(file),
);
const sql = migrationName ? readFileSync(`supabase/migrations/${migrationName}`, "utf8") : "";
const productPage = readFileSync("pages/shop/[slug].vue", "utf8");
const shopProducts = readFileSync("utils/shopProducts.ts", "utf8");
const adminProducts = readFileSync("pages/admin/products.vue", "utf8");

describe("variant public deep-link keys", () => {
  it("adds automatic UUID public keys for existing and new products and variants", () => {
    assert.ok(migrationName, "expected variant public keys migration");
    assert.match(sql, /create extension if not exists pgcrypto/i);
    assert.match(sql, /alter table public\.products\s+add column if not exists product_group_key uuid/i);
    assert.match(sql, /alter table public\.product_variants\s+add column if not exists public_key uuid/i);
    assert.match(sql, /update public\.products\s+set product_group_key = gen_random_uuid\(\)\s+where product_group_key is null/i);
    assert.match(sql, /update public\.product_variants\s+set public_key = gen_random_uuid\(\)\s+where public_key is null/i);
    assert.match(sql, /alter column product_group_key set default gen_random_uuid\(\)/i);
    assert.match(sql, /alter column product_group_key set not null/i);
    assert.match(sql, /alter column public_key set default gen_random_uuid\(\)/i);
    assert.match(sql, /alter column public_key set not null/i);
    assert.match(sql, /products_product_group_key_unique/i);
    assert.match(sql, /product_variants_public_key_unique/i);
  });

  it("keeps public keys technical and does not rewrite commercial product data", () => {
    assert.doesNotMatch(sql, /set\s+slug\s*=/i);
    assert.doesNotMatch(sql, /set\s+price\s*=/i);
    assert.doesNotMatch(sql, /set\s+old_price\s*=/i);
    assert.doesNotMatch(sql, /set\s+stock_quantity\s*=/i);
    assert.doesNotMatch(sql, /set\s+is_active\s*=/i);
    assert.doesNotMatch(sql, /alter table public\.products[\s\S]*alter column id/i);
    assert.doesNotMatch(sql, /alter table public\.product_variants[\s\S]*alter column id/i);
    assert.doesNotMatch(sql, /product_group_key[\s\S]*slug/i);
    assert.doesNotMatch(sql, /public_key[\s\S]*color_id\s*\|\|/i);
    assert.doesNotMatch(sql, /public_key[\s\S]*size_id\s*\|\|/i);
  });

  it("keeps technical keys automatic and fetched without admin-managed inputs", () => {
    assert.match(shopProducts, /SHOP_PRODUCT_DETAIL_SELECT[\s\S]*product_variants\(\*\)/);
    assert.match(productPage, /route\.query\.variant/);
    assert.doesNotMatch(adminProducts, /product_group_key|public_key/);
  });
});

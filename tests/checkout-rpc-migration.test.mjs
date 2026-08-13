import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  new URL("../supabase/migrations/20260813110000_create_checkout_coupon_rpc.sql", import.meta.url),
  "utf8",
);

describe("checkout coupon RPC migration", () => {
  it("creates server-side checkout preview and order RPCs", () => {
    assert.match(sql, /create or replace function public\.preview_checkout_coupon\b/);
    assert.match(sql, /create or replace function public\.create_checkout_order\b/);
    assert.match(sql, /security definer/i);
  });

  it("uses auth.uid() instead of trusting a browser-provided user id", () => {
    assert.match(sql, /auth\.uid\(\)/);
    assert.doesNotMatch(sql, /p_customer\s*->>\s*'user_id'/);
  });

  it("re-reads product prices and categories from public.products", () => {
    assert.match(sql, /public\.products product/);
    assert.match(sql, /product\.price/);
    assert.match(sql, /product\.category_id/);
  });

  it("validates coupon state, restrictions, and usage before redemption", () => {
    assert.match(sql, /active = false/);
    assert.match(sql, /minimum_order_amount/);
    assert.match(sql, /coupon_products/);
    assert.match(sql, /coupon_categories/);
    assert.match(sql, /max_total_uses/);
    assert.match(sql, /max_uses_per_user/);
  });

  it("writes coupon_redemptions only from the order creation RPC", () => {
    assert.match(sql, /insert into public\.orders/);
    assert.match(sql, /insert into public\.order_items/);
    assert.match(sql, /insert into public\.coupon_redemptions/);
    assert.match(sql, /discount_amount/);
  });
});

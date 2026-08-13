import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const migrationPath = new URL(
  "../supabase/migrations/20260812170000_create_coupons.sql",
  import.meta.url,
);

const sql = readFileSync(migrationPath, "utf8").toLowerCase();

describe("coupon database migration", () => {
  it("creates the approved coupon foundation tables", () => {
    for (const table of [
      "coupons",
      "coupon_products",
      "coupon_categories",
      "coupon_redemptions",
    ]) {
      assert.match(sql, new RegExp(`create table if not exists public\\.${table}\\b`));
    }
  });

  it("keeps coupon usage source of truth in coupon_redemptions", () => {
    assert.equal(sql.includes("current_usage_count"), false);
    assert.match(sql, /create table if not exists public\.coupon_redemptions\b/);
  });

  it("defines core coupon validation constraints", () => {
    assert.match(sql, /discount_type.*percentage.*fixed_amount/s);
    assert.match(sql, /discount_value > 0/);
    assert.match(sql, /minimum_order_amount >= 0/);
    assert.match(sql, /maximum_discount_amount is null or maximum_discount_amount >= 0/);
    assert.match(sql, /expires_at is null or starts_at is null or expires_at >= starts_at/);
    assert.match(sql, /max_total_uses is null or max_total_uses >= 0/);
    assert.match(sql, /max_uses_per_user is null or max_uses_per_user >= 0/);
  });

  it("uses admin-only writes and no customer redemption writes", () => {
    assert.match(sql, /public\.is_admin\(\)/);
    assert.match(sql, /create policy "admins can manage coupons"/);
    assert.match(sql, /create policy "admins can manage coupon redemptions"/);
    assert.equal(sql.includes("users can insert coupon redemptions"), false);
    assert.equal(sql.includes("customers can insert coupon redemptions"), false);
  });
});

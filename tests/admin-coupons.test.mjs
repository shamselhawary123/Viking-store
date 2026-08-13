import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCouponPayload,
  canDeleteCoupon,
  filterAdminCoupons,
  formatCouponDiscount,
  getCouponLifecycleStatus,
  getCouponRestrictionSummary,
  getCouponUsageCount,
  normalizeCouponCode,
  validateCouponForm,
} from "../utils/adminCoupons.ts";

describe("admin coupon helpers", () => {
  it("normalizes coupon codes consistently", () => {
    assert.equal(normalizeCouponCode("  summer10  "), "SUMMER10");
    assert.equal(normalizeCouponCode("vip deal"), "VIPDEAL");
  });

  it("validates coupon form values against database constraints", () => {
    assert.equal(validateCouponForm({ code: "", name: "Sale", discount_type: "percentage", discount_value: 10 }), "Code is required.");
    assert.equal(validateCouponForm({ code: "SALE", name: "", discount_type: "percentage", discount_value: 10 }), "Name is required.");
    assert.equal(validateCouponForm({ code: "SALE", name: "Sale", discount_type: "percentage", discount_value: 0 }), "Discount value must be greater than 0.");
    assert.equal(validateCouponForm({ code: "SALE", name: "Sale", discount_type: "percentage", discount_value: 101 }), "Percentage discount cannot exceed 100.");
    assert.equal(validateCouponForm({ code: "SALE", name: "Sale", discount_type: "fixed_amount", discount_value: 10, minimum_order_amount: -1 }), "Minimum order amount must be zero or more.");
    assert.equal(validateCouponForm({ code: "SALE", name: "Sale", discount_type: "percentage", discount_value: 10, starts_at: "2026-08-13T10:00", expires_at: "2026-08-12T10:00" }), "Expiration date must be after the start date.");
    assert.equal(validateCouponForm({ code: "SALE", name: "Sale", discount_type: "fixed_amount", discount_value: 10 }), "");
  });

  it("builds coupon payloads without usage counters or redemption fields", () => {
    const payload = buildCouponPayload({
      code: " sale10 ",
      name: "Sale",
      description: "",
      discount_type: "fixed_amount",
      discount_value: 10,
      minimum_order_amount: 0,
      maximum_discount_amount: 5,
      starts_at: "",
      expires_at: "",
      active: true,
      max_total_uses: null,
      max_uses_per_user: 2,
    });

    assert.deepEqual(payload, {
      code: "SALE10",
      name: "Sale",
      description: null,
      discount_type: "fixed_amount",
      discount_value: 10,
      minimum_order_amount: 0,
      maximum_discount_amount: null,
      starts_at: null,
      expires_at: null,
      active: true,
      max_total_uses: null,
      max_uses_per_user: 2,
    });
    assert.equal(Object.hasOwn(payload, "current_usage_count"), false);
    assert.equal(Object.hasOwn(payload, "coupon_redemptions"), false);
  });

  it("formats discounts and restriction summaries", () => {
    assert.equal(formatCouponDiscount({ discount_type: "percentage", discount_value: 15 }), "15%");
    assert.equal(formatCouponDiscount({ discount_type: "fixed_amount", discount_value: 25 }), "$25");
    assert.equal(getCouponRestrictionSummary({ coupon_products: [], coupon_categories: [] }), "All products");
    assert.equal(getCouponRestrictionSummary({ coupon_products: [{ products: { title: "Gloves" } }], coupon_categories: [] }), "1 product");
    assert.equal(getCouponRestrictionSummary({ coupon_products: [], coupon_categories: [{ categories: { name: "Wraps" } }, { categories: { name: "Gloves" } }] }), "2 categories");
  });

  it("derives usage count from redemption rows and blocks deleting used coupons", () => {
    const coupon = { coupon_redemptions: [{ id: "r1" }, { id: "r2" }] };

    assert.equal(getCouponUsageCount(coupon), 2);
    assert.equal(canDeleteCoupon(coupon), false);
    assert.equal(canDeleteCoupon({ coupon_redemptions: [] }), true);
  });

  it("filters coupons by search, active state, type, and lifecycle", () => {
    const now = new Date("2026-08-12T12:00:00Z");
    const coupons = [
      { id: "1", code: "ACTIVE10", name: "Active", active: true, discount_type: "percentage", starts_at: "2026-08-01T00:00:00Z", expires_at: "2026-08-20T00:00:00Z" },
      { id: "2", code: "OLD20", name: "Expired", active: true, discount_type: "fixed_amount", starts_at: "2026-08-01T00:00:00Z", expires_at: "2026-08-10T00:00:00Z" },
      { id: "3", code: "OFF", name: "Inactive", active: false, discount_type: "percentage", starts_at: null, expires_at: null },
    ];

    assert.equal(getCouponLifecycleStatus(coupons[0], now), "active");
    assert.equal(getCouponLifecycleStatus(coupons[1], now), "expired");
    assert.equal(getCouponLifecycleStatus(coupons[2], now), "inactive");
    assert.deepEqual(filterAdminCoupons(coupons, { search: "old", active: "all", type: "all", lifecycle: "all", sort: "newest" }, now).map((coupon) => coupon.id), ["2"]);
    assert.deepEqual(filterAdminCoupons(coupons, { search: "", active: "active", type: "percentage", lifecycle: "active", sort: "newest" }, now).map((coupon) => coupon.id), ["1"]);
  });
});

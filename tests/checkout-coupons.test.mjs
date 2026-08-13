import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateCartSubtotal,
  normalizeCheckoutCouponCode,
  validateCheckoutCoupon,
} from "../utils/checkoutCoupons.ts";

const now = new Date("2026-08-12T12:00:00.000Z");

const baseItems = [
  { id: 1, price: 100, quantity: 2, category_id: 10 },
  { id: 2, price: 50, quantity: 1, category_id: 20 },
];

const coupon = (overrides = {}) => ({
  id: "coupon-1",
  code: "SAVE10",
  active: true,
  discount_type: "percentage",
  discount_value: 10,
  minimum_order_amount: 0,
  maximum_discount_amount: null,
  starts_at: null,
  expires_at: null,
  max_total_uses: null,
  max_uses_per_user: null,
  productIds: [],
  categoryIds: [],
  totalRedemptions: 0,
  userRedemptions: 0,
  ...overrides,
});

const validate = (couponOverrides = {}, itemOverrides = {}) =>
  validateCheckoutCoupon({
    coupon: coupon(couponOverrides),
    items: itemOverrides.items || baseItems,
    userId: Object.hasOwn(itemOverrides, "userId") ? itemOverrides.userId : "user-1",
    now,
  });

describe("checkout coupon helpers", () => {
  it("normalizes coupon codes for case-insensitive matching", () => {
    assert.equal(normalizeCheckoutCouponCode("  save 10 "), "SAVE10");
  });

  it("calculates cart subtotal with decimal rounding", () => {
    assert.equal(calculateCartSubtotal([{ id: 1, price: 19.995, quantity: 2 }]), 39.99);
  });

  it("applies a valid percentage coupon to all products", () => {
    const result = validate({ discount_type: "percentage", discount_value: 10 });

    assert.equal(result.ok, true);
    assert.equal(result.discountAmount, 25);
    assert.equal(result.total, 225);
  });

  it("applies a valid fixed coupon without exceeding eligible subtotal", () => {
    const result = validate({ discount_type: "fixed_amount", discount_value: 300 });

    assert.equal(result.ok, true);
    assert.equal(result.discountAmount, 250);
    assert.equal(result.total, 0);
  });

  it("rejects expired coupons", () => {
    const result = validate({ expires_at: "2026-08-11T00:00:00.000Z" });

    assert.equal(result.ok, false);
    assert.equal(result.error, "Coupon has expired.");
  });

  it("rejects inactive coupons", () => {
    const result = validate({ active: false });

    assert.equal(result.ok, false);
    assert.equal(result.error, "Coupon is inactive.");
  });

  it("rejects coupons below the minimum order amount", () => {
    const result = validate({ minimum_order_amount: 300 });

    assert.equal(result.ok, false);
    assert.equal(result.error, "Minimum order amount not met.");
  });

  it("caps percentage discounts at maximum_discount_amount", () => {
    const result = validate({
      discount_type: "percentage",
      discount_value: 50,
      maximum_discount_amount: 40,
    });

    assert.equal(result.ok, true);
    assert.equal(result.discountAmount, 40);
    assert.equal(result.total, 210);
  });

  it("applies product restrictions only to matching products", () => {
    const result = validate({ productIds: [2], discount_type: "percentage", discount_value: 20 });

    assert.equal(result.ok, true);
    assert.equal(result.eligibleSubtotal, 50);
    assert.equal(result.discountAmount, 10);
  });

  it("applies category restrictions only to matching categories", () => {
    const result = validate({ categoryIds: [10], discount_type: "percentage", discount_value: 10 });

    assert.equal(result.ok, true);
    assert.equal(result.eligibleSubtotal, 200);
    assert.equal(result.discountAmount, 20);
  });

  it("rejects restricted coupons when no cart items are eligible", () => {
    const result = validate({ productIds: [99] });

    assert.equal(result.ok, false);
    assert.equal(result.error, "Coupon does not apply to the items in your cart.");
  });

  it("rejects coupons that reached the total usage limit", () => {
    const result = validate({ max_total_uses: 2, totalRedemptions: 2 });

    assert.equal(result.ok, false);
    assert.equal(result.error, "Coupon usage limit has been reached.");
  });

  it("rejects authenticated users that reached the per-user usage limit", () => {
    const result = validate({ max_uses_per_user: 1, userRedemptions: 1 });

    assert.equal(result.ok, false);
    assert.equal(result.error, "You have already used this coupon.");
  });

  it("requires authentication when a guest uses a per-user limited coupon", () => {
    const result = validate({ max_uses_per_user: 1 }, { userId: null });

    assert.equal(result.ok, false);
    assert.equal(result.requiresAuthentication, true);
    assert.equal(result.error, "Sign in to use this coupon.");
  });

  it("allows guest usage when no per-user limit exists", () => {
    const result = validate({ max_uses_per_user: null }, { userId: null });

    assert.equal(result.ok, true);
    assert.equal(result.discountAmount, 25);
  });

  it("rejects missing or invalid coupons", () => {
    const result = validateCheckoutCoupon({ coupon: null, items: baseItems, now });

    assert.equal(result.ok, false);
    assert.equal(result.error, "Coupon not found.");
  });
});

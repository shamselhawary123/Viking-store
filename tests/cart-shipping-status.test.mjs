import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  calculateCartShippingStatus,
  getCartMerchandiseSubtotal,
} from "../utils/cartShippingStatus.ts";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("cart shipping status", () => {
  it("uses cart item merchandise subtotal without shipping", () => {
    assert.equal(
      getCartMerchandiseSubtotal([
        { price: 125.5, quantity: 2 },
        { price: "69", quantity: "3" },
      ]),
      458,
    );
  });

  it("shows free shipping success when all orders ship free", () => {
    const status = calculateCartShippingStatus({
      subtotal: 320,
      settings: {
        shipping_enabled: true,
        free_shipping_all_orders: true,
        free_shipping_threshold_enabled: true,
        free_shipping_threshold: 2000,
      },
    });

    assert.equal(status.kind, "free_all");
    assert.equal(status.messageKey, "cart.freeShippingUnlocked");
    assert.equal(status.showProgress, false);
    assert.equal(status.progress, 100);
    assert.equal(status.remaining, 0);
  });

  it("derives remaining amount and progress from the configured threshold", () => {
    const status = calculateCartShippingStatus({
      subtotal: 320,
      settings: {
        shipping_enabled: true,
        free_shipping_all_orders: false,
        free_shipping_threshold_enabled: true,
        free_shipping_threshold: 2000,
      },
    });

    assert.equal(status.kind, "threshold_remaining");
    assert.equal(status.messageKey, "cart.freeShippingRemaining");
    assert.equal(status.showProgress, true);
    assert.equal(status.remaining, 1680);
    assert.equal(status.progress, 16);
  });

  it("uses a changed admin threshold without a hardcoded cart threshold", () => {
    const status = calculateCartShippingStatus({
      subtotal: 1250,
      settings: {
        shipping_enabled: true,
        free_shipping_all_orders: false,
        free_shipping_threshold_enabled: true,
        free_shipping_threshold: "5000",
      },
    });

    assert.equal(status.remaining, 3750);
    assert.equal(status.progress, 25);
  });

  it("qualifies exactly at or above the configured threshold", () => {
    for (const subtotal of [1500, 1900]) {
      const status = calculateCartShippingStatus({
        subtotal,
        settings: {
          shipping_enabled: true,
          free_shipping_all_orders: false,
          free_shipping_threshold_enabled: true,
          free_shipping_threshold: 1500,
        },
      });

      assert.equal(status.kind, "threshold_qualified");
      assert.equal(status.messageKey, "cart.freeShippingUnlocked");
      assert.equal(status.showProgress, true);
      assert.equal(status.progress, 100);
      assert.equal(status.remaining, 0);
    }
  });

  it("does not show a free-shipping progress bar when threshold mode is disabled", () => {
    const status = calculateCartShippingStatus({
      subtotal: 320,
      settings: {
        shipping_enabled: true,
        free_shipping_all_orders: false,
        free_shipping_threshold_enabled: false,
        free_shipping_threshold: 2000,
      },
    });

    assert.equal(status.kind, "calculated_at_checkout");
    assert.equal(status.messageKey, "cart.shippingCalculatedAtCheckout");
    assert.equal(status.showProgress, false);
    assert.equal(status.progress, 0);
    assert.equal(status.remaining, 0);
  });

  it("handles invalid thresholds and empty carts without NaN or Infinity", () => {
    for (const threshold of [null, 0, "", "not-a-number"]) {
      const status = calculateCartShippingStatus({
        subtotal: 0,
        settings: {
          shipping_enabled: true,
          free_shipping_all_orders: false,
          free_shipping_threshold_enabled: true,
          free_shipping_threshold: threshold,
        },
      });

      assert.equal(status.kind, "calculated_at_checkout");
      assert.equal(status.showProgress, false);
      assert.equal(Number.isFinite(status.progress), true);
      assert.equal(status.progress, 0);
      assert.equal(status.remaining, 0);
    }
  });

  it("keeps the cart page wired to real shipping settings and existing checkout behavior", () => {
    const cartPage = read("../pages/cart.vue");
    const checkoutPage = read("../pages/checkout.vue");
    const adminShippingPage = read("../pages/admin/shipping.vue");
    const localeEn = read("../locales/en.json");
    const localeAr = read("../locales/ar.json");

    assert.match(cartPage, /from\("shipping_settings"\)/);
    assert.match(cartPage, /shipping_enabled,free_shipping_all_orders,free_shipping_threshold_enabled,free_shipping_threshold,default_shipping_fee/);
    assert.match(cartPage, /calculateCartShippingStatus/);
    assert.match(cartPage, /getCartMerchandiseSubtotal\(cartStore\.items\)/);
    assert.match(cartPage, /router\.push\("\/checkout"\)/);
    assert.doesNotMatch(cartPage, /shippingProgress\s*=\s*computed\(\(\)\s*=>\s*\(cartStore\.items\.length\s*\?\s*100\s*:\s*0\)\)/);
    assert.doesNotMatch(cartPage, /2000/);
    assert.doesNotMatch(read("../utils/cartShippingStatus.ts"), /2000/);
    assert.match(checkoutPage, /preview_checkout_totals/);
    assert.match(checkoutPage, /shippingPreview/);
    assert.match(adminShippingPage, /free_shipping_all_orders/);
    assert.match(adminShippingPage, /free_shipping_threshold_enabled/);
    assert.match(adminShippingPage, /free_shipping_threshold/);
    assert.match(localeEn, /freeShippingRemaining/);
    assert.match(localeEn, /shippingCalculatedAtCheckout/);
    assert.match(localeAr, /freeShippingRemaining/);
    assert.match(localeAr, /shippingCalculatedAtCheckout/);
  });
});

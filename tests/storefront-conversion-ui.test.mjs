import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { getDiscountPercent, getSavingsAmount } from "../utils/localizationFormat.ts";
import {
  buildVariantSelectionState,
  getInitialVariantSelection,
  getVariantPriceState,
} from "../utils/storefrontProductVariants.ts";

const productPage = readFileSync("pages/shop/[slug].vue", "utf8");
const productCard = readFileSync("components/shop/ProductCard.vue", "utf8");
const checkoutPage = readFileSync("pages/checkout.vue", "utf8");
const css = readFileSync("assets/css/main.css", "utf8");
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

const variantProduct = {
  inventory_model: "variants",
  product_colors: [{ id: 1, name: "Red", value: "#f00", product_images: [] }],
  product_sizes: [{ id: 10, size: "L" }, { id: 11, size: "XL" }],
  product_variants: [
    { id: 100, color_id: 1, size_id: 10, price: 1200, old_price: 2000, stock_quantity: 3, is_active: true },
    { id: 101, color_id: 1, size_id: 11, price: 1500, old_price: 1500, stock_quantity: 8, is_active: true },
  ],
};

describe("storefront conversion UI", () => {
  it("calculates valid discount percentage and exact EGP savings only for real discounts", () => {
    assert.equal(getDiscountPercent(2000, 1200), 40);
    assert.equal(getSavingsAmount(2000, 1200), 800);
    assert.equal(getDiscountPercent(1200, 1200), 0);
    assert.equal(getSavingsAmount(1200, 1200), 0);
    assert.equal(getSavingsAmount(1000, 1200), 0);
  });

  it("uses selected variant prices for discount and savings values", () => {
    const state = buildVariantSelectionState(variantProduct);
    const selection = getInitialVariantSelection(state);
    const firstPrice = getVariantPriceState(state, { colorId: selection.color?.id, sizeId: selection.size?.id });
    const secondPrice = getVariantPriceState(state, { colorId: 1, sizeId: 11 });

    assert.deepEqual(firstPrice, { type: "selected", price: 1200, oldPrice: 2000 });
    assert.equal(getDiscountPercent(firstPrice.oldPrice, firstPrice.price), 40);
    assert.equal(getSavingsAmount(firstPrice.oldPrice, firstPrice.price), 800);
    assert.deepEqual(secondPrice, { type: "selected", price: 1500, oldPrice: 1500 });
    assert.equal(getSavingsAmount(secondPrice.oldPrice, secondPrice.price), 0);
  });

  it("keeps the single existing mobile sticky buy bar and adds purchase CTA shine only to purchase actions", () => {
    const mobileCtaMatches = productPage.match(/mobile-product-cta/g) || [];
    assert.equal(mobileCtaMatches.length, 1);
    assert.match(productPage, /env\(safe-area-inset-bottom\)/);
    assert.match(productPage, /purchase-cta-shine[\s\S]*shop\.addToCart/);
    assert.match(productPage, /purchase-cta-shine[\s\S]*shop\.buyNow/);
    assert.match(checkoutPage, /purchase-cta-shine[\s\S]*checkout\.placeGuest/);
  });

  it("defines a CSS-only premium shine with reduced-motion protection", () => {
    assert.match(css, /\.purchase-cta-shine/);
    assert.match(css, /@keyframes purchase-cta-shine/);
    assert.match(css, /prefers-reduced-motion: reduce[\s\S]*\.purchase-cta-shine::before/);
    assert.match(css, /animation:\s*none/);
  });

  it("shows variant-aware sale savings and real low-stock messaging on the product page", () => {
    assert.match(productPage, /const savingsAmount = computed/);
    assert.match(productPage, /shop\.saveAmount/);
    assert.match(productPage, /const lowStockMessage = computed/);
    assert.match(productPage, /shop\.lowStockOnly/);
    assert.doesNotMatch(productPage, /countdown|sale ends today|people are viewing|recent purchases/i);
  });

  it("shows the selected-variant low-stock warning only for stock one through three", () => {
    const lowStockBlock = productPage.match(/const lowStockMessage = computed\(\(\) => \{[\s\S]*?\n\}\);/)?.[0] || "";
    const threshold = Number(lowStockBlock.match(/stock > 0 && stock <= (\d+)/)?.[1]);
    const shouldShowWarning = (stock) => stock > 0 && stock <= threshold;

    assert.match(lowStockBlock, /selectedVariant\.value\.stock_quantity/);
    assert.equal(shouldShowWarning(0), false);
    assert.equal(shouldShowWarning(1), true);
    assert.equal(shouldShowWarning(2), true);
    assert.equal(shouldShowWarning(3), true);
    assert.equal(shouldShowWarning(4), false);
    assert.equal(shouldShowWarning(12), false);
  });

  it("separates ProductCard sale badge from secondary marketing badge without changing card dimensions", () => {
    assert.match(productCard, /sale-badge-primary/);
    assert.match(productCard, /marketing-badge-secondary/);
    assert.match(productCard, /cardSavingsAmount/);
    assert.match(productCard, /shop\.saveAmount/);
    assert.match(productCard, /aspect-\[4\/5\]/);
    assert.match(productCard, /width="640"/);
    assert.match(productCard, /height="800"/);
  });

  it("keeps real reviews and required conversion labels localized", () => {
    assert.match(productPage, /reviewSummary/);
    for (const key of ["saveAmount", "lowStockOnly"]) {
      assert.equal(typeof en.shop[key], "string", `missing en.shop.${key}`);
      assert.equal(typeof ar.shop[key], "string", `missing ar.shop.${key}`);
    }
  });
});

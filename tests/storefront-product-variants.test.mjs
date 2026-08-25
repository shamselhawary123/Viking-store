import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  buildVariantSelectionState,
  getVariantGalleryImages,
  getInitialVariantSelection,
  getVariantPriceState,
  getVariantSelectionErrorKey,
  isLegacyInventoryProduct,
  resolveSelectedVariant,
} from "../utils/storefrontProductVariants.ts";

const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));
const productPage = readFileSync("pages/shop/[slug].vue", "utf8");
const shopProducts = readFileSync("utils/shopProducts.ts", "utf8");

const color = (id, name, images = []) => ({
  id,
  name,
  value: name === "Red" ? "#ff0000" : "#000000",
  product_images: images.map((image_url, index) => ({ id: index + 1, image_url })),
});

const size = (id, label) => ({ id, size: label, in_stock: true });

const variant = ({ id, color_id = null, size_id = null, price, stock_quantity, is_active = true }) => ({
  id,
  color_id,
  size_id,
  price,
  stock_quantity,
  is_active,
});

const variantProduct = (overrides = {}) => ({
  id: 10,
  title: "Variant Gloves",
  inventory_model: "variants",
  price: 800,
  cover_image: "/cover.png",
  product_colors: [
    color(1, "Red", ["/red-1.png", "/red-2.png"]),
    color(2, "Black", ["/black-1.png"]),
    color(3, "Blue", ["/blue-1.png"]),
  ],
  product_sizes: [size(11, "M"), size(12, "L"), size(13, "XL")],
  product_variants: [
    variant({ id: 101, color_id: 1, size_id: 12, price: 850, stock_quantity: 4 }),
    variant({ id: 102, color_id: 1, size_id: 13, price: 900, stock_quantity: 2 }),
    variant({ id: 103, color_id: 2, size_id: 11, price: 800, stock_quantity: 3 }),
    variant({ id: 104, color_id: 2, size_id: 12, price: 870, stock_quantity: 5 }),
    variant({ id: 105, color_id: 2, size_id: 13, price: 920, stock_quantity: 0 }),
    variant({ id: 106, color_id: 3, size_id: 12, price: 880, stock_quantity: 9, is_active: false }),
  ],
  ...overrides,
});

describe("storefront product variants", () => {
  it("keeps legacy products on the legacy inventory path", () => {
    assert.equal(isLegacyInventoryProduct({ inventory_model: "legacy" }), true);
    assert.equal(isLegacyInventoryProduct({ inventory_model: "variants" }), false);
  });

  it("detects color and size mode from active variants only", () => {
    const state = buildVariantSelectionState(variantProduct());

    assert.equal(state.mode, "color_size");
    assert.deepEqual(state.colors.map((item) => [item.id, item.name, item.soldOut]), [
      [1, "Red", false],
      [2, "Black", false],
    ]);
    assert.deepEqual(state.sizesForColor(1).map((item) => [item.id, item.label, item.soldOut]), [
      [12, "L", false],
      [13, "XL", false],
    ]);
    assert.deepEqual(state.sizesForColor(2).map((item) => [item.id, item.label, item.soldOut]), [
      [11, "M", false],
      [12, "L", false],
      [13, "XL", true],
    ]);
  });

  it("does not expose nonexistent, inactive, or stale color-size combinations", () => {
    const state = buildVariantSelectionState(variantProduct());

    assert.equal(resolveSelectedVariant(state, { colorId: 1, sizeId: 11 }), null);
    assert.equal(resolveSelectedVariant(state, { colorId: 3, sizeId: 12 }), null);
    assert.equal(resolveSelectedVariant(state, { colorId: 1, sizeId: 12 })?.id, 101);
  });

  it("auto-selects the first stable color and first in-stock size on initial load", () => {
    const state = buildVariantSelectionState(variantProduct());
    const selection = getInitialVariantSelection(state);

    assert.equal(selection.color?.id, 1);
    assert.equal(selection.size?.id, 12);
    assert.deepEqual(getVariantGalleryImages(variantProduct(), state, selection.color?.id), ["/red-1.png", "/red-2.png"]);
    assert.deepEqual(getVariantPriceState(state, { colorId: selection.color?.id, sizeId: selection.size?.id }), {
      type: "selected",
      price: 850,
    });
  });

  it("skips stock-zero variants for auto-selection while keeping them visible and disabled", () => {
    const state = buildVariantSelectionState(variantProduct({
      product_variants: [
        variant({ id: 101, color_id: 1, size_id: 12, price: 850, stock_quantity: 0 }),
        variant({ id: 102, color_id: 1, size_id: 13, price: 900, stock_quantity: 2 }),
      ],
    }));
    const selection = getInitialVariantSelection(state);

    assert.equal(selection.color?.id, 1);
    assert.equal(selection.size?.id, 13);
    assert.deepEqual(state.sizesForColor(1).map((item) => [item.id, item.soldOut]), [
      [12, true],
      [13, false],
    ]);
    assert.match(productPage, /text-neutral-600 line-through/);
  });

  it("uses the first later color with stock when the first color is sold out", () => {
    const state = buildVariantSelectionState(variantProduct({
      product_variants: [
        variant({ id: 101, color_id: 1, size_id: 12, price: 850, stock_quantity: 0 }),
        variant({ id: 102, color_id: 1, size_id: 13, price: 900, stock_quantity: 0 }),
        variant({ id: 103, color_id: 2, size_id: 11, price: 800, stock_quantity: 3 }),
      ],
    }));
    const selection = getInitialVariantSelection(state);

    assert.equal(selection.color?.id, 2);
    assert.equal(selection.size?.id, 11);
    assert.equal(state.colors[0].soldOut, true);
    assert.match(productPage, /color\.soldOut[\s\S]*absolute h-px w-12 rotate-45/);
  });

  it("keeps sold-out products visible without selecting stock-zero variants", () => {
    const state = buildVariantSelectionState(variantProduct({
      product_variants: [
        variant({ id: 101, color_id: 1, size_id: 12, price: 850, stock_quantity: 0 }),
        variant({ id: 102, color_id: 2, size_id: 11, price: 800, stock_quantity: 0 }),
      ],
    }));
    const selection = getInitialVariantSelection(state);

    assert.equal(state.hasAvailableStock, false);
    assert.equal(selection.color?.id, 1);
    assert.equal(selection.size, null);
    assert.equal(state.colors.length, 2);
    assert.equal(state.sizesForColor(1)[0].soldOut, true);
  });

  it("invalidates a stale selected size when changing color", () => {
    const state = buildVariantSelectionState(variantProduct());

    assert.equal(state.isSizeValidForColor(13, 1), true);
    assert.equal(state.isSizeValidForColor(13, 2), true);
    assert.equal(state.isSizePurchasableForColor(13, 2), false);
    assert.equal(state.isSizeValidForColor(11, 1), false);
  });

  it("resolves exact selected prices and From minimum price states", () => {
    const state = buildVariantSelectionState(variantProduct());

    assert.deepEqual(getVariantPriceState(state, { colorId: 1, sizeId: 12 }), {
      type: "selected",
      price: 850,
    });
    assert.deepEqual(getVariantPriceState(state, { colorId: 1, sizeId: null }), {
      type: "from",
      price: 850,
    });
  });

  it("shows a single price when all relevant variants have the same price", () => {
    const state = buildVariantSelectionState(variantProduct({
      product_variants: [
        variant({ id: 201, color_id: 1, size_id: 12, price: 700, stock_quantity: 1 }),
        variant({ id: 202, color_id: 1, size_id: 13, price: 700, stock_quantity: 1 }),
      ],
    }));

    assert.deepEqual(getVariantPriceState(state, { colorId: 1, sizeId: null }), {
      type: "single",
      price: 700,
    });
  });

  it("switches gallery by color and keeps same-color images on size change", () => {
    const state = buildVariantSelectionState(variantProduct());
    const fallbackProduct = variantProduct({ product_colors: [color(1, "Red", [])] });
    const fallbackState = buildVariantSelectionState(fallbackProduct);

    assert.deepEqual(getVariantGalleryImages(variantProduct(), state, 1), ["/red-1.png", "/red-2.png"]);
    assert.deepEqual(getVariantGalleryImages(variantProduct(), state, 1), getVariantGalleryImages(variantProduct(), state, 1));
    assert.deepEqual(getVariantGalleryImages(fallbackProduct, fallbackState, 1), ["/cover.png"]);
    assert.match(productPage, /selectedSize\.value = variantState\.value\.firstAvailableSizeForColor\(color\.id\)\?\.label \|\| ""/);
    assert.match(productPage, /watch\(product, initializeProductSelection, \{ immediate: true \}\)/);
  });

  it("keeps stock-zero active variants visible but not purchasable and detects fully sold out products", () => {
    const state = buildVariantSelectionState(variantProduct());
    const soldOutState = buildVariantSelectionState(variantProduct({
      product_variants: [
        variant({ id: 301, color_id: 1, size_id: 12, price: 850, stock_quantity: 0 }),
      ],
    }));

    assert.equal(resolveSelectedVariant(state, { colorId: 2, sizeId: 13 })?.stock_quantity, 0);
    assert.equal(state.hasAvailableStock, true);
    assert.equal(soldOutState.hasAvailableStock, false);
    assert.equal(soldOutState.colors[0].soldOut, true);
  });

  it("supports size-only, color-only, and simple/default modes", () => {
    const sizeOnly = buildVariantSelectionState(variantProduct({
      product_colors: [],
      product_variants: [
        variant({ id: 401, size_id: 11, price: 650, stock_quantity: 1 }),
      ],
    }));
    assert.equal(sizeOnly.mode, "size_only");
    assert.equal(resolveSelectedVariant(sizeOnly, { sizeId: 11 })?.id, 401);

    const colorOnly = buildVariantSelectionState(variantProduct({
      product_sizes: [],
      product_variants: [
        variant({ id: 501, color_id: 1, price: 750, stock_quantity: 1 }),
      ],
    }));
    assert.equal(colorOnly.mode, "color_only");
    assert.equal(resolveSelectedVariant(colorOnly, { colorId: 1 })?.id, 501);

    const simple = buildVariantSelectionState(variantProduct({
      product_colors: [],
      product_sizes: [],
      product_variants: [
        variant({ id: 601, price: 500, stock_quantity: 1 }),
      ],
    }));
    assert.equal(simple.mode, "simple");
    assert.equal(resolveSelectedVariant(simple, {})?.id, 601);
  });

  it("returns localized selection error keys and allows exact selected variant cart insertion", () => {
    const state = buildVariantSelectionState(variantProduct());

    assert.equal(getVariantSelectionErrorKey(state, {}), "shop.selectColorRequired");
    assert.equal(getVariantSelectionErrorKey(state, { colorId: 1 }), "shop.selectSizeRequired");
    assert.equal(getVariantSelectionErrorKey(state, { colorId: 2, sizeId: 13 }), "shop.outOfStock");
    assert.equal(getVariantSelectionErrorKey(state, { colorId: 1, sizeId: 12 }), "");
    assert.doesNotMatch(productPage, /variantCartPhase4Blocked/);
    assert.match(productPage, /cartStore\.addToCart[\s\S]*selectedVariant\.value/);
  });

  it("defines Arabic and English storefront variant strings", () => {
    for (const key of [
      "fromPrice",
      "selectColorRequired",
      "selectSizeRequired",
      "unavailableCombination",
    ]) {
      assert.equal(typeof en.shop[key], "string", `missing en.shop.${key}`);
      assert.equal(typeof ar.shop[key], "string", `missing ar.shop.${key}`);
    }
  });

  it("uses a detail-only product select so shop cards do not fetch all variants", () => {
    const listingSelect = shopProducts.match(/export const SHOP_PRODUCTS_SELECT = `([\s\S]*?)`;/)?.[1] || "";
    assert.doesNotMatch(listingSelect, /product_variants/);
    assert.match(shopProducts, /SHOP_PRODUCT_DETAIL_SELECT[\s\S]*product_variants/);
    assert.match(productPage, /product_variants\.is_active/);
  });
});

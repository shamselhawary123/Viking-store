import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SHOP_DEFAULT_MAX_PRICE,
  SHOP_PRODUCTS_SELECT,
  isWithinShopPriceLimit,
} from "../utils/shopProducts.ts";

describe("shop product loading helpers", () => {
  it("selects the relations the storefront needs for admin-created products", () => {
    assert.match(SHOP_PRODUCTS_SELECT, /categories/);
    assert.match(SHOP_PRODUCTS_SELECT, /product_colors/);
    assert.match(SHOP_PRODUCTS_SELECT, /product_images/);
    assert.match(SHOP_PRODUCTS_SELECT, /product_sizes/);
  });

  it("does not hide products above the default price slider value", () => {
    assert.equal(SHOP_DEFAULT_MAX_PRICE, 10000);
    assert.equal(isWithinShopPriceLimit(30000, 25000), true);
    assert.equal(isWithinShopPriceLimit(30000, 24900), false);
  });
});

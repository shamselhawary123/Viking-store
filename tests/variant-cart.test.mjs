import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addCartItem,
  getCartItemIdentity,
  increaseCartItemQuantity,
  normalizeCartItems,
} from "../utils/cartItems.ts";

const legacyProduct = {
  id: 1,
  title: "Legacy Gloves",
  slug: "legacy-gloves",
  price: 500,
  cover_image: "/legacy.png",
  category: "Gloves",
};

const variantProduct = {
  id: 2,
  title: "Variant Gloves",
  slug: "variant-gloves",
  price: 800,
  cover_image: "/variant.png",
  category: "Gloves",
};

describe("variant cart items", () => {
  it("keeps old persisted legacy cart items compatible", () => {
    const [item] = normalizeCartItems([
      { id: 1, title: "Legacy", price: 100, color: "Black", size: "L", quantity: 1 },
    ]);

    assert.equal(item.variant_id, null);
    assert.equal(getCartItemIdentity(item), "legacy:1:Black:L");
  });

  it("uses product_id + variant_id identity for variant products", () => {
    const items = addCartItem([], {
      product: variantProduct,
      selectedColor: { name: "Red", value: "#f00" },
      selectedSize: "L",
      quantity: 1,
      selectedImage: "/red.png",
      variant: { id: 50, price: 850, stock_quantity: 4 },
    });

    assert.equal(items[0].id, 2);
    assert.equal(items[0].variant_id, 50);
    assert.equal(items[0].price, 850);
    assert.equal(items[0].maxStock, 4);
    assert.equal(getCartItemIdentity(items[0]), "variant:2:50");
  });

  it("keeps same product different variants separate and merges same variant quantities", () => {
    let items = addCartItem([], {
      product: variantProduct,
      selectedColor: { name: "Red" },
      selectedSize: "L",
      quantity: 1,
      selectedImage: "/red-l.png",
      variant: { id: 50, price: 850, stock_quantity: 4 },
    });
    items = addCartItem(items, {
      product: variantProduct,
      selectedColor: { name: "Red" },
      selectedSize: "XL",
      quantity: 1,
      selectedImage: "/red-xl.png",
      variant: { id: 51, price: 900, stock_quantity: 2 },
    });
    items = addCartItem(items, {
      product: variantProduct,
      selectedColor: { name: "Red" },
      selectedSize: "L",
      quantity: 2,
      selectedImage: "/red-l.png",
      variant: { id: 50, price: 850, stock_quantity: 4 },
    });

    assert.equal(items.length, 2);
    assert.deepEqual(items.map((item) => [item.variant_id, item.quantity]), [[50, 3], [51, 1]]);
  });

  it("caps variant quantity at known stock in normal cart UI helpers", () => {
    const [item] = addCartItem([], {
      product: variantProduct,
      selectedColor: { name: "Red" },
      selectedSize: "L",
      quantity: 4,
      selectedImage: "/red-l.png",
      variant: { id: 50, price: 850, stock_quantity: 4 },
    });

    const result = increaseCartItemQuantity(item);
    assert.equal(result.item.quantity, 4);
    assert.equal(result.errorKey, "cart.quantityExceedsStock");
  });

  it("preserves legacy merge behavior by product color and size", () => {
    let items = addCartItem([], {
      product: legacyProduct,
      selectedColor: { name: "Black" },
      selectedSize: "L",
      quantity: 1,
      selectedImage: "/black.png",
    });
    items = addCartItem(items, {
      product: legacyProduct,
      selectedColor: { name: "Black" },
      selectedSize: "L",
      quantity: 2,
      selectedImage: "/black.png",
    });

    assert.equal(items.length, 1);
    assert.equal(items[0].quantity, 3);
    assert.equal(items[0].variant_id, null);
  });
});

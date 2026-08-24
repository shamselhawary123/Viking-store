import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(path, "utf8");

const layout = read("layouts/admin.vue");
const dashboard = read("pages/admin/index.vue");
const products = read("pages/admin/products.vue");
const orders = read("pages/admin/orders.vue");
const coupons = read("pages/admin/coupons.vue");
const users = read("pages/admin/users.vue");
const blog = read("pages/admin/blog/index.vue");

describe("admin mobile responsive source", () => {
  it("uses an off-canvas mobile drawer while preserving the desktop sidebar", () => {
    assert.match(layout, /hidden w-72[\s\S]*lg:block/);
    assert.match(layout, /admin-mobile-drawer/);
    assert.match(layout, /admin-mobile-backdrop/);
    assert.match(layout, /Escape/);
    assert.match(layout, /document\.body\.style\.overflow/);
    assert.match(layout, /:dir="isRtl \? 'rtl' : 'ltr'"/);
  });

  it("adds mobile card/list presentations for operational admin tables", () => {
    for (const source of [dashboard, products, orders, coupons, users, blog]) {
      assert.match(source, /admin-mobile-card/);
      assert.match(source, /md:hidden/);
    }
  });

  it("keeps product ordering and drag behavior available in mobile card mode", () => {
    assert.match(products, /productCardList/);
    assert.match(products, /useDraggable\(productCardList/);
    assert.match(products, /product-drag-handle/);
    assert.match(products, /move_product_shop_position"/);
    assert.match(products, /move_product_shop_position_to/);
  });

  it("keeps desktop tables controlled instead of causing page-level overflow", () => {
    for (const source of [dashboard, products, orders, coupons, users, blog]) {
      assert.match(source, /hidden md:block|md:hidden/);
      assert.match(source, /overflow-x-auto/);
    }
  });
});

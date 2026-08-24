import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  adminOrderStatusLabelKey,
  adminPaymentStatusLabelKey,
} from "../utils/admin.ts";

const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

const adminSourceRoots = ["pages/admin", "layouts/admin.vue", "components/shared/BlogPostForm.vue"];

const walkFiles = (path) => {
  const stat = statSync(path);
  if (stat.isFile()) return [path];

  return readdirSync(path).flatMap((entry) => walkFiles(join(path, entry)));
};

const adminSourceFiles = adminSourceRoots.flatMap(walkFiles).filter((file) => file.endsWith(".vue"));

const requiredAdminKeys = [
  "overview",
  "dashboardHome",
  "recentOrders",
  "manageOrders",
  "recentProducts",
  "manageProducts",
  "products",
  "orders",
  "categories",
  "coupons",
  "users",
  "settings",
  "searchProducts",
  "searchOrders",
  "searchUsers",
  "searchCoupons",
  "inStock",
  "outOfStock",
  "manualOrder",
  "orderStatus",
  "paymentStatus",
  "status.pending",
  "status.processing",
  "status.shipped",
  "status.delivered",
  "status.cancelled",
  "paymentStatusValues.paid",
  "paymentStatusValues.unpaid",
];

const getPath = (object, path) =>
  path.split(".").reduce((value, part) => value?.[part], object);

const collectStrings = (value, path = []) => {
  if (typeof value === "string") return [{ path: path.join("."), value }];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, next]) => collectStrings(next, [...path, key]));
};

describe("admin i18n", () => {
  it("does not contain corrupted question-mark Arabic in admin locales or source", () => {
    const corruptedAdminValues = collectStrings(ar.admin).filter(({ value }) => /\?{3,}/.test(value));
    assert.deepEqual(corruptedAdminValues, []);

    const corruptedSourceFiles = adminSourceFiles.filter((file) => /\?{3,}/.test(readFileSync(file, "utf8")));
    assert.deepEqual(corruptedSourceFiles, []);
  });

  it("defines required admin keys in English and Arabic", () => {
    for (const key of requiredAdminKeys) {
      assert.equal(typeof getPath(en.admin, key), "string", `missing en.admin.${key}`);
      assert.equal(typeof getPath(ar.admin, key), "string", `missing ar.admin.${key}`);
    }
  });

  it("maps raw order and payment statuses to admin locale keys", () => {
    assert.equal(adminOrderStatusLabelKey("pending"), "admin.status.pending");
    assert.equal(adminOrderStatusLabelKey("delivered"), "admin.status.delivered");
    assert.equal(adminPaymentStatusLabelKey("paid"), "admin.paymentStatusValues.paid");
    assert.equal(adminPaymentStatusLabelKey("unpaid"), "admin.paymentStatusValues.unpaid");
  });

  it("sets admin layout direction from the active locale", () => {
    const layout = readFileSync("layouts/admin.vue", "utf8");
    assert.match(layout, /:dir="isRtl \? 'rtl' : 'ltr'"/);
    assert.match(layout, /:class="isRtl \? 'text-right' : 'text-left'"/);
  });

  it("keeps product drag ordering implementation intact", () => {
    const source = readFileSync("pages/admin/products.vue", "utf8");
    assert.match(source, /useDraggable/);
    assert.match(source, /move_product_shop_position_to/);
    assert.match(source, /move_product_shop_position"/);
  });
});

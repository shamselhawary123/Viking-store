import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("viewport overlays that must ignore page scroll are body teleports", () => {
  const loader = read("components/shared/VikingGlobalLoader.vue");
  const productPage = read("pages/shop/[slug].vue");
  const adminProducts = read("pages/admin/products.vue");

  assert.match(loader, /<Teleport\s+to=["']body["']>[\s\S]*fixed\s+inset-0/);
  assert.match(productPage, /<Teleport\s+to=["']body["']>[\s\S]*mobile-product-cta[\s\S]*fixed\s+inset-x-0\s+bottom-0/);
  assert.match(adminProducts, /<Teleport\s+to=["']body["']>[\s\S]*admin-product-modal[\s\S]*fixed\s+inset-0/);
});

test("RTL root containers stay non-transformed so fixed layers use viewport geometry", () => {
  const css = read("assets/css/main.css");
  const app = read("app.vue");
  const defaultLayout = read("layouts/default.vue");
  const adminLayout = read("layouts/admin.vue");

  const rootSizingRule = css.match(/html,\s*body,\s*#__(?:nuxt)\s*{[\s\S]*?}/);
  assert.ok(rootSizingRule);
  assert.doesNotMatch(rootSizingRule[0], /transform\s*:/);
  assert.doesNotMatch(rootSizingRule[0], /translate\s*:/);
  assert.doesNotMatch(rootSizingRule[0], /filter\s*:/);
  assert.doesNotMatch(rootSizingRule[0], /perspective\s*:/);
  assert.doesNotMatch(rootSizingRule[0], /contain\s*:/);
  assert.doesNotMatch(rootSizingRule[0], /will-change\s*:/);
  const rtlRootRule = css.match(/html\[dir="rtl"\]\s*{[\s\S]*?}/)?.[0] || "";
  assert.doesNotMatch(rtlRootRule, /transform\s*:/);
  assert.doesNotMatch(rtlRootRule, /translate\s*:/);

  for (const source of [app, defaultLayout, adminLayout]) {
    assert.doesNotMatch(source, /document\.documentElement\.style\.(transform|translate)/);
  }
});

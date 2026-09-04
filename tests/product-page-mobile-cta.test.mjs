import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const productPage = () => readFileSync("pages/shop/[slug].vue", "utf8");

test("product mobile CTA is a viewport-fixed body layer", () => {
  const source = productPage();
  const mobileCtaStart = source.indexOf("mobile-product-cta");

  assert.notEqual(mobileCtaStart, -1, "mobile CTA should have a stable marker class");

  const beforeCta = source.slice(0, mobileCtaStart);
  const mobileCta = source.slice(mobileCtaStart, source.indexOf("<div v-if=\"isLightboxOpen\"", mobileCtaStart));

  assert.match(beforeCta, /<Teleport\s+to=["']body["']>\s*<div\s+v-if=["']product["']/);
  assert.match(mobileCta, /fixed\s+inset-x-0\s+bottom-0/);
  assert.match(mobileCta, /sm:hidden/);
  assert.match(mobileCta, /shop\.buyNow/);
  assert.match(mobileCta, /shop\.addToCart/);
});

test("desktop product actions remain in the normal product details layout", () => {
  const source = productPage();
  const desktopActions = source.match(/<div class=["']hidden grid-cols-\[1fr_1fr_auto\][\s\S]*?<\/div>\s*<a/);

  assert.ok(desktopActions, "desktop action grid should remain unchanged");
  assert.match(desktopActions[0], /shop\.addToCart/);
  assert.match(desktopActions[0], /shop\.buyNow/);
  assert.doesNotMatch(desktopActions[0], /<Teleport/);
});

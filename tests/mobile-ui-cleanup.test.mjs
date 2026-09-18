import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const registerPage = read("../pages/auth/register.vue");
const shopPage = read("../pages/shop/index.vue");
const checkoutPage = read("../pages/checkout.vue");
const mainCss = read("../assets/css/main.css");
const defaultLayout = read("../layouts/default.vue");
const app = read("../app.vue");

const classForFirstTagContaining = (source, tag, marker) => {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `missing marker ${marker}`);

  const beforeMarker = source.slice(0, markerIndex);
  const tagMatches = [...beforeMarker.matchAll(new RegExp(`<${tag}\\b[^>]*class="([^"]+)"`, "g"))];
  assert.ok(tagMatches.length, `missing classed <${tag}> before ${marker}`);

  return tagMatches.at(-1)[1];
};

const classForTagWithClassFragment = (source, tag, fragment) => {
  const tagMatches = [...source.matchAll(new RegExp(`<${tag}\\b[^>]*class="([^"]+)"`, "g"))];
  const match = tagMatches.find(([, className]) => className.includes(fragment));

  assert.ok(match, `missing <${tag}> class containing ${fragment}`);

  return match[1];
};

const rootCssBlocks = (source) =>
  [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, selector]) => {
    const selectors = selector.split(",").map((item) => item.trim());

    return selectors.every((item) =>
      ["html", "body", "#__nuxt", 'html[dir="rtl"]', 'body[dir="rtl"]'].includes(item),
    );
  });

describe("mobile UI cleanup", () => {
  it("keeps the register page width-safe on mobile without masking overflow", () => {
    const shellClass = classForFirstTagContaining(registerPage, "section", "max-w-6xl");
    const panelClass = classForTagWithClassFragment(registerPage, "div", "lg:grid-cols-2");
    const formColumnClass = classForTagWithClassFragment(registerPage, "div", "md:p-10");
    const formInnerClass = classForTagWithClassFragment(registerPage, "div", "max-w-xl");
    const avatarRowClass = classForTagWithClassFragment(registerPage, "div", "flex-wrap items-center");
    const formClass = classForFirstTagContaining(registerPage, "form", "handleRegister");

    for (const className of [shellClass, panelClass, formColumnClass, formInnerClass, avatarRowClass, formClass]) {
      assert.match(className, /\bmin-w-0\b/);
    }

    const controlClassMatches = [
      ...registerPage.matchAll(/<(input|select|textarea)\b[^>]*class="([^"]+)"/g),
    ].filter((match) => !/\bhidden\b/.test(match[2]));

    assert.ok(controlClassMatches.length >= 10, "expected the register form controls to be inspected");

    for (const [, tag, className] of controlClassMatches) {
      assert.match(className, /\bw-full\b/, `${tag} should fill only its own safe container`);
      assert.match(className, /\bmin-w-0\b/, `${tag} should be allowed to shrink inside mobile grids`);
    }

    assert.match(registerPage, /\btext-start\b/);
    assert.doesNotMatch(registerPage, /\bright-5\b/);
    assert.doesNotMatch(registerPage, /\bpr-20\b/);
    assert.doesNotMatch(registerPage, /\boverflow-x-(?:hidden|clip)\b/);
  });

  it("hides only the shop intro stats hero on mobile while keeping catalog controls visible", () => {
    const heroClass = classForTagWithClassFragment(shopPage, "div", "mb-8 hidden");

    assert.match(heroClass, /\bhidden\b/);
    assert.match(heroClass, /\bmd:block\b/);
    assert.match(shopPage, /<ShopSidebar\s*\/>/);
    assert.match(shopPage, /<ShopTopbar\s+:total-products="productsStore\.products\.length"\s*\/>/);
    assert.match(shopPage, /<ShopProductGrid\s+:products="filteredProducts"\s*\/>/);
    assert.doesNotMatch(shopPage, /<Shop(?:Sidebar|Topbar|ProductGrid)[^>]*\bhidden\b/);
  });

  it("hides only the checkout intro hero on mobile while preserving checkout choices", () => {
    const heroClass = classForTagWithClassFragment(checkoutPage, "div", "mb-10 hidden");

    assert.match(heroClass, /\bhidden\b/);
    assert.match(heroClass, /\bmd:block\b/);
    assert.match(checkoutPage, /checkoutMode === 'guest'/);
    assert.match(checkoutPage, /checkoutMode === 'account'/);
    assert.match(checkoutPage, /t\("checkout\.guestTitle"\)/);
    assert.match(checkoutPage, /t\("checkout\.accountTitle"\)/);
    assert.doesNotMatch(checkoutPage, /checkout-choice[^"]*\bhidden\b/);
  });

  it("does not add transformed containing-block properties to root app containers", () => {
    const combinedRootSource = [mainCss, defaultLayout, app].join("\n");
    const unsafeRootProperty = /\b(?:transform|translate|filter|perspective|contain|will-change)\s*:/i;

    for (const [rule] of rootCssBlocks(combinedRootSource)) {
      assert.doesNotMatch(rule, unsafeRootProperty);
    }
  });
});

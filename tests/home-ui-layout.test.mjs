import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("home UI layout", () => {
  it("uses logical desktop alignment for the hero while keeping mobile centered", () => {
    const source = read("../components/home/HeroSection.vue");

    assert.match(source, /text-center lg:text-start/);
    assert.match(source, /lg:ms-0 lg:me-auto/);
    assert.match(source, /lg:justify-start/);
    assert.match(source, /text-start/);
    assert.doesNotMatch(source, /lg:text-left/);
    assert.doesNotMatch(source, /text-left/);
  });

  it("clips root horizontal overflow while keeping premium containers centered for RTL", () => {
    const css = read("../assets/css/main.css");

    assert.match(css, /html,\s*body,\s*#__nuxt\s*{/);
    assert.match(css, /max-width:\s*100%;/);
    assert.match(css, /overflow-x:\s*clip;/);
    assert.match(css, /\.container-premium\s*{[^}]*width:\s*min\(100% - 2rem,\s*80rem\);/s);
    assert.match(css, /\.container-premium\s*{[^}]*margin-inline:\s*auto;/s);
  });

  it("prevents post-hydration root transforms from shifting the RTL page", () => {
    const css = read("../assets/css/main.css");
    const rtlRootRule = css.match(/html\[dir="rtl"\]\s*{[\s\S]*?}/)?.[0] || "";

    assert.doesNotMatch(rtlRootRule, /transform\s*:/);
    assert.doesNotMatch(rtlRootRule, /translate\s*:/);
  });

  it("keeps category text in a dedicated lower panel instead of over the image", () => {
    const source = read("../components/home/CategoriesSection.vue");

    assert.match(source, /class="group flex h-\[25rem\]/);
    assert.match(source, /class="relative h-\[70%\] overflow-hidden bg-black"/);
    assert.match(source, /border-t border-white\/10 bg-\[#0c0c0c\] p-5 text-start/);
    assert.match(source, /class="font-display text-3xl leading-none text-white/);
    assert.doesNotMatch(source, /absolute bottom-6 left-6 right-6/);
    assert.doesNotMatch(source, /font-display text-5xl/);
  });

  it("limits homepage categories to eight and places the categories CTA above the grid", () => {
    const source = read("../components/home/CategoriesSection.vue");
    const enLocale = read("../locales/en.json");
    const arLocale = read("../locales/ar.json");

    assert.match(source, /homepageCategories/);
    assert.match(source, /\.slice\(0, 8\)/);
    assert.match(source, /to="\/categories"/);
    assert.match(source, /home\.viewAllCategories/);
    assert.match(source, /<div\s+v-reveal\s+class="mb-16/);
    assert.match(source, /<div class="hidden gap-5 sm:grid/);
    assert.ok(
      source.indexOf('to="/categories"') <
        source.indexOf('class="hidden gap-5 sm:grid'),
      "Categories CTA should render before the category grid",
    );
    assert.match(enLocale, /"viewAllCategories": "View All Categories"/);
    assert.match(arLocale, /"viewAllCategories": "عرض كل الأقسام"/);
  });
});

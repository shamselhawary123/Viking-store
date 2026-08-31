import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { getCategorySeoIntent } from "../utils/seo.ts";

const shopPageSource = readFileSync(
  new URL("../pages/shop/index.vue", import.meta.url),
  "utf8",
);
const shopSidebarSource = readFileSync(
  new URL("../components/shop/ShopSidebar.vue", import.meta.url),
  "utf8",
);
const shopProductGridSource = readFileSync(
  new URL("../components/shop/ProductGrid.vue", import.meta.url),
  "utf8",
);
const shopProductCardSource = readFileSync(
  new URL("../components/shop/ProductCard.vue", import.meta.url),
  "utf8",
);
const productsStoreSource = readFileSync(
  new URL("../stores/products.ts", import.meta.url),
  "utf8",
);
const categoriesStoreSource = readFileSync(
  new URL("../stores/categories.ts", import.meta.url),
  "utf8",
);

describe("shop SSR category pages", () => {
  it("loads products and categories during setup before rendering filtered pages", () => {
    assert.match(shopPageSource, /await\s+useAsyncData\("shop-initial-catalog"/);
    assert.match(shopPageSource, /Promise\.all\(\[/);
    assert.match(shopPageSource, /productsStore\.getProducts\(\)/);
    assert.match(shopPageSource, /categoriesStore\.getCategories\(\)/);
    assert.match(shopPageSource, /shopStore\.selectedCategory\s*=\s*selectedCategorySlug\.value/);
    assert.doesNotMatch(
      shopPageSource,
      /onMounted\s*\(\s*async\s*\(\)\s*=>\s*{[\s\S]*productsStore\.getProducts\(\)/,
    );
    assert.doesNotMatch(
      shopSidebarSource,
      /onMounted\s*\(\s*async\s*\(\)\s*=>\s*{[\s\S]*categoriesStore\.getCategories\(\)/,
    );
  });

  it("uses the SSR-safe public Supabase client for public catalog store queries", () => {
    for (const source of [productsStoreSource, categoriesStoreSource]) {
      assert.match(source, /getPublicSupabaseClient/);
      assert.match(source, /config\.public\.supabaseUrl/);
      assert.match(source, /config\.public\.supabaseKey/);
      assert.doesNotMatch(source, /const supabase = useSupabase\(\)/);
    }
  });

  it("keeps crawlable product links and avoids intentional empty SSR placeholders", () => {
    assert.match(shopProductCardSource, /<NuxtLink/);
    assert.match(shopProductCardSource, /:to="`\/shop\/\$\{product\.slug\}`"/);
    assert.match(shopProductGridSource, /v-else-if="filteredProducts\.length"/);
    assert.match(shopProductGridSource, /<ShopProductCard/);
  });

  it("uses the exact gloves wording without introducing banned terms", () => {
    const gloves = getCategorySeoIntent({ slug: "gloves", name: "Gloves" }, "ar");

    assert.match(gloves.title, /جلافز ملاكمة/);
    assert.equal(gloves.title, "جلافز ملاكمة في مصر");
    assert.doesNotMatch(gloves.title, /قلبظ|قلابظ/);
    assert.match(gloves.keywords, /قلبظ ملاكمة/);
    assert.match(gloves.keywords, /قلابظ ملاكمة/);
    assert.match(gloves.description, /قفازات ملاكمة/);
    assert.doesNotMatch(
      [gloves.title, gloves.description, gloves.keywords].join(" "),
      /جوانتي بوكس/,
    );
  });
});

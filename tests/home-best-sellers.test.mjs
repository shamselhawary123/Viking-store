import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { selectHomepageBestSellerProducts } from "../utils/homeBestSellers.ts";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const product = (id, slug, categorySlug, createdAt = `2026-08-${String(id).padStart(2, "0")}`) => ({
  id,
  slug,
  title: slug,
  created_at: createdAt,
  categories: { slug: categorySlug },
});

describe("homepage best sellers", () => {
  it("prefers real RPC best seller products for gloves, shorts, and overall slots", () => {
    const glovesLow = product(1, "gloves-low", "gloves");
    const glovesTop = product(2, "gloves-top", "gloves");
    const shortsTop = product(3, "shorts-top", "shorts");
    const overallTop = product(4, "overall-top", "guards");

    const selected = selectHomepageBestSellerProducts({
      bestSellerResults: [
        { slot: "gloves", product_id: 2, is_real_best_seller: true },
        { slot: "shorts", product_id: 3, is_real_best_seller: true },
        { slot: "overall", product_id: 4, is_real_best_seller: true },
      ],
      bestSellerProducts: [glovesLow, glovesTop, shortsTop, overallTop],
      fallbackProducts: [],
    });

    assert.deepEqual(
      selected.map((item) => item.slug),
      ["gloves-top", "shorts-top", "overall-top"],
    );
    assert.deepEqual(
      selected.map((item) => item.isRealBestSeller),
      [true, true, true],
    );
  });

  it("uses newest products as non-best-seller fallbacks when sales are missing", () => {
    const selected = selectHomepageBestSellerProducts({
      bestSellerResults: [
        { slot: "gloves", product_id: null, is_real_best_seller: false },
        { slot: "shorts", product_id: null, is_real_best_seller: false },
        { slot: "overall", product_id: null, is_real_best_seller: false },
      ],
      bestSellerProducts: [],
      fallbackProducts: [
        product(5, "newest-gloves", "gloves", "2026-08-05"),
        product(6, "newest-shorts", "shorts", "2026-08-06"),
        product(1, "old-gloves", "gloves", "2026-08-01"),
        product(2, "new-gloves", "gloves", "2026-08-03"),
        product(3, "new-shorts", "shorts", "2026-08-02"),
        product(4, "new-overall", "guards", "2026-08-04"),
      ],
    });

    assert.deepEqual(
      selected.map((item) => item.slug),
      ["newest-gloves", "newest-shorts", "new-overall"],
    );
    assert.deepEqual(
      selected.map((item) => item.isRealBestSeller),
      [false, false, false],
    );
  });

  it("never uses gloves or shorts products for the overall slot", () => {
    const selected = selectHomepageBestSellerProducts({
      bestSellerResults: [
        { slot: "gloves", product_id: 1, is_real_best_seller: true },
        { slot: "shorts", product_id: 2, is_real_best_seller: true },
        { slot: "overall", product_id: 3, is_real_best_seller: true },
      ],
      bestSellerProducts: [
        product(1, "gloves-top", "gloves"),
        product(2, "shorts-top", "shorts"),
        product(3, "overall-gloves", "gloves"),
      ],
      fallbackProducts: [
        product(4, "newest-non-excluded", "guards", "2026-08-04"),
        product(5, "newest-excluded-shorts", "shorts", "2026-08-05"),
      ],
    });

    assert.deepEqual(
      selected.map((item) => item.slug),
      ["gloves-top", "shorts-top", "newest-non-excluded"],
    );
    assert.deepEqual(
      selected.map((item) => item.isRealBestSeller),
      [true, true, false],
    );
  });

  it("falls back when an RPC result points at a missing product", () => {
    const selected = selectHomepageBestSellerProducts({
      bestSellerResults: [
        { slot: "gloves", product_id: 999, is_real_best_seller: true },
        { slot: "shorts", product_id: 3, is_real_best_seller: true },
        { slot: "overall", product_id: null, is_real_best_seller: false },
      ],
      bestSellerProducts: [product(3, "shorts-top", "shorts")],
      fallbackProducts: [
        product(2, "new-gloves", "gloves", "2026-08-03"),
        product(4, "new-overall", "guards", "2026-08-04"),
      ],
    });

    assert.deepEqual(
      selected.map((item) => item.slug),
      ["new-gloves", "shorts-top", "new-overall"],
    );
    assert.deepEqual(
      selected.map((item) => item.isRealBestSeller),
      [false, true, false],
    );
  });

  it("loads homepage best sellers from the backend RPC without direct sales table reads", () => {
    const source = read("../components/home/FeaturedProductsSection.vue");

    assert.match(source, /\.rpc\("get_home_best_sellers"\)/);
    assert.doesNotMatch(source, /\.from\("order_items"\)/);
    assert.doesNotMatch(source, /orders!inner\(status\)/);
    assert.doesNotMatch(source, /\.from\("orders"\)/);
    assert.doesNotMatch(source, /ADMIN_REVENUE_ORDER_STATUSES/);
    assert.doesNotMatch(source, /products!inner/);
    assert.match(source, /\.from\("products"\)/);
    assert.match(source, /\.select\(SHOP_PRODUCTS_SELECT\)/);
    assert.match(source, /\.in\("id",\s*productIds\)/);
    assert.match(source, /\.order\("created_at",\s*\{\s*ascending:\s*false\s*\}\)/);
    assert.match(source, /selectHomepageBestSellerProducts/);
    assert.match(source, /bestSellersError/);
    assert.match(source, /fallbackProducts/);
    assert.match(source, /v-if="product\.isRealBestSeller \|\| product\.badge"/);
    assert.match(source, /v-if="featuredProducts\[itemIndex\]\.isRealBestSeller \|\| featuredProducts\[itemIndex\]\.badge"/);
    assert.doesNotMatch(source, /productsStore\.products\.slice\(0,\s*3\)/);
    assert.doesNotMatch(source, /productsStore\.getProducts/);
  });
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  DEFAULT_SITE_URL,
  buildCategorySeo,
  buildCanonicalUrl,
  buildProductImageAlt,
  buildProductSeoMeta,
  buildProductStructuredData,
  buildRobotsTxt,
  buildShopCategoryUrl,
  buildSitemapXml,
  getCategorySeoIntent,
  publicSitemapEntries,
} from "../utils/seo.ts";

const enLocaleSource = readFileSync(
  new URL("../locales/en.json", import.meta.url),
  "utf8",
);
const arLocaleSource = readFileSync(
  new URL("../locales/ar.json", import.meta.url),
  "utf8",
);
const homeHeroSource = readFileSync(
  new URL("../components/home/HeroSection.vue", import.meta.url),
  "utf8",
);
const homeCategoriesSource = readFileSync(
  new URL("../components/home/CategoriesSection.vue", import.meta.url),
  "utf8",
);
const productPageSource = readFileSync(
  new URL("../pages/shop/[slug].vue", import.meta.url),
  "utf8",
);
const shopPageSource = readFileSync(
  new URL("../pages/shop/index.vue", import.meta.url),
  "utf8",
);
const blogDetailSource = readFileSync(
  new URL("../pages/blog/[slug].vue", import.meta.url),
  "utf8",
);
const sitemapSource = readFileSync(
  new URL("../server/routes/sitemap.xml.ts", import.meta.url),
  "utf8",
);
const robotsSource = readFileSync(
  new URL("../server/routes/robots.txt.ts", import.meta.url),
  "utf8",
);
const nuxtConfigSource = readFileSync(
  new URL("../nuxt.config.ts", import.meta.url),
  "utf8",
);

describe("SEO helpers", () => {
  it("builds clean canonical URLs without query strings or duplicate slashes", () => {
    assert.equal(
      buildCanonicalUrl("https://viking.example/", "/shop?category=boxing"),
      "https://viking.example/shop",
    );
    assert.equal(
      buildCanonicalUrl("https://viking.example", "shop/gloves#reviews"),
      "https://viking.example/shop/gloves",
    );
    assert.equal(
      buildCanonicalUrl("https://viking.example", "/"),
      "https://viking.example/",
    );
  });

  it("keeps product structured data EGP-only and uses real review aggregates only", () => {
    const product = {
      title: "Elite Boxing Gloves",
      slug: "elite-boxing-gloves",
      description: "Premium gloves for daily rounds.",
      price: 1500,
      cover_image: "https://images.example/gloves.jpg",
      product_sizes: [{ in_stock: true }],
      categories: { name: "Boxing" },
    };

    const withoutReviews = buildProductStructuredData(
      product,
      "https://viking.example/shop/elite-boxing-gloves",
      {
        total: 0,
        average: 0,
      },
    );
    const withReviews = buildProductStructuredData(
      product,
      "https://viking.example/shop/elite-boxing-gloves",
      {
        total: 3,
        average: 4.666,
      },
    );

    assert.equal(withoutReviews.offers.priceCurrency, "EGP");
    assert.equal(withoutReviews.offers.price, 1500);
    assert.equal(withoutReviews.aggregateRating, undefined);
    assert.equal(withReviews.aggregateRating.ratingValue, "4.7");
    assert.equal(withReviews.aggregateRating.reviewCount, 3);
  });

  it("keeps private routes out of robots and sitemap output", () => {
    const robots = buildRobotsTxt("https://viking.example");
    const sitemap = buildSitemapXml([
      ...publicSitemapEntries("https://viking.example"),
      { loc: "https://viking.example/shop/gloves" },
      {
        loc: "https://viking.example/blog/wrap-guide",
        lastmod: "2026-08-17T10:00:00.000Z",
      },
    ]);

    assert.match(robots, /Disallow: \/admin/);
    assert.match(robots, /Disallow: \/checkout/);
    assert.match(robots, /Sitemap: https:\/\/viking\.example\/sitemap\.xml/);
    assert.match(sitemap, /https:\/\/viking\.example\/shop\/gloves/);
    assert.doesNotMatch(sitemap, /\/admin/);
    assert.doesNotMatch(sitemap, /\/checkout/);
  });

  it("uses the current Vercel production URL as the runtime SEO fallback", () => {
    assert.match(nuxtConfigSource, /DEFAULT_SITE_URL/);
    assert.equal(DEFAULT_SITE_URL, "https://viking-store.vercel.app");
    assert.equal(
      buildCanonicalUrl("", "/shop"),
      "https://viking-store.vercel.app/shop",
    );
    assert.match(
      buildRobotsTxt(""),
      /Sitemap: https:\/\/viking-store\.vercel\.app\/sitemap\.xml/,
    );
  });

  it("builds category SEO and links only for real filtered shop routes", () => {
    const boxing = getCategorySeoIntent(
      { slug: "boxing", name: "Boxing" },
      "ar",
    );
    const mma = buildCategorySeo({ slug: "mma", name: "MMA" }, "ar");

    assert.match(boxing.keywords, /قفازات ملاكمة/);
    assert.match(mma.title, /MMA/);
    assert.equal(buildShopCategoryUrl("boxing"), "/shop?category=boxing");
    assert.equal(buildShopCategoryUrl("all"), "/shop");
    assert.doesNotMatch(buildShopCategoryUrl("kick boxing!"), /!| /);
  });

  it("builds product SEO from real product and category data without fake review data", () => {
    const product = {
      title: "Pro Gloves",
      slug: "pro-gloves",
      description: "",
      price: 1800,
      categories: { slug: "boxing", name: "Boxing" },
    };
    const english = buildProductSeoMeta(product, "en");
    const arabic = buildProductSeoMeta(product, "ar");
    const structuredData = buildProductStructuredData(
      product,
      "https://viking.example/shop/pro-gloves",
      {
        total: 0,
        average: 0,
      },
    );

    assert.match(english.title, /Boxing Gloves/);
    assert.match(arabic.title, /قفازات ملاكمة/);
    assert.match(buildProductImageAlt(product, "ar"), /Pro Gloves/);
    assert.equal(structuredData.aggregateRating, undefined);
  });
});

describe("SEO route integration", () => {
  it("adds product SEO and keeps sitemap/robots server-driven", () => {
    assert.match(productPageSource, /buildProductStructuredData/);
    assert.match(productPageSource, /useSeoMeta/);
    assert.match(productPageSource, /setResponseStatus\(404\)/);
    assert.match(sitemapSource, /\.from\("products"\)/);
    assert.match(sitemapSource, /\.from\("blog_posts"\)/);
    assert.doesNotMatch(sitemapSource, /\/admin/);
    assert.match(robotsSource, /buildRobotsTxt/);
  });

  it("keeps Arabic and English SEO independent and strengthens real internal links", () => {
    assert.match(enLocaleSource, /Egypt/);
    assert.match(arLocaleSource, /أدوات رياضية/);
    assert.match(arLocaleSource, /قفازات ملاكمة/);
    assert.doesNotMatch(enLocaleSource, /قفازات|ادوات سندا|كونغ فو/);
    assert.match(homeHeroSource, /home\.categoryQuickLinks/);
    assert.match(homeCategoriesSource, /buildShopCategoryUrl/);
    assert.match(shopPageSource, /buildCategorySeo/);
    assert.match(productPageSource, /buildProductSeoMeta/);
    assert.match(productPageSource, /buildShopCategoryUrl/);
    assert.match(blogDetailSource, /blogCategoryShopUrl/);
  });
});

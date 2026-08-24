import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const read = (path) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

const sections = [
  {
    name: "FeaturedProductsSection",
    path: "../components/home/FeaturedProductsSection.vue",
    key: "home-best-selling-products",
  },
  {
    name: "BlogSection",
    path: "../components/home/BlogSection.vue",
    key: "home-blog-posts",
  },
];

describe("homepage navigation performance", () => {
  for (const section of sections) {
    it(`${section.name} loads homepage data without blocking client navigation`, () => {
      const source = read(section.path);

      assert.match(source, /useLazyAsyncData|lazy:\s*true/);
      assert.match(
        source,
        new RegExp(`useLazyAsyncData\\s*\\(\\s*["']${section.key}["']`),
      );
      assert.doesNotMatch(source, /await\s+useAsyncData/);
      assert.doesNotMatch(source, /server:\s*false/);
      assert.doesNotMatch(source, /<ClientOnly/);
    });
  }
});

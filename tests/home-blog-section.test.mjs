import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("homepage blog showcase", () => {
  it("renders the blog showcase on the homepage instead of the CTA section", () => {
    const homepage = read("../pages/index.vue");

    assert.match(homepage, /<HomeBlogSection\s*\/>/);
    assert.doesNotMatch(homepage, /<HomeCTASection\s*\/>/);
  });

  it("uses real published blog posts with mobile carousel controls", () => {
    const blogSectionPath = new URL("../components/home/BlogSection.vue", import.meta.url);

    assert.equal(existsSync(blogSectionPath), true);

    const blogSection = read("../components/home/BlogSection.vue");

    assert.match(blogSection, /\.from\("blog_posts"\)/);
    assert.match(blogSection, /\.eq\("status", "published"\)/);
    assert.match(blogSection, /\.not\("published_at", "is", null\)/);
    assert.match(blogSection, /\.order\("published_at", \{ ascending: false \}\)/);
    assert.match(blogSection, /\.limit\([3-6]\)/);
    assert.match(blogSection, /`\/blog\/\$\{post\.slug\}`/);
    assert.match(blogSection, /@touchstart\.passive="handleTouchStart"/);
    assert.match(blogSection, /@touchend\.passive="handleTouchEnd"/);
    assert.match(blogSection, /home\.blogSection\.title/);
  });
});

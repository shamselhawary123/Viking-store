import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  BLOG_POST_STATUSES,
  buildBlogCanonicalUrl,
  buildBlogPostPayload,
  buildBlogSeoMeta,
  buildBlogStructuredData,
  buildBlogImagePath,
  calculateReadingTime,
  normalizeBlogRouteId,
  normalizeBlogSlug,
  renderSafeBlogContent,
  validateBlogPostForm,
} from "../utils/blog.ts";

const migrationSql = readFileSync(
  new URL("../supabase/migrations/20260817120000_create_blog_posts.sql", import.meta.url),
  "utf8",
).toLowerCase();
const blogIndexSource = readFileSync(new URL("../pages/blog/index.vue", import.meta.url), "utf8");
const blogDetailSource = readFileSync(new URL("../pages/blog/[slug].vue", import.meta.url), "utf8");
const sitemapSource = readFileSync(new URL("../server/routes/sitemap.xml.ts", import.meta.url), "utf8");
const adminBlogSource = readFileSync(new URL("../pages/admin/blog/index.vue", import.meta.url), "utf8");
const adminEditSource = readFileSync(new URL("../pages/admin/blog/[id]/edit.vue", import.meta.url), "utf8");
const nuxtConfigSource = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");

describe("blog helpers", () => {
  it("normalizes slugs and validates required blog fields", () => {
    assert.equal(normalizeBlogSlug("  Fight Gear Basics! "), "fight-gear-basics");
    assert.equal(validateBlogPostForm({ title: "", slug: "x", content: "Body", status: "draft" }), "Title is required.");
    assert.equal(validateBlogPostForm({ title: "Title", slug: "", content: "Body", status: "draft" }), "Slug is required.");
    assert.equal(validateBlogPostForm({ title: "Title", slug: "x", content: "", status: "draft" }), "Content is required.");
    assert.equal(validateBlogPostForm({ title: "Title", slug: "x", content: "Body", status: "archived" }), "Status must be draft or published.");
  });

  it("builds payloads without trusting uncontrolled fields", () => {
    const payload = buildBlogPostPayload(
      {
        title: " Fight Gloves ",
        slug: " Fight Gloves ",
        excerpt: " Short ",
        content: "Body",
        cover_image: "",
        category: " Boxing ",
        tags: "gloves, training, gloves",
        status: "published",
        published_at: "",
        seo_title: "",
        seo_description: "",
        og_image: "",
      },
      "admin-user-id",
    );

    assert.equal(payload.title, "Fight Gloves");
    assert.equal(payload.slug, "fight-gloves");
    assert.deepEqual(payload.tags, ["gloves", "training"]);
    assert.equal(payload.author_id, "admin-user-id");
    assert.equal(payload.status, "published");
    assert.ok(payload.published_at);
  });

  it("calculates reading time and renders authored content safely", () => {
    assert.equal(calculateReadingTime("one ".repeat(420)), 3);
    const html = renderSafeBlogContent("# Title\n\n<script>alert(1)</script>\n\n- Wrap hands");

    assert.match(html, /<h2>Title<\/h2>/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /<li>Wrap hands<\/li>/);
  });

  it("builds SEO and structured data from published article fields", () => {
    const post = {
      title: "Boxing Wrap Guide",
      slug: "boxing-wrap-guide",
      excerpt: "How to choose boxing wraps.",
      cover_image: "https://example.com/cover.jpg",
      seo_title: "Best Boxing Wraps",
      seo_description: "Choose boxing wraps for training.",
      og_image: "",
      published_at: "2026-08-17T10:00:00.000Z",
      updated_at: "2026-08-17T11:00:00.000Z",
    };
    const url = buildBlogCanonicalUrl("https://viking.example", post.slug);
    const seo = buildBlogSeoMeta(post, url);
    const data = buildBlogStructuredData(post, url, "Viking Store", "Admin");

    assert.equal(url, "https://viking.example/blog/boxing-wrap-guide");
    assert.equal(seo.title, "Best Boxing Wraps");
    assert.equal(seo.ogImage, "https://example.com/cover.jpg");
    assert.equal(data.article["@type"], "Article");
    assert.equal(data.breadcrumb.itemListElement[1].item, url);
  });

  it("builds safe blog image storage paths", () => {
    assert.equal(buildBlogImagePath("My Cover.PNG", 1700000000000), "blog-images/1700000000000-my-cover.png");
  });

  it("keeps admin edit route ids usable for uuid and numeric blog primary keys", () => {
    assert.equal(
      normalizeBlogRouteId("ce3290ee-de2a-4931-9cdf-5f3fd5fdf6"),
      "ce3290ee-de2a-4931-9cdf-5f3fd5fdf6",
    );
    assert.equal(normalizeBlogRouteId("42"), "42");
    assert.equal(normalizeBlogRouteId(["42"]), "42");
    assert.equal(normalizeBlogRouteId(""), "");
  });
});

describe("blog migration", () => {
  it("creates blog_posts with publish status, SEO fields, and useful indexes", () => {
    assert.match(migrationSql, /create table if not exists public\.blog_posts\b/);
    assert.match(migrationSql, /status text not null default 'draft'/);
    assert.match(migrationSql, /status in \('draft', 'published'\)/);
    assert.match(migrationSql, /seo_title text/);
    assert.match(migrationSql, /seo_description text/);
    assert.match(migrationSql, /og_image text/);
    assert.match(migrationSql, /blog_posts_slug_unique/);
    assert.match(migrationSql, /blog_posts_published_idx/);
  });

  it("uses public published-only reads and admin-only mutations", () => {
    assert.match(migrationSql, /public can read published blog posts/);
    assert.match(migrationSql, /status = 'published'/);
    assert.match(migrationSql, /admins can manage blog posts/);
    assert.match(migrationSql, /public\.is_admin\(\)/);
    assert.doesNotMatch(migrationSql, /for all\s+to anon/);
  });
});

describe("blog constants", () => {
  it("only exposes draft and published statuses", () => {
    assert.deepEqual(BLOG_POST_STATUSES, ["draft", "published"]);
  });
});

describe("blog route integration", () => {
  it("keeps public blog reads limited to published posts", () => {
    assert.match(blogIndexSource, /\.from\("blog_posts"\)/);
    assert.match(blogIndexSource, /\.eq\("status", "published"\)/);
    assert.match(blogDetailSource, /\.eq\("status", "published"\)/);
    assert.match(blogDetailSource, /statusCode: 404/);
  });

  it("exposes canonical SEO, structured data, and a published-only sitemap", () => {
    assert.match(blogDetailSource, /useSeoMeta/);
    assert.match(blogDetailSource, /application\/ld\+json/);
    assert.match(sitemapSource, /\.eq\("status", "published"\)/);
    assert.match(sitemapSource, /\/blog/);
    assert.doesNotMatch(sitemapSource, /\/admin/);
    assert.match(nuxtConfigSource, /siteUrl/);
  });

  it("keeps admin blog management behind admin middleware", () => {
    assert.match(adminBlogSource, /middleware: \["admin"\]/);
    assert.match(adminBlogSource, /\/admin\/blog\/\$\{post\.id\}\/edit/);
    assert.match(adminEditSource, /middleware: \["admin"\]/);
    assert.doesNotMatch(adminEditSource, /Number\(route\.params\.id\)/);
    assert.match(adminEditSource, /\.eq\("id", id\)/);
  });
});

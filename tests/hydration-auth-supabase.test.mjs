import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const publicReadClientFiles = [
  {
    path: "../components/home/BlogSection.vue",
    storageKey: "viking-store-home-blog-readonly",
  },
  {
    path: "../components/home/FeaturedProductsSection.vue",
    storageKey: "viking-store-home-best-sellers-readonly",
  },
  {
    path: "../pages/blog/index.vue",
    storageKey: "viking-store-blog-index-readonly",
  },
  {
    path: "../pages/blog/[slug].vue",
    storageKey: "viking-store-blog-detail-readonly",
  },
  {
    path: "../pages/shop/[slug].vue",
    storageKey: "viking-store-shop-product-seo-readonly",
  },
];

describe("hydration-safe auth UI and public Supabase reads", () => {
  it("uses a stable public logo URL in navbar and footer during hydration", () => {
    assert.equal(existsSync(new URL("../public/logo.png", import.meta.url)), true);

    for (const path of [
      "../components/shared/AppNavbar.vue",
      "../components/shared/Footer.vue",
    ]) {
      const source = read(path);

      assert.match(source, /siteLogoSrc\s*=\s*"\/logo\.png"/);
      assert.match(source, /:src="siteLogoSrc"/);
      assert.doesNotMatch(source, /src="\/logo\.png"/);
      assert.doesNotMatch(source, /\?t=/);
    }
  });

  it("does not render navbar auth-specific controls before client auth is ready", () => {
    const source = read("../components/shared/AppNavbar.vue");

    assert.match(source, /const isAuthReady = ref\(false\)/);
    assert.match(source, /finally\s*{\s*isAuthReady\.value = true;\s*}/);
    assert.match(source, /v-if="isAuthReady && authStore\.user"/);
    assert.match(source, /v-else-if="isAuthReady"/);
  });

  it("treats a missing startup auth session as a normal guest state", () => {
    const source = read("../stores/auth.ts");

    assert.match(source, /auth\.getSession\(\)/);
    assert.match(source, /this\.user\s*=\s*null/);
    assert.match(source, /this\.profile\s*=\s*null/);
    assert.match(source, /if\s*\(\s*!session\s*\)/);
    assert.match(source, /await supabase\.auth\.getUser\(\)/);
  });

  it("uses a cached non-persistent browser public Supabase client for read-only callers", () => {
    const utilUrl = new URL("../utils/publicSupabase.ts", import.meta.url);

    assert.equal(existsSync(utilUrl), true);

    const utilSource = read("../utils/publicSupabase.ts");

    assert.match(utilSource, /persistSession:\s*false/);
    assert.match(utilSource, /autoRefreshToken:\s*false/);
    assert.match(utilSource, /detectSessionInUrl:\s*false/);
    assert.match(utilSource, /createPublicSupabaseReadOptions/);
    assert.match(utilSource, /getPublicSupabaseClient/);
    assert.match(utilSource, /browserPublicSupabaseClient/);
    assert.match(utilSource, /import\.meta\.client/);
    assert.match(utilSource, /storageKey:\s*string/);

    for (const client of publicReadClientFiles) {
      const source = read(client.path);

      assert.match(source, /getPublicSupabaseClient/);
      assert.doesNotMatch(source, /createPublicSupabaseReadOptions/);
      assert.doesNotMatch(source, /createClient\([^)]*createPublicSupabaseReadOptions/s);
    }
  });
});

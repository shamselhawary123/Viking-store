import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const publicReadClientFiles = [
  "../components/home/BlogSection.vue",
  "../pages/blog/index.vue",
  "../pages/blog/[slug].vue",
  "../pages/shop/[slug].vue",
];

describe("hydration-safe auth UI and public Supabase reads", () => {
  it("does not render navbar auth-specific controls before client auth is ready", () => {
    const source = read("../components/shared/AppNavbar.vue");

    assert.match(source, /const isAuthReady = ref\(false\)/);
    assert.match(source, /finally\s*{\s*isAuthReady\.value = true;\s*}/);
    assert.match(source, /v-if="isAuthReady && authStore\.user"/);
    assert.match(source, /v-else-if="isAuthReady"/);
  });

  it("uses non-persistent public Supabase options for direct read-only clients", () => {
    const utilUrl = new URL("../utils/publicSupabase.ts", import.meta.url);

    assert.equal(existsSync(utilUrl), true);

    const utilSource = read("../utils/publicSupabase.ts");

    assert.match(utilSource, /persistSession:\s*false/);
    assert.match(utilSource, /autoRefreshToken:\s*false/);
    assert.match(utilSource, /detectSessionInUrl:\s*false/);
    assert.match(utilSource, /storageKey:\s*"viking-store-public-readonly"/);

    for (const file of publicReadClientFiles) {
      const source = read(file);

      assert.match(source, /publicSupabaseReadOptions/);
      assert.match(source, /createClient\([^)]*publicSupabaseReadOptions/s);
    }
  });
});

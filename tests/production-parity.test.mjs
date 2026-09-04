import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("root app containers do not create transformed viewport containing blocks", () => {
  const css = read("../assets/css/main.css");
  const app = read("../app.vue");
  const layout = read("../layouts/default.vue");

  const rootContainerBlock = css.match(/html,\s*body,\s*#__(?:nuxt)\s*{[\s\S]*?}/);
  assert.ok(rootContainerBlock, "root container sizing rule should stay explicit");
  assert.doesNotMatch(rootContainerBlock[0], /transform\s*:/);
  assert.doesNotMatch(rootContainerBlock[0], /translate\s*:/);
  assert.doesNotMatch(rootContainerBlock[0], /filter\s*:/);
  assert.doesNotMatch(rootContainerBlock[0], /perspective\s*:/);
  assert.doesNotMatch(rootContainerBlock[0], /contain\s*:/);
  assert.doesNotMatch(rootContainerBlock[0], /will-change\s*:/);

  assert.match(css, /html\[dir="rtl"\]\s*{[\s\S]*transform:\s*none\s*!important;[\s\S]*translate:\s*none\s*!important;[\s\S]*}/);
  assert.doesNotMatch(app, /document\.documentElement\.style\.transform|document\.documentElement\.style\.translate/);
  assert.doesNotMatch(layout, /transform|translate|filter|perspective|contain|will-change/);
});

test("critical viewport-fixed customer UI is mounted as a body layer", () => {
  const loader = read("../components/shared/VikingGlobalLoader.vue");
  const productPage = read("../pages/shop/[slug].vue");

  assert.match(loader, /<Teleport\s+to=["']body["']>/);
  assert.match(loader, /class=["'][^"']*fixed[^"']*inset-0[^"']*/);

  const mobileCtaStart = productPage.indexOf("mobile-product-cta");
  assert.notEqual(mobileCtaStart, -1, "mobile CTA marker should exist");
  assert.match(productPage.slice(0, mobileCtaStart), /<Teleport\s+to=["']body["']>/);
  assert.match(productPage.slice(mobileCtaStart, mobileCtaStart + 500), /fixed\s+inset-x-0\s+bottom-0/);
});

test("production-only developer tooling and anonymous public reads stay intentional", () => {
  const config = read("../nuxt.config.ts");
  const publicSupabase = read("../utils/publicSupabase.ts");

  assert.match(config, /devtools:\s*{\s*enabled:\s*process\.env\.NODE_ENV !== "production"\s*}/);
  assert.match(config, /detectBrowserLanguage:\s*false/);
  assert.match(publicSupabase, /persistSession:\s*false/);
  assert.match(publicSupabase, /autoRefreshToken:\s*false/);
  assert.match(publicSupabase, /if\s*\(!import\.meta\.client\)\s*{[\s\S]*createClient\(supabaseUrl,\s*supabaseKey,\s*options\)/);
});

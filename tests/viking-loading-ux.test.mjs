import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("global loader uses Nuxt page lifecycle with a 250ms delay", () => {
  const composablePath = "composables/useVikingNavigationLoader.ts";
  const pluginPath = "plugins/viking-loader.client.ts";

  assert.equal(existsSync(composablePath), true);
  assert.equal(existsSync(pluginPath), true);

  const composable = read(composablePath);
  const plugin = read(pluginPath);

  assert.match(composable, /VIKING_LOADER_DELAY_MS\s*=\s*250/);
  assert.match(composable, /VIKING_LOADER_STATE_KEY\s*=\s*["']viking-navigation-loader-visible["']/);
  assert.match(composable, /useState<[^>]+>\(VIKING_LOADER_STATE_KEY/);
  assert.match(composable, /clearTimeout/);
  assert.match(plugin, /nuxtApp\.hook\(["']page:start["']/);
  assert.match(plugin, /nuxtApp\.hook\(["']page:finish["']/);
  assert.match(plugin, /nuxtApp\.hook\(["']app:error["']/);
  assert.doesNotMatch(plugin, /afterEach/);
});

test("default layout mounts the branded global loader once", () => {
  const layout = read("layouts/default.vue");

  assert.match(layout, /<SharedVikingGlobalLoader\s*\/>/);
});

test("global loader overlay is teleported to a viewport-fixed body layer", () => {
  const loader = read("components/shared/VikingGlobalLoader.vue");

  assert.match(loader, /<Teleport\s+to=["']body["']>/);
  assert.match(loader, /class=["'][^"']*fixed[^"']*inset-0[^"']*/);
  assert.doesNotMatch(loader, /absolute inset-0/);
});

test("global loader is branded, accessible, localized, reduced-motion safe, and does not touch root transforms", () => {
  const loader = read("components/shared/VikingGlobalLoader.vue");
  const ar = JSON.parse(read("locales/ar.json"));
  const en = JSON.parse(read("locales/en.json"));

  assert.match(loader, /src=["']\/logo\.png["']/);
  assert.match(loader, /role=["']status["']/);
  assert.match(loader, /aria-live=["']polite["']/);
  assert.match(loader, /common\.preparingGear/);
  assert.match(loader, /viking-loader-glove/);
  assert.match(loader, /viking-loader-glove-left/);
  assert.match(loader, /viking-loader-glove-right/);
  assert.match(loader, /<svg[\s\S]*viewBox=/);
  assert.match(loader, /viking-loader-impact-flash/);
  assert.match(loader, /viking-loader-impact-streak/);
  assert.match(loader, /viking-loader-idle-halo/);
  assert.match(loader, /viking-loader-logo/);
  assert.match(loader, /viking-loader-logo-reveal/);
  assert.match(loader, /viking-loader-glove-left 980ms/);
  assert.match(loader, /viking-loader-glove-right 980ms/);
  assert.match(loader, /viking-loader-impact-flash 150ms ease-out 700ms/);
  assert.match(loader, /viking-loader-impact-ring 170ms ease-out 706ms/);
  assert.match(loader, /viking-loader-impact-streak 150ms ease-out 704ms/);
  assert.match(loader, /viking-loader-logo-reveal 240ms[\s\S]*730ms/);
  assert.match(loader, /viking-loader-text-in 160ms ease-out 920ms/);
  assert.match(loader, /viking-loader-logo-idle 1\.9s/);
  assert.doesNotMatch(loader, /viking-loader-slash/);
  assert.doesNotMatch(loader, /viking-loader-spin/);
  assert.doesNotMatch(loader, /viking-loader-impact-arc/);
  assert.doesNotMatch(loader, /viking-loader-shockwave/);
  assert.match(loader, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(loader, /html\s*[,{]/);
  assert.doesNotMatch(loader, /body\s*[,{]/);
  assert.doesNotMatch(loader, /#__nuxt/);
  assert.equal(ar.common.preparingGear, "جاري تجهيز معداتك...");
  assert.equal(en.common.preparingGear, "Preparing your gear...");
});

test("shop skeletons use the reusable Viking skeleton component", () => {
  const skeletonPath = "components/shared/VikingSkeleton.vue";
  assert.equal(existsSync(skeletonPath), true);

  const skeleton = read(skeletonPath);
  const grid = read("components/shop/ProductGrid.vue");
  const details = read("pages/shop/[slug].vue");

  assert.match(skeleton, /variant\?:\s*["']line["']\s*\|\s*["']product-card["']\s*\|\s*["']product-detail["']/);
  assert.match(skeleton, /variant === ['"]product-card['"]/);
  assert.match(skeleton, /variant === ['"]product-detail['"]/);
  assert.match(skeleton, /viking-skeleton-shimmer/);
  assert.match(skeleton, /prefers-reduced-motion:\s*reduce/);
  assert.match(grid, /<SharedVikingSkeleton[\s\S]*variant=["']product-card["']/);
  assert.doesNotMatch(grid, /animate-pulse bg-white\/10/);
  assert.match(details, /v-else-if=["']loading["']/);
  assert.match(details, /<SharedVikingSkeleton[\s\S]*variant=["']product-detail["']/);
});

test("product cards provide visual navigation feedback without replacing NuxtLink behavior", () => {
  const card = read("components/shop/ProductCard.vue");

  assert.match(card, /<NuxtLink/);
  assert.match(card, /isNavigatingToProduct/);
  assert.match(card, /markProductNavigation/);
  assert.match(card, /router\.push\(`\/shop\/\$\{props\.product\.slug\}`\)/);
  assert.match(card, /border-\[#CF1D1D\]/);
  assert.match(card, /@click\.prevent\.stop=["']toggleWishlist["']/);
});

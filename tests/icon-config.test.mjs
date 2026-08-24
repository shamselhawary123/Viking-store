import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const packageLock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const nuxtConfig = readFileSync("nuxt.config.ts", "utf8");
const footerSource = readFileSync("components/shared/Footer.vue", "utf8");

describe("Nuxt Icon SSR collections", () => {
  it("bundles the local Simple Icons collection used by footer social links", () => {
    assert.match(footerSource, /simple-icons:facebook/);
    assert.match(footerSource, /simple-icons:instagram/);
    assert.match(footerSource, /simple-icons:tiktok/);

    assert.match(nuxtConfig, /collections:\s*\[[^\]]*"heroicons"[^\]]*"simple-icons"/s);
    assert.equal(
      packageJson.devDependencies["@iconify-json/simple-icons"],
      "^1.2.80",
    );
    assert.ok(packageLock.packages["node_modules/@iconify-json/simple-icons"]);
  });
});

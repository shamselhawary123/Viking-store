import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const readProjectFile = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const en = JSON.parse(readProjectFile("locales/en.json"));
const ar = JSON.parse(readProjectFile("locales/ar.json"));

const pages = [
  { file: "pages/privacy-policy.vue", key: "privacy", route: "/privacy-policy" },
  { file: "pages/terms.vue", key: "terms", route: "/terms" },
  { file: "pages/cookies.vue", key: "cookies", route: "/cookies" },
];

describe("legal pages", () => {
  it("creates localized legal route pages with page-level SEO", () => {
    for (const page of pages) {
      assert.equal(existsSync(new URL(`../${page.file}`, import.meta.url)), true);

      const source = readProjectFile(page.file);
      assert.match(source, new RegExp(`legal\\.${page.key}\\.`));
      assert.match(source, new RegExp(`seo\\.${page.key}Title`));
      assert.match(source, new RegExp(`seo\\.${page.key}Description`));
      assert.match(source, /useSeoMeta/);
      assert.match(source, /buildCanonicalUrl/);
    }
  });

  it("resolves nested tm() legal messages before rendering them", () => {
    for (const page of pages) {
      const source = readProjectFile(page.file);

      assert.match(source, /const \{ t, tm, rt \} = useI18n\(\)/);
      assert.match(source, /rt\(section\.title\)/);
      assert.match(source, /rt\(paragraph\)/);
      assert.doesNotMatch(source, /\{\{\s*section\.title\s*\}\}/);
      assert.doesNotMatch(source, /\{\{\s*paragraph\s*\}\}/);
    }
  });

  it("keeps English and Arabic legal locale sections aligned", () => {
    assert.ok(en.legal);
    assert.ok(ar.legal);
    assert.deepEqual(Object.keys(ar.legal).sort(), Object.keys(en.legal).sort());

    for (const { key } of pages) {
      assert.deepEqual(Object.keys(ar.legal[key]).sort(), Object.keys(en.legal[key]).sort());
      assert.deepEqual(
        ar.legal[key].sections.map((section) => section.id),
        en.legal[key].sections.map((section) => section.id),
      );
    }
  });

  it("adds public legal pages to the sitemap entries", () => {
    const source = readProjectFile("utils/seo.ts");

    for (const { route } of pages) {
      assert.match(source, new RegExp(`buildCanonicalUrl\\(siteUrl, "${route}"\\)`));
    }
  });
});

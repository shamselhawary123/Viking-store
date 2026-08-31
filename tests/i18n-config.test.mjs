import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync, readFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

describe("i18n configuration", () => {
  it("defines matching English and Arabic locale files", () => {
    assert.equal(existsSync(new URL("../locales/en.json", import.meta.url)), true);
    assert.equal(existsSync(new URL("../locales/ar.json", import.meta.url)), true);

    const en = readJson("../locales/en.json");
    const ar = readJson("../locales/ar.json");

    assert.deepEqual(Object.keys(ar).sort(), Object.keys(en).sort());
    assert.equal(en.common.save, "Save");
    assert.equal(ar.common.save, "حفظ");
  });

  it("configures @nuxtjs/i18n with browser-language persistence and no URL prefixing", () => {
    const config = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");
    const plugin = readFileSync(new URL("../plugins/locale-preference.ts", import.meta.url), "utf8");
    const switcher = readFileSync(new URL("../components/shared/LanguageSwitcher.vue", import.meta.url), "utf8");

    assert.match(config, /@nuxtjs\/i18n/);
    assert.match(config, /defaultLocale:\s*"ar"/);
    assert.match(config, /strategy:\s*"no_prefix"/);
    assert.match(config, /langDir:\s*"\.\.\/locales\/"/);
    assert.match(config, /detectBrowserLanguage:\s*false/);
    assert.match(plugin, /useCookie<"en" \| "ar">\("viking_locale"\)/);
    assert.match(plugin, /savedLocale !== "en" && savedLocale !== "ar"/);
    assert.match(plugin, /await \$i18n\.setLocale\(savedLocale\)/);
    assert.doesNotMatch(plugin, /navigator|Accept-Language|accept-language|getHeader|tryHeaderLocale/);
    assert.match(switcher, /useCookie<"en" \| "ar">\("viking_locale"/);
    assert.match(switcher, /localeCookie\.value = code/);
    assert.match(switcher, /@click="switchLocale\(option\.code\)"/);
  });

  it("uses IBM Plex Sans Arabic only for Arabic typography", () => {
    const config = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");
    const css = readFileSync(new URL("../assets/css/main.css", import.meta.url), "utf8");

    assert.match(config, /name:\s*"IBM Plex Sans Arabic"/);
    assert.match(config, /weights:\s*\[400,\s*500,\s*600,\s*700,\s*800\]/);
    assert.match(config, /styles:\s*\["normal"\]/);
    assert.doesNotMatch(config, /name:\s*"Cairo"/);
    assert.match(css, /body\s*{[^}]*font-family:\s*"Inter",\s*sans-serif;/s);
    assert.match(
      css,
      /html\[dir="rtl"\]\s+body\s*{[^}]*font-family:\s*"IBM Plex Sans Arabic",\s*"Inter",\s*sans-serif;/s,
    );
    assert.match(css, /html\[dir="rtl"\]\s+\.font-display/s);
    assert.match(css, /html\[dir="rtl"\]\s+\.display-heading/s);
  });

  it("keeps Nuxt DevTools development-only", () => {
    const config = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");

    assert.match(config, /devtools:\s*{\s*enabled:\s*process\.env\.NODE_ENV !== "production"\s*}/);
    assert.doesNotMatch(config, /devtools:\s*{\s*enabled:\s*true\s*}/);
  });
});

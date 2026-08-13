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

    assert.match(config, /@nuxtjs\/i18n/);
    assert.match(config, /defaultLocale:\s*"en"/);
    assert.match(config, /strategy:\s*"no_prefix"/);
    assert.match(config, /langDir:\s*"\.\.\/locales\/"/);
    assert.match(config, /useCookie:\s*true/);
    assert.match(config, /cookieKey:\s*"viking_locale"/);
  });
});

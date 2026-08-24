import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("footer mobile layout", () => {
  it("keeps footer navigation compact in two columns on mobile", () => {
    const source = readFileSync("components/shared/Footer.vue", "utf8");

    assert.match(source, /footer-navigation-grid/);
    assert.match(source, /grid-cols-2/);
    assert.match(source, /lg:contents/);
    assert.match(source, /nav\.categories/);
    assert.match(source, /footer\.customerSupport/);
  });

  it("keeps mobile contact and newsletter spacing compact", () => {
    const source = readFileSync("components/shared/Footer.vue", "utf8");

    assert.match(source, /footer-contact-panel/);
    assert.match(source, /grid gap-2 text-sm/);
    assert.match(source, /mt-5 grid gap-4 border-y border-white\/10 py-4/);
  });
});

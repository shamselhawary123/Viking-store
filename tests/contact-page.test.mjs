import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const source = readFileSync("pages/contact.vue", "utf8");

describe("contact page online-only layout", () => {
  it("does not render a physical location or map", () => {
    assert.doesNotMatch(source, /<iframe/i);
    assert.doesNotMatch(source, /google\.com\/maps/i);
    assert.doesNotMatch(source, /i-heroicons-map-pin/);
    assert.doesNotMatch(source, /footer\.addressValue/);
    assert.doesNotMatch(source, /common\.address/);
    assert.doesNotMatch(source, /pages\.openMap/);
  });

  it("keeps the contact form and real contact methods", () => {
    assert.match(source, /@submit\.prevent="handleSubmit"/);
    assert.match(source, /mailto:shamselhawary123@gmail\.com/);
    assert.match(source, /tel:\+201123997154/);
    assert.match(source, /footer\.workingHours/);
    assert.match(source, /socials/);
  });

  it("uses logical alignment for contact form floating labels", () => {
    assert.match(source, /text-align: start;/);
    assert.match(source, /inset-inline-start: 1rem;/);
    assert.doesNotMatch(source, /\n\s*left: 1rem;/);
  });
});

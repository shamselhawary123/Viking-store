import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

const sectionKeys = ["whyViking", "testimonials", "newsletterSection"];

const componentFiles = [
  "components/home/WhyVikingSection.vue",
  "components/home/TestimonialsSection.vue",
  "components/home/NewsletterSection.vue",
];

const hardcodedPhrases = [
  "BUILT FOR WARRIORS",
  "WHAT FIGHTERS SAY",
  "VIKING TRAINING CLUB",
  "JOIN THE FIGHT CLUB",
  "Join The Movement",
  "Your Email",
];

describe("home storefront section localization", () => {
  it("keeps required section translation groups in both locales", () => {
    for (const key of sectionKeys) {
      assert.ok(en.home[key], `Missing English home.${key}`);
      assert.ok(ar.home[key], `Missing Arabic home.${key}`);
      assert.deepEqual(
        Object.keys(ar.home[key]).sort(),
        Object.keys(en.home[key]).sort(),
      );
    }
  });

  it("removes visible hardcoded English from the four localized sections", () => {
    const source = componentFiles
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    for (const phrase of hardcodedPhrases) {
      assert.equal(
        source.includes(phrase),
        false,
        `Found hardcoded phrase: ${phrase}`,
      );
    }
  });
});

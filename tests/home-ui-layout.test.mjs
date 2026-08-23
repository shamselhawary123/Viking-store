import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("home UI layout", () => {
  it("uses logical desktop alignment for the hero while keeping mobile centered", () => {
    const source = read("../components/home/HeroSection.vue");

    assert.match(source, /text-center lg:text-start/);
    assert.match(source, /lg:ms-0 lg:me-auto/);
    assert.match(source, /lg:justify-start/);
    assert.match(source, /text-start/);
    assert.doesNotMatch(source, /lg:text-left/);
    assert.doesNotMatch(source, /text-left/);
  });

  it("keeps category text in a dedicated lower panel instead of over the image", () => {
    const source = read("../components/home/CategoriesSection.vue");

    assert.match(source, /class="group flex h-\[25rem\]/);
    assert.match(source, /class="relative h-\[70%\] overflow-hidden bg-black"/);
    assert.match(source, /border-t border-white\/10 bg-\[#0c0c0c\] p-5 text-start/);
    assert.match(source, /class="font-display text-3xl leading-none text-white/);
    assert.doesNotMatch(source, /absolute bottom-6 left-6 right-6/);
    assert.doesNotMatch(source, /font-display text-5xl/);
  });
});

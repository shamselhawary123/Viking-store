import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const sections = [
  {
    name: "HomeCategoriesSection",
    path: "../components/home/CategoriesSection.vue",
    desktopGrid: /class="hidden gap-5 sm:grid sm:grid-cols-2 xl:grid-cols-4"/,
  },
  {
    name: "HomeFeaturedProductsSection",
    path: "../components/home/FeaturedProductsSection.vue",
    desktopGrid: /class="relative hidden gap-6 sm:grid sm:grid-cols-2 xl:grid-cols-3"/,
  },
  {
    name: "HomeWhyVikingSection",
    path: "../components/home/WhyVikingSection.vue",
    desktopGrid: /class="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-5"/,
  },
  {
    name: "HomeTestimonialsSection",
    path: "../components/home/TestimonialsSection.vue",
    desktopGrid: /class="hidden gap-6 md:grid md:grid-cols-3"/,
  },
];

describe("mobile-only homepage carousels", () => {
  it("provides reusable autoplay, swipe, RTL, visibility, and cleanup behavior", () => {
    const composableUrl = new URL("../composables/useMobileCarousel.ts", import.meta.url);

    assert.equal(existsSync(composableUrl), true);

    const source = read("../composables/useMobileCarousel.ts");

    assert.match(source, /reactive/);
    assert.match(source, /export const useMobileCarousel/);
    assert.match(source, /setInterval/);
    assert.match(source, /visibilitychange/);
    assert.match(source, /onBeforeUnmount/);
    assert.match(source, /handleTouchStart/);
    assert.match(source, /handleTouchMove/);
    assert.match(source, /handleTouchEnd/);
    assert.match(source, /trackStyle/);
    assert.match(source, /dragOffset/);
    assert.match(source, /centerOffsetPx/);
    assert.match(source, /trackIndex/);
    assert.match(source, /loopedIndexes/);
    assert.match(source, /snapToLoopedRealSlide/);
    assert.match(source, /ResizeObserver|resize/);
    assert.match(source, /isRtl/);
    assert.match(source, /resumeDelayMs/);
    assert.match(source, /options\.intervalMs \?\? 3800/);
    assert.match(source, /gapPx = options\.gapPx \?\? 0/);
    assert.match(source, /slideWidthRatio = options\.slideWidthRatio \?\? 1/);
    assert.match(source, /movePrevious/);
    assert.match(source, /moveNext/);
    assert.match(source, /return reactive\(/);
  });

  for (const section of sections) {
    it(`${section.name} keeps desktop grid and adds mobile arrows around a single-card carousel`, () => {
      const source = read(section.path);

      assert.match(source, section.desktopGrid);
      assert.match(source, /useMobileCarousel/);
      assert.match(source, /@touchstart\.passive="carousel\.handleTouchStart"/);
      assert.match(source, /@touchmove\.passive="carousel\.handleTouchMove"/);
      assert.match(source, /@touchend\.passive="carousel\.handleTouchEnd"/);
      assert.match(source, /:ref="carousel\.setViewportRef"/);
      assert.match(source, /:style="carousel\.trackStyle"/);
      assert.match(source, /v-for="\([^"]*index[^"]*\) in carousel\.loopedIndexes"/);
      assert.match(source, /mobile-carousel-arrow/);
      assert.match(source, /type="button"/);
      assert.match(source, /@click="carousel\.movePrevious"/);
      assert.match(source, /@click="carousel\.moveNext"/);
      assert.match(source, /i-heroicons-chevron/);
      assert.match(source, /mobile-carousel-track/);
      assert.match(source, /mobile-carousel-slide/);
      assert.match(source, /(sm:hidden|md:hidden)/);
      assert.doesNotMatch(source, /scale-\[0\.94\] opacity-50/);
      assert.doesNotMatch(source, /<Transition :name="carousel\.transitionName" mode="out-in">/);
      assert.doesNotMatch(source, /carousel\.goPrevious|carousel\.goNext|carousel\.previous|carousel\.next/);
    });
  }
});

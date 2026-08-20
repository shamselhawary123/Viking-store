import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const homepageSections = [
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
  {
    name: "HomeBlogSection",
    path: "../components/home/BlogSection.vue",
    desktopGrid: /class="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4"/,
  },
];

describe("homepage scroll reveal", () => {
  it("registers a client-only IntersectionObserver reveal directive", () => {
    const pluginUrl = new URL("../plugins/reveal.client.ts", import.meta.url);

    assert.equal(existsSync(pluginUrl), true);

    const source = read("../plugins/reveal.client.ts");

    assert.match(source, /defineNuxtPlugin/);
    assert.match(source, /vueApp\.directive\("reveal"/);
    assert.match(source, /IntersectionObserver/);
    assert.match(source, /isIntersecting/);
    assert.match(source, /unobserve/);
    assert.match(source, /disconnect/);
    assert.doesNotMatch(source, /addEventListener\(["']scroll/);
  });

  it("defines subtle transform-based reveal CSS with reduced-motion support", () => {
    const source = read("../assets/css/main.css");

    assert.match(source, /\.reveal\s*{/);
    assert.match(source, /opacity:\s*0/);
    assert.match(source, /translate3d\(0,\s*32px,\s*0\)\s*scale\(0\.98\)/);
    assert.match(source, /\.reveal\.is-revealed\s*{/);
    assert.match(source, /transition-delay:\s*var\(--reveal-delay,\s*0ms\)/);
    assert.match(source, /prefers-reduced-motion:\s*reduce/);
    assert.match(source, /\.reveal\.is-revealed/);
  });

  for (const section of homepageSections) {
    it(`${section.name} uses reveal without changing its desktop grid or carousel track`, () => {
      const source = read(section.path);

      assert.match(source, section.desktopGrid);
      assert.match(source, /v-reveal/);

      for (const line of source.split(/\r?\n/)) {
        assert.equal(
          line.includes("mobile-carousel-track") && line.includes("v-reveal"),
          false,
        );
      }
    });
  }
});

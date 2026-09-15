import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("home UI layout", () => {
  it("uses logical desktop alignment for the hero while keeping mobile centered", () => {
    const source = read("../components/home/HeroSection.vue");

    assert.match(source, /text-center xl:text-start/);
    assert.match(source, /xl:ms-0 xl:me-auto/);
    assert.match(source, /xl:justify-start/);
    assert.match(source, /text-start/);
    assert.doesNotMatch(source, /lg:text-left/);
    assert.doesNotMatch(source, /text-left/);
  });

  it("uses a blended image-led hero with visible SEO copy and stable CTA routes", () => {
    const source = read("../components/home/HeroSection.vue");
    const h1Matches = source.match(/<h1\b/g) || [];
    const firstHeroImageIndex = source.indexOf('src="/hero.webp"');
    const heroCopyIndex = source.indexOf('class="hero-copy');

    assert.equal(h1Matches.length, 1);
    assert.match(source, /src="\/hero\.webp"/);
    assert.match(source, /fetchpriority="high"/);
    assert.match(source, /object-contain/);
    assert.match(source, /xl:object-contain/);
    assert.match(source, /hero-visual/);
    assert.match(source, /hero-copy/);
    assert.match(source, /hero-mobile-fade/);
    assert.match(source, /hero-desktop-fade/);
    assert.match(source, /xl:min-h-\[clamp\(620px,calc\(100svh-5rem\),850px\)\]/);
    assert.match(source, /xl:h-\[clamp\(620px,calc\(100svh-5rem\),850px\)\]/);
    assert.match(source, /xl:absolute/);
    assert.match(source, /xl:w-\[72vw\]/);
    assert.match(source, /xl:w-auto/);
    assert.match(source, /xl:max-w-none/);
    assert.match(source, /xl:grid-cols-2/);
    assert.match(source, /xl:w-\[min\(36rem,34vw\)\]/);
    assert.match(source, /max-w-\[96rem\]/);
    assert.match(source, /xl:max-w-none/);
    assert.match(source, /xl:px-\[clamp\(2rem,3vw,3\.5rem\)\]/);
    assert.match(source, /-mt-8/);
    assert.ok(firstHeroImageIndex > -1, "Hero image should render in the component");
    assert.ok(heroCopyIndex > firstHeroImageIndex, "SEO copy should render below/after the mobile image");
    assert.match(source, /home\.heroEyebrow/);
    assert.match(source, /home\.heroTitle/);
    assert.match(source, /home\.heroAccent/);
    assert.match(source, /home\.heroText/);
    assert.match(source, /to="\/shop"/);
    assert.match(source, /to="\/categories"/);
    assert.match(source, /max-h-\[55svh\]/);
    assert.match(source, /md:max-h-\[62svh\]/);
    assert.match(source, /hero-desktop-inner-fade/);
    assert.match(source, /hero-desktop-outer-fade/);
    assert.match(source, /w-\[30%\]/);
    assert.match(source, /isRtl\s*\?\s*'xl:left-0 xl:justify-start'/);
    assert.match(source, /:\s*'xl:right-0 xl:justify-end'/);
    assert.match(source, /isRtl\s*\?\s*'xl:col-start-2 xl:justify-self-end'/);
    assert.match(source, /:\s*'xl:col-start-1 xl:justify-self-start'/);
    assert.match(source, /isRtl\s*\?\s*'end-0 hero-desktop-fade--right'/);
    assert.match(source, /:\s*'start-0 hero-desktop-fade--left'/);
    assert.match(source, /text-neutral-300 xl:text-\[#CF1D1D\]/);
    assert.match(source, /text-\[#CF1D1D\]\/80 xl:text-\[#CF1D1D\]/);
    assert.doesNotMatch(source, /src="\/train-hard\.png"/);
    assert.doesNotMatch(source, /xl:object-cover/);
    assert.doesNotMatch(source, /xl:-m[lrse]-/);
    assert.doesNotMatch(source, /xl:-?translate-x/);
    assert.doesNotMatch(source, /md:grid-cols|md:col-span|md:col-start/);
    assert.doesNotMatch(source, /xl:grid-cols-5/);
    assert.doesNotMatch(source, /xl:gap-7/);
    assert.doesNotMatch(source, /xl:col-span-/);
    assert.doesNotMatch(source, /hero-overlay/);
    assert.doesNotMatch(source, /rounded-\[1\.75rem\]/);
    assert.doesNotMatch(source, /hero-visual[^"]*rounded/);
    assert.doesNotMatch(source, /hero-visual[^"]*border/);
    assert.doesNotMatch(source, /sm:mx-0 lg:h-\[40rem\]/);
    assert.doesNotMatch(source, /-mt-\[5rem\]/);
    assert.doesNotMatch(source, /\blg:/);
    assert.doesNotMatch(source, /eyebrow[^"]*gap-3 text-\[#CF1D1D\]/);
    assert.doesNotMatch(source, /lg:pe-\[max\(2rem,calc\(\(100vw-96rem\)\/2\+2rem\)\)\]/);
    assert.doesNotMatch(source, /lg:ps-\[max\(2rem,calc\(\(100vw-96rem\)\/2\+2rem\)\)\]/);
    assert.doesNotMatch(source, /h-\[clamp\(500px,\s*72svh,\s*650px\)\]/);
    assert.doesNotMatch(source, /min-h-screen/);
    assert.doesNotMatch(source, /100vh/);
    assert.doesNotMatch(source, /min-h-\[calc\(100dvh-5rem\)\]/);
    assert.doesNotMatch(source, /categoryLinks/);
    assert.doesNotMatch(source, /stats/);
    assert.doesNotMatch(source, /home\.proGrade/);
    assert.doesNotMatch(source, /home\.fighterRating/);
    assert.doesNotMatch(source, /display:\s*none|visibility:\s*hidden|opacity:\s*0|sr-only/);
  });

  it("clips root horizontal overflow while keeping premium containers centered for RTL", () => {
    const css = read("../assets/css/main.css");

    assert.match(css, /html,\s*body,\s*#__nuxt\s*{/);
    assert.match(css, /max-width:\s*100%;/);
    assert.match(css, /overflow-x:\s*clip;/);
    assert.match(css, /\.container-premium\s*{[^}]*width:\s*min\(100% - 2rem,\s*80rem\);/s);
    assert.match(css, /\.container-premium\s*{[^}]*margin-inline:\s*auto;/s);
  });

  it("prevents post-hydration root transforms from shifting the RTL page", () => {
    const css = read("../assets/css/main.css");
    const rtlRootRule = css.match(/html\[dir="rtl"\]\s*{[\s\S]*?}/)?.[0] || "";

    assert.doesNotMatch(rtlRootRule, /transform\s*:/);
    assert.doesNotMatch(rtlRootRule, /translate\s*:/);
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

  it("limits homepage categories to eight and places the categories CTA above the grid", () => {
    const source = read("../components/home/CategoriesSection.vue");
    const enLocale = read("../locales/en.json");
    const arLocale = read("../locales/ar.json");

    assert.match(source, /homepageCategories/);
    assert.match(source, /\.slice\(0, 8\)/);
    assert.match(source, /to="\/categories"/);
    assert.match(source, /home\.viewAllCategories/);
    assert.match(source, /<div\s+v-reveal\s+class="mb-16/);
    assert.match(source, /<div class="hidden gap-5 sm:grid/);
    assert.ok(
      source.indexOf('to="/categories"') <
        source.indexOf('class="hidden gap-5 sm:grid'),
      "Categories CTA should render before the category grid",
    );
    assert.match(enLocale, /"viewAllCategories": "View All Categories"/);
    assert.match(arLocale, /"viewAllCategories": "عرض كل الأقسام"/);
  });

  it("uses a mobile and tablet brands marquee while keeping the desktop brand grid", () => {
    const source = read("../components/home/BrandsSection.vue");

    for (const brand of ["RDX", "VENUM", "EVERLAST", "WOLON", "TOP TEN"]) {
      assert.match(source, new RegExp(`"${brand}"`));
    }

    assert.match(source, /class="hidden grid-cols-5/);
    assert.match(source, /lg:grid/);
    assert.match(source, /class="brand-marquee/);
    assert.match(source, /lg:hidden/);
    assert.match(source, /brandMarqueeTracks/);
    assert.match(source, /aria-hidden="trackIndex === 1"/);
    assert.match(source, /brand-marquee-track/);
    assert.match(source, /animation:\s*brand-marquee\s+22s\s+linear\s+infinite/);
    assert.match(source, /@keyframes brand-marquee/);
    assert.match(source, /translate3d\(-50%,\s*0,\s*0\)/);
    assert.match(source, /translate3d\(0,\s*0,\s*0\)/);
    assert.match(source, /prefers-reduced-motion:\s*reduce/);
    assert.match(source, /animation:\s*none/);
    assert.doesNotMatch(source, /setInterval|setTimeout|requestAnimationFrame/);
  });
});

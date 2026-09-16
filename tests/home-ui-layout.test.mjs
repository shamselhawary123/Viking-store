import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const file = (path) => new URL(path, import.meta.url);

const readWebpInfo = (path) => {
  const bytes = readFileSync(file(path));

  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");

  for (let offset = 12; offset + 8 <= bytes.length;) {
    const chunk = bytes.toString("ascii", offset, offset + 4);
    const chunkSize = bytes.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (chunk === "VP8 ") {
      return {
        bytes: bytes.length,
        format: "webp",
        width: bytes.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: bytes.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    if (chunk === "VP8L") {
      const bits = bytes.readUInt32LE(dataOffset + 1);

      return {
        bytes: bytes.length,
        format: "webp",
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    if (chunk === "VP8X") {
      return {
        bytes: bytes.length,
        format: "webp",
        width: bytes.readUIntLE(dataOffset + 4, 3) + 1,
        height: bytes.readUIntLE(dataOffset + 7, 3) + 1,
      };
    }

    offset = dataOffset + chunkSize + (chunkSize % 2);
  }

  throw new Error(`Unable to read WebP dimensions for ${path}`);
};

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

  it("uses a blended image-led hero with a single descriptive H1 and stable CTA routes", () => {
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
    assert.match(source, /hero-heading-ar/);
    assert.match(source, /isRtl\s*\?\s*'hero-heading-ar'/);
    assert.match(source, /{{ t\("home\.heroEyebrow"\) }}/);
    assert.doesNotMatch(source, /home\.heroEyebrowLine1|home\.heroEyebrowLine2|home\.heroTitleLine1|home\.heroTitleLine2/);
    assert.doesNotMatch(source, /<br\b|<span class="block">\s*{{ t\("home\.heroEyebrowLine/);
    assert.match(source, /text-\[clamp\(1\.875rem,5vw,4rem\)\]/);
    assert.match(source, /text-balance/);
    assert.match(source, /xl:max-w-\[min\(38rem,36vw\)\]/);
    assert.match(source, /\.hero-heading-ar\s*{[^}]*font-family:\s*"Alexandria",\s*"IBM Plex Sans Arabic",\s*"Inter",\s*sans-serif;/s);
    assert.match(source, /\.hero-heading-ar\s*{[^}]*font-weight:\s*600;/s);
    assert.match(source, /\.hero-heading-ar\s*{[^}]*font-size:\s*clamp\(1\.875rem,\s*5vw,\s*2\.25rem\);[^}]*line-height:\s*1\.28;[^}]*max-width:\s*24rem;/s);
    assert.match(source, /@media\s*\(min-width:\s*1280px\)\s*{[\s\S]*?\.hero-heading-ar\s*{[^}]*font-size:\s*clamp\(2\.1rem,\s*2\.4vw,\s*3rem\);[^}]*line-height:\s*1\.12;[^}]*max-width:\s*min\(38rem,\s*36vw\);/s);
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
    assert.doesNotMatch(source, /home\.heroTitle/);
    assert.doesNotMatch(source, /home\.heroAccent/);
    assert.doesNotMatch(source, /home\.heroText/);
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
    assert.doesNotMatch(source, /class="eyebrow/);
    assert.doesNotMatch(source, /text-neutral-300 xl:text-\[#CF1D1D\]/);
    assert.doesNotMatch(source, /text-\[#CF1D1D\]\/80 xl:text-\[#CF1D1D\]/);
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
    assert.doesNotMatch(source, /class="[^"]*\blg:/);
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

  it("serves the hero as a native static responsive image without runtime transforms", () => {
    const source = read("../components/home/HeroSection.vue");
    const navbar = read("../components/shared/AppNavbar.vue");
    const expectedVariants = [
      ["../public/hero-640.webp", 640],
      ["../public/hero-960.webp", 960],
      ["../public/hero-1280.webp", 1280],
      ["../public/hero.webp", 1672],
    ];
    const imageTags = source.match(/<(?:NuxtImg|img)\b/g) || [];

    assert.equal(imageTags.length, 1);
    assert.match(source, /<img\b/);
    assert.doesNotMatch(source, /<NuxtImg\b/);
    assert.match(source, /src="\/hero\.webp"/);
    assert.match(source, /srcset="[\s\S]*?\/hero-640\.webp 640w,[\s\S]*?\/hero-960\.webp 960w,[\s\S]*?\/hero-1280\.webp 1280w,[\s\S]*?\/hero\.webp 1672w[\s\S]*?"/);
    assert.match(source, /width="1672"/);
    assert.match(source, /height="941"/);
    assert.match(source, /sizes="\s*\(min-width: 1280px\) 72vw,\s*100vw\s*"/);
    assert.match(source, /loading="eager"/);
    assert.match(source, /fetchpriority="high"/);
    assert.match(source, /decoding="async"/);
    assert.doesNotMatch(source, /loading="lazy"/);
    assert.doesNotMatch(source, /width="1400"|height="1200"/);
    assert.doesNotMatch(source, /\/_ipx|\/_vercel\/image|1844w|2048w|2212w/);
    assert.match(source, /h-auto max-h-\[55svh\] w-full object-contain md:max-h-\[62svh\] xl:h-full xl:w-auto xl:max-h-none xl:max-w-none xl:object-contain/);
    assert.doesNotMatch(navbar, /fetchpriority="high"/);

    for (const [path, width] of expectedVariants) {
      assert.ok(existsSync(file(path)), `${path} should exist`);

      const info = readWebpInfo(path);

      assert.equal(info.format, "webp");
      assert.equal(info.width, width);
      assert.equal(
        Math.round((info.width * 941) / 1672),
        info.height,
        `${path} should preserve the source aspect ratio`,
      );
      assert.ok(info.width <= 1672, `${path} must not upscale past the source width`);
      assert.equal(statSync(file(path)).size, info.bytes);
    }
  });

  it("moves the marketing headline and paragraph into visible intro content after brands", () => {
    const page = read("../pages/index.vue");
    const intro = read("../components/home/IntroSection.vue");
    const enLocale = read("../locales/en.json");
    const arLocale = read("../locales/ar.json");
    const h1Matches = `${read("../components/home/HeroSection.vue")}\n${intro}`.match(/<h1\b/g) || [];
    const brandsIndex = page.indexOf("<HomeBrandsSection />");
    const introIndex = page.indexOf("<HomeIntroSection />");
    const categoriesIndex = page.indexOf("<HomeCategoriesSection />");

    assert.equal(h1Matches.length, 1);
    assert.ok(brandsIndex > -1, "Brands section should remain on the homepage");
    assert.ok(introIndex > brandsIndex, "Intro content should render after Brands");
    assert.ok(categoriesIndex > introIndex, "Intro content should render before the rest of the homepage");
    assert.match(intro, /<h2\b/);
    assert.match(intro, /home\.heroTitle/);
    assert.match(intro, /home\.heroAccent/);
    assert.match(intro, /home\.heroText/);
    assert.match(intro, /:dir="isRtl \? 'rtl' : 'ltr'"/);
    assert.match(intro, /text-neutral-300/);
    assert.match(intro, /class="bg-black pt-10 pb-0 sm:pt-12 xl:pt-14"/);
    assert.doesNotMatch(intro, /(?:^|\s)(?:sm:|md:|lg:|xl:|2xl:)?(?:p|py|pb)-(?!(?:0)(?:\s|"))/);
    assert.doesNotMatch(intro, /NuxtLink|premium-button|to="\/shop"|to="\/categories"/);
    assert.doesNotMatch(intro, /display:\s*none|visibility:\s*hidden|opacity:\s*0|sr-only/);
    assert.match(enLocale, /"heroEyebrow": "Egypt Combat Sports Store"/);
    assert.match(arLocale, /"heroEyebrow": "متجر أدوات رياضية وأدوات فنون قتالية في مصر"/);
    assert.doesNotMatch(arLocale, /heroEyebrowLine1|heroEyebrowLine2|heroTitleLine1|heroTitleLine2/);
    assert.match(arLocale, /"heroAccent":\s*"[^"]+"/);
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

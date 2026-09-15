<template>
  <section
    class="overflow-hidden bg-black xl:relative xl:min-h-[clamp(620px,calc(100svh-5rem),850px)]"
  >
    <div
      dir="ltr"
      class="mx-auto grid w-full max-w-[96rem] xl:min-h-[clamp(620px,calc(100svh-5rem),850px)] xl:max-w-none xl:grid-cols-2 xl:items-center xl:px-[clamp(2rem,3vw,3.5rem)]"
    >
      <div
        class="hero-visual relative flex items-end justify-center overflow-hidden bg-black xl:pointer-events-none xl:absolute xl:inset-y-0 xl:z-0 xl:h-[clamp(620px,calc(100svh-5rem),850px)] xl:w-[72vw] xl:items-center"
        :class="isRtl ? 'xl:left-0 xl:justify-start' : 'xl:right-0 xl:justify-end'"
      >
        <img
          src="/hero.webp"
          alt="Viking Store combat sports equipment"
          width="1400"
          height="1200"
          class="h-auto max-h-[55svh] w-full object-contain md:max-h-[62svh] xl:h-full xl:w-auto xl:max-h-none xl:max-w-none xl:object-contain"
          fetchpriority="high"
          decoding="async"
        />
        <div
          class="hero-mobile-fade pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.35)_38%,rgba(0,0,0,0.8)_72%,#000_100%)] xl:hidden"
        />
        <div
          class="hero-desktop-inner-fade pointer-events-none absolute inset-y-0 hidden w-[30%] xl:block"
          :class="
            isRtl
              ? 'end-0 hero-desktop-fade--right'
              : 'start-0 hero-desktop-fade--left'
          "
        />
        <div
          class="hero-desktop-outer-fade pointer-events-none absolute inset-y-0 hidden w-36 xl:block"
          :class="
            isRtl
              ? 'start-0 hero-desktop-fade--left'
              : 'end-0 hero-desktop-fade--right'
          "
        />
      </div>

      <div
        :dir="isRtl ? 'rtl' : 'ltr'"
        class="hero-copy reveal-up relative z-10 -mt-8 px-4 pb-7 text-center xl:text-start xl:mt-0 xl:flex xl:min-h-[clamp(620px,calc(100svh-5rem),850px)] xl:w-[min(36rem,34vw)] xl:flex-col xl:justify-center xl:px-0 xl:pb-0"
        :class="
          isRtl
            ? 'xl:col-start-2 xl:justify-self-end'
            : 'xl:col-start-1 xl:justify-self-start'
        "
      >
        <p
          class="eyebrow inline-flex items-center justify-center gap-3 text-neutral-300 xl:text-[#CF1D1D] xl:justify-start"
        >
          <span class="h-px w-8 bg-[#CF1D1D] xl:w-10" />
          {{ t("home.heroEyebrow") }}
        </p>
        <h1
          class="display-heading mx-auto mt-3 max-w-3xl text-[2rem] leading-[0.96] text-white sm:text-4xl xl:mx-0 xl:mt-4 xl:text-[4.55rem] xl:leading-[0.92]"
        >
          {{ t("home.heroTitle") }}
          <span
            class="block text-[#CF1D1D]/80 xl:text-[#CF1D1D] drop-shadow-none xl:drop-shadow-[0_0_34px_rgba(207,29,29,0.22)]"
          >
            {{ t("home.heroAccent") }}
          </span>
        </h1>
        <p
          class="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-200 xl:ms-0 xl:me-auto xl:mt-5 xl:text-lg xl:leading-8"
        >
          {{ t("home.heroText") }}
        </p>

        <div
          class="mt-5 flex flex-col justify-center gap-3 sm:flex-row xl:mt-7 xl:justify-start"
        >
          <NuxtLink
            to="/shop"
            class="premium-button premium-button-primary purchase-cta-shine min-h-14 w-full px-7 sm:w-auto"
          >
            {{ t("home.shopGear") }}
            <Icon
              :name="
                isRtl ? 'i-heroicons-arrow-left' : 'i-heroicons-arrow-right'
              "
            />
          </NuxtLink>
          <NuxtLink
            to="/categories"
            class="premium-button premium-button-secondary purchase-cta-shine min-h-14 border-white/20 bg-black/45 px-7 backdrop-blur"
          >
            {{ t("home.exploreCategories") }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { locale, t } = useI18n();
const isRtl = computed(() => locale.value === "ar");
</script>

<style scoped>
.hero-desktop-fade--right {
  background: linear-gradient(
    to left,
    #000 0%,
    rgba(0, 0, 0, 0.78) 34%,
    rgba(0, 0, 0, 0) 100%
  );
}

.hero-desktop-fade--left {
  background: linear-gradient(
    to right,
    #000 0%,
    rgba(0, 0, 0, 0.78) 34%,
    rgba(0, 0, 0, 0) 100%
  );
}
</style>

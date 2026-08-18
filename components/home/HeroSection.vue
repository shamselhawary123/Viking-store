<template>
  <section class="relative min-h-[calc(100dvh-5rem)] overflow-hidden bg-black">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,77,0,0.26),transparent_28rem),radial-gradient(circle_at_12%_70%,rgba(255,255,255,0.08),transparent_22rem)]"
    />
    <div
      class="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,77,0,0.08)_0_1px,transparent_1px_120px)] opacity-25"
    />
    <div
      class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent"
    />

    <div
      class="container-premium relative grid min-h-[calc(100dvh-5rem)] items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:py-20"
    >
      <div class="reveal-up pt-4 text-center lg:text-left">
        <p class="eyebrow inline-flex items-center gap-3">
          <span class="h-px w-10 bg-[#FF4D00]" />
          {{ t("home.heroEyebrow") }}
        </p>
        <h1
          class="display-heading mt-6 text-7xl text-white sm:text-8xl lg:text-[9.6rem]"
        >
          {{ t("home.heroTitle") }}
          <span
            class="block text-[#FF4D00] drop-shadow-[0_0_34px_rgba(255,77,0,0.22)]"
            >{{ t("home.heroAccent") }}</span
          >
        </h1>
        <p
          class="mx-auto mt-7 max-w-2xl text-base leading-8 text-neutral-300 lg:mx-0 lg:text-lg"
        >
          {{ t("home.heroText") }}
        </p>

        <div
          class="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
        >
          <NuxtLink
            to="/shop"
            class="premium-button premium-button-primary min-h-14 px-7"
          >
            {{ t("home.shopGear") }}
            <Icon name="i-heroicons-arrow-right" />
          </NuxtLink>
          <NuxtLink
            to="/categories"
            class="premium-button premium-button-secondary min-h-14 px-7"
          >
            {{ t("home.exploreCategories") }}
          </NuxtLink>
        </div>

        <div
          class="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start"
          :aria-label="t('home.categoryQuickLinks')"
        >
          <NuxtLink
            v-for="link in categoryLinks"
            :key="link.slug"
            :to="buildShopCategoryUrl(link.slug)"
            class="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-300 transition hover:border-[#FF4D00] hover:text-[#FF4D00]"
          >
            {{ t(link.labelKey) }}
          </NuxtLink>
        </div>

        <div class="mt-11 grid grid-cols-3 gap-3 text-left">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/50"
          >
            <p class="font-display text-4xl leading-none text-white">
              {{ stat.value }}
            </p>
            <p
              class="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500"
            >
              {{ t(stat.labelKey) }}
            </p>
          </div>
        </div>
      </div>

      <div class="relative min-h-[25rem] reveal-slide lg:min-h-[44rem]">
        <div
          class="absolute inset-6 rounded-full bg-[#FF4D00]/15 blur-[100px]"
        />
        <div
          class="absolute right-4 top-12 h-24 w-24 rounded-full border border-[#FF4D00]/25"
        />
        <div
          class="absolute bottom-16 left-4 h-32 w-32 rounded-full border border-white/10"
        />
        <img
          src="/train-hard.png"
          alt="Premium Viking combat equipment"
          width="900"
          height="900"
          class="relative z-10 mx-auto max-h-[40rem] w-full max-w-3xl object-contain drop-shadow-[0_35px_70px_rgba(0,0,0,0.7)] floating"
          fetchpriority="high"
          decoding="async"
        />
        <div
          class="absolute bottom-7 left-4 z-20 rounded-2xl border border-white/10 bg-black/75 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur md:left-10"
        >
          <p
            class="text-xs font-black uppercase tracking-[0.22em] text-[#FF4D00]"
          >
            {{ t("home.proGrade") }}
          </p>
          <p class="mt-1 text-sm font-bold text-white">
            {{ t("home.rounds") }}
          </p>
        </div>
        <div
          class="absolute right-3 top-8 z-20 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur md:right-12"
        >
          <p class="font-display text-4xl leading-none text-white">4.9</p>
          <p
            class="text-xs font-black uppercase tracking-[0.16em] text-[#FF4D00]"
          >
            {{ t("home.fighterRating") }}
          </p>
        </div>
      </div>
    </div>

    <!-- <div class="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-neutral-500 md:flex">
      <span class="text-xs font-bold uppercase tracking-[0.3em]">Scroll</span>
      <span class="h-10 w-px animate-bounce bg-[#FF4D00]" />
    </div> -->
  </section>
</template>

<script setup lang="ts">
import { buildShopCategoryUrl } from "../../utils/seo";

const { t } = useI18n();

const categoryLinks = [
  { slug: "gloves", labelKey: "home.boxingGear" },
  { slug: "gloves", labelKey: "home.mmaGear" },
];

const stats = [
  { value: "4.9", labelKey: "home.rating" },
  { value: "24h", labelKey: "home.dispatch" },
  { value: "Pro", labelKey: "home.quality" },
];
</script>

<style scoped>
.floating {
  animation: floating 6s ease-in-out infinite;
}

.reveal-slide {
  animation: reveal-slide 650ms ease 120ms both;
}

@keyframes floating {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-14px);
  }
}

@keyframes reveal-slide {
  from {
    opacity: 0;
    transform: translateX(22px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

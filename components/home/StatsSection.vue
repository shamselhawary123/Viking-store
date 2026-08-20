<template>
  <section class="bg-[#080808] py-10 md:py-16">
    <div class="container-premium">
      <div
        class="relative overflow-hidden rounded-2xl border border-white/10 bg-black px-6 py-14 shadow-[0_28px_100px_rgba(0,0,0,0.45)] md:px-10 lg:px-14"
      >
        <img
          src="/train-hard.png"
          alt=""
          width="900"
          height="900"
          class="absolute inset-y-0 right-0 hidden h-full w-1/2 object-contain opacity-35 lg:block"
          loading="lazy"
          decoding="async"
        />
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(255,77,0,0.28),transparent_26rem)]"
        />
        <div
          class="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50"
        />

        <div
          class="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <div>
            <p class="eyebrow">{{ t("home.limitedTrainingDrop") }}</p>
            <h2
              class="display-heading mt-4 max-w-2xl text-6xl text-white md:text-7xl"
            >
              {{ t("home.gearUpNextRound") }}
            </h2>
            <p class="mt-5 max-w-xl leading-8 text-neutral-300">
              {{ t("home.statsLead") }}
            </p>
            <NuxtLink
              to="/shop"
              class="premium-button premium-button-primary mt-8 min-h-14 px-7"
            >
              {{ t("home.shopTheDrop") }}
              <Icon name="i-heroicons-arrow-right" />
            </NuxtLink>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="stat in stats"
              :key="stat.titleKey"
              class="rounded-2xl border border-white/10 bg-white/[0.055] p-5 text-center backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/50"
            >
              <h3 class="font-display text-5xl leading-none text-[#FF4D00]">
                {{ stat.number }}
              </h3>
              <p
                class="mt-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-400"
              >
                {{ t(stat.titleKey) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();

const stats = [
  { number: "690+", titleKey: "home.ordersStat" },
  { number: "489+", titleKey: "home.athletesStat" },
  { number: "4.8", titleKey: "home.ratingStat" },
];
</script>

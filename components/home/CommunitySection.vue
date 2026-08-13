<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div class="mb-14 flex flex-col gap-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div>
          <p class="eyebrow">{{ t("home.communitySection.eyebrow") }}</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">{{ t("home.communitySection.title") }}</h2>
          <p class="mt-5 max-w-2xl leading-8 text-neutral-400">
            {{ t("home.communitySection.description") }}
          </p>
        </div>
        <NuxtLink to="/shop" class="premium-button premium-button-secondary hidden md:inline-flex">
          {{ t("home.communitySection.cta") }}
          <Icon name="i-heroicons-arrow-right" />
        </NuxtLink>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="item in gallery"
          :key="item.titleKey"
          class="group relative min-h-[18rem] overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/70"
        >
          <img
            src="/train-hard.png"
            :alt="t(item.titleKey)"
            width="640"
            height="640"
            class="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-110 group-hover:opacity-75"
            loading="lazy"
            decoding="async"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
          <div class="absolute inset-x-5 bottom-5">
            <p class="text-xs font-black uppercase tracking-[0.2em] text-[#FF4D00]">{{ t(item.kickerKey) }}</p>
            <h3 class="mt-2 text-2xl font-black text-white">{{ t(item.titleKey) }}</h3>
          </div>
        </article>
      </div>

      <div class="mt-8 text-center md:hidden">
        <NuxtLink to="/shop" class="premium-button premium-button-secondary">
          {{ t("home.communitySection.cta") }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();

const gallery = [
  { kickerKey: "home.communitySection.bagWork", titleKey: "home.communitySection.powerRounds" },
  { kickerKey: "home.communitySection.sparring", titleKey: "home.communitySection.sharpSessions" },
  { kickerKey: "home.communitySection.fightwear", titleKey: "home.communitySection.walkoutEnergy" },
  { kickerKey: "home.communitySection.recovery", titleKey: "home.communitySection.readyTomorrow" },
];
</script>

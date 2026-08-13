<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <p class="eyebrow">{{ t("home.whyViking.eyebrow") }}</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">{{ t("home.whyViking.title") }}</h2>
        <p class="mt-5 leading-8 text-neutral-400">
          {{ t("home.whyViking.description") }}
        </p>
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <article
          v-for="item in features"
          :key="item.titleKey"
          class="premium-panel group rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60 hover:shadow-[0_30px_90px_rgba(255,77,0,0.1)]"
        >
          <div class="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF4D00]/10 text-[#FF4D00] transition duration-300 group-hover:scale-110 group-hover:bg-[#FF4D00] group-hover:text-white">
            <Icon :name="item.icon" class="text-3xl" />
          </div>
          <h3 class="text-2xl font-black text-white">{{ t(item.titleKey) }}</h3>
          <p class="mt-4 leading-7 text-neutral-400">{{ t(item.descriptionKey) }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();

const features = [
  {
    icon: "i-heroicons-shield-check",
    titleKey: "home.whyViking.materialsTitle",
    descriptionKey: "home.whyViking.materialsText",
  },
  {
    icon: "i-heroicons-truck",
    titleKey: "home.whyViking.shippingTitle",
    descriptionKey: "home.whyViking.shippingText",
  },
  {
    icon: "i-heroicons-banknotes",
    titleKey: "home.whyViking.paymentTitle",
    descriptionKey: "home.whyViking.paymentText",
  },
  {
    icon: "i-heroicons-trophy",
    titleKey: "home.whyViking.fightersTitle",
    descriptionKey: "home.whyViking.fightersText",
  },
  {
    icon: "i-heroicons-sparkles",
    titleKey: "home.whyViking.supportTitle",
    descriptionKey: "home.whyViking.supportText",
  },
];
</script>

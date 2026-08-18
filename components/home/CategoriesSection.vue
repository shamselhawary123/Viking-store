<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <p class="eyebrow">{{ t('common.categories') }}</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">{{ t('home.chooseYourWeapon') }}</h2>
        <p class="mt-5 leading-8 text-neutral-400">
          {{ t('home.categoriesLead') }}
        </p>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <NuxtLink
          v-for="category in categoriesStore.categories.filter((c) => c.slug !== 'all')"
          :key="category.id"
          :to="buildShopCategoryUrl(category.slug)"
          class="group relative min-h-[23rem] overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/70 hover:shadow-[0_30px_90px_rgba(255,77,0,0.12)]"
        >
          <img
            :src="category.image"
            :alt="categorySeo(category).title"
            width="640"
            height="800"
            class="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
            loading="lazy"
            decoding="async"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div class="absolute inset-x-5 top-5 flex items-center justify-between">
            <span class="rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur">{{ t('home.proGear') }}</span>
            <span class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition duration-300 group-hover:border-[#FF4D00] group-hover:bg-[#FF4D00]">
              <Icon name="i-heroicons-arrow-right" />
            </span>
          </div>
          <div class="absolute bottom-6 left-6 right-6 translate-y-2 transition duration-300 group-hover:translate-y-0">
            <h3 class="font-display text-5xl leading-none text-white">{{ getLocalizedCategoryName(category, locale) || category.name }}</h3>
            <p class="mt-3 max-w-52 text-sm leading-6 text-neutral-300">
              {{ categorySeo(category).intro }}
            </p>
            <p class="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#FF4D00]">
              {{ t('home.explore') }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useCategoriesStore } from "../../stores/categories";
import { getLocalizedCategoryName } from "../../utils/localizationFormat";
import { buildCategorySeo, buildShopCategoryUrl } from "../../utils/seo";

const categoriesStore = useCategoriesStore(usePinia());
const { locale, t } = useI18n();

const categorySeo = (category: { slug?: string | null; name?: string | null }) =>
  buildCategorySeo(category, locale.value);

onMounted(async () => {
  await categoriesStore.getCategories();
});
</script>

<template>
  <div
    v-if="shopStore.mobileFiltersOpen"
    class="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
    aria-hidden="true"
    @click="shopStore.mobileFiltersOpen = false"
  />

  <aside
    class="premium-panel space-y-7 rounded-2xl p-5 transition-all duration-300 ease-in-out lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
    :class="[
      shopStore.mobileFiltersOpen
        ? 'fixed bottom-0 left-0 right-0 z-50 max-h-[88dvh] overflow-y-auto rounded-b-none shadow-[0_-30px_90px_rgba(0,0,0,0.55)]'
        : 'fixed bottom-0 left-0 right-0 z-50 max-h-[88dvh] translate-y-full overflow-y-auto rounded-b-none lg:static lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-2xl',
    ]"
    :aria-label="t('shop.productFilters')"
  >
    <div class="mx-auto h-1.5 w-12 rounded-full bg-white/15 lg:hidden" />

    <div class="flex items-center justify-between">
      <div>
        <p class="eyebrow">{{ t('shop.refine') }}</p>
        <h2 class="mt-2 text-2xl font-black text-white">{{ t('common.filters') }}</h2>
      </div>

      <button
        class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition hover:border-[#CF1D1D] hover:text-[#CF1D1D] lg:hidden"
        :aria-label="t('shop.closeFilters')"
        @click="shopStore.mobileFiltersOpen = false"
      >
        <Icon name="i-heroicons-x-mark" />
      </button>
    </div>

    <div>
      <label for="shop-search" class="mb-3 block text-sm font-black uppercase tracking-[0.16em] text-white">{{ t('common.search') }}</label>
      <div class="relative">
        <Icon name="i-heroicons-magnifying-glass" class="absolute top-1/2 -translate-y-1/2 text-neutral-500" :class="isRtl ? 'right-4' : 'left-4'" />
        <input id="shop-search" v-model="shopStore.search" type="search" :placeholder="t('shop.searchPlaceholder')" class="premium-input px-11" />
        <button
          v-if="shopStore.search"
          class="absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
          :class="isRtl ? 'left-2' : 'right-2'"
          :aria-label="t('shop.clearSearch')"
          @click="shopStore.search = ''"
        >
          <Icon name="i-heroicons-x-mark" />
        </button>
      </div>
    </div>

    <div>
      <button class="flex min-h-11 w-full items-center justify-between" @click="categoriesOpen = !categoriesOpen">
        <h3 class="text-sm font-black uppercase tracking-[0.16em] text-white">{{ t('nav.categories') }}</h3>
        <Icon name="i-heroicons-chevron-down" class="text-[#CF1D1D] transition duration-300" :class="{ 'rotate-180': categoriesOpen }" />
      </button>

      <div v-show="categoriesOpen" class="mt-4 grid gap-2">
        <button
          v-for="category in categoriesStore.categories"
          :key="category.id"
          class="flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition duration-200 active:scale-[0.99]"
          :class="
            shopStore.selectedCategory === category.slug
              ? 'border-[#CF1D1D] bg-[#CF1D1D]/10 text-[#CF1D1D] shadow-[0_0_0_3px_rgba(207,29,29,0.08)]'
              : 'border-white/10 bg-black/20 text-neutral-300 hover:-translate-y-0.5 hover:border-[#CF1D1D] hover:text-white'
          "
          @click="selectCategory(category.slug)"
        >
          <span>{{ getLocalizedCategoryName(category, locale) || category.name }}</span>
          <Icon :name="shopStore.selectedCategory === category.slug ? 'i-heroicons-check' : 'i-heroicons-chevron-right'" class="text-neutral-500" />
        </button>
      </div>
    </div>

    <div>
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-black uppercase tracking-[0.16em] text-white">{{ t('shop.maxPrice') }}</h3>
        <span class="font-black text-[#CF1D1D]">{{ priceLabel }}</span>
      </div>
      <input v-model="shopStore.maxPrice" type="range" min="0" :max="SHOP_DEFAULT_MAX_PRICE" step="10" class="w-full accent-[#CF1D1D]" />
      <div class="mt-2 flex justify-between text-xs text-neutral-500">
        <span>{{ formatStorePrice(0, locale) }}</span>
        <span>{{ t('shop.any') }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-1">
      <button class="premium-button premium-button-secondary w-full rounded-xl" @click="resetFilters">
        <Icon name="i-heroicons-arrow-path" />
        {{ t('shop.reset') }}
      </button>
      <button
        class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#CF1D1D] px-5 py-3 font-extrabold text-white shadow-[0_18px_45px_rgba(207,29,29,0.26)] transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] lg:hidden"
        @click="shopStore.mobileFiltersOpen = false"
      >
        {{ t('shop.applyFilters') }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useShopStore } from "../../stores/shop";
import { useCategoriesStore } from "../../stores/categories";
import { formatStorePrice, getLocalizedCategoryName } from "../../utils/localizationFormat";
import { SHOP_DEFAULT_MAX_PRICE } from "../../utils/shopProducts";

const shopStore = useShopStore(usePinia());
const categoriesStore = useCategoriesStore(usePinia());
const categoriesOpen = ref(true);
const { locale, t } = useI18n();
const isRtl = computed(() => locale.value === "ar");
const priceLabel = computed(() =>
  shopStore.maxPrice >= SHOP_DEFAULT_MAX_PRICE ? t("shop.any") : formatStorePrice(shopStore.maxPrice, locale.value),
);

const selectCategory = (slug: string) => {
  shopStore.selectedCategory = slug;
  shopStore.mobileFiltersOpen = false;
  navigateTo(slug === "all" ? "/shop" : `/shop?category=${slug}`);
};

const resetFilters = () => {
  shopStore.selectedCategory = "all";
  shopStore.search = "";
  shopStore.sortBy = "default";
  shopStore.maxPrice = SHOP_DEFAULT_MAX_PRICE;
  shopStore.mobileFiltersOpen = false;
  navigateTo("/shop");
};
</script>

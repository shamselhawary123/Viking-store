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
    aria-label="Product filters"
  >
    <div class="mx-auto h-1.5 w-12 rounded-full bg-white/15 lg:hidden" />

    <div class="flex items-center justify-between">
      <div>
        <p class="eyebrow">Refine</p>
        <h2 class="mt-2 text-2xl font-black text-white">Filters</h2>
      </div>

      <button
        class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition hover:border-[#FF4D00] hover:text-[#FF4D00] lg:hidden"
        aria-label="Close filters"
        @click="shopStore.mobileFiltersOpen = false"
      >
        <Icon name="i-heroicons-x-mark" />
      </button>
    </div>

    <div>
      <label for="shop-search" class="mb-3 block text-sm font-black uppercase tracking-[0.16em] text-white">Search</label>
      <div class="relative">
        <Icon name="i-heroicons-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input id="shop-search" v-model="shopStore.search" type="search" placeholder="Search gloves, wraps, shorts..." class="premium-input pl-11 pr-11" />
        <button
          v-if="shopStore.search"
          class="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Clear search"
          @click="shopStore.search = ''"
        >
          <Icon name="i-heroicons-x-mark" />
        </button>
      </div>
    </div>

    <div>
      <button class="flex min-h-11 w-full items-center justify-between" @click="categoriesOpen = !categoriesOpen">
        <h3 class="text-sm font-black uppercase tracking-[0.16em] text-white">Categories</h3>
        <Icon name="i-heroicons-chevron-down" class="text-[#FF4D00] transition duration-300" :class="{ 'rotate-180': categoriesOpen }" />
      </button>

      <div v-show="categoriesOpen" class="mt-4 grid gap-2">
        <button
          v-for="category in categoriesStore.categories"
          :key="category.id"
          class="flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition duration-200 active:scale-[0.99]"
          :class="
            shopStore.selectedCategory === category.slug
              ? 'border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00] shadow-[0_0_0_3px_rgba(255,77,0,0.08)]'
              : 'border-white/10 bg-black/20 text-neutral-300 hover:-translate-y-0.5 hover:border-[#FF4D00] hover:text-white'
          "
          @click="selectCategory(category.slug)"
        >
          <span>{{ category.name }}</span>
          <Icon :name="shopStore.selectedCategory === category.slug ? 'i-heroicons-check' : 'i-heroicons-chevron-right'" class="text-neutral-500" />
        </button>
      </div>
    </div>

    <div>
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-black uppercase tracking-[0.16em] text-white">Max Price</h3>
        <span class="font-black text-[#FF4D00]">${{ shopStore.maxPrice }}</span>
      </div>
      <input v-model="shopStore.maxPrice" type="range" min="0" max="500" step="10" class="w-full accent-[#FF4D00]" />
      <div class="mt-2 flex justify-between text-xs text-neutral-500">
        <span>$0</span>
        <span>$500</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-1">
      <button class="premium-button premium-button-secondary w-full rounded-xl" @click="resetFilters">
        <Icon name="i-heroicons-arrow-path" />
        Reset
      </button>
      <button
        class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF4D00] px-5 py-3 font-extrabold text-white shadow-[0_18px_45px_rgba(255,77,0,0.26)] transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] lg:hidden"
        @click="shopStore.mobileFiltersOpen = false"
      >
        Apply Filters
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useShopStore } from "../../stores/shop";
import { useCategoriesStore } from "../../stores/categories";

const shopStore = useShopStore(usePinia());
const categoriesStore = useCategoriesStore(usePinia());
const categoriesOpen = ref(true);

onMounted(async () => {
  await categoriesStore.getCategories();
});

const selectCategory = (slug: string) => {
  shopStore.selectedCategory = slug;
  shopStore.mobileFiltersOpen = false;
  navigateTo(slug === "all" ? "/shop" : `/shop?category=${slug}`);
};

const resetFilters = () => {
  shopStore.selectedCategory = "all";
  shopStore.search = "";
  shopStore.sortBy = "default";
  shopStore.maxPrice = 500;
  shopStore.mobileFiltersOpen = false;
  navigateTo("/shop");
};
</script>

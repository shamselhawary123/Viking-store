<template>
  <div
    v-if="shopStore.mobileFiltersOpen"
    class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
    aria-hidden="true"
    @click="shopStore.mobileFiltersOpen = false"
  />

  <aside
    class="premium-panel space-y-8 rounded-2xl p-5 transition-all duration-300 ease-in-out lg:sticky lg:top-28"
    :class="[
      shopStore.mobileFiltersOpen
        ? 'fixed bottom-0 left-0 right-0 z-50 max-h-[88dvh] overflow-y-auto rounded-b-none'
        : 'fixed bottom-0 left-0 right-0 z-50 max-h-[88dvh] translate-y-full overflow-y-auto rounded-b-none lg:static lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-2xl',
    ]"
    aria-label="Product filters"
  >
    <div class="flex items-center justify-between">
      <div>
        <p class="eyebrow">Refine</p>
        <h2 class="mt-2 text-2xl font-black">Filters</h2>
      </div>

      <button
        class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition hover:border-[#FF4D00] hover:text-[#FF4D00] lg:hidden"
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
        <input id="shop-search" v-model="shopStore.search" type="text" placeholder="Search gloves, wraps, shorts..." class="premium-input pl-11" />
      </div>
    </div>

    <div>
      <button class="flex w-full items-center justify-between" @click="categoriesOpen = !categoriesOpen">
        <h3 class="text-sm font-black uppercase tracking-[0.16em] text-white">Categories</h3>
        <Icon name="i-heroicons-chevron-down" class="text-[#FF4D00] transition duration-300" :class="{ 'rotate-180': categoriesOpen }" />
      </button>

      <div v-show="categoriesOpen" class="mt-4 space-y-2">
        <button
          v-for="category in categoriesStore.categories"
          :key="category.id"
          class="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold transition"
          :class="
            shopStore.selectedCategory === category.slug
              ? 'border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]'
              : 'border-white/10 text-neutral-300 hover:border-[#FF4D00] hover:text-white'
          "
          @click="selectCategory(category.slug)"
        >
          <span>{{ category.name }}</span>
          <Icon name="i-heroicons-chevron-right" class="text-neutral-500" />
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

    <button class="premium-button premium-button-secondary w-full" @click="resetFilters">
      <Icon name="i-heroicons-arrow-path" />
      Reset Filters
    </button>
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

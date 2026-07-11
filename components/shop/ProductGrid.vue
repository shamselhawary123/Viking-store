<template>
  <div>
    <div v-if="activeFilters.length" class="mb-6 flex flex-wrap gap-3">
      <button
        v-for="filter in activeFilters"
        :key="filter.key"
        class="inline-flex items-center gap-2 rounded-full border border-[#FF4D00]/30 bg-[#FF4D00]/10 px-4 py-2 text-sm font-bold text-[#FF4D00]"
        @click="filter.clear"
      >
        {{ filter.label }}
        <Icon name="i-heroicons-x-mark" />
      </button>
    </div>

    <div class="mb-6 flex items-center justify-between gap-4">
      <p class="text-sm font-semibold text-neutral-400">
        Showing <span class="text-white">{{ filteredProducts.length }}</span> products
      </p>
      <p class="hidden text-sm text-neutral-500 sm:block">Premium combat gear curated for hard training.</p>
    </div>

    <div v-if="productsStore.loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="i in 6" :key="i" class="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <div class="aspect-[4/5] animate-pulse bg-white/10" />
        <div class="space-y-4 p-5">
          <div class="h-3 w-24 animate-pulse rounded bg-white/10" />
          <div class="h-6 w-3/4 animate-pulse rounded bg-white/10" />
          <div class="h-12 w-full animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    </div>

    <div v-else-if="filteredProducts.length" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <ShopProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
    </div>

    <div v-else class="premium-panel rounded-2xl px-6 py-20 text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black text-[#FF4D00]">
        <Icon name="i-heroicons-magnifying-glass" class="text-3xl" />
      </div>
      <h2 class="mt-6 text-3xl font-black">No Products Found</h2>
      <p class="mx-auto mt-3 max-w-md text-neutral-400">
        Try another category, lower the price filter, or search for a different training essential.
      </p>
      <button class="premium-button premium-button-primary mt-8" @click="resetFilters">
        Reset Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useShopStore } from "../../stores/shop";
import { useProductsStore } from "../../stores/products";

const productsStore = useProductsStore(usePinia());
const props = defineProps<{
  products: any[];
}>();

const shopStore = useShopStore(usePinia());

const filteredProducts = computed(() => {
  let result = [...props.products];

  if (shopStore.selectedCategory !== "all") {
    result = result.filter((product) => product.categories?.slug === shopStore.selectedCategory);
  }

  if (shopStore.search) {
    const query = shopStore.search.toLowerCase();
    result = result.filter((product) => product.title?.toLowerCase().includes(query));
  }

  result = result.filter((product) => Number(product.price) <= shopStore.maxPrice);

  if (shopStore.sortBy === "low") {
    result.sort((a, b) => a.price - b.price);
  }

  if (shopStore.sortBy === "high") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
});

const activeFilters = computed(() => {
  const filters = [];

  if (shopStore.selectedCategory !== "all") {
    filters.push({
      key: "category",
      label: shopStore.selectedCategory,
      clear: () => {
        shopStore.selectedCategory = "all";
        navigateTo("/shop");
      },
    });
  }

  if (shopStore.search) {
    filters.push({
      key: "search",
      label: shopStore.search,
      clear: () => {
        shopStore.search = "";
      },
    });
  }

  return filters;
});

const resetFilters = () => {
  shopStore.selectedCategory = "all";
  shopStore.search = "";
  shopStore.sortBy = "default";
  shopStore.maxPrice = 500;
  navigateTo("/shop");
};
</script>

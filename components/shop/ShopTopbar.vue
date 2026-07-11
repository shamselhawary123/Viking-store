<template>
  <div class="premium-panel rounded-2xl p-5 md:p-6">
    <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="eyebrow">Viking Store</p>
        <h1 class="mt-2 text-3xl font-black md:text-4xl">Combat Equipment</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
          Browse premium training gear built for boxing, kickboxing, Muay Thai, and MMA.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button class="premium-button premium-button-secondary lg:hidden" @click="toggleFilters">
          <Icon name="i-heroicons-funnel" />
          Filters
        </button>

        <label class="sr-only" for="sort-products">Sort products</label>
        <select id="sort-products" v-model="shopStore.sortBy" class="premium-input min-w-52">
          <option value="default">Featured</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShopStore } from "../../stores/shop";

const shopStore = useShopStore(usePinia());

const toggleFilters = () => {
  shopStore.mobileFiltersOpen = !shopStore.mobileFiltersOpen;
};
</script>

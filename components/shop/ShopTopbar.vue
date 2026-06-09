<template>
  <div
    class="flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#111111] p-6 md:flex-row md:items-center md:justify-between"
  >
    <div>
      <p class="text-xs uppercase tracking-[0.3em] text-[#FF4D00]">
        Viking Store
      </p>

      <h2 class="mt-2 text-3xl font-black">Combat Equipment</h2>
    </div>

    <div class="flex items-center gap-3">
      <button
        @click="toggleFilters"
        class="rounded-2xl border border-white/10 px-5 py-3 transition hover:border-[#FF4D00] lg:hidden"
      >
        Filters
      </button>

      <select
        v-model="shopStore.sortBy"
        class="rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none"
      >
        <option value="default">Default</option>

        <option value="low">Price: Low → High</option>

        <option value="high">Price: High → Low</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShopStore } from "../../stores/shop";

const shopStore = useShopStore();

const toggleFilters = () => {
  console.log("FILTER CLICKED");

  shopStore.mobileFiltersOpen = !shopStore.mobileFiltersOpen;

  console.log(shopStore.mobileFiltersOpen);
};
</script>

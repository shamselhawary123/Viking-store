<template>
  <div class="rounded-2xl border border-white/10 bg-[#0f0f0f]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur md:p-5">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0">
        <p class="text-sm font-bold text-neutral-400">
          <span class="text-white">{{ totalProducts }}</span> products curated for training and fight night
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="preset in quickSorts"
            :key="preset.value"
            class="rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition duration-200"
            :class="shopStore.sortBy === preset.value ? 'border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]' : 'border-white/10 text-neutral-400 hover:border-[#FF4D00]/70 hover:text-white'"
            @click="shopStore.sortBy = preset.value"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-[1fr_auto] xl:min-w-[34rem]">
        <div class="relative">
          <Icon name="i-heroicons-magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            id="shop-top-search"
            v-model="shopStore.search"
            type="search"
            placeholder="Search gloves, wraps, shorts..."
            class="premium-input h-12 pl-11 pr-11"
          />
          <button
            v-if="shopStore.search"
            class="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Clear search"
            @click="shopStore.search = ''"
          >
            <Icon name="i-heroicons-x-mark" />
          </button>
        </div>

        <div class="flex gap-3">
          <button
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#FF4D00] hover:text-[#FF4D00] active:scale-[0.98] lg:hidden"
            @click="toggleFilters"
          >
            <Icon name="i-heroicons-funnel" />
            Filters
          </button>

          <label class="sr-only" for="sort-products">Sort products</label>
          <select id="sort-products" v-model="shopStore.sortBy" class="premium-input h-12 min-w-44 rounded-xl">
            <option value="default">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShopStore } from "../../stores/shop";

const shopStore = useShopStore(usePinia());

defineProps<{
  totalProducts: number;
}>();

const quickSorts = [
  { value: "default", label: "Featured" },
  { value: "low", label: "Lowest" },
  { value: "high", label: "Highest" },
];

const toggleFilters = () => {
  shopStore.mobileFiltersOpen = !shopStore.mobileFiltersOpen;
};
</script>

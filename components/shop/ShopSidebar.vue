<script setup lang="ts">
import { categories } from "../../data/categories";
import { useShopStore } from "../../stores/shop";

const shopStore = useShopStore();
</script>

<template>
  <div class="space-y-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
    <!-- Search -->
    <div>
      <h3 class="mb-4 text-xl font-bold">Search</h3>

      <input
        v-model="shopStore.search"
        type="text"
        placeholder="Search products..."
        class="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-[#FF4D00]"
      />
    </div>

    <!-- Categories -->
    <div>
      <h3 class="mb-4 text-xl font-bold">Categories</h3>

      <div class="space-y-3">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="shopStore.selectedCategory = category.name"
          class="flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-4 text-left transition hover:border-[#FF4D00]"
        >
          <span>
            {{ category.name }}
          </span>

          <span class="text-xs text-gray-500"> → </span>
        </button>
      </div>
    </div>
    <div class="mt-8">
      <h3 class="mb-4 font-semibold">Max Price: ${{ shopStore.maxPrice }}</h3>

      <input
        v-model="shopStore.maxPrice"
        type="range"
        min="0"
        max="500"
        class="w-full accent-[#FF4D00]"
      />
    </div>
  </div>
</template>

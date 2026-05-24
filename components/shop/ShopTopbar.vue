<script setup lang="ts">
import { useShopStore } from "../../stores/shop";

const shopStore = useShopStore();
</script>

<template>
  <div
    class="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#111111] p-6 md:flex-row md:items-center md:justify-between"
  >
    <h2 class="text-2xl font-black">Combat Equipment</h2>
    <div class="flex items-center gap-3">
      <!-- Mobile Filter -->
      <button
        class="rounded-2xl border border-white/10 px-4 py-3 transition hover:border-[#FF4D00] lg:hidden"
      >
        Filters
      </button>
      <!-- Sort -->
      <select
        v-model="shopStore.sortBy"
        class="rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-3 outline-none"
      >
        <option value="default">Default</option>
        <option value="low">Price: Low To High</option>
        <option value="high">Price: High To Low</option>
      </select>
    </div>
  </div>
</template>

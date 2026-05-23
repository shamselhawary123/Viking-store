<script setup lang="ts">
import { computed, ref } from "vue";
import { products } from "../data/products";

const categories = ["all", "gloves", "shorts", "protection"];

const activeCategory = ref("all");

const searchQuery = ref("");

const filteredProducts = computed(() => {
  let filtered = products;

  // Category Filter
  if (activeCategory.value !== "all") {
    filtered = filtered.filter(
      (product) => product.category === activeCategory.value,
    );
  }

  // Search Filter
  if (searchQuery.value.trim()) {
    filtered = filtered.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  }

  return filtered;
});
</script>

<template>
  <section class="p-10">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-10">
        <p class="text-sm uppercase tracking-[0.3em] text-[#FF4D00]">
          Viking Store
        </p>

        <h1 class="mt-4 text-5xl font-black">Shop Products</h1>
      </div>

      <!-- Search -->
      <div class="mb-8">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 outline-none transition focus:border-[#FF4D00]"
        />
      </div>

      <!-- Categories -->
      <div class="mb-10 flex flex-wrap gap-4">
        <button
          v-for="category in categories"
          :key="category"
          @click="activeCategory = category"
          class="rounded-2xl border px-6 py-3 capitalize transition"
          :class="
            activeCategory === category
              ? 'border-[#FF4D00] bg-[#FF4D00] text-white'
              : 'border-white/10 hover:border-[#FF4D00]'
          "
        >
          {{ category }}
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredProducts.length === 0"
        class="rounded-3xl border border-white/10 p-10 text-center"
      >
        <h2 class="text-3xl font-black">No Products Found</h2>

        <p class="mt-4 text-gray-400">Try another search or category.</p>
      </div>

      <!-- Products -->
      <div v-else class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <SharedProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :title="product.title"
          :image="product.image"
          :price="product.price"
        />
      </div>
    </div>
  </section>
</template>

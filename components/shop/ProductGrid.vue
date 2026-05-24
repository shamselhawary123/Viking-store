<script setup lang="ts">
import { computed } from "vue";
import { products } from "../../data/products";
import { useShopStore } from "../../stores/shop";
const shopStore = useShopStore();

const filteredProducts = computed(() => {
  let result = [...products];

  // Category Filter
  if (shopStore.selectedCategory !== "All") {
    result = result.filter(
      (product) => product.category === shopStore.selectedCategory,
    );
  }

  // Search
  if (shopStore.search) {
    result = result.filter((product) =>
      product.title.toLowerCase().includes(shopStore.search.toLowerCase()),
    );
  }

  // Sorting
  if (shopStore.sortBy === "low") {
    result.sort((a, b) => a.price - b.price);
  }

  if (shopStore.sortBy === "high") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
});
</script>

<template>
  <div>
    <!-- Results -->
    <div class="mb-6 flex items-center justify-between">
      <p class="text-gray-400">
        Showing {{ filteredProducts.length }} products
      </p>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <ShopProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

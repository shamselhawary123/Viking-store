<template>
  <div>
    <div class="mb-6 flex flex-wrap gap-3">
      <button
        v-if="shopStore.selectedCategory !== 'all'"
        @click="
          () => {
            shopStore.selectedCategory = 'all';
            navigateTo('/shop');
          }
        "
        class="rounded-full bg-[#FF4D00]/20 px-4 py-2 text-sm"
      >
        {{ shopStore.selectedCategory }} ✕
      </button>

      <button
        v-if="shopStore.search"
        @click="shopStore.search = ''"
        class="rounded-full bg-[#FF4D00]/20 px-4 py-2 text-sm"
      >
        {{ shopStore.search }} ✕
      </button>
    </div>
    <div class="mb-6 flex items-center justify-between">
      <p class="text-gray-400">
        Showing {{ filteredProducts.length }} products
      </p>
    </div>
    <div
      v-if="productsStore.loading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="h-[420px] animate-pulse rounded-3xl bg-[#111111]"
      />
    </div>

    <div
      v-if="filteredProducts.length"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      <ShopProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :image="product.cover_image"
        :product="product"
      />
    </div>

    <div v-else class="py-24 text-center">
      <h2 class="text-3xl font-black">No Products Found</h2>

      <p class="mt-4 text-gray-400">Try another category or search term.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useShopStore } from "../../stores/shop";
import { useProductsStore } from "../../stores/products";

const productsStore = useProductsStore();
const props = defineProps<{
  products: any[];
}>();

const shopStore = useShopStore();

const filteredProducts = computed(() => {
  let result = [...props.products];

  // Category
  if (shopStore.selectedCategory !== "all") {
    result = result.filter(
      (product) => product.categories?.slug === shopStore.selectedCategory,
    );
  }

  // Search
  if (shopStore.search) {
    result = result.filter((product) =>
      product.title.toLowerCase().includes(shopStore.search.toLowerCase()),
    );
  }

  // Price
  result = result.filter((product) => product.price <= shopStore.maxPrice);

  // Sort
  if (shopStore.sortBy === "low") {
    result.sort((a, b) => a.price - b.price);
  }

  if (shopStore.sortBy === "high") {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
});
</script>

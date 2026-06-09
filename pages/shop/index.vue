<template>
  <section class="px-4 py-10 md:px-6">
    <div class="mx-auto grid max-w-7xl grid-cols-12 gap-8">
      <!-- Sidebar -->
      <aside class="lg:col-span-3">
        <ShopSidebar />
      </aside>

      <!-- Content -->
      <div class="col-span-12 lg:col-span-9">
        <ShopTopbar />

        <div class="mt-8">
          <ShopProductGrid :products="filteredProducts" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProductsStore } from "../../stores/products";
import { useShopStore } from "../../stores/shop";

const route = useRoute();
const productsStore = useProductsStore();
const shopStore = useShopStore();

onMounted(async () => {
  await productsStore.getProducts();
});

const category = computed(() => route.query.category);

const filteredProducts = computed(() => {
  if (!category.value || category.value === "all") {
    return productsStore.products;
  }

  return productsStore.products.filter(
    (product) => product.categories?.slug === category.value,
  );
});

watch(
  () => route.query.category,
  (newCategory) => {
    shopStore.selectedCategory = (newCategory as string) || "all";
  },
  { immediate: true },
);

console.log(productsStore.products);
console.log(route.query.category);
</script>

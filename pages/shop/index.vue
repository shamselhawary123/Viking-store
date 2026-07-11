<template>
  <section class="section-premium">
    <div class="container-premium grid grid-cols-12 gap-8">
      <aside class="lg:col-span-3">
        <ShopSidebar />
      </aside>

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
const productsStore = useProductsStore(usePinia());
const shopStore = useShopStore(usePinia());

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
</script>

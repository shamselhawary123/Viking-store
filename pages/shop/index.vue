<template>
  <section class="px-4 py-10 md:px-6">
    <div class="mx-auto grid max-w-7xl grid-cols-12 gap-8">
      <!-- Sidebar -->
      <aside class="hidden lg:col-span-3 lg:block">
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
import { computed } from "vue";
import { useRoute } from "vue-router";

import { products } from "../../data/products";

const route = useRoute();

const category = computed(() => route.query.category);

const filteredProducts = computed(() => {
  if (!category.value || category.value === "all") {
    return products;
  }

  return products.filter((product) =>
    product.category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .includes(category.value as string),
  );
});
</script>

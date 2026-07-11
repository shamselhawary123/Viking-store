<template>
  <div class="container-premium section-premium">
    <div class="mb-10">
      <p class="eyebrow">Shop by discipline</p>
      <h1 class="display-heading mt-3 text-6xl text-white md:text-7xl">Categories</h1>
      <p class="mt-4 max-w-2xl text-neutral-400">
        Find the right gear for striking, sparring, conditioning, and daily fight camp work.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <ShopCategoryCard
        v-for="category in categoriesStore.categories.filter((item) => item.slug !== 'all')"
        :key="category.id"
        :name="category.name"
        :image="category.image"
        :slug="category.slug"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useCategoriesStore } from "../../stores/categories";

const categoriesStore = useCategoriesStore(usePinia());

onMounted(async () => {
  await categoriesStore.getCategories();
});
</script>

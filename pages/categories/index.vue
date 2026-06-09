<template>
  <div class="mx-auto max-w-7xl px-6 py-10">
    <h1 class="mb-10 text-4xl font-black">Categories</h1>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <ShopCategoryCard
        v-for="category in categoriesStore.categories"
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

const categoriesStore = useCategoriesStore();

onMounted(async () => {
  await categoriesStore.getCategories();
});
</script>

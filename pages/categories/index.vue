<template>
  <div class="mx-auto max-w-7xl px-6 py-10">
    <h1 class="mb-10 text-4xl font-black">Categories</h1>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <ShopCategoryCard
        v-for="category in typedCategories"
        :key="category.id"
        :name="category.name"
        :image="category.image"
        :slug="category.slug"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { categories } from "../../data/categories";

type Category = {
  id: number | string;
  name: string;
  image: string;
  slug: string;
};

// If categories is string[], map it to Category[]
const typedCategories: Category[] = categories.map((cat, idx) => ({
  id: idx,
  name: cat,
  image: "", // Provide a default or fetch image if available
  slug: typeof cat === "string" ? cat.toLowerCase().replace(/\s+/g, "-") : "",
}));
</script>

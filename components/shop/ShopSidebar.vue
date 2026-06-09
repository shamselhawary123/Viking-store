<template>
  <div
    class="space-y-8 rounded-3xl border border-white/10 bg-[#111111] p-6"
    :class="[
      shopStore.mobileFiltersOpen
        ? 'fixed inset-0 z-50 overflow-y-auto bg-[#111111]'
        : 'hidden lg:block',
    ]"
  >
    <div class="flex items-center justify-between lg:hidden">
      <h2 class="text-2xl font-black">Filters</h2>

      <button @click="shopStore.mobileFiltersOpen = false" class="text-2xl">
        ✕
      </button>
    </div>
    <!-- Search -->
    <div>
      <h3 class="mb-4 text-xl font-bold">Search</h3>

      <input
        v-model="shopStore.search"
        type="text"
        placeholder="Search products..."
        class="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-[#FF4D00]"
      />
    </div>

    <!-- Categories -->
    <div>
      <button
        @click="categoriesOpen = !categoriesOpen"
        class="flex w-full items-center justify-between"
      >
        <h3 class="text-xl font-bold">Categories</h3>

        <Icon
          name="heroicons:chevron-down"
          class="text-[#FF4D00] transition duration-300"
          :class="{ 'rotate-180': categoriesOpen }"
        />
      </button>

      <div v-show="categoriesOpen" class="mt-4 space-y-3">
        <button
          v-for="category in categoriesStore.categories"
          :key="category.id"
          @click="$router.push(`/shop?category=${category.slug}`)"
          class="flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition"
          :class="
            shopStore.selectedCategory === category.slug
              ? 'border-[#FF4D00] bg-[#FF4D00]/10'
              : 'border-white/10 hover:border-[#FF4D00]'
          "
        >
          <span>
            {{ category.name }}
          </span>

          <Icon name="heroicons:chevron-right" class="text-gray-500" />
        </button>
      </div>
    </div>
    <div class="mt-8">
      <h3 class="mb-4 font-semibold">Max Price: ${{ shopStore.maxPrice }}</h3>

      <input
        v-model="shopStore.maxPrice"
        type="range"
        min="0"
        max="500"
        class="w-full accent-[#FF4D00]"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useShopStore } from "../../stores/shop";
import { ref, onMounted } from "vue";
import { useCategoriesStore } from "../../stores/categories";

const categoriesStore = useCategoriesStore();
const categoriesOpen = ref(true);

onMounted(async () => {
  await categoriesStore.getCategories();
});

const shopStore = useShopStore();
</script>

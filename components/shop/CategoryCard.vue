<script setup lang="ts">
defineProps<{
  name: string;
  image: string;
  slug: string;
}>();
</script>

<template>
  <NuxtLink
    :to="`/shop?category=${slug}`"
    class="group relative overflow-hidden rounded-3xl"
  >
    <img
      :src="image"
      :alt="name"
      class="h-[320px] w-full object-cover transition duration-500 group-hover:scale-110"
    />

    <div
      class="absolute inset-0 bg-black/40 transition group-hover:bg-black/20"
    />

    <div class="absolute bottom-6 left-6">
      <h2 class="text-2xl font-bold text-white">
        {{ name }}
      </h2>
    </div>
  </NuxtLink>
</template>

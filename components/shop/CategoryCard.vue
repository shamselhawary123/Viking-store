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
    class="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/70"
  >
    <div class="aspect-[4/5] overflow-hidden">
      <img
        :src="image"
        :alt="name"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
    <div class="absolute bottom-0 left-0 right-0 p-6">
      <p class="eyebrow text-[0.65rem]">Category</p>
      <div class="mt-2 flex items-end justify-between gap-3">
        <h2 class="font-display text-4xl leading-none text-white">{{ name }}</h2>
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF4D00] text-white transition group-hover:translate-x-1">
          <Icon name="i-heroicons-arrow-right" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

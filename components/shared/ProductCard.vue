<template>
  <div
    class="group overflow-hidden rounded-3xl border border-white/10 bg-[#111111]"
  >
    <!-- Image -->
    <div class="overflow-hidden">
      <img
        :src="image"
        :alt="title"
        class="h-[320px] w-full object-cover transition duration-500 group-hover:scale-105"
      />
    </div>

    <!-- Content -->
    <div class="p-5">
      <div class="mb-2 flex items-center justify-between">
        <h3 class="text-xl font-bold">
          {{ title }}
        </h3>

        <span class="text-[#FF4D00] font-bold"> ${{ price }} </span>
      </div>

      <p class="text-sm text-gray-400">Premium fighting equipment.</p>

      <div class="mt-5">
        <UiVButton> Add To Cart </UiVButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  image: string;
  price: number;
}>();
</script>

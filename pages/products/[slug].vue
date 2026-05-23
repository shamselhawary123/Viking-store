<script setup lang="ts">
import { useRoute } from "vue-router";
import { products } from "../../data/products";

const route = useRoute();

const product = products.find((item) => item.slug === route.params.slug);
</script>

<template>
  <section class="p-10">
    <div v-if="product" class="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
      <img :src="product.image" :alt="product.title" class="rounded-3xl" />

      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-[#FF4D00]">
          {{ product.category }}
        </p>

        <h1 class="mt-4 text-5xl font-black">
          {{ product.title }}
        </h1>

        <p class="mt-6 text-3xl font-bold">${{ product.price }}</p>

        <button
          class="mt-10 rounded-2xl bg-[#FF4D00] px-8 py-4 font-bold text-white"
        >
          Add To Cart
        </button>
      </div>
    </div>
  </section>
</template>

<template>
  <div v-if="product" class="mx-auto max-w-7xl px-6 py-16">
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <!-- Image -->
      <div class="overflow-hidden rounded-3xl border border-white/10">
        <img
          :src="product.image"
          :alt="product.title"
          class="h-full w-full object-cover"
        />
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <p class="uppercase tracking-widest text-[#FF4D00]">
          {{ product.category }}
        </p>

        <h1 class="text-5xl font-black">
          {{ product.title }}
        </h1>

        <div class="flex items-center gap-4">
          <span class="text-4xl font-black"> ${{ product.price }} </span>

          <span
            v-if="product.oldPrice"
            class="text-xl text-gray-500 line-through"
          >
            ${{ product.oldPrice }}
          </span>
        </div>

        <p class="max-w-xl text-lg leading-relaxed text-gray-400">
          Premium combat sports equipment designed for athletes who train hard
          and fight harder.
        </p>

        <div class="flex gap-4">
          <button
            class="rounded-2xl bg-[#FF4D00] px-8 py-4 font-bold transition hover:opacity-90"
          >
            Add To Cart
          </button>

          <button
            class="rounded-2xl border border-white/10 px-8 py-4 font-bold transition hover:border-[#FF4D00]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="py-40 text-center text-3xl font-bold">
    Product Not Found
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { products } from "../../data/products";

const route = useRoute();

const product = products.find((item) => item.slug === route.params.slug);
</script>

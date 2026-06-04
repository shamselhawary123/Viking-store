<template>
  <NuxtLink
    :to="`/shop/${product.slug}`"
    class="group block overflow-hidden rounded-3xl border border-white/10 bg-[#111111] transition hover:-translate-y-1 hover:border-[#FF4D00]"
  >
    <!-- Image -->
    <div class="relative overflow-hidden">
      <img
        :src="product.image"
        :alt="product.title"
        class="h-[320px] w-full object-cover transition duration-500 group-hover:scale-110"
      />

      <!-- Badge -->
      <div
        v-if="product.badge"
        class="absolute left-4 top-4 rounded-full bg-[#FF4D00] px-3 py-1 text-xs font-bold"
      >
        {{ product.badge }}
      </div>

      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100"
      />
    </div>

    <!-- Content -->
    <div class="space-y-3 p-5">
      <p class="text-sm uppercase tracking-widest text-[#FF4D00]">
        {{ product.category }}
      </p>

      <h3 class="text-xl font-bold text-white">
        {{ product.title }}
      </h3>

      <div class="flex items-center gap-3">
        <span class="text-2xl font-black text-white">
          ${{ product.price }}
        </span>

        <span
          v-if="product.oldPrice"
          class="text-sm text-gray-500 line-through"
        >
          ${{ product.oldPrice }}
        </span>
      </div>

      <!-- Button -->
      <button
        @click.prevent="
          cartStore.addToCart(
            props.product.id,
            props.product.title,
            props.product.selectedColor || '',
            1,
            props.product.selectedImage || '',
          )
        "
        class="w-full rounded-2xl border border-white/10 py-3 font-semibold transition hover:border-[#FF4D00] hover:bg-[#FF4D00]"
      >
        Add To Cart
      </button>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useCartStore } from "../../stores/cart";
const cartStore = useCartStore();

const props = defineProps<{
  product: {
    id: number;
    title: string;
    slug: string;
    price: number;
    oldPrice?: number;
    category: string;
    image: string;
    badge?: string;
    selectedColor?: string;
    selectedImage?: string;
  };
}>();
</script>

<template>
  <section class="container-premium section-premium">
    <div class="mb-10">
      <p class="eyebrow">Saved gear</p>
      <h1 class="display-heading mt-3 text-6xl text-white md:text-7xl">Wishlist</h1>
      <p class="mt-4 max-w-2xl text-neutral-400">
        Keep your favorite gloves, shorts, guards, and training essentials ready for your next order.
      </p>
    </div>

    <div v-if="wishlist.items.length === 0" class="premium-panel rounded-2xl p-10 text-center md:p-16">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-[#FF4D00]">
        <Icon name="i-heroicons-heart" class="text-4xl" />
      </div>
      <h2 class="mt-6 text-3xl font-black">No Favorites Yet</h2>
      <p class="mx-auto mt-3 max-w-md text-neutral-400">Tap the heart on any product to build your shortlist.</p>
      <NuxtLink to="/shop" class="premium-button premium-button-primary mt-8">Explore Products</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ShopProductCard v-for="product in wishlist.items" :key="product.id" :product="product" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useWishlistStore } from "../stores/wishlist";

definePageMeta({
  middleware: ["auth"],
});

const wishlist = useWishlistStore(usePinia());

onMounted(() => {
  wishlist.loadWishlist();
});
</script>

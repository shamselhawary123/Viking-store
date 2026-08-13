<template>
  <section class="container-premium section-premium">
    <div class="mb-10">
      <p class="eyebrow">{{ t('pages.savedGear') }}</p>
      <h1 class="display-heading mt-3 text-6xl text-white md:text-7xl">{{ t('pages.wishlist') }}</h1>
      <p class="mt-4 max-w-2xl text-neutral-400">
        {{ t('pages.wishlistLead') }}
      </p>
    </div>

    <div v-if="wishlist.items.length === 0" class="premium-panel rounded-2xl p-10 text-center md:p-16">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-[#FF4D00]">
        <Icon name="i-heroicons-heart" class="text-4xl" />
      </div>
      <h2 class="mt-6 text-3xl font-black">{{ t('pages.noFavoritesYet') }}</h2>
      <p class="mx-auto mt-3 max-w-md text-neutral-400">{{ t('pages.wishlistEmptyText') }}</p>
      <NuxtLink to="/shop" class="premium-button premium-button-primary mt-8">{{ t('pages.exploreProducts') }}</NuxtLink>
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
const { t } = useI18n();

onMounted(() => {
  wishlist.loadWishlist();
});
</script>

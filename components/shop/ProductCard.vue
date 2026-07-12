<template>
  <NuxtLink
    :to="`/shop/${product.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/70 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
  >
    <div class="relative aspect-[4/5] overflow-hidden bg-black">
      <img
        :src="product.cover_image || product.image"
        :alt="product.title"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

      <button
        class="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-[#FF4D00] backdrop-blur transition hover:scale-105 hover:border-[#FF4D00] active:scale-95"
        :aria-label="wishlistStore.isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
        @click.prevent="wishlistStore.toggleWishlist(product)"
      >
        <Icon :name="wishlistStore.isFavorite(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="text-xl" />
      </button>

      <div
        v-if="product.badge"
        class="absolute left-4 top-4 rounded-full bg-[#FF4D00] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white"
      >
        {{ product.badge }}
      </div>

      <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
        <span class="min-w-0 truncate rounded-full border border-white/10 bg-black/65 px-3 py-1 text-xs font-bold text-neutral-200 backdrop-blur">
          {{ product.categories?.name || product.category || "Combat Gear" }}
        </span>
        <span class="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
          In Stock
        </span>
      </div>
    </div>

    <div class="flex flex-1 flex-col space-y-4 p-5">
      <div>
        <p class="eyebrow text-[0.65rem]">{{ product.categories?.slug || product.category || "Viking" }}</p>
        <h3 class="mt-2 line-clamp-2 min-h-14 text-xl font-black leading-tight text-white">
          {{ product.title }}
        </h3>
      </div>

      <div class="flex items-end justify-between gap-3">
        <div class="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span class="text-2xl font-black text-white">${{ product.price }}</span>
          <span v-if="product.old_price || product.oldPrice" class="text-sm text-neutral-500 line-through">
            ${{ product.old_price || product.oldPrice }}
          </span>
        </div>
        <div class="flex text-[#FF4D00]" aria-label="Rated 5 out of 5">
          <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" class="text-sm" />
        </div>
      </div>

      <button
        class="premium-button premium-button-secondary mt-auto min-h-0 w-full rounded-xl py-3 active:scale-[0.98]"
        @click.prevent="navigateToDetails"
      >
        View Details
        <Icon name="i-heroicons-arrow-right" />
      </button>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useWishlistStore } from "../../stores/wishlist";
import { onMounted } from "vue";

const wishlistStore = useWishlistStore(usePinia());
const router = useRouter();

const props = defineProps<{
  product: any;
}>();

onMounted(() => {
  wishlistStore.loadWishlist();
});

const navigateToDetails = () => {
  router.push(`/shop/${props.product.slug}`);
};
</script>

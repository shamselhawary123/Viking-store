<template>
  <NuxtLink
    :to="`/shop/${product.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#171717] transition duration-300 hover:-translate-y-1 hover:border-[#CF1D1D]/70 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
    :class="isNavigatingToProduct ? 'scale-[0.985] border-[#CF1D1D]/80 opacity-85 shadow-[0_0_0_1px_rgba(207,29,29,0.28)]' : ''"
    @click="handleCardClick"
  >
    <div class="relative aspect-[4/5] overflow-hidden bg-black">
      <img
        :src="product.cover_image || product.image"
        :alt="product.title"
        width="640"
        height="800"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

      <button
        class="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-[#CF1D1D] backdrop-blur transition hover:scale-105 hover:border-[#CF1D1D] active:scale-95"
        :aria-label="wishlistStore.isFavorite(product.id) ? t('shop.removeWishlist') : t('shop.addWishlist')"
        @click.prevent.stop="toggleWishlist"
      >
        <Icon :name="wishlistStore.isFavorite(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="text-xl" />
      </button>

      <div
        v-if="product.badge"
        class="absolute left-4 top-4 rounded-full bg-[#CF1D1D] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white"
      >
        {{ product.badge }}
      </div>

      <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
        <span class="min-w-0 truncate rounded-full border border-white/10 bg-black/65 px-3 py-1 text-xs font-bold text-neutral-200 backdrop-blur">
          {{ getLocalizedCategoryName(product.categories, locale) || product.category || t('shop.combatGear') }}
        </span>
        <span class="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
          {{ t('shop.inStock') }}
        </span>
      </div>
    </div>

    <div class="flex flex-1 flex-col space-y-4 p-5">
      <div>
        <p class="eyebrow text-[0.65rem]">{{ getLocalizedCategoryName(product.categories, locale) || product.category || t('shop.viking') }}</p>
        <h3 class="mt-2 line-clamp-2 min-h-14 text-xl font-black leading-tight text-white">
          {{ product.title }}
        </h3>
      </div>

      <div class="flex items-end justify-between gap-3">
        <div class="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span class="text-2xl font-black text-white">{{ formatStorePrice(product.price, locale) }}</span>
          <span v-if="product.old_price || product.oldPrice" class="text-sm text-neutral-500 line-through">
            {{ formatStorePrice(product.old_price || product.oldPrice, locale) }}
          </span>
        </div>
        <div class="flex text-[#CF1D1D]" :aria-label="t('shop.ratedFive')">
          <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" class="text-sm" />
        </div>
      </div>

      <button
        class="premium-button premium-button-secondary mt-auto min-h-0 w-full rounded-xl py-3 active:scale-[0.98]"
        @click.prevent.stop="navigateToDetails"
      >
        {{ t('shop.viewDetails') }}
        <Icon :name="isRtl ? 'i-heroicons-arrow-left' : 'i-heroicons-arrow-right'" />
      </button>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useWishlistStore } from "../../stores/wishlist";
import { computed, onBeforeUnmount, ref } from "vue";
import { formatStorePrice, getLocalizedCategoryName } from "../../utils/localizationFormat";

const wishlistStore = useWishlistStore(usePinia());
const router = useRouter();
const { locale, t } = useI18n();
const isRtl = computed(() => locale.value === "ar");
const isNavigatingToProduct = ref(false);
let navigationFeedbackTimer: ReturnType<typeof window.setTimeout> | undefined;

const props = defineProps<{
  product: any;
}>();

const clearNavigationFeedbackTimer = () => {
  if (!navigationFeedbackTimer) return;
  window.clearTimeout(navigationFeedbackTimer);
  navigationFeedbackTimer = undefined;
};

const markProductNavigation = () => {
  isNavigatingToProduct.value = true;
  clearNavigationFeedbackTimer();
  navigationFeedbackTimer = window.setTimeout(() => {
    isNavigatingToProduct.value = false;
  }, 1200);
};

const handleCardClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest("button")) return;
  markProductNavigation();
};

const toggleWishlist = () => {
  wishlistStore.toggleWishlist(props.product);
};

const navigateToDetails = async () => {
  markProductNavigation();
  await router.push(`/shop/${props.product.slug}`);
};

onBeforeUnmount(clearNavigationFeedbackTimer);
</script>

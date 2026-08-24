<template>
  <section class="section-premium relative overflow-hidden bg-[#080808]">
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(207,29,29,0.13),transparent_26rem)]"
    />
    <div class="container-premium">
      <div
        v-reveal
        class="relative mb-14 flex flex-col gap-5 text-center md:flex-row md:items-end md:justify-between md:text-start"
      >
        <div>
          <p class="eyebrow">{{ t("home.featured") }}</p>

          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
            {{ t("home.fighterFavorites") }}
          </h2>
          <p class="mt-5 max-w-2xl leading-8 text-neutral-400">
            {{ t("home.featuredText") }}
          </p>
        </div>
        <NuxtLink
          to="/shop"
          class="premium-button premium-button-primary hidden md:inline-flex min-h-14 px-6"
        >
          {{ t("home.viewAllProducts") }}
          <Icon name="i-heroicons-arrow-right" />
        </NuxtLink>
      </div>

      <div
        v-if="pending && !featuredProducts.length"
        class="relative hidden gap-6 sm:grid sm:grid-cols-2 xl:grid-cols-3"
        aria-live="polite"
      >
        <article
          v-for="index in 3"
          :key="index"
          class="min-h-[30rem] overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-[0_22px_70px_rgba(0,0,0,0.32)]"
        >
          <div class="aspect-[4/5] animate-pulse bg-white/[0.04]" />
          <div class="space-y-4 p-5">
            <div class="h-3 w-24 animate-pulse rounded-full bg-[#CF1D1D]/25" />
            <div class="h-6 w-3/4 animate-pulse rounded-full bg-white/10" />
            <div class="h-10 w-36 animate-pulse rounded-full bg-white/10" />
          </div>
        </article>
      </div>

      <div
        v-else-if="featuredProducts.length"
        class="relative hidden gap-6 sm:grid sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="(product, index) in featuredProducts"
          :key="product.id"
          v-reveal="{ delay: index * 90 }"
          class="group overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-[0_22px_70px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-2 hover:border-[#CF1D1D]/70 hover:shadow-[0_34px_90px_rgba(207,29,29,0.1)]"
        >
          <NuxtLink :to="`/shop/${product.slug}`" class="block">
            <div class="relative aspect-[4/5] overflow-hidden bg-black">
              <img
                :src="product.cover_image || product.image"
                :alt="product.title"
                width="640"
                height="800"
                class="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20"
              />
              <div
                v-if="product.isRealBestSeller || product.badge"
                class="absolute left-4 top-4 rounded-full bg-[#CF1D1D] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(207,29,29,0.28)]"
              >
                {{ product.badge || t("home.bestSeller") }}
              </div>
              <button
                class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-[#CF1D1D] backdrop-blur transition duration-300 hover:scale-105 hover:border-[#CF1D1D]"
                :aria-label="
                  wishlistStore.isFavorite(product.id)
                    ? t('shop.removeWishlist')
                    : t('shop.addWishlist')
                "
                @click.prevent="wishlistStore.toggleWishlist(product)"
              >
                <Icon
                  :name="
                    wishlistStore.isFavorite(product.id)
                      ? 'i-heroicons-heart-solid'
                      : 'i-heroicons-heart'
                  "
                  class="text-xl"
                />
              </button>
              <div
                class="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3"
              >
                <span
                  class="rounded-full border border-white/10 bg-black/65 px-3 py-1 text-xs font-bold text-neutral-200 backdrop-blur"
                >
                  {{
                    getLocalizedCategoryName(product.categories, locale) ||
                    product.category ||
                    t("footer.combatStore")
                  }}
                </span>
                <span
                  class="flex items-center gap-1 text-[#CF1D1D]"
                  :aria-label="t('shop.ratedFive')"
                >
                  <Icon
                    v-for="star in 5"
                    :key="star"
                    name="i-heroicons-star-solid"
                    class="text-xs"
                  />
                </span>
              </div>
            </div>
          </NuxtLink>

          <div class="p-5">
            <p class="eyebrow text-[0.65rem]">
              {{
                getLocalizedCategoryName(product.categories, locale) ||
                product.category ||
                t("shop.viking")
              }}
            </p>
            <h3
              class="mt-2 line-clamp-2 min-h-14 text-xl font-black leading-tight text-white"
            >
              {{ product.title }}
            </h3>

            <div class="mt-5 flex items-end justify-between gap-3">
              <div>
                <p
                  class="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500"
                >
                  {{ t("shop.from") }}
                </p>
                <div class="mt-1 flex items-center gap-3">
                  <span class="text-2xl font-black text-white">{{
                    formatStorePrice(product.price, locale)
                  }}</span>
                  <span
                    v-if="product.old_price || product.oldPrice"
                    class="text-sm text-neutral-500 line-through"
                  >
                    {{
                      formatStorePrice(
                        product.old_price || product.oldPrice,
                        locale,
                      )
                    }}
                  </span>
                </div>
              </div>
              <NuxtLink
                :to="`/shop/${product.slug}`"
                class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#CF1D1D] hover:bg-[#CF1D1D] hover:text-white"
                :aria-label="t('shop.viewDetails')"
              >
                <Icon name="i-heroicons-arrow-right" />
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <div
        v-if="featuredProducts.length"
        v-reveal
        class="flex items-center gap-2 sm:hidden"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
      >
        <div
          class="shrink-0"
        >
          <button
            type="button"
            class="mobile-carousel-arrow"
            :aria-label="locale === 'ar' ? 'الشريحة السابقة' : 'Previous slide'"
            @click="carousel.movePrevious"
          >
            <Icon
              :name="locale === 'ar' ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
              class="text-lg"
            />
          </button>
        </div>

        <div
          :ref="carousel.setViewportRef"
          class="min-w-0 flex-1 overflow-hidden"
          @touchstart.passive="carousel.handleTouchStart"
          @touchmove.passive="carousel.handleTouchMove"
          @touchend.passive="carousel.handleTouchEnd"
          @touchcancel.passive="carousel.handleTouchCancel"
        >
          <div
            class="mobile-carousel-track flex touch-pan-y will-change-transform"
            :class="{ 'is-dragging': carousel.isDragging, 'is-snapping': carousel.isSnapping }"
            :style="carousel.trackStyle"
          >
            <article
              v-for="(itemIndex, index) in carousel.loopedIndexes"
              :key="`${index}-${featuredProducts[itemIndex].id}`"
              class="mobile-carousel-slide group shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-[0_22px_70px_rgba(0,0,0,0.32)] transition duration-300 hover:border-[#CF1D1D]/70 hover:shadow-[0_34px_90px_rgba(207,29,29,0.1)]"
            >
              <NuxtLink :to="`/shop/${featuredProducts[itemIndex].slug}`" class="block">
                <div class="relative aspect-[4/5] overflow-hidden bg-black">
                  <img
                    :src="featuredProducts[itemIndex].cover_image || featuredProducts[itemIndex].image"
                    :alt="featuredProducts[itemIndex].title"
                    width="640"
                    height="800"
                    class="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20"
                  />
                  <div
                    v-if="featuredProducts[itemIndex].isRealBestSeller || featuredProducts[itemIndex].badge"
                    class="absolute left-4 top-4 rounded-full bg-[#CF1D1D] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_30px_rgba(207,29,29,0.28)]"
                  >
                    {{ featuredProducts[itemIndex].badge || t("home.bestSeller") }}
                  </div>
                  <button
                    class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/70 text-[#CF1D1D] backdrop-blur transition duration-300 hover:scale-105 hover:border-[#CF1D1D]"
                    :aria-label="
                      wishlistStore.isFavorite(featuredProducts[itemIndex].id)
                        ? t('shop.removeWishlist')
                        : t('shop.addWishlist')
                    "
                    @click.prevent="wishlistStore.toggleWishlist(featuredProducts[itemIndex])"
                  >
                    <Icon
                      :name="
                        wishlistStore.isFavorite(featuredProducts[itemIndex].id)
                          ? 'i-heroicons-heart-solid'
                          : 'i-heroicons-heart'
                      "
                      class="text-xl"
                    />
                  </button>
                  <div
                    class="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3"
                  >
                    <span
                      class="rounded-full border border-white/10 bg-black/65 px-3 py-1 text-xs font-bold text-neutral-200 backdrop-blur"
                    >
                      {{
                        getLocalizedCategoryName(featuredProducts[itemIndex].categories, locale) ||
                        featuredProducts[itemIndex].category ||
                        t("footer.combatStore")
                      }}
                    </span>
                    <span
                      class="flex items-center gap-1 text-[#CF1D1D]"
                      :aria-label="t('shop.ratedFive')"
                    >
                      <Icon
                        v-for="star in 5"
                        :key="star"
                        name="i-heroicons-star-solid"
                        class="text-xs"
                      />
                    </span>
                  </div>
                </div>
              </NuxtLink>

              <div class="p-5">
                <p class="eyebrow text-[0.65rem]">
                  {{
                    getLocalizedCategoryName(featuredProducts[itemIndex].categories, locale) ||
                    featuredProducts[itemIndex].category ||
                    t("shop.viking")
                  }}
                </p>
                <h3
                  class="mt-2 line-clamp-2 min-h-14 text-xl font-black leading-tight text-white"
                >
                  {{ featuredProducts[itemIndex].title }}
                </h3>

                <div class="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p
                      class="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500"
                    >
                      {{ t("shop.from") }}
                    </p>
                    <div class="mt-1 flex items-center gap-3">
                      <span class="text-2xl font-black text-white">{{
                        formatStorePrice(featuredProducts[itemIndex].price, locale)
                      }}</span>
                      <span
                        v-if="featuredProducts[itemIndex].old_price || featuredProducts[itemIndex].oldPrice"
                        class="text-sm text-neutral-500 line-through"
                      >
                        {{
                          formatStorePrice(
                            featuredProducts[itemIndex].old_price || featuredProducts[itemIndex].oldPrice,
                            locale,
                          )
                        }}
                      </span>
                    </div>
                  </div>
                  <NuxtLink
                    :to="`/shop/${featuredProducts[itemIndex].slug}`"
                    class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#CF1D1D] hover:bg-[#CF1D1D] hover:text-white"
                    :aria-label="t('shop.viewDetails')"
                  >
                    <Icon name="i-heroicons-arrow-right" />
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div
          class="shrink-0"
        >
          <button
            type="button"
            class="mobile-carousel-arrow"
            :aria-label="locale === 'ar' ? 'الشريحة التالية' : 'Next slide'"
            @click="carousel.moveNext"
          >
            <Icon
              :name="locale === 'ar' ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'"
              class="text-lg"
            />
          </button>
        </div>
      </div>

      <div class="mt-12 text-center md:hidden">
        <NuxtLink to="/shop" class="premium-button premium-button-secondary">
          {{ t("home.viewAllProducts") }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useMobileCarousel } from "../../composables/useMobileCarousel";
import { useWishlistStore } from "../../stores/wishlist";
import {
  selectHomepageBestSellerProducts,
  type BestSellerProduct,
  type HomeBestSellerResult,
} from "../../utils/homeBestSellers";
import {
  formatStorePrice,
  getLocalizedCategoryName,
} from "../../utils/localizationFormat";
import { getPublicSupabaseClient } from "../../utils/publicSupabase";
import { SHOP_PRODUCTS_SELECT } from "../../utils/shopProducts";

const wishlistStore = useWishlistStore(usePinia());
const { locale, t } = useI18n();
const config = useRuntimeConfig();
const supabase = getPublicSupabaseClient(
  config.public.supabaseUrl as string,
  config.public.supabaseKey as string,
);

onMounted(async () => {
  wishlistStore.loadWishlist();
});

const { data: bestSellingProducts, pending } = await useLazyAsyncData(
  "home-best-selling-products",
  async () => {
    const { data: bestSellerResults, error: bestSellersError } =
      await supabase.rpc("get_home_best_sellers");

    if (bestSellersError) console.error(bestSellersError);

    const usableBestSellerResults = bestSellersError
      ? []
      : ((bestSellerResults || []) as HomeBestSellerResult[]);
    const productIds = Array.from(
      new Set(
        usableBestSellerResults
          .map((item) => item.product_id)
          .filter(Boolean)
          .map(String),
      ),
    );
    let bestSellerProducts: BestSellerProduct[] = [];

    if (productIds.length) {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(SHOP_PRODUCTS_SELECT)
        .in("id", productIds);

      if (productsError) {
        console.error(productsError);
      } else {
        bestSellerProducts = (products || []) as BestSellerProduct[];
      }
    }

    const { data: fallbackProducts, error: fallbackProductsError } =
      await supabase
        .from("products")
        .select(SHOP_PRODUCTS_SELECT)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

    if (fallbackProductsError) console.error(fallbackProductsError);

    return selectHomepageBestSellerProducts({
      bestSellerResults: usableBestSellerResults,
      bestSellerProducts,
      fallbackProducts: fallbackProductsError
        ? []
        : ((fallbackProducts || []) as BestSellerProduct[]),
    });
  },
);

const featuredProducts = computed(() => bestSellingProducts.value || []);
const isRtl = computed(() => locale.value === "ar");
const carousel = useMobileCarousel(computed(() => featuredProducts.value.length), {
  isRtl,
});
</script>

<style scoped>
.mobile-carousel-track {
  transition:
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-carousel-track.is-dragging,
.mobile-carousel-track.is-snapping {
  transition: none;
}

.mobile-carousel-slide {
  flex-basis: var(--mobile-carousel-slide-width);
  margin-inline-end: var(--mobile-carousel-gap);
  transition:
    opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-carousel-arrow {
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.12);
  background: rgb(12 12 12 / 0.82);
  color: #cf1d1d;
  box-shadow: 0 14px 34px rgb(0 0 0 / 0.32);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.mobile-carousel-arrow:hover {
  border-color: rgb(207 29 29 / 0.72);
  background: rgb(207 29 29 / 0.14);
  box-shadow: 0 16px 38px rgb(207 29 29 / 0.12);
}

.mobile-carousel-arrow:active {
  transform: scale(0.94);
}

.mobile-carousel-arrow:focus-visible {
  outline: 2px solid #cf1d1d;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .mobile-carousel-track,
  .mobile-carousel-slide,
  .mobile-carousel-arrow {
    transition-duration: 1ms;
  }
}
</style>

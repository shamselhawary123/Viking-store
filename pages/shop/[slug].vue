<template>
  <section v-if="product" class="container-premium section-premium pb-28 sm:pb-16">
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr] xl:gap-14">
      <div class="space-y-4 reveal-up">
        <div
          class="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_32px_90px_rgba(0,0,0,0.38)]"
          @click="openLightbox"
          @mousemove="handleZoomMove"
          @mouseleave="resetZoom"
          @touchstart.passive="handleTouchStart"
          @touchend.passive="handleTouchEnd"
        >
          <img
            :key="selectedImage"
            :src="selectedImage"
            :alt="productImageAlt"
            width="960"
            height="1120"
            class="h-[390px] w-full object-cover transition duration-500 group-hover:scale-110 md:h-[560px] lg:h-[700px]"
            :style="{ transformOrigin: zoomOrigin }"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 opacity-80" />
          <button
            class="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur transition duration-200 hover:scale-105 hover:border-[#FF4D00] hover:text-[#FF4D00]"
            :aria-label="t('shop.enlargeImage')"
            @click.stop="openLightbox"
          >
            <Icon name="i-heroicons-magnifying-glass-plus" class="text-xl" />
          </button>
          <div v-if="product.badge" class="absolute left-5 top-5 rounded-full bg-[#FF4D00] px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
            {{ product.badge }}
          </div>
        </div>

        <div v-if="galleryImages.length" class="grid grid-cols-4 gap-3 sm:grid-cols-5">
          <button
            v-for="(image, index) in galleryImages"
            :key="image"
            class="relative overflow-hidden rounded-xl border bg-[#111111] transition duration-300 hover:-translate-y-0.5"
            :class="selectedImage === image ? 'border-[#FF4D00] shadow-[0_0_0_3px_rgba(255,77,0,0.16)]' : 'border-white/10 hover:border-[#FF4D00]/70'"
            :aria-label="t('shop.viewProductImage', { title: product.title })"
            @click="selectImage(index)"
          >
            <img :src="image" :alt="productImageAlt" width="180" height="96" class="h-24 w-full object-cover transition duration-500 hover:scale-105" loading="lazy" decoding="async" />
          </button>
        </div>
      </div>

      <div class="lg:sticky lg:top-28 lg:self-start">
        <div class="space-y-7 reveal-up">
          <nav class="flex flex-wrap items-center gap-2 text-sm text-neutral-500" :aria-label="t('nav.home')">
            <NuxtLink to="/" class="premium-link">{{ t('nav.home') }}</NuxtLink>
            <Icon name="i-heroicons-chevron-right" class="text-xs" />
            <NuxtLink to="/shop" class="premium-link">{{ t('nav.shop') }}</NuxtLink>
            <Icon name="i-heroicons-chevron-right" class="text-xs" />
            <NuxtLink v-if="productCategoryUrl" :to="productCategoryUrl" class="premium-link">{{ productCategoryName }}</NuxtLink>
            <Icon v-if="productCategoryUrl" name="i-heroicons-chevron-right" class="text-xs" />
            <span class="text-white">{{ product.title }}</span>
          </nav>

          <div>
            <p class="eyebrow">{{ productCategoryName }}</p>
            <h1 class="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">{{ product.title }}</h1>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-sm">
            <div class="flex text-[#FF4D00]" :aria-label="t('shop.averageRatingAria', { rating: reviewSummary.displayAverage })">
              <Icon v-for="star in starNumbers" :key="star" :name="star <= filledReviewStars ? 'i-heroicons-star-solid' : 'i-heroicons-star'" />
            </div>
            <span class="font-bold text-white">{{ reviewSummary.displayAverage }}</span>
            <span class="text-neutral-400">{{ t('shop.reviews', { count: reviewSummary.total }) }}</span>
          </div>

          <div class="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div class="flex flex-wrap items-center gap-4">
              <span class="text-4xl font-black text-white">{{ formatStorePrice(product.price, locale) }}</span>
              <span v-if="oldPrice" class="text-2xl text-neutral-500 line-through">{{ formatStorePrice(oldPrice, locale) }}</span>
              <span v-if="discountPercent" class="rounded-full bg-[#FF4D00] px-3 py-1 text-sm font-black text-white">
                -{{ discountPercent }}%
              </span>
              <span class="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-300">
                {{ isAvailable ? t('shop.inStock') : t('shop.outOfStock') }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div class="rounded-xl border border-white/10 bg-black/30 p-3">
                <p class="text-neutral-500">{{ t('common.category') }}</p>
                <p class="mt-1 font-bold text-white">{{ getLocalizedCategoryName(product.categories, locale) || product.category || t('shop.combatGear') }}</p>
              </div>
              <div v-if="product.sku" class="rounded-xl border border-white/10 bg-black/30 p-3">
                <p class="text-neutral-500">SKU</p>
                <p class="mt-1 font-bold text-white">{{ product.sku }}</p>
              </div>
              <div v-if="brandName" class="rounded-xl border border-white/10 bg-black/30 p-3">
                <p class="text-neutral-500">{{ t('shop.brand') }}</p>
                <p class="mt-1 font-bold text-white">{{ brandName }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-black/30 p-3">
                <p class="text-neutral-500">{{ t('shop.availability') }}</p>
                <p class="mt-1 font-bold text-white">{{ isAvailable ? t('shop.readyToShip') : t('shop.unavailable') }}</p>
              </div>
            </div>
          </div>

          <p class="max-w-2xl text-lg leading-8 text-neutral-400">{{ product.description }}</p>

          <div v-if="product.product_colors?.length" class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-black">{{ t('shop.color') }}</h3>
              <span class="text-neutral-400">{{ selectedColor?.name }}</span>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                v-for="color in product.product_colors"
                :key="color.id"
                class="flex h-12 w-12 items-center justify-center rounded-full border-2 transition duration-300 hover:-translate-y-0.5 hover:scale-105"
                :class="selectedColor?.id === color.id ? 'border-[#FF4D00] bg-white/10 shadow-[0_0_0_4px_rgba(255,77,0,0.14)]' : 'border-white/15 hover:border-[#FF4D00]/70'"
                :aria-label="t('shop.selectColor', { color: color.name })"
                @click="changeColor(color)"
              >
                <span class="h-8 w-8 rounded-full border border-white/20" :style="{ backgroundColor: colorValue(color) }" />
              </button>
            </div>
          </div>

          <div v-if="product.product_sizes?.length" class="space-y-4">
            <h3 class="text-lg font-black">{{ t('shop.size') }}</h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="size in product.product_sizes"
                :key="size.id"
                :disabled="!size.in_stock"
                class="min-h-12 min-w-[74px] rounded-xl border px-5 py-3 font-black transition duration-200 disabled:cursor-not-allowed"
                :class="
                  selectedSize === size.size
                    ? 'border-[#FF4D00] bg-[#FF4D00] text-white shadow-[0_14px_34px_rgba(255,77,0,0.22)]'
                    : size.in_stock
                      ? 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-[#FF4D00]'
                      : 'border-white/5 bg-white/[0.02] text-neutral-600 line-through'
                "
                @click="selectedSize = size.size"
              >
                {{ size.size }}
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-black">{{ t('shop.quantity') }}</h3>
            <div class="flex w-fit items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
              <button class="flex h-12 w-12 items-center justify-center text-xl transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40" :disabled="quantity === 1" :aria-label="t('cart.decreaseQuantity')" @click="decreaseQty">
                <Icon name="i-heroicons-minus" />
              </button>
              <span class="flex h-12 min-w-16 items-center justify-center border-x border-white/10 font-black">{{ quantity }}</span>
              <button class="flex h-12 w-12 items-center justify-center text-xl transition hover:bg-white/10 active:scale-95" :aria-label="t('cart.increaseQuantity')" @click="quantity++">
                <Icon name="i-heroicons-plus" />
              </button>
            </div>
          </div>

          <div class="hidden grid-cols-[1fr_1fr_auto] gap-3 sm:grid">
            <button class="premium-button premium-button-primary flex-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45" :disabled="!canPurchase || addLoading" @click="handleAddToCart">
              <Icon :name="addLoading ? 'i-heroicons-arrow-path' : 'i-heroicons-shopping-bag'" :class="{ 'animate-spin': addLoading }" />
              {{ addLoading ? t('shop.adding') : t('shop.addToCart') }}
            </button>
            <button class="premium-button premium-button-secondary flex-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45" :disabled="!canPurchase || buyLoading" @click="handleBuyNow">
              <Icon v-if="buyLoading" name="i-heroicons-arrow-path" class="animate-spin" />
              {{ buyLoading ? t('shop.loading') : t('shop.buyNow') }}
            </button>
            <button
              class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#FF4D00] hover:text-[#FF4D00] active:scale-95"
              :aria-label="wishlistStore.isFavorite(product.id) ? t('shop.removeWishlist') : t('shop.addWishlist')"
              @click="wishlistStore.toggleWishlist(product)"
            >
              <Icon :name="wishlistStore.isFavorite(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 border-t border-white/10 pt-7">
            <div v-for="feature in trustFeatures" :key="feature.titleKey" class="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#FF4D00]/55">
              <Icon :name="feature.icon" class="text-2xl text-[#FF4D00]" />
              <h3 class="mt-3 font-black">{{ t(feature.titleKey) }}</h3>
              <p class="mt-1 text-sm leading-6 text-neutral-400">{{ t(feature.labelKey) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:mt-20 md:p-7">
      <div class="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <p class="eyebrow">{{ t('shop.customerReviews') }}</p>
          <div class="mt-4 flex items-end gap-3">
            <span class="text-5xl font-black text-white">{{ reviewSummary.displayAverage }}</span>
            <span class="pb-2 text-neutral-400">{{ t('shop.outOfFive') }}</span>
          </div>
          <div class="mt-3 flex text-xl text-[#FF4D00]">
            <Icon v-for="star in starNumbers" :key="star" :name="star <= filledReviewStars ? 'i-heroicons-star-solid' : 'i-heroicons-star'" />
          </div>
          <p class="mt-2 text-sm text-neutral-400">{{ t('shop.reviews', { count: reviewSummary.total }) }}</p>

          <div class="mt-6 space-y-3">
            <div v-for="rating in REVIEW_RATINGS" :key="rating" class="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 text-sm">
              <span class="font-bold text-white">{{ rating }} {{ t('shop.starShort') }}</span>
              <div class="h-2 overflow-hidden rounded-full bg-white/10">
                <div class="h-full rounded-full bg-[#FF4D00]" :style="{ width: ratingDistributionPercent(rating) }" />
              </div>
              <span class="text-right text-neutral-500">{{ reviewSummary.distribution[rating] }}</span>
            </div>
          </div>

          <div class="mt-8 rounded-xl border border-white/10 bg-black/25 p-4">
            <template v-if="currentUser">
              <div v-if="currentUserReview && !editingReview" class="space-y-4">
                <div>
                  <p class="text-sm font-bold text-neutral-400">{{ t('shop.yourReview') }}</p>
                  <div class="mt-2 flex text-[#FF4D00]">
                    <Icon v-for="star in starNumbers" :key="star" :name="star <= currentUserReview.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'" />
                  </div>
                  <p class="mt-3 leading-7 text-neutral-300">{{ currentUserReview.comment }}</p>
                </div>
                <div class="flex flex-wrap gap-3">
                  <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-[#FF4D00]" @click="startEditReview">
                    {{ t('shop.editReview') }}
                  </button>
                  <button type="button" class="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500 hover:text-white" :disabled="deletingReview" @click="deleteReview">
                    {{ deletingReview ? t('shop.deletingReview') : t('shop.deleteReview') }}
                  </button>
                </div>
              </div>

              <form v-else class="space-y-4" @submit.prevent="submitReview">
                <h3 class="text-xl font-black text-white">{{ editingReview ? t('shop.editReview') : t('shop.writeReview') }}</h3>
                <div>
                  <label class="text-sm font-bold text-neutral-400">{{ t('shop.yourRating') }}</label>
                  <div class="mt-2 flex gap-1 text-2xl text-[#FF4D00]">
                    <button v-for="star in starNumbers" :key="star" type="button" class="transition hover:scale-110" :aria-label="t('shop.selectRating', { rating: star })" @click="reviewRating = star">
                      <Icon :name="star <= reviewRating ? 'i-heroicons-star-solid' : 'i-heroicons-star'" />
                    </button>
                  </div>
                </div>
                <div>
                  <label class="text-sm font-bold text-neutral-400" for="review-comment">{{ t('shop.yourComment') }}</label>
                  <textarea
                    id="review-comment"
                    v-model="reviewComment"
                    rows="4"
                    class="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#FF4D00]"
                    :placeholder="t('shop.reviewPlaceholder')"
                  />
                </div>
                <p v-if="reviewError" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{{ reviewError }}</p>
                <p v-if="reviewSuccess" class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{{ reviewSuccess }}</p>
                <div class="flex flex-wrap gap-3">
                  <button type="submit" class="premium-button premium-button-primary min-h-12" :disabled="submittingReview">
                    <Icon v-if="submittingReview" name="i-heroicons-arrow-path" class="animate-spin" />
                    {{ submittingReview ? t('shop.submittingReview') : t('shop.submitReview') }}
                  </button>
                  <button v-if="editingReview" type="button" class="premium-button premium-button-secondary min-h-12" @click="cancelEditReview">
                    {{ t('common.cancel') }}
                  </button>
                </div>
              </form>
            </template>
            <template v-else>
              <h3 class="text-xl font-black text-white">{{ t('shop.signInToReviewTitle') }}</h3>
              <p class="mt-2 leading-7 text-neutral-400">{{ t('shop.signInToReviewText') }}</p>
              <NuxtLink to="/auth/login" class="premium-button premium-button-secondary mt-5">{{ t('nav.login') }}</NuxtLink>
            </template>
          </div>
        </div>

        <div>
          <div class="mb-5 flex items-center justify-between gap-4">
            <h3 class="text-2xl font-black text-white">{{ t('shop.reviewsTitle') }}</h3>
            <span v-if="reviewsLoading" class="text-sm text-neutral-500">{{ t('common.loading') }}</span>
          </div>
          <p v-if="reviewsError" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{{ reviewsError }}</p>
          <div v-else-if="displayReviews.length" class="space-y-4">
            <article v-for="review in displayReviews" :key="review.id" class="rounded-xl border border-white/10 bg-black/25 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="font-black text-white">{{ review.reviewerName }}</p>
                  <div class="mt-1 flex text-sm text-[#FF4D00]">
                    <Icon v-for="star in starNumbers" :key="star" :name="star <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'" />
                  </div>
                </div>
                <time class="text-sm text-neutral-500" :datetime="review.created_at">{{ formatReviewDate(review.created_at) }}</time>
              </div>
              <p class="mt-4 leading-7 text-neutral-300">{{ review.comment }}</p>
            </article>
          </div>
          <p v-else class="rounded-xl border border-white/10 bg-black/25 p-6 text-neutral-400">{{ t('shop.noReviews') }}</p>
        </div>
      </div>
    </section>

    <div class="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:mt-20">
      <div class="grid grid-cols-2 gap-2 md:flex">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="min-h-12 rounded-xl px-4 py-3 text-sm font-black transition duration-200"
          :class="activeTab === tab.key ? 'bg-[#FF4D00] text-white' : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white'"
          @click="activeTab = tab.key"
        >
          {{ t(tab.labelKey) }}
        </button>
      </div>
      <div class="p-4 text-neutral-300 md:p-7">
        <div v-if="activeTab === 'description'" class="max-w-4xl text-lg leading-8">
          {{ product.description }}
        </div>
        <div v-else-if="activeTab === 'specifications'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="spec in specifications" :key="spec.label" class="rounded-xl border border-white/10 bg-black/25 p-4">
            <p class="text-sm text-neutral-500">{{ spec.label }}</p>
            <p class="mt-2 font-black text-white">{{ spec.value }}</p>
          </div>
        </div>
        <div v-else-if="activeTab === 'shipping'" class="max-w-3xl leading-8">
          {{ t('shop.shippingText') }}
        </div>
        <div v-else class="max-w-3xl leading-8">
          {{ t('shop.returnsText') }}
        </div>
      </div>
    </div>
  </section>

  <section v-if="relatedProducts.length" class="container-premium pb-24">
    <div class="mb-10 flex items-end justify-between gap-5">
      <div>
        <p class="eyebrow">{{ t('shop.moreGear') }}</p>
        <h2 class="display-heading mt-3 text-5xl text-white md:text-6xl">{{ t('shop.relatedProducts') }}</h2>
      </div>
      <NuxtLink to="/shop" class="premium-button premium-button-secondary hidden sm:inline-flex">{{ t('shop.viewAll') }}</NuxtLink>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <ShopProductCard v-for="item in relatedProducts" :key="item.id" :product="item" />
    </div>
  </section>

  <section v-if="recentlyViewed.length" class="container-premium pb-24">
    <div class="mb-8">
      <p class="eyebrow">{{ t('shop.yourPicks') }}</p>
      <h2 class="display-heading mt-3 text-5xl text-white md:text-6xl">{{ t('shop.recentlyViewed') }}</h2>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <ShopProductCard v-for="item in recentlyViewed" :key="item.id" :product="item" />
    </div>
  </section>

  <div v-else-if="!loading && !product" class="container-premium flex min-h-[60vh] items-center justify-center py-20 text-center">
    <div class="premium-panel rounded-2xl p-10">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black text-[#FF4D00]">
        <Icon name="i-heroicons-exclamation-triangle" class="text-3xl" />
      </div>
      <h2 class="mt-6 text-4xl font-black">{{ t('shop.productNotFound') }}</h2>
      <p class="mt-4 text-neutral-400">{{ t('shop.productNotFoundText') }}</p>
      <NuxtLink to="/shop" class="premium-button premium-button-primary mt-8">{{ t('shop.backToShop') }}</NuxtLink>
    </div>
  </div>

  <div v-if="product" class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 p-3 backdrop-blur sm:hidden">
    <div class="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
      <div class="pr-1">
        <p class="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-neutral-500">{{ t('common.price') }}</p>
        <p class="text-lg font-black text-white">{{ formatStorePrice(product.price, locale) }}</p>
      </div>
      <button class="premium-button premium-button-secondary min-h-12 rounded-xl px-3 text-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45" :disabled="!canPurchase || buyLoading" @click="handleBuyNow">{{ t('shop.buyNow') }}</button>
      <button class="premium-button premium-button-primary min-h-12 rounded-xl px-3 text-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45" :disabled="!canPurchase || addLoading" @click="handleAddToCart">{{ t('shop.addToCart') }}</button>
    </div>
  </div>

  <div v-if="isLightboxOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" @click="isLightboxOpen = false">
    <button class="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-[#FF4D00] hover:text-[#FF4D00]" :aria-label="t('common.close')" @click="isLightboxOpen = false">
      <Icon name="i-heroicons-x-mark" class="text-2xl" />
    </button>
    <img :src="selectedImage" :alt="productImageAlt" width="960" height="1120" class="max-h-[88vh] max-w-full rounded-2xl object-contain" decoding="async" @click.stop />
  </div>
</template>

<script setup lang="ts">
import { createClient } from "@supabase/supabase-js";
import { computed, ref, onBeforeUnmount, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCartStore } from "../../stores/cart";
import { useProductsStore } from "../../stores/products";
import { useWishlistStore } from "../../stores/wishlist";
import { formatStorePrice, getLocalizedCategoryName } from "../../utils/localizationFormat";
import { createPublicSupabaseReadOptions } from "../../utils/publicSupabase";
import { SHOP_PRODUCTS_SELECT } from "../../utils/shopProducts";
import {
  buildBreadcrumbStructuredData,
  buildCanonicalUrl,
  buildProductImageAlt,
  buildProductSeoMeta,
  buildProductStructuredData,
  buildShopCategoryCanonicalUrl,
  buildShopCategoryUrl,
  normalizeSiteUrl,
} from "../../utils/seo";
import {
  REVIEW_RATINGS,
  getProductReviewSummary,
  normalizeReviewInput,
  reviewerDisplayName,
} from "../../utils/productReviews";

type ProductReviewRow = {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string | null;
};

type ReviewProfile = {
  id: string;
  full_name?: string | null;
};

const cartStore = useCartStore(usePinia());
const productsStore = useProductsStore(usePinia());
const wishlistStore = useWishlistStore(usePinia());
const supabase = useSupabase();
const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const config = useRuntimeConfig();
const slug = String(route.params.slug || "");
const siteUrl = normalizeSiteUrl(String(config.public.siteUrl || ""));

const product = ref<any>(null);
const reviews = ref<ProductReviewRow[]>([]);
const reviewProfiles = ref<Record<string, ReviewProfile>>({});
const reviewsLoading = ref(false);
const reviewsError = ref("");
const currentUser = ref<any>(null);
const reviewRating = ref(5);
const reviewComment = ref("");
const reviewError = ref("");
const reviewSuccess = ref("");
const submittingReview = ref(false);
const deletingReview = ref(false);
const editingReview = ref(false);
const relatedProducts = ref<any[]>([]);
const recentlyViewed = ref<any[]>([]);
const selectedColor = ref<any>(null);
const selectedImage = ref("");
const selectedSize = ref("");
const quantity = ref(1);
const loading = ref(true);
const activeTab = ref("description");
const isLightboxOpen = ref(false);
const zoomOrigin = ref("center center");
const touchStartX = ref(0);
const didSwipe = ref(false);
let zoomFrame = 0;
let pendingZoomOrigin = "center center";
const addLoading = ref(false);
const buyLoading = ref(false);
const starNumbers = [1, 2, 3, 4, 5];
const seoSupabase = createClient(
  config.public.supabaseUrl as string,
  config.public.supabaseKey as string,
  createPublicSupabaseReadOptions("viking-store-shop-product-seo-readonly"),
);

const { data: initialProduct } = await useAsyncData(`shop-product-seo-${slug}`, async () => {
  const { data, error } = await seoSupabase
    .from("products")
    .select(SHOP_PRODUCTS_SELECT)
    .eq("slug", slug)
    .single();

  if (error) return null;

  return data;
});

const { data: initialReviews } = await useAsyncData(`shop-product-reviews-seo-${slug}`, async () => {
  if (!initialProduct.value?.id) return [];

  const { data, error } = await seoSupabase
    .from("product_reviews")
    .select("id, product_id, user_id, rating, comment, created_at, updated_at")
    .eq("product_id", initialProduct.value.id)
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data || []) as ProductReviewRow[];
});

product.value = initialProduct.value || null;
reviews.value = initialReviews.value || [];

if (!initialProduct.value) {
  setResponseStatus(404);
  loading.value = false;
}

const trustFeatures = [
  { icon: "i-heroicons-lock-closed", titleKey: "shop.securePayment", labelKey: "shop.protectedCheckout" },
  { icon: "i-heroicons-truck", titleKey: "shop.fastShipping", labelKey: "shop.quickDelivery" },
  { icon: "i-heroicons-arrow-path-rounded-square", titleKey: "shop.easyReturns", labelKey: "shop.returnSupport" },
  { icon: "i-heroicons-shield-check", titleKey: "shop.premiumQuality", labelKey: "shop.builtForTraining" },
];

const tabs = [
  { key: "description", labelKey: "shop.description" },
  { key: "specifications", labelKey: "shop.specifications" },
  { key: "shipping", labelKey: "common.shipping" },
  { key: "returns", labelKey: "cart.returns" },
];

const galleryImages = computed(() => {
  const images = selectedColor.value?.product_images?.map((image: any) => image.image_url).filter(Boolean) || [];
  return images.length ? images : [product.value?.cover_image || product.value?.image].filter(Boolean);
});

const oldPrice = computed(() => product.value?.old_price || product.value?.oldPrice || null);
const brandName = computed(() => product.value?.brand?.name || product.value?.brands?.name || product.value?.brand_name || product.value?.brand || "");
const isAvailable = computed(() => !product.value?.product_sizes?.length || product.value.product_sizes.some((size: any) => size.in_stock));
const canPurchase = computed(() => Boolean(product.value && selectedSize.value && isAvailable.value));
const discountPercent = computed(() => {
  if (!oldPrice.value || !product.value?.price) return 0;

  return Math.max(0, Math.round(((oldPrice.value - product.value.price) / oldPrice.value) * 100));
});
const reviewSummary = computed(() => getProductReviewSummary(reviews.value));
const filledReviewStars = computed(() => Math.round(reviewSummary.value.average));
const productCategoryName = computed(() =>
  getLocalizedCategoryName(product.value?.categories, locale.value) || product.value?.category || t("shop.combatGear"),
);
const productCategorySlug = computed(() => product.value?.categories?.slug || "");
const productCategoryUrl = computed(() => (productCategorySlug.value ? buildShopCategoryUrl(productCategorySlug.value) : ""));
const currentUserReview = computed(() =>
  currentUser.value
    ? reviews.value.find((review) => review.user_id === currentUser.value.id) || null
    : null,
);
const displayReviews = computed(() =>
  reviews.value.map((review) => ({
    ...review,
    reviewerName: reviewerDisplayName(reviewProfiles.value[review.user_id], t("shop.vikingMember")),
  })),
);
const specifications = computed(() =>
  [
    {
      label: t("common.category"),
      value: getLocalizedCategoryName(product.value?.categories, locale.value) || product.value?.category || t("shop.combatGear"),
    },
    { label: t("shop.color"), value: selectedColor.value?.name || t("shop.default") },
    { label: t("shop.size"), value: selectedSize.value || t("shop.selectSize") },
    { label: t("shop.availability"), value: isAvailable.value ? t("shop.inStock") : t("shop.outOfStock") },
    product.value?.sku ? { label: t("shop.sku"), value: product.value.sku } : null,
    brandName.value ? { label: t("shop.brand"), value: brandName.value } : null,
  ].filter(Boolean),
);
const canonicalUrl = computed(() => buildCanonicalUrl(siteUrl, `/shop/${slug}`));
const productSeoMeta = computed(() => (product.value ? buildProductSeoMeta(product.value, locale.value) : null));
const productMetaTitle = computed(() => productSeoMeta.value?.title || t("seo.shopTitle"));
const productMetaDescription = computed(() => productSeoMeta.value?.description || t("seo.shopDescription"));
const productImageAlt = computed(() => (product.value ? buildProductImageAlt(product.value, locale.value) : t("shop.combatGear")));
const productStructuredData = computed(() =>
  product.value
    ? buildProductStructuredData(product.value, canonicalUrl.value, reviewSummary.value)
    : null,
);
const breadcrumbStructuredData = computed(() =>
  product.value
    ? buildBreadcrumbStructuredData(
      [
        { name: t("nav.home"), url: buildCanonicalUrl(siteUrl, "/") },
        { name: t("nav.shop"), url: buildCanonicalUrl(siteUrl, "/shop") },
        productCategorySlug.value
          ? { name: productCategoryName.value, url: buildShopCategoryCanonicalUrl(siteUrl, productCategorySlug.value) }
          : null,
        { name: product.value.title, url: canonicalUrl.value },
      ].filter(Boolean) as Array<{ name: string; url: string }>,
    )
    : null,
);

useSeoMeta({
  title: () => productMetaTitle.value,
  description: () => productMetaDescription.value,
  ogTitle: () => productMetaTitle.value,
  ogDescription: () => productMetaDescription.value,
  ogImage: () => product.value?.cover_image || product.value?.image || undefined,
  ogUrl: () => canonicalUrl.value,
  twitterCard: "summary_large_image",
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: [productStructuredData.value, breadcrumbStructuredData.value]
    .filter(Boolean)
    .map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
}));

onMounted(async () => {
  try {
    wishlistStore.loadWishlist();
    loadRecentlyViewed();
    await loadCurrentUser();
    product.value ||= await productsStore.getProductBySlug(slug);

    if (!product.value) return;

    if (product.value.product_colors?.length) {
      selectedColor.value = product.value.product_colors[0];
      selectedImage.value = selectedColor.value.product_images?.[0]?.image_url || product.value.cover_image || product.value.image;
    } else {
      selectedImage.value = product.value.cover_image || product.value.image;
    }

    if (product.value.product_sizes?.length) {
      selectedSize.value = product.value.product_sizes.find((size: any) => size.in_stock)?.size || "";
    }

    if (product.value.categories) {
      relatedProducts.value = await productsStore.getRelatedProducts(product.value.category_id, product.value.id);
    }

    if (reviews.value.length) {
      await loadReviewProfiles(reviews.value.map((review) => review.user_id));
    } else {
      await loadReviews();
    }
    saveRecentlyViewed();
  } finally {
    loading.value = false;
  }
});

const loadCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  currentUser.value = user || null;
};

const loadReviews = async () => {
  if (!product.value?.id) return;

  reviewsLoading.value = true;
  reviewsError.value = "";

  try {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("id, product_id, user_id, rating, comment, created_at, updated_at")
      .eq("product_id", product.value.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    reviews.value = (data || []) as ProductReviewRow[];
    await loadReviewProfiles(reviews.value.map((review) => review.user_id));
  } catch (error: any) {
    reviewsError.value = error?.message || t("shop.reviewsLoadFailed");
  } finally {
    reviewsLoading.value = false;
  }
};

const loadReviewProfiles = async (userIds: string[]) => {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  const profilesById: Record<string, ReviewProfile> = {};

  if (currentUser.value?.id && currentUser.value.user_metadata?.full_name) {
    profilesById[currentUser.value.id] = {
      id: currentUser.value.id,
      full_name: currentUser.value.user_metadata.full_name,
    };
  }

  if (!ids.length) {
    reviewProfiles.value = profilesById;
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ids);

  if (!error) {
    (data || []).forEach((profile: ReviewProfile) => {
      profilesById[profile.id] = profile;
    });
  }

  reviewProfiles.value = profilesById;
};

const ratingDistributionPercent = (rating: number) => {
  if (!reviewSummary.value.total) return "0%";

  return `${Math.round((reviewSummary.value.distribution[rating] / reviewSummary.value.total) * 100)}%`;
};

const resetReviewForm = () => {
  reviewRating.value = 5;
  reviewComment.value = "";
  reviewError.value = "";
  reviewSuccess.value = "";
  editingReview.value = false;
};

const startEditReview = () => {
  if (!currentUserReview.value) return;

  reviewRating.value = currentUserReview.value.rating;
  reviewComment.value = currentUserReview.value.comment;
  reviewError.value = "";
  reviewSuccess.value = "";
  editingReview.value = true;
};

const cancelEditReview = () => {
  resetReviewForm();
};

const submitReview = async () => {
  if (!currentUser.value || !product.value?.id) return;

  const normalized = normalizeReviewInput(reviewRating.value, reviewComment.value);
  reviewError.value = "";
  reviewSuccess.value = "";

  if (!normalized.ok) {
    reviewError.value = normalized.error === "rating"
      ? t("shop.reviewRatingRequired")
      : t("shop.reviewCommentRequired");
    return;
  }

  submittingReview.value = true;

  try {
    const payload = {
      product_id: product.value.id,
      user_id: currentUser.value.id,
      rating: normalized.rating,
      comment: normalized.comment,
    };
    const { error } = currentUserReview.value
      ? await supabase
        .from("product_reviews")
        .update({
          rating: payload.rating,
          comment: payload.comment,
        })
        .eq("id", currentUserReview.value.id)
        .eq("user_id", currentUser.value.id)
      : await supabase
        .from("product_reviews")
        .insert(payload);

    if (error) throw error;

    resetReviewForm();
    reviewSuccess.value = t("shop.reviewSaved");
    await loadReviews();
  } catch (error: any) {
    reviewError.value = error?.code === "23505"
      ? t("shop.reviewDuplicate")
      : error?.message || t("shop.reviewSaveFailed");
  } finally {
    submittingReview.value = false;
  }
};

const deleteReview = async () => {
  if (!currentUser.value || !currentUserReview.value) return;
  if (!window.confirm(t("shop.deleteReviewConfirm"))) return;

  deletingReview.value = true;
  reviewError.value = "";
  reviewSuccess.value = "";

  try {
    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", currentUserReview.value.id)
      .eq("user_id", currentUser.value.id);

    if (error) throw error;

    resetReviewForm();
    reviewSuccess.value = t("shop.reviewDeleted");
    await loadReviews();
  } catch (error: any) {
    reviewError.value = error?.message || t("shop.reviewDeleteFailed");
  } finally {
    deletingReview.value = false;
  }
};

const formatReviewDate = (value: string) =>
  new Intl.DateTimeFormat(locale.value === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const changeColor = (color: any) => {
  selectedColor.value = color;
  selectedImage.value = color.product_images?.[0]?.image_url || product.value.cover_image || product.value.image;
};

const selectImage = (index: number) => {
  selectedImage.value = galleryImages.value[index] || selectedImage.value;
};

const openLightbox = () => {
  if (didSwipe.value) return;

  isLightboxOpen.value = true;
};

const handleZoomMove = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  pendingZoomOrigin = `${x}% ${y}%`;

  if (zoomFrame) return;

  zoomFrame = window.requestAnimationFrame(() => {
    zoomOrigin.value = pendingZoomOrigin;
    zoomFrame = 0;
  });
};

const resetZoom = () => {
  if (zoomFrame) {
    window.cancelAnimationFrame(zoomFrame);
    zoomFrame = 0;
  }

  zoomOrigin.value = "center center";
};

onBeforeUnmount(() => {
  if (zoomFrame) {
    window.cancelAnimationFrame(zoomFrame);
  }
});

const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.changedTouches[0]?.clientX || 0;
};

const handleTouchEnd = (event: TouchEvent) => {
  const endX = event.changedTouches[0]?.clientX || 0;
  const delta = touchStartX.value - endX;

  if (Math.abs(delta) < 45 || galleryImages.value.length < 2) return;

  didSwipe.value = true;
  const currentIndex = galleryImages.value.indexOf(selectedImage.value);
  const nextIndex = delta > 0 ? currentIndex + 1 : currentIndex - 1;
  selectImage((nextIndex + galleryImages.value.length) % galleryImages.value.length);
  window.setTimeout(() => {
    didSwipe.value = false;
  }, 120);
};

const colorValue = (color: any) => color.value || color.hex || color.color || color.name || "#111111";

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = () => {
  if (!product.value || !selectedSize.value) return;

  addLoading.value = true;
  cartStore.addToCart(product.value, selectedColor.value, selectedSize.value, quantity.value, selectedImage.value);
  cartStore.openCart();
  window.setTimeout(() => {
    addLoading.value = false;
  }, 350);
};

const handleBuyNow = () => {
  if (!product.value || !selectedSize.value) return;

  buyLoading.value = true;
  cartStore.addToCart(product.value, selectedColor.value, selectedSize.value, quantity.value, selectedImage.value);
  router.push("/checkout");
};

const loadRecentlyViewed = () => {
  if (typeof window === "undefined") return;

  const saved = localStorage.getItem("recentlyViewedProducts");
  recentlyViewed.value = saved ? JSON.parse(saved) : [];
};

const saveRecentlyViewed = () => {
  if (typeof window === "undefined" || !product.value) return;

  const compactProduct = {
    id: product.value.id,
    title: product.value.title,
    slug: product.value.slug,
    price: product.value.price,
    old_price: product.value.old_price,
    oldPrice: product.value.oldPrice,
    cover_image: product.value.cover_image || product.value.image,
    image: product.value.cover_image || product.value.image,
    badge: product.value.badge,
    categories: product.value.categories,
    category: product.value.category,
  };
  const nextItems = [compactProduct, ...recentlyViewed.value.filter((item) => item.id !== product.value.id)].slice(0, 5);

  localStorage.setItem("recentlyViewedProducts", JSON.stringify(nextItems));
  recentlyViewed.value = nextItems.filter((item) => item.id !== product.value.id).slice(0, 4);
};
</script>

<template>
  <div>
    <div v-if="activeFilters.length" class="mb-6 flex flex-wrap gap-3">
      <button
        v-for="filter in activeFilters"
        :key="filter.key"
        class="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#CF1D1D]/30 bg-[#CF1D1D]/10 px-4 py-2 text-sm font-bold text-[#CF1D1D] transition duration-200 hover:-translate-y-0.5 hover:border-[#CF1D1D]"
        @click="filter.clear"
      >
        {{ filter.label }}
        <Icon name="i-heroicons-x-mark" />
      </button>
    </div>

    <div class="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm font-semibold text-neutral-400">
        {{ t('shop.showingProducts', { visible: visibleProducts.length, total: filteredProducts.length }) }}
      </p>
      <p class="text-sm text-neutral-500">{{ t('shop.curated') }}</p>
    </div>

    <div v-if="productsStore.loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <SharedVikingSkeleton v-for="i in 9" :key="i" variant="product-card" />
    </div>

    <div v-else-if="filteredProducts.length">
      <TransitionGroup name="shop-grid" tag="div" class="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <ShopProductCard v-for="product in visibleProducts" :key="product.id" :product="product" />
      </TransitionGroup>

      <div v-if="hasMoreProducts" class="mt-10 flex justify-center">
        <button class="premium-button premium-button-secondary rounded-xl px-8" @click="visibleCount += pageSize">
          {{ t('common.loadMore') }}
          <Icon name="i-heroicons-arrow-down" />
        </button>
      </div>
    </div>

    <div v-else class="premium-panel rounded-2xl px-6 py-20 text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black text-[#CF1D1D]">
        <Icon name="i-heroicons-magnifying-glass" class="text-3xl" />
      </div>
      <h2 class="mt-6 text-3xl font-black text-white">{{ t('shop.noProducts') }}</h2>
      <p class="mx-auto mt-3 max-w-md text-neutral-400">
        {{ t('shop.tryDifferent') }}
      </p>
      <button class="premium-button premium-button-primary mt-8" @click="resetFilters">
        {{ t('shop.resetFilters') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useShopStore } from "../../stores/shop";
import { useProductsStore } from "../../stores/products";
import { formatStorePrice } from "../../utils/localizationFormat";
import { SHOP_DEFAULT_MAX_PRICE, isWithinShopPriceLimit, sortShopProducts } from "../../utils/shopProducts";

const productsStore = useProductsStore(usePinia());
const { locale, t } = useI18n();
const props = defineProps<{
  products: any[];
}>();

const shopStore = useShopStore(usePinia());
const pageSize = 9;
const visibleCount = ref(pageSize);

const filteredProducts = computed(() => {
  let result = [...props.products];

  if (shopStore.selectedCategory !== "all") {
    result = result.filter((product) => product.categories?.slug === shopStore.selectedCategory);
  }

  if (shopStore.search) {
    const query = shopStore.search.toLowerCase();
    result = result.filter((product) => product.title?.toLowerCase().includes(query));
  }

  result = result.filter((product) => isWithinShopPriceLimit(product.price, shopStore.maxPrice));

  return sortShopProducts(result, shopStore.sortBy);
});

const visibleProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value));
const hasMoreProducts = computed(() => visibleCount.value < filteredProducts.value.length);

const activeFilters = computed(() => {
  const filters = [];

  if (shopStore.selectedCategory !== "all") {
    filters.push({
      key: "category",
      label: formatLabel(shopStore.selectedCategory),
      clear: () => {
        shopStore.selectedCategory = "all";
        navigateTo("/shop");
      },
    });
  }

  if (shopStore.search) {
    filters.push({
      key: "search",
      label: t("shop.searchActive", { query: shopStore.search }),
      clear: () => {
        shopStore.search = "";
      },
    });
  }

  if (shopStore.maxPrice < SHOP_DEFAULT_MAX_PRICE) {
    filters.push({
      key: "price",
      label: t("shop.underPrice", { price: formatStorePrice(shopStore.maxPrice, locale.value) }),
      clear: () => {
        shopStore.maxPrice = SHOP_DEFAULT_MAX_PRICE;
      },
    });
  }

  if (shopStore.sortBy !== "default") {
    filters.push({
      key: "sort",
      label: shopStore.sortBy === "low" ? t("shop.lowestPrice") : t("shop.highestPrice"),
      clear: () => {
        shopStore.sortBy = "default";
      },
    });
  }

  return filters;
});

watch(
  () => [shopStore.search, shopStore.selectedCategory, shopStore.sortBy, shopStore.maxPrice, props.products.length],
  () => {
    visibleCount.value = pageSize;
  },
);

const formatLabel = (value: string) =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const resetFilters = () => {
  shopStore.selectedCategory = "all";
  shopStore.search = "";
  shopStore.sortBy = "default";
  shopStore.maxPrice = SHOP_DEFAULT_MAX_PRICE;
  navigateTo("/shop");
};
</script>

<style scoped>
.shop-grid-enter-active,
.shop-grid-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.shop-grid-enter-from,
.shop-grid-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

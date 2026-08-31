<template>
  <section class="section-premium">
    <div class="container-premium">
      <div class="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="eyebrow">{{ t('admin.store') }}</p>
            <h1 class="mt-2 text-4xl font-black leading-tight text-white md:text-6xl">{{ shopHeading }}</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-neutral-400 md:text-base">
              {{ shopLead }}
            </p>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div v-for="stat in stats" :key="stat.labelKey" class="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
              <p class="text-xl font-black text-white">{{ stat.value }}</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{{ t(stat.labelKey) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-8">
        <aside class="lg:col-span-3">
          <ShopSidebar />
        </aside>

        <div class="col-span-12 lg:col-span-9">
          <ShopTopbar :total-products="productsStore.products.length" />

          <div class="mt-8">
            <ShopProductGrid :products="filteredProducts" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCategoriesStore } from "../../stores/categories";
import { useProductsStore } from "../../stores/products";
import { useShopStore } from "../../stores/shop";
import { useWishlistStore } from "../../stores/wishlist";
import {
  buildCategorySeo,
  buildShopCategoryCanonicalUrl,
  normalizeCategorySlug,
} from "../../utils/seo";

const route = useRoute();
const productsStore = useProductsStore(usePinia());
const categoriesStore = useCategoriesStore(usePinia());
const shopStore = useShopStore(usePinia());
const wishlistStore = useWishlistStore(usePinia());
const { locale, t } = useI18n();
const config = useRuntimeConfig();

const selectedCategorySlug = computed(() => {
  const value = Array.isArray(route.query.category) ? route.query.category[0] : route.query.category;

  return normalizeCategorySlug(String(value || "all"));
});

shopStore.selectedCategory = selectedCategorySlug.value;

await useAsyncData("shop-initial-catalog", async () => {
  await Promise.all([
    productsStore.getProducts(),
    categoriesStore.getCategories(),
  ]);

  return {
    productsLoaded: productsStore.loaded,
    categoriesLoaded: categoriesStore.loaded,
  };
});

const selectedCategoryRecord = computed(() =>
  categoriesStore.categories.find((category) => category.slug === selectedCategorySlug.value) ||
  productsStore.products.find((product) => product.categories?.slug === selectedCategorySlug.value)?.categories || {
    slug: selectedCategorySlug.value,
    name: selectedCategorySlug.value,
  },
);

const activeCategorySeo = computed(() => buildCategorySeo(selectedCategoryRecord.value, locale.value));
const isCategoryLanding = computed(() => Boolean(selectedCategorySlug.value && selectedCategorySlug.value !== "all"));
const shopHeading = computed(() => (isCategoryLanding.value ? activeCategorySeo.value.h1 : t("shop.shopCombatGear")));
const shopLead = computed(() => (isCategoryLanding.value ? activeCategorySeo.value.intro : t("shop.shopLead")));
const shopMetaTitle = computed(() => (isCategoryLanding.value ? activeCategorySeo.value.title : t("seo.shopTitle")));
const shopMetaDescription = computed(() => (isCategoryLanding.value ? activeCategorySeo.value.description : t("seo.shopDescription")));
const shopCanonicalUrl = computed(() =>
  buildShopCategoryCanonicalUrl(String(config.public.siteUrl || ""), isCategoryLanding.value ? selectedCategorySlug.value : "all"),
);

useSeoMeta({
  title: () => shopMetaTitle.value,
  description: () => shopMetaDescription.value,
  ogTitle: () => shopMetaTitle.value,
  ogDescription: () => shopMetaDescription.value,
  ogUrl: () => shopCanonicalUrl.value,
});

useHead(() => ({
  link: [{ rel: "canonical", href: shopCanonicalUrl.value }],
}));

onMounted(async () => {
  wishlistStore.loadWishlist();
});

const filteredProducts = computed(() => {
  if (!isCategoryLanding.value) {
    return productsStore.products;
  }

  return productsStore.products.filter(
    (product) => product.categories?.slug === selectedCategorySlug.value,
  );
});

const stats = computed(() => [
  { labelKey: "shop.items", value: productsStore.products.length },
  { labelKey: "common.categories", value: new Set(productsStore.products.map((product) => product.categories?.slug).filter(Boolean)).size || 0 },
  { labelKey: "shop.ready", value: "24/7" },
]);

watch(
  () => route.query.category,
  (newCategory) => {
    shopStore.selectedCategory = normalizeCategorySlug(String(newCategory || "all"));
  },
  { immediate: true },
);
</script>

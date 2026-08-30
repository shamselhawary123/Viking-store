<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, watchEffect } from "vue";
import {
  buildCanonicalUrl,
  buildOrganizationStructuredData,
  buildShopCategoryUrl,
  buildWebsiteStructuredData,
  isPrivateSeoPath,
  normalizeSiteUrl,
  SEO_DEFAULT_IMAGE,
  SEO_SITE_NAME,
} from "./utils/seo";

const { locale } = useI18n();
const route = useRoute();
const config = useRuntimeConfig();
const direction = computed(() => (locale.value === "ar" ? "rtl" : "ltr"));
const siteUrl = computed(() =>
  normalizeSiteUrl(String(config.public.siteUrl || "")),
);
const canonicalPath = computed(() => {
  if (route.path === "/shop" && typeof route.query.category === "string") {
    return buildShopCategoryUrl(route.query.category);
  }

  return route.path;
});
const canonicalUrl = computed(() => {
  if (canonicalPath.value.includes("?")) {
    return `${siteUrl.value}${canonicalPath.value}`;
  }

  return buildCanonicalUrl(siteUrl.value, canonicalPath.value);
});
const isPrivateRoute = computed(() => isPrivateSeoPath(route.path));

useHead(() => ({
  titleTemplate: (title) =>
    title ? `${title} | ${SEO_SITE_NAME}` : SEO_SITE_NAME,
  htmlAttrs: {
    lang: locale.value,
    dir: direction.value,
  },
  link: isPrivateRoute.value
    ? []
    : [{ rel: "canonical", href: canonicalUrl.value }],
  script: isPrivateRoute.value
    ? []
    : [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildOrganizationStructuredData(siteUrl.value),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(buildWebsiteStructuredData(siteUrl.value)),
        },
      ],
}));

useSeoMeta({
  title: () => SEO_SITE_NAME,
  description: () =>
    locale.value === "ar"
      ? "فايكنج ستور لمستلزمات الألعاب القتالية في مصر: قفازات ملاكمة وMMA، واقي رأس، واقي أسنان، بنداج، وتجهيزات تمرين يومية."
      : "Viking Store Egypt supplies boxing gloves, MMA gloves, head guards, mouth guards, hand wraps, and combat-sports training gear.",
  ogSiteName: SEO_SITE_NAME,
  ogType: "website",
  ogLocale: () => (locale.value === "ar" ? "ar_EG" : "en_US"),
  ogUrl: () => canonicalUrl.value,
  ogImage: () => buildCanonicalUrl(siteUrl.value, SEO_DEFAULT_IMAGE),
  twitterCard: "summary_large_image",
  twitterImage: () => buildCanonicalUrl(siteUrl.value, SEO_DEFAULT_IMAGE),
  robots: () => (isPrivateRoute.value ? "noindex,nofollow" : "index,follow"),
});

watchEffect(() => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale.value;
    document.documentElement.dir = direction.value;
  }
});

onMounted(async () => {
  const { useCartStore } = await import("./stores/cart");

  const cartStore = useCartStore(usePinia());

  cartStore.loadCart();
});
</script>

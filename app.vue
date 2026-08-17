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
  buildWebsiteStructuredData,
  isPrivateSeoPath,
  normalizeSiteUrl,
  SEO_SITE_NAME,
} from "./utils/seo";

const { locale } = useI18n();
const route = useRoute();
const config = useRuntimeConfig();
const direction = computed(() => (locale.value === "ar" ? "rtl" : "ltr"));
const siteUrl = computed(() => normalizeSiteUrl(String(config.public.siteUrl || "")));
const canonicalUrl = computed(() => buildCanonicalUrl(siteUrl.value, route.path));
const isPrivateRoute = computed(() => isPrivateSeoPath(route.path));

useHead(() => ({
  titleTemplate: (title) => (title ? `${title} | ${SEO_SITE_NAME}` : SEO_SITE_NAME),
  htmlAttrs: {
    lang: locale.value,
    dir: direction.value,
  },
  link: isPrivateRoute.value ? [] : [{ rel: "canonical", href: canonicalUrl.value }],
  script: isPrivateRoute.value
    ? []
    : [
        {
          type: "application/ld+json",
          children: JSON.stringify(buildOrganizationStructuredData(siteUrl.value)),
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
      ? "Viking Store لمعدات القتال عالية الجودة للملاكمة وMMA والكيك بوكسينج والتمرين اليومي."
      : "Viking Store supplies premium boxing, MMA, kickboxing, and combat-sports gear for serious daily training.",
  ogSiteName: SEO_SITE_NAME,
  ogType: "website",
  ogLocale: () => (locale.value === "ar" ? "ar_EG" : "en_US"),
  ogUrl: () => canonicalUrl.value,
  twitterCard: "summary_large_image",
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

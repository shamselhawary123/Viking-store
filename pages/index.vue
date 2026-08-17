<template>
  <div class="bg-black">
    <HomeHeroSection />

    <HomeBrandsSection />

    <HomeCategoriesSection />

    <HomeFeaturedProductsSection />

    <HomeWhyVikingSection />

    <HomeStatsSection />

    <HomeTestimonialsSection />

    <HomeCommunitySection />

    <HomeCTASection />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: () => t("seo.homeTitle"),
  description: () => t("seo.homeDescription"),
  ogTitle: () => t("seo.homeTitle"),
  ogDescription: () => t("seo.homeDescription"),
});
</script>

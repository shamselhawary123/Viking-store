<template>
  <div class="bg-black">
    <HomeHeroSection />

    <HomeBrandsSection />

    <HomeIntroSection />

    <HomeCategoriesSection />

    <HomeFeaturedProductsSection />

    <HomeWhyVikingSection />

    <HomeStatsSection />

    <HomeTestimonialsSection />

    <HomeBlogSection />
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

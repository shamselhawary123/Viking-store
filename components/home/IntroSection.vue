<template>
  <section class="bg-black pt-10 pb-0 sm:pt-12 xl:pt-14">
    <div class="container-premium">
      <div
        :dir="isRtl ? 'rtl' : 'ltr'"
        class="mx-auto max-w-3xl text-center xl:mx-0 xl:max-w-4xl xl:text-start"
      >
        <div class="mx-auto mb-4 h-px w-12 bg-[#CF1D1D]/70 xl:mx-0" />
        <h2
          class="font-display text-3xl leading-tight text-white sm:text-4xl xl:text-5xl"
        >
          {{ t("home.heroTitle") }}
          <span class="text-[#CF1D1D]">{{ t("home.heroAccent") }}</span>
        </h2>
        <p
          class="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base xl:mx-0"
        >
          {{ t("home.heroText") }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { locale, t } = useI18n();
const isRtl = computed(() => locale.value === "ar");
</script>

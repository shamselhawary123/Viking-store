<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, watchEffect } from "vue";

const { locale } = useI18n();
const direction = computed(() => (locale.value === "ar" ? "rtl" : "ltr"));

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    dir: direction.value,
  },
}));

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

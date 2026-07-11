<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(async () => {
  const { useCartStore } = await import("./stores/cart");

  const cartStore = useCartStore(usePinia());

  cartStore.loadCart();
});
</script>

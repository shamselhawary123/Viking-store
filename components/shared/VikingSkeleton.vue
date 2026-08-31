<template>
  <div v-if="variant === 'product-card'" class="overflow-hidden rounded-2xl border border-white/10 bg-[#171717]" aria-hidden="true">
    <div class="viking-skeleton-block aspect-[4/5]" />
    <div class="space-y-4 p-5">
      <div class="viking-skeleton-block h-3 w-24 rounded" />
      <div class="viking-skeleton-block h-6 w-3/4 rounded" />
      <div class="viking-skeleton-block h-6 w-1/2 rounded" />
      <div class="viking-skeleton-block h-12 w-full rounded-xl" />
    </div>
  </div>

  <section v-else-if="variant === 'product-detail'" class="container-premium section-premium pb-28 sm:pb-16" aria-hidden="true">
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr] xl:gap-14">
      <div class="space-y-4">
        <div class="viking-skeleton-block h-[390px] rounded-2xl md:h-[560px] lg:h-[700px]" />
        <div class="grid grid-cols-4 gap-3 sm:grid-cols-5">
          <div v-for="item in 5" :key="item" class="viking-skeleton-block h-24 rounded-xl" />
        </div>
      </div>
      <div class="space-y-7">
        <div class="viking-skeleton-block h-5 w-2/3 rounded" />
        <div class="space-y-3">
          <div class="viking-skeleton-block h-3 w-28 rounded" />
          <div class="viking-skeleton-block h-14 w-full rounded" />
          <div class="viking-skeleton-block h-14 w-4/5 rounded" />
        </div>
        <div class="viking-skeleton-block h-28 rounded-2xl" />
        <div class="viking-skeleton-block h-44 rounded-2xl" />
        <div class="viking-skeleton-block h-14 rounded-xl" />
      </div>
    </div>
  </section>

  <div v-else class="viking-skeleton-block h-4 rounded" aria-hidden="true" />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "line" | "product-card" | "product-detail";
  }>(),
  {
    variant: "line",
  },
);
</script>

<style scoped>
.viking-skeleton-block {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.055), rgba(207, 29, 29, 0.075));
}

.viking-skeleton-block::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.085), transparent);
  transform: translateX(-100%);
  animation: viking-skeleton-shimmer 1.35s ease-in-out infinite;
}

@keyframes viking-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .viking-skeleton-block::after {
    animation: none;
    opacity: 0;
  }
}
</style>

<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div v-reveal class="mx-auto mb-16 max-w-3xl text-center">
        <p class="eyebrow">{{ t("home.whyViking.eyebrow") }}</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">{{ t("home.whyViking.title") }}</h2>
        <p class="mt-5 leading-8 text-neutral-400">
          {{ t("home.whyViking.description") }}
        </p>
      </div>

      <div class="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-5">
        <article
          v-for="(item, index) in features"
          :key="item.titleKey"
          v-reveal="{ delay: index * 90 }"
          class="premium-panel group rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60 hover:shadow-[0_30px_90px_rgba(255,77,0,0.1)]"
        >
          <div class="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF4D00]/10 text-[#FF4D00] transition duration-300 group-hover:scale-110 group-hover:bg-[#FF4D00] group-hover:text-white">
            <Icon :name="item.icon" class="text-3xl" />
          </div>
          <h3 class="text-2xl font-black text-white">{{ t(item.titleKey) }}</h3>
          <p class="mt-4 leading-7 text-neutral-400">{{ t(item.descriptionKey) }}</p>
        </article>
      </div>

      <div
        v-reveal
        class="flex items-center gap-2 md:hidden"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
      >
        <div
          class="shrink-0"
        >
          <button
            type="button"
            class="mobile-carousel-arrow"
            :aria-label="locale === 'ar' ? 'الشريحة السابقة' : 'Previous slide'"
            @click="carousel.movePrevious"
          >
            <Icon
              :name="locale === 'ar' ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
              class="text-lg"
            />
          </button>
        </div>

        <div
          :ref="carousel.setViewportRef"
          class="min-w-0 flex-1 overflow-hidden"
          @touchstart.passive="carousel.handleTouchStart"
          @touchmove.passive="carousel.handleTouchMove"
          @touchend.passive="carousel.handleTouchEnd"
          @touchcancel.passive="carousel.handleTouchCancel"
        >
          <div
            class="mobile-carousel-track flex touch-pan-y will-change-transform"
            :class="{ 'is-dragging': carousel.isDragging, 'is-snapping': carousel.isSnapping }"
            :style="carousel.trackStyle"
          >
            <article
              v-for="(itemIndex, index) in carousel.loopedIndexes"
              :key="`${index}-${features[itemIndex].titleKey}`"
              class="mobile-carousel-slide premium-panel group shrink-0 rounded-2xl p-6 transition duration-300 hover:border-[#FF4D00]/60 hover:shadow-[0_30px_90px_rgba(255,77,0,0.1)]"
            >
              <div class="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF4D00]/10 text-[#FF4D00] transition duration-300 group-hover:scale-110 group-hover:bg-[#FF4D00] group-hover:text-white">
                <Icon :name="features[itemIndex].icon" class="text-3xl" />
              </div>
              <h3 class="text-2xl font-black text-white">{{ t(features[itemIndex].titleKey) }}</h3>
              <p class="mt-4 leading-7 text-neutral-400">{{ t(features[itemIndex].descriptionKey) }}</p>
            </article>
          </div>
        </div>

        <div
          class="shrink-0"
        >
          <button
            type="button"
            class="mobile-carousel-arrow"
            :aria-label="locale === 'ar' ? 'الشريحة التالية' : 'Next slide'"
            @click="carousel.moveNext"
          >
            <Icon
              :name="locale === 'ar' ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'"
              class="text-lg"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMobileCarousel } from "../../composables/useMobileCarousel";

const { locale, t } = useI18n();

const features = [
  {
    icon: "i-heroicons-shield-check",
    titleKey: "home.whyViking.materialsTitle",
    descriptionKey: "home.whyViking.materialsText",
  },
  {
    icon: "i-heroicons-truck",
    titleKey: "home.whyViking.shippingTitle",
    descriptionKey: "home.whyViking.shippingText",
  },
  {
    icon: "i-heroicons-banknotes",
    titleKey: "home.whyViking.paymentTitle",
    descriptionKey: "home.whyViking.paymentText",
  },
  {
    icon: "i-heroicons-trophy",
    titleKey: "home.whyViking.fightersTitle",
    descriptionKey: "home.whyViking.fightersText",
  },
  {
    icon: "i-heroicons-sparkles",
    titleKey: "home.whyViking.supportTitle",
    descriptionKey: "home.whyViking.supportText",
  },
];

const isRtl = computed(() => locale.value === "ar");
const carousel = useMobileCarousel(computed(() => features.length), { isRtl });
</script>

<style scoped>
.mobile-carousel-track {
  transition:
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-carousel-track.is-dragging,
.mobile-carousel-track.is-snapping {
  transition: none;
}

.mobile-carousel-slide {
  flex-basis: var(--mobile-carousel-slide-width);
  margin-inline-end: var(--mobile-carousel-gap);
  transition:
    opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-carousel-arrow {
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.12);
  background: rgb(12 12 12 / 0.82);
  color: #ff4d00;
  box-shadow: 0 14px 34px rgb(0 0 0 / 0.32);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.mobile-carousel-arrow:hover {
  border-color: rgb(255 77 0 / 0.72);
  background: rgb(255 77 0 / 0.14);
  box-shadow: 0 16px 38px rgb(255 77 0 / 0.12);
}

.mobile-carousel-arrow:active {
  transform: scale(0.94);
}

.mobile-carousel-arrow:focus-visible {
  outline: 2px solid #ff4d00;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .mobile-carousel-track,
  .mobile-carousel-slide,
  .mobile-carousel-arrow {
    transition-duration: 1ms;
  }
}
</style>

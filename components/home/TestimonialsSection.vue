<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div v-reveal class="mx-auto mb-16 max-w-3xl text-center">
        <p class="eyebrow font-size-l">{{ t("home.testimonials.eyebrow") }}</p>

        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
          {{ t("home.testimonials.title") }}
        </h2>
        <p class="mt-5 leading-8 text-neutral-400">
          {{ t("home.testimonials.description") }}
        </p>
      </div>

      <div class="hidden gap-6 md:grid md:grid-cols-3">
        <div
          v-for="(item, index) in testimonials"
          :key="item.name"
          v-reveal="{ delay: index * 90 }"
          class="premium-panel group rounded-2xl p-7 transition duration-300 hover:-translate-y-2 hover:border-[#CF1D1D]/60"
        >
          <div class="mb-6 flex items-center justify-between">
            <div class="flex text-[#CF1D1D]">
              <Icon
                v-for="star in 5"
                :key="star"
                name="i-heroicons-star-solid"
              />
            </div>
            <span
              class="font-display text-5xl leading-none text-white/10 transition group-hover:text-[#CF1D1D]/25"
              >"</span
            >
          </div>
          <p class="min-h-24 leading-8 text-neutral-300">
            "{{ t(item.reviewKey) }}"
          </p>

          <div
            class="mt-8 flex items-center gap-4 border-t border-white/10 pt-6"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-[#CF1D1D] font-black text-white"
            >
              {{ item.name.slice(0, 1) }}
            </div>
            <div>
              <h3 class="font-black text-white">
                {{ item.name }}
              </h3>

              <p class="text-sm text-[#CF1D1D]">
                {{ t(item.roleKey) }}
              </p>
            </div>
          </div>
        </div>
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
            <div
              v-for="(itemIndex, index) in carousel.loopedIndexes"
              :key="`${index}-${testimonials[itemIndex].name}`"
              class="mobile-carousel-slide premium-panel group shrink-0 rounded-2xl p-7 transition duration-300 hover:border-[#CF1D1D]/60"
            >
              <div class="mb-6 flex items-center justify-between">
                <div class="flex text-[#CF1D1D]">
                  <Icon
                    v-for="star in 5"
                    :key="star"
                    name="i-heroicons-star-solid"
                  />
                </div>
                <span
                  class="font-display text-5xl leading-none text-white/10 transition group-hover:text-[#CF1D1D]/25"
                  >"</span
                >
              </div>
              <p class="min-h-24 leading-8 text-neutral-300">
                "{{ t(testimonials[itemIndex].reviewKey) }}"
              </p>

              <div
                class="mt-8 flex items-center gap-4 border-t border-white/10 pt-6"
              >
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-[#CF1D1D] font-black text-white"
                >
                  {{ testimonials[itemIndex].name.slice(0, 1) }}
                </div>
                <div>
                  <h3 class="font-black text-white">
                    {{ testimonials[itemIndex].name }}
                  </h3>

                  <p class="text-sm text-[#CF1D1D]">
                    {{ t(testimonials[itemIndex].roleKey) }}
                  </p>
                </div>
              </div>
            </div>
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

const testimonials = [
  {
    name: "Ahmed Ali",
    roleKey: "home.testimonials.ahmedRole",
    reviewKey: "home.testimonials.ahmedReview",
  },
  {
    name: "Mohamed Hassan",
    roleKey: "home.testimonials.mohamedRole",
    reviewKey: "home.testimonials.mohamedReview",
  },
  {
    name: "Omar Khaled",
    roleKey: "home.testimonials.omarRole",
    reviewKey: "home.testimonials.omarReview",
  },
];

const isRtl = computed(() => locale.value === "ar");
const carousel = useMobileCarousel(computed(() => testimonials.length), { isRtl });
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
  color: #cf1d1d;
  box-shadow: 0 14px 34px rgb(0 0 0 / 0.32);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.mobile-carousel-arrow:hover {
  border-color: rgb(207 29 29 / 0.72);
  background: rgb(207 29 29 / 0.14);
  box-shadow: 0 16px 38px rgb(207 29 29 / 0.12);
}

.mobile-carousel-arrow:active {
  transform: scale(0.94);
}

.mobile-carousel-arrow:focus-visible {
  outline: 2px solid #cf1d1d;
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

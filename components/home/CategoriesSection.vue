<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div v-reveal class="mx-auto mb-16 max-w-3xl text-center">
        <p class="eyebrow">{{ t("common.categories") }}</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
          {{ t("home.chooseYourWeapon") }}
        </h2>
        <p class="mt-5 leading-8 text-neutral-400">
          {{ t("home.categoriesLead") }}
        </p>
      </div>

      <div class="hidden gap-5 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        <NuxtLink
          v-for="(category, index) in visibleCategories"
          :key="category.id"
          v-reveal="{ delay: index * 90 }"
          :to="buildShopCategoryUrl(category.slug)"
          class="group flex h-[25rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/70 hover:shadow-[0_30px_90px_rgba(255,77,0,0.12)]"
        >
          <div class="relative h-[70%] overflow-hidden bg-black">
            <img
              :src="category.image"
              :alt="categorySeo(category).title"
              width="640"
              height="800"
              class="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
              loading="lazy"
              decoding="async"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/20"
            />
            <div
              class="absolute inset-x-5 top-5 flex items-center justify-between"
            >
              <span
                class="rounded-full border border-white/10 bg-black/65 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white"
                >{{ t("home.proGear") }}</span
              >
              <span
                class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white transition duration-300 group-hover:border-[#FF4D00] group-hover:bg-[#FF4D00]"
              >
                <Icon name="i-heroicons-arrow-right" />
              </span>
            </div>
          </div>
          <div
            class="flex flex-1 flex-col justify-between border-t border-white/10 bg-[#0c0c0c] p-5 text-start"
          >
            <div>
              <h3
                class="font-display text-3xl leading-none text-white transition duration-300 group-hover:text-[#FF4D00]"
              >
                {{ getLocalizedCategoryName(category, locale) || category.name }}
              </h3>
              <p class="mt-3 line-clamp-2 text-sm leading-6 text-neutral-400">
                {{ categorySeo(category).intro }}
              </p>
            </div>
            <p
              class="mt-4 inline-flex w-fit items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#FF4D00]"
            >
              {{ t("home.explore") }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <div
        v-if="visibleCategories.length"
        v-reveal
        class="flex items-center gap-2 sm:hidden"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
      >
        <div class="shrink-0">
          <button
            type="button"
            class="mobile-carousel-arrow"
            :aria-label="locale === 'ar' ? 'الشريحة السابقة' : 'Previous slide'"
            @click="carousel.movePrevious"
          >
            <Icon
              :name="
                locale === 'ar'
                  ? 'i-heroicons-chevron-right'
                  : 'i-heroicons-chevron-left'
              "
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
            :class="{
              'is-dragging': carousel.isDragging,
              'is-snapping': carousel.isSnapping,
            }"
            :style="carousel.trackStyle"
          >
            <NuxtLink
              v-for="(itemIndex, index) in carousel.loopedIndexes"
              :key="`${index}-${visibleCategories[itemIndex].id}`"
              :to="buildShopCategoryUrl(visibleCategories[itemIndex].slug)"
              class="mobile-carousel-slide group flex h-[25rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition duration-300 hover:border-[#FF4D00]/70 hover:shadow-[0_30px_90px_rgba(255,77,0,0.12)]"
            >
              <div class="relative h-[70%] overflow-hidden bg-black">
                <img
                  :src="visibleCategories[itemIndex].image"
                  :alt="categorySeo(visibleCategories[itemIndex]).title"
                  width="640"
                  height="800"
                  class="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/20"
                />
                <div
                  class="absolute inset-x-5 top-5 flex items-center justify-between"
                >
                  <span
                    class="rounded-full border border-white/10 bg-black/65 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white"
                    >{{ t("home.proGear") }}</span
                  >
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white transition duration-300 group-hover:border-[#FF4D00] group-hover:bg-[#FF4D00]"
                  >
                    <Icon name="i-heroicons-arrow-right" />
                  </span>
                </div>
              </div>
              <div
                class="flex flex-1 flex-col justify-between border-t border-white/10 bg-[#0c0c0c] p-5 text-start"
              >
                <div>
                  <h3
                    class="font-display text-3xl leading-none text-white transition duration-300 group-hover:text-[#FF4D00]"
                  >
                    {{
                      getLocalizedCategoryName(
                        visibleCategories[itemIndex],
                        locale,
                      ) || visibleCategories[itemIndex].name
                    }}
                  </h3>
                  <p class="mt-3 line-clamp-2 text-sm leading-6 text-neutral-400">
                    {{ categorySeo(visibleCategories[itemIndex]).intro }}
                  </p>
                </div>
                <p
                  class="mt-4 inline-flex w-fit items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#FF4D00]"
                >
                  {{ t("home.explore") }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div class="shrink-0">
          <button
            type="button"
            class="mobile-carousel-arrow"
            :aria-label="locale === 'ar' ? 'الشريحة التالية' : 'Next slide'"
            @click="carousel.moveNext"
          >
            <Icon
              :name="
                locale === 'ar'
                  ? 'i-heroicons-chevron-left'
                  : 'i-heroicons-chevron-right'
              "
              class="text-lg"
            />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useMobileCarousel } from "../../composables/useMobileCarousel";
import { useCategoriesStore } from "../../stores/categories";
import { getLocalizedCategoryName } from "../../utils/localizationFormat";
import { buildCategorySeo, buildShopCategoryUrl } from "../../utils/seo";

const categoriesStore = useCategoriesStore(usePinia());
const { locale, t } = useI18n();

const categorySeo = (category: {
  slug?: string | null;
  name?: string | null;
}) => buildCategorySeo(category, locale.value);

const visibleCategories = computed(() =>
  categoriesStore.categories.filter((category) => category.slug !== "all"),
);
const isRtl = computed(() => locale.value === "ar");
const carousel = useMobileCarousel(
  computed(() => visibleCategories.value.length),
  {
    isRtl,
  },
);

onMounted(async () => {
  await categoriesStore.getCategories();
});
</script>

<style scoped>
.mobile-carousel-track {
  transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
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

<template>
  <div class="rounded-2xl border border-white/10 bg-[#171717]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur md:p-5">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0">
        <p class="text-sm font-bold text-neutral-400">
          {{ t('shop.totalCurated', { count: totalProducts }) }}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="preset in quickSorts"
            :key="preset.value"
            class="rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition duration-200"
            :class="shopStore.sortBy === preset.value ? 'border-[#CF1D1D] bg-[#CF1D1D]/10 text-[#CF1D1D]' : 'border-white/10 text-neutral-400 hover:border-[#CF1D1D]/70 hover:text-white'"
            @click="shopStore.sortBy = preset.value"
          >
            {{ t(preset.labelKey) }}
          </button>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-[1fr_auto] xl:min-w-[34rem]">
        <div class="relative">
          <Icon name="i-heroicons-magnifying-glass" class="absolute top-1/2 -translate-y-1/2 text-neutral-500" :class="isRtl ? 'right-4' : 'left-4'" />
          <input
            id="shop-top-search"
            v-model="shopStore.search"
            type="search"
            :placeholder="t('shop.searchPlaceholder')"
            class="premium-input h-12 px-11"
          />
          <button
            v-if="shopStore.search"
            class="absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
            :class="isRtl ? 'left-2' : 'right-2'"
            :aria-label="t('shop.clearSearch')"
            @click="shopStore.search = ''"
          >
            <Icon name="i-heroicons-x-mark" />
          </button>
        </div>

        <div class="flex gap-3">
          <button
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#CF1D1D] hover:text-[#CF1D1D] active:scale-[0.98] lg:hidden"
            @click="toggleFilters"
          >
            <Icon name="i-heroicons-funnel" />
            {{ t('common.filters') }}
          </button>

          <label class="sr-only" for="sort-products">{{ t('shop.sortProducts') }}</label>
          <select id="sort-products" v-model="shopStore.sortBy" class="premium-input h-12 min-w-44 rounded-xl">
            <option value="default">{{ t('shop.defaultSort') }}</option>
            <option value="low">{{ t('shop.priceLowToHigh') }}</option>
            <option value="high">{{ t('shop.priceHighToLow') }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShopStore } from "../../stores/shop";
import { computed } from "vue";

const shopStore = useShopStore(usePinia());
const { locale, t } = useI18n();
const isRtl = computed(() => locale.value === "ar");

defineProps<{
  totalProducts: number;
}>();

const quickSorts = [
  { value: "default", labelKey: "shop.defaultSort" },
  { value: "low", labelKey: "shop.lowest" },
  { value: "high", labelKey: "shop.highest" },
];

const toggleFilters = () => {
  shopStore.mobileFiltersOpen = !shopStore.mobileFiltersOpen;
};
</script>

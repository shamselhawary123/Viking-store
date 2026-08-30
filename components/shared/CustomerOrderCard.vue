<template>
  <article
    class="premium-panel overflow-hidden rounded-3xl border-white/10 bg-gradient-to-br from-white/[0.06] to-black/40 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-[#CF1D1D]/60 md:p-6"
  >
    <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <p class="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
          {{ t("orders.orderNumber") }}
        </p>
        <h3 class="mt-2 truncate text-2xl font-black text-white">
          #{{ displayOrderNumber }}
        </h3>
        <p class="mt-2 text-sm text-neutral-400">{{ formatDate(order.created_at) }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span
          class="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em]"
          :class="statusClass"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-current" />
          {{ t(`orders.${status}`) }}
        </span>
        <span
          v-if="order.payment_status"
          class="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-neutral-300"
        >
          {{ t(`orders.${order.payment_status}`) }}
        </span>
      </div>
    </div>

    <div class="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
      <CustomerOrderStatusTracker :status="status" />

      <div class="rounded-2xl border border-white/10 bg-black/30 p-4 lg:min-w-56">
        <p class="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
          {{ t("common.total") }}
        </p>
        <p class="mt-2 text-3xl font-black text-[#CF1D1D]">
          {{ formatStorePrice(order.total_price, locale) }}
        </p>

        <NuxtLink
          :to="`/profile/orders/${order.id}`"
          class="mt-4 inline-flex items-center gap-2 text-sm font-black text-white transition hover:text-[#CF1D1D]"
        >
          {{ t("profile.viewDetails") }}
          <Icon
            name="i-heroicons-arrow-right"
            class="text-base"
            :class="locale === 'ar' ? 'rotate-180' : ''"
          />
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CustomerOrderStatusTracker from "./CustomerOrderStatusTracker.vue";
import { formatStorePrice } from "../../utils/localizationFormat";

const props = defineProps<{
  order: Record<string, any>;
}>();

const { locale, t } = useI18n();

const status = computed(() => String(props.order.status || "pending").toLowerCase());

const displayOrderNumber = computed(() => {
  return props.order.order_number || String(props.order.id || "").slice(0, 8);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(locale.value === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusClass = computed(() => {
  switch (status.value) {
    case "delivered":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "shipped":
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
    case "cancelled":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    case "processing":
      return "border-orange-500/30 bg-orange-500/10 text-orange-300";
    default:
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }
});
</script>

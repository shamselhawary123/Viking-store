<template>
  <section class="container-premium section-premium">
    <div class="mb-10">
      <p class="eyebrow">{{ t('common.account') }}</p>
      <h1 class="display-heading mt-3 text-6xl text-white md:text-7xl">{{ t('profile.orderHistory') }}</h1>
      <p class="mt-4 max-w-2xl text-neutral-400">{{ t('profile.orderHistoryLead') }}</p>
    </div>

    <div v-if="loading" class="grid gap-5">
      <div v-for="i in 3" :key="i" class="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
    </div>

    <div v-else-if="orders.length === 0" class="premium-panel rounded-2xl p-10 text-center md:p-16">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-[#CF1D1D]">
        <Icon name="i-heroicons-archive-box" class="text-4xl" />
      </div>
      <h2 class="mt-6 text-3xl font-black text-white">{{ t('profile.noOrdersYet') }}</h2>
      <p class="mt-3 text-neutral-400">{{ t('profile.startShopping') }}</p>
      <NuxtLink to="/shop" class="premium-button premium-button-primary mt-8">{{ t('profile.goShopping') }}</NuxtLink>
    </div>

    <div v-else class="grid gap-5">
      <NuxtLink
        v-for="order in orders"
        :key="order.id"
        :to="`/profile/orders/${order.id}`"
        class="premium-panel rounded-2xl p-6 transition hover:-translate-y-1 hover:border-[#CF1D1D]/70"
      >
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm text-neutral-500">{{ t('orders.orderId') }}</p>
            <h3 class="mt-1 text-lg font-black text-white">#{{ order.id.slice(0, 8) }}</h3>
            <p class="mt-3 text-neutral-400">{{ formatDate(order.created_at) }}</p>
          </div>

          <span class="w-fit rounded-full border px-4 py-2 text-sm font-black capitalize" :class="getStatusClass(order.status)">
            {{ t(`orders.${order.status}`) }}
          </span>

          <div class="text-left lg:text-right">
            <p class="text-sm text-neutral-500">{{ t('common.total') }}</p>
            <h2 class="text-4xl font-black text-[#CF1D1D]">{{ formatStorePrice(order.total_price, locale) }}</h2>
            <span class="mt-4 inline-flex items-center gap-2 text-sm font-black text-white">
              {{ t('common.details') }}
              <Icon name="i-heroicons-arrow-right" />
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../../stores/auth";
import { formatStorePrice } from "../../../utils/localizationFormat";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore(usePinia());
const { locale, t } = useI18n();
const orders = ref<any[]>([]);
const loading = ref(true);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(locale.value === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "shipped":
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";
    case "cancelled":
      return "border-red-500/30 bg-red-500/10 text-red-300";
    default:
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }
};

onMounted(async () => {
  try {
    orders.value = await authStore.getOrders();
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
});
</script>

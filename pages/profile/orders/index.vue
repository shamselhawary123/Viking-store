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

    <div v-else>
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm font-bold text-neutral-400">
          {{ t("profile.showingOrders", { visible: visibleOrders.length, total: orders.length }) }}
        </p>
      </div>

      <div class="grid gap-5">
        <CustomerOrderCard
          v-for="order in visibleOrders"
          :key="order.id"
          :order="order"
        />
      </div>

      <div v-if="hasMoreOrders" class="mt-8 flex justify-center">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full border border-[#CF1D1D]/40 bg-neutral-950 px-7 py-3 text-sm font-black text-white shadow-[0_14px_36px_rgba(0,0,0,0.32)] transition hover:border-[#CF1D1D]/80 hover:bg-[#CF1D1D]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CF1D1D] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          @click="showMoreOrders"
        >
          {{ t("profile.showMore") }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import CustomerOrderCard from "../../../components/shared/CustomerOrderCard.vue";
import { useAuthStore } from "../../../stores/auth";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore(usePinia());
const { t } = useI18n();
const orders = ref<any[]>([]);
const loading = ref(true);
const visibleCount = ref(5);

const visibleOrders = computed(() => orders.value.slice(0, visibleCount.value));
const hasMoreOrders = computed(() => visibleCount.value < orders.value.length);

const showMoreOrders = () => {
  visibleCount.value += 5;
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

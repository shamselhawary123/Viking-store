<template>
  <section class="container-premium section-premium">
    <NuxtLink to="/profile/orders" class="premium-link mb-8 inline-flex items-center gap-2">
      <Icon name="i-heroicons-arrow-left" />
      {{ t('profile.backToOrders') }}
    </NuxtLink>

    <div v-if="loading" class="premium-panel rounded-2xl p-10 text-center text-neutral-400">
      {{ t('profile.loadingOrder') }}
    </div>

    <div v-else-if="order" class="space-y-8">
      <div class="premium-panel rounded-2xl p-6">
        <div class="grid gap-6 md:grid-cols-3">
          <div>
            <p class="text-sm text-neutral-500">{{ t('orders.orderId') }}</p>
            <h2 class="mt-2 break-all font-black text-white">{{ order.id }}</h2>
          </div>
          <div>
            <p class="text-sm text-neutral-500">{{ t('common.status') }}</p>
            <h2 class="mt-2 font-black capitalize text-[#CF1D1D]">{{ t(`orders.${order.status}`) }}</h2>
          </div>
          <div>
            <p class="text-sm text-neutral-500">{{ t('common.total') }}</p>
            <h2 class="mt-2 text-3xl font-black text-white">{{ formatStorePrice(order.total_price, locale) }}</h2>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <article v-for="item in orderItems" :key="item.id" class="premium-panel rounded-2xl p-5">
          <div class="flex flex-col gap-5 md:flex-row">
            <img :src="item.product_image" :alt="item.product_name" width="128" height="128" class="h-32 w-full rounded-xl object-cover md:w-32" loading="lazy" decoding="async" />
            <div class="flex flex-1 flex-col justify-between gap-4">
              <div>
                <h3 class="text-2xl font-black">{{ item.product_name }}</h3>
                <div class="mt-3 flex flex-wrap gap-4 text-neutral-400">
                  <span>{{ t('shop.color') }}: {{ item.color || t('shop.default') }}</span>
                  <span>{{ t('shop.size') }}: {{ item.size || t('shop.default') }}</span>
                  <span>{{ t('shop.quantity') }}: {{ item.quantity }}</span>
                </div>
              </div>
              <h3 class="text-2xl font-black text-[#CF1D1D]">{{ formatStorePrice(item.product_price, locale) }}</h3>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="premium-panel rounded-2xl p-10 text-center">
      <h2 class="text-3xl font-black">{{ t('profile.orderNotFound') }}</h2>
      <p class="mt-3 text-neutral-400">{{ t('profile.orderNotFoundText') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useSupabase } from "../../../composables/useSupabase";
import { formatStorePrice } from "../../../utils/localizationFormat";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const supabase = useSupabase();
const { locale, t } = useI18n();
const loading = ref(true);
const order = ref<any>(null);
const orderItems = ref<any[]>([]);

onMounted(async () => {
  const orderId = route.params.id;

  const { data: orderData } = await supabase.from("orders").select("*").eq("id", orderId).single();
  order.value = orderData;

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  orderItems.value = items || [];
  loading.value = false;
});
</script>

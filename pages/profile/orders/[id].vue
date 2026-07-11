<template>
  <section class="container-premium section-premium">
    <NuxtLink to="/profile/orders" class="premium-link mb-8 inline-flex items-center gap-2">
      <Icon name="i-heroicons-arrow-left" />
      Back To Orders
    </NuxtLink>

    <div v-if="loading" class="premium-panel rounded-2xl p-10 text-center text-neutral-400">
      Loading order...
    </div>

    <div v-else-if="order" class="space-y-8">
      <div class="premium-panel rounded-2xl p-6">
        <div class="grid gap-6 md:grid-cols-3">
          <div>
            <p class="text-sm text-neutral-500">Order ID</p>
            <h2 class="mt-2 break-all font-black text-white">{{ order.id }}</h2>
          </div>
          <div>
            <p class="text-sm text-neutral-500">Status</p>
            <h2 class="mt-2 font-black capitalize text-[#FF4D00]">{{ order.status }}</h2>
          </div>
          <div>
            <p class="text-sm text-neutral-500">Total</p>
            <h2 class="mt-2 text-3xl font-black text-white">${{ order.total_price }}</h2>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <article v-for="item in orderItems" :key="item.id" class="premium-panel rounded-2xl p-5">
          <div class="flex flex-col gap-5 md:flex-row">
            <img :src="item.product_image" :alt="item.product_name" class="h-32 w-full rounded-xl object-cover md:w-32" />
            <div class="flex flex-1 flex-col justify-between gap-4">
              <div>
                <h3 class="text-2xl font-black">{{ item.product_name }}</h3>
                <div class="mt-3 flex flex-wrap gap-4 text-neutral-400">
                  <span>Color: {{ item.color }}</span>
                  <span>Size: {{ item.size }}</span>
                  <span>Qty: {{ item.quantity }}</span>
                </div>
              </div>
              <h3 class="text-2xl font-black text-[#FF4D00]">${{ item.product_price }}</h3>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="premium-panel rounded-2xl p-10 text-center">
      <h2 class="text-3xl font-black">Order Not Found</h2>
      <p class="mt-3 text-neutral-400">This order does not exist or cannot be accessed.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useSupabase } from "../../../composables/useSupabase";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const supabase = useSupabase();
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

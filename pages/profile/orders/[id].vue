<template>
  <section class="min-h-screen bg-black py-10">
    <div class="mx-auto max-w-6xl px-4">
      <!-- Back -->
      <NuxtLink
        to="/profile/orders"
        class="mb-8 inline-flex items-center gap-2 text-gray-400 transition hover:text-[#FF4D00]"
      >
        ← Back To Orders
      </NuxtLink>

      <!-- Loading -->
      <div v-if="loading" class="text-center text-gray-400">Loading...</div>

      <!-- Order -->
      <div v-else-if="order">
        <div class="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
          <div class="flex flex-wrap gap-10">
            <div>
              <p class="text-gray-400">Order ID</p>

              <h2 class="font-bold text-white">
                {{ order.id }}
              </h2>
            </div>

            <div>
              <p class="text-gray-400">Status</p>

              <h2 class="font-bold text-[#FF4D00]">
                {{ order.status }}
              </h2>
            </div>

            <div>
              <p class="text-gray-400">Total</p>

              <h2 class="font-bold text-white">${{ order.total_price }}</h2>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="space-y-5">
          <div
            v-for="item in orderItems"
            :key="item.id"
            class="rounded-3xl border border-white/10 bg-[#111111] p-5"
          >
            <div class="flex gap-5">
              <img
                :src="item.product_image"
                class="h-28 w-28 rounded-2xl object-cover"
              />

              <div class="flex flex-1 flex-col justify-between">
                <div>
                  <h3 class="text-2xl font-black">
                    {{ item.product_name }}
                  </h3>

                  <div class="mt-3 flex gap-6 text-gray-400">
                    <span>Color: {{ item.color }}</span>

                    <span>Size: {{ item.size }}</span>

                    <span>Qty: {{ item.quantity }}</span>
                  </div>
                </div>

                <h3 class="text-2xl font-black text-[#FF4D00]">
                  ${{ item.product_price }}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center text-gray-400">Order not found</div>
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

  const { data: orderData } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  order.value = orderData;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  orderItems.value = items || [];

  loading.value = false;
});
</script>

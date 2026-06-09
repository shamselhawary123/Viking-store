<template>
  <section class="min-h-screen bg-black py-12">
    <div class="mx-auto max-w-7xl px-4">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-5xl font-black text-white">Order History</h1>

        <p class="mt-3 text-gray-400">Track all your Viking Store orders</p>
      </div>

      <!-- Empty -->
      <div
        v-if="!loading && orders.length === 0"
        class="rounded-3xl border border-white/10 bg-[#111111] p-16 text-center"
      >
        <h2 class="text-3xl font-black text-white">No Orders Yet</h2>

        <p class="mt-3 text-gray-400">
          Start shopping and your orders will appear here.
        </p>

        <NuxtLink
          to="/shop"
          class="mt-8 inline-flex rounded-2xl bg-[#FF4D00] px-8 py-4 font-bold text-white"
        >
          Go Shopping
        </NuxtLink>
      </div>

      <!-- Orders -->
      <div v-else class="grid gap-6">
        <NuxtLink
          v-for="order in orders"
          :key="order.id"
          :to="`/profile/orders/${order.id}`"
          class="rounded-3xl border border-white/10 bg-[#111111] p-6 transition hover:border-[#FF4D00]"
        >
          <div
            class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <!-- Left -->
            <div>
              <p class="text-sm text-gray-500">Order ID</p>

              <h3 class="mt-1 break-all text-lg font-bold text-white">
                {{ order.id }}
              </h3>

              <p class="mt-3 text-gray-400">
                {{ formatDate(order.created_at) }}
              </p>
            </div>

            <!-- Center -->
            <div>
              <span
                class="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400"
              >
                {{ order.status }}
              </span>
            </div>

            <!-- Right -->
            <div class="text-right">
              <p class="text-sm text-gray-500">Total</p>

              <h2 class="text-4xl font-black text-[#FF4D00]">
                ${{ order.total_price }}
              </h2>

              <NuxtLink
                :to="`/profile/orders/${order.id}`"
                class="mt-4 inline-block rounded-xl border border-white/10 px-5 py-2 text-white transition hover:border-[#FF4D00]"
              >
                View Details
              </NuxtLink>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../../stores/auth";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore();

const orders = ref<any[]>([]);
const loading = ref(true);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
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

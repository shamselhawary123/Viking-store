<template>
  <section class="min-h-screen bg-black py-10">
    <div class="mx-auto max-w-7xl px-4">
      <!-- Loading -->
      <div v-if="loading" class="text-center text-white">Loading Order...</div>

      <template v-else-if="order">
        <!-- Header -->
        <div class="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-8">
          <div
            class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p class="text-sm text-gray-500">Order ID</p>

              <h1 class="mt-2 break-all text-2xl font-black text-white">
                {{ order.id }}
              </h1>

              <p class="mt-3 text-gray-400">
                {{ formatDate(order.created_at) }}
              </p>
            </div>

            <div class="text-right">
              <span
                class="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 font-bold text-[#FF4D00]"
              >
                {{ order.status }}
              </span>

              <h2 class="mt-4 text-4xl font-black text-[#FF4D00]">
                ${{ order.total_price }}
              </h2>
            </div>
          </div>
        </div>

        <!-- Products -->
        <div class="space-y-5">
          <div
            v-for="item in items"
            :key="item.id"
            class="rounded-3xl border border-white/10 bg-[#111111] p-5"
          >
            <div class="flex flex-col gap-5 md:flex-row md:items-center">
              <!-- Image -->
              <img
                :src="item.product_image"
                :alt="item.product_name"
                class="h-28 w-28 rounded-2xl object-cover"
              />

              <!-- Info -->
              <div class="flex-1">
                <h3 class="text-2xl font-black text-white">
                  {{ item.product_name }}
                </h3>

                <div class="mt-3 flex flex-wrap gap-4 text-gray-400">
                  <span>
                    Color:
                    <span class="text-white">
                      {{ item.color }}
                    </span>
                  </span>

                  <span>
                    Size:
                    <span class="text-white">
                      {{ item.size }}
                    </span>
                  </span>

                  <span>
                    Qty:
                    <span class="text-white">
                      {{ item.quantity }}
                    </span>
                  </span>
                </div>
              </div>

              <!-- Price -->
              <div class="text-right">
                <p class="text-gray-400">Product Price</p>

                <h3 class="text-2xl font-black text-[#FF4D00]">
                  ${{ item.product_price }}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-black text-white">Order Total</h3>

            <span class="text-4xl font-black text-[#FF4D00]">
              ${{ order.total_price }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../../stores/auth";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);

const order = ref<any>(null);
const items = ref<any[]>([]);

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

onMounted(async () => {
  try {
    const result = await authStore.getOrderDetails(route.params.id as string);

    order.value = result.order;
    items.value = result.items;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

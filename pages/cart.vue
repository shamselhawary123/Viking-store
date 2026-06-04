<template>
  <section class="mx-auto max-w-7xl px-4 py-10">
    <!-- Header -->
    <div
      class="mb-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 class="text-4xl font-black">Shopping Cart</h1>

        <p class="mt-2 text-gray-400">
          {{ cartStore.totalItems }} Items In Your Cart
        </p>
      </div>

      <button
        v-if="cartStore.items.length"
        @click="cartStore.clearCart()"
        class="rounded-2xl border border-red-500 px-6 py-3 text-red-500 transition hover:bg-red-500 hover:text-white"
      >
        Clear Cart
      </button>
    </div>

    <!-- EMPTY -->
    <div
      v-if="!cartStore.items.length"
      class="flex min-h-[400px] flex-col items-center justify-center gap-5 rounded-3xl border border-white/10 bg-[#111111]"
    >
      <h2 class="text-4xl font-black">Your Cart Is Empty</h2>

      <NuxtLink to="/shop" class="rounded-2xl bg-[#FF4D00] px-8 py-4 font-bold">
        Continue Shopping
      </NuxtLink>
    </div>

    <!-- CONTENT -->
    <div v-else class="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <!-- CART ITEMS -->
      <div class="space-y-6 lg:col-span-8">
        <div
          v-for="(item, index) in cartStore.items"
          :key="index"
          class="flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#111111] p-5 md:flex-row"
        >
          <!-- IMAGE -->
          <div class="overflow-hidden rounded-2xl border border-white/10">
            <img
              :src="item.image"
              :alt="item.title"
              class="h-36 w-full object-cover md:w-36"
            />
          </div>

          <!-- INFO -->
          <div class="flex flex-1 flex-col justify-between gap-5">
            <div class="space-y-3">
              <div>
                <p class="text-sm uppercase tracking-widest text-[#FF4D00]">
                  {{ item.category }}
                </p>

                <h2 class="mt-2 text-3xl font-black">
                  {{ item.title }}
                </h2>
              </div>

              <!-- Variant -->
              <div class="flex flex-wrap items-center gap-6">
                <!-- Color -->
                <div class="flex items-center gap-3">
                  <p class="text-gray-400">Color:</p>

                  <div
                    class="h-6 w-6 rounded-full border border-white/20"
                    :style="{
                      backgroundColor: item.colorValue,
                    }"
                  />

                  <span class="font-semibold">
                    {{ item.color }}
                  </span>
                </div>

                <!-- Size -->
                <div class="flex items-center gap-3">
                  <p class="text-gray-400">Size:</p>

                  <span
                    class="rounded-xl border border-white/10 px-3 py-1 font-bold"
                  >
                    {{ item.size }}
                  </span>
                </div>
              </div>

              <!-- Price -->
              <div class="flex items-center gap-4">
                <span class="text-3xl font-black"> ${{ item.price }} </span>

                <span
                  v-if="item.oldPrice"
                  class="text-lg text-gray-500 line-through"
                >
                  ${{ item.oldPrice }}
                </span>
              </div>
            </div>

            <!-- Bottom -->
            <div
              class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
            >
              <!-- Quantity -->
              <div
                class="flex w-fit items-center overflow-hidden rounded-2xl border border-white/10"
              >
                <button
                  @click="cartStore.decreaseQuantity(index)"
                  class="px-5 py-3 text-xl transition hover:bg-white/10"
                >
                  -
                </button>

                <div
                  class="flex h-full min-w-[70px] items-center justify-center border-x border-white/10 font-bold"
                >
                  {{ item.quantity }}
                </div>

                <button
                  @click="cartStore.increaseQuantity(index)"
                  class="px-5 py-3 text-xl transition hover:bg-white/10"
                >
                  +
                </button>
              </div>

              <!-- Subtotal -->
              <div class="text-right">
                <p class="text-sm text-gray-400">Subtotal</p>

                <h3 class="text-2xl font-black text-[#FF4D00]">
                  ${{ item.price * item.quantity }}
                </h3>
              </div>

              <!-- Remove -->
              <button
                @click="cartStore.removeFromCart(index)"
                class="rounded-2xl border border-red-500 px-6 py-3 text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SUMMARY -->
      <div class="lg:col-span-4">
        <div
          class="sticky top-28 rounded-3xl border border-white/10 bg-[#111111] p-6"
        >
          <h2 class="text-3xl font-black">Order Summary</h2>

          <div class="mt-8 space-y-5">
            <div class="flex items-center justify-between">
              <p class="text-gray-400">Items</p>

              <span class="font-bold">
                {{ cartStore.totalItems }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <p class="text-gray-400">Shipping</p>

              <span class="font-bold text-green-500"> Free </span>
            </div>

            <div class="border-t border-white/10 pt-5">
              <div class="flex items-center justify-between">
                <p class="text-xl font-bold">Total</p>

                <span class="text-3xl font-black text-[#FF4D00]">
                  ${{ cartStore.totalPrice }}
                </span>
              </div>
            </div>
          </div>

          <button
            class="mt-8 w-full rounded-2xl bg-[#FF4D00] py-4 text-lg font-bold transition hover:opacity-90"
          >
            Proceed To Checkout
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();

onMounted(() => {
  cartStore.loadCart();
});
</script>

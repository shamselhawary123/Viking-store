<template>
  <!-- Overlay -->
  <Transition name="fade">
    <div
      v-if="cartStore.isOpen"
      @click="cartStore.closeCart()"
      class="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
    />
  </Transition>

  <!-- Drawer -->
  <Transition name="drawer">
    <div
      v-if="cartStore.isOpen"
      class="fixed right-0 top-0 z-[100] flex h-screen w-full max-w-md flex-col border-l border-white/10 bg-black"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between border-b border-white/10 p-6"
      >
        <div>
          <h2 class="text-3xl font-black">Your Cart</h2>

          <p class="mt-1 text-sm text-gray-400">
            {{ cartStore.totalItems }} Items
          </p>
        </div>

        <button
          @click="cartStore.closeCart()"
          class="rounded-xl border border-white/10 p-3 transition hover:border-[#FF4D00]"
        >
          ✕
        </button>
      </div>

      <!-- EMPTY -->
      <div
        v-if="!cartStore.items.length"
        class="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center"
      >
        <h3 class="text-3xl font-black">Your Cart Is Empty</h3>

        <NuxtLink
          to="/shop"
          @click="cartStore.closeCart()"
          class="rounded-2xl bg-[#FF4D00] px-8 py-4 font-bold"
        >
          Continue Shopping
        </NuxtLink>
      </div>

      <!-- ITEMS -->
      <div v-else class="flex-1 space-y-4 overflow-y-auto p-5">
        <div
          v-for="(item, index) in cartStore.items"
          :key="index"
          class="rounded-3xl border border-white/10 bg-[#111111] p-4"
        >
          <div class="flex gap-4">
            <!-- Image -->
            <img
              :src="item.image"
              :alt="item.title"
              class="h-24 w-24 rounded-2xl object-cover"
            />

            <!-- Content -->
            <div class="flex flex-1 flex-col justify-between">
              <div>
                <h3 class="line-clamp-1 text-xl font-bold">
                  {{ item.title }}
                </h3>

                <div
                  class="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-400"
                >
                  <span>
                    {{ item.color }}
                  </span>

                  <span>
                    {{ item.size }}
                  </span>
                </div>

                <p class="mt-3 text-2xl font-black">${{ item.price }}</p>
              </div>

              <!-- Bottom -->
              <div class="mt-4 flex items-center justify-between">
                <!-- Quantity -->
                <div
                  class="flex items-center overflow-hidden rounded-xl border border-white/10"
                >
                  <button
                    @click="cartStore.decreaseQuantity(index)"
                    class="px-3 py-2 transition hover:bg-white/10"
                  >
                    -
                  </button>

                  <div
                    class="flex min-w-[40px] items-center justify-center border-x border-white/10"
                  >
                    {{ item.quantity }}
                  </div>

                  <button
                    @click="cartStore.increaseQuantity(index)"
                    class="px-3 py-2 transition hover:bg-white/10"
                  >
                    +
                  </button>
                </div>

                <!-- Remove -->
                <button
                  @click="cartStore.removeFromCart(index)"
                  class="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="cartStore.items.length" class="border-t border-white/10 p-6">
        <div class="mb-6 flex items-center justify-between">
          <p class="text-lg text-gray-400">Total</p>

          <h3 class="text-4xl font-black text-[#FF4D00]">
            ${{ cartStore.totalPrice }}
          </h3>
        </div>

        <div class="space-y-3">
          <NuxtLink
            to="/cart"
            @click="cartStore.closeCart()"
            class="flex w-full items-center justify-center rounded-2xl border border-white/10 py-4 font-bold transition hover:border-[#FF4D00]"
          >
            View Cart
          </NuxtLink>

          <button
            class="w-full rounded-2xl bg-[#FF4D00] py-4 font-bold transition hover:opacity-90"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useCartStore } from "../../stores/cart";

const cartStore = useCartStore();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>

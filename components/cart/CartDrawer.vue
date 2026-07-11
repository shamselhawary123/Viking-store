<template>
  <Transition name="fade">
    <div
      v-if="cartStore.isOpen"
      class="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm"
      aria-hidden="true"
      @click="cartStore.closeCart()"
    />
  </Transition>

  <Transition name="drawer">
    <aside
      v-if="cartStore.isOpen"
      class="fixed right-0 top-0 z-[100] flex h-dvh w-full max-w-md flex-col border-l border-white/10 bg-[#070707]"
      aria-label="Shopping cart"
    >
      <div class="flex items-center justify-between border-b border-white/10 p-6">
        <div>
          <p class="eyebrow">Viking cart</p>
          <h2 class="mt-2 text-3xl font-black">Your Bag</h2>
          <p class="mt-1 text-sm text-neutral-400">{{ cartStore.totalItems }} items selected</p>
        </div>

        <button
          class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition hover:border-[#FF4D00] hover:text-[#FF4D00]"
          aria-label="Close cart"
          @click="cartStore.closeCart()"
        >
          <Icon name="i-heroicons-x-mark" class="text-xl" />
        </button>
      </div>

      <div
        v-if="!cartStore.items.length"
        class="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center"
      >
        <div class="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#FF4D00]">
          <Icon name="i-heroicons-shopping-bag" class="text-4xl" />
        </div>
        <div>
          <h3 class="text-3xl font-black">Your Bag Is Empty</h3>
          <p class="mt-3 text-neutral-400">Add fight-tested gear and it will appear here.</p>
        </div>
        <NuxtLink to="/shop" class="premium-button premium-button-primary" @click="cartStore.closeCart()">
          Continue Shopping
        </NuxtLink>
      </div>

      <div v-else class="flex-1 space-y-4 overflow-y-auto p-5">
        <article
          v-for="(item, index) in cartStore.items"
          :key="`${item.id}-${item.color}-${item.size}-${index}`"
          class="premium-panel rounded-2xl p-4"
        >
          <div class="flex gap-4">
            <img :src="item.image" :alt="item.title" class="h-24 w-24 rounded-xl object-cover" />

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate text-base font-black">{{ item.title }}</h3>
                  <p class="mt-1 text-sm text-neutral-400">{{ item.color }} / {{ item.size }}</p>
                </div>
                <button
                  class="text-neutral-500 transition hover:text-red-400"
                  aria-label="Remove item from cart"
                  @click="cartStore.removeFromCart(index)"
                >
                  <Icon name="i-heroicons-trash" class="text-lg" />
                </button>
              </div>

              <div class="mt-4 flex items-center justify-between gap-3">
                <div class="flex items-center overflow-hidden rounded-full border border-white/10">
                  <button
                    class="flex h-9 w-9 items-center justify-center transition hover:bg-white/10"
                    aria-label="Decrease quantity"
                    @click="cartStore.decreaseQuantity(index)"
                  >
                    <Icon name="i-heroicons-minus" />
                  </button>
                  <div class="flex h-9 min-w-10 items-center justify-center border-x border-white/10 text-sm font-black">
                    {{ item.quantity }}
                  </div>
                  <button
                    class="flex h-9 w-9 items-center justify-center transition hover:bg-white/10"
                    aria-label="Increase quantity"
                    @click="cartStore.increaseQuantity(index)"
                  >
                    <Icon name="i-heroicons-plus" />
                  </button>
                </div>

                <p class="text-xl font-black text-[#FF4D00]">${{ item.price * item.quantity }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-if="cartStore.items.length" class="border-t border-white/10 p-6">
        <div class="mb-6 space-y-3">
          <div class="flex items-center justify-between text-sm text-neutral-400">
            <span>Subtotal</span>
            <span class="font-bold text-white">${{ cartStore.totalPrice }}</span>
          </div>
          <div class="flex items-center justify-between text-sm text-neutral-400">
            <span>Shipping</span>
            <span class="font-bold text-emerald-400">Free</span>
          </div>
          <div class="flex items-center justify-between border-t border-white/10 pt-4">
            <span class="text-lg font-black">Total</span>
            <span class="text-3xl font-black text-[#FF4D00]">${{ cartStore.totalPrice }}</span>
          </div>
        </div>

        <div class="grid gap-3">
          <NuxtLink to="/cart" class="premium-button premium-button-secondary w-full" @click="cartStore.closeCart()">
            View Cart
          </NuxtLink>
          <button class="premium-button premium-button-primary w-full" @click="handleCheckout">
            Checkout
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { useCartStore } from "../../stores/cart";

const router = useRouter();
const cartStore = useCartStore(usePinia());

const handleCheckout = () => {
  cartStore.closeCart();
  router.push("/checkout");
};
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
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>

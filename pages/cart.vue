<template>
  <section class="container-premium section-premium">
    <div class="mb-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="eyebrow">Shopping bag</p>
        <h1 class="display-heading mt-3 text-6xl text-white md:text-7xl">Cart</h1>
        <p class="mt-3 text-neutral-400">{{ cartStore.totalItems }} items ready for checkout.</p>
      </div>

      <button v-if="cartStore.items.length" class="premium-button rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white" @click="cartStore.clearCart()">
        <Icon name="i-heroicons-trash" />
        Clear Cart
      </button>
    </div>

    <div v-if="!cartStore.items.length" class="premium-panel flex min-h-[420px] flex-col items-center justify-center gap-5 rounded-2xl p-8 text-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-[#FF4D00]">
        <Icon name="i-heroicons-shopping-bag" class="text-4xl" />
      </div>
      <div>
        <h2 class="text-3xl font-black">Your Cart Is Empty</h2>
        <p class="mt-3 text-neutral-400">Start with gloves, wraps, shorts, or protection built for daily training.</p>
      </div>
      <NuxtLink to="/shop" class="premium-button premium-button-primary">Continue Shopping</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div class="space-y-5 lg:col-span-8">
        <article
          v-for="(item, index) in cartStore.items"
          :key="`${item.id}-${item.color}-${item.size}-${index}`"
          class="premium-panel rounded-2xl p-5"
        >
          <div class="flex flex-col gap-5 md:flex-row">
            <img :src="item.image" :alt="item.title" class="h-40 w-full rounded-xl object-cover md:w-40" />

            <div class="flex flex-1 flex-col justify-between gap-5">
              <div>
                <p class="eyebrow text-[0.65rem]">{{ item.category || "Combat Gear" }}</p>
                <h2 class="mt-2 text-2xl font-black">{{ item.title }}</h2>
                <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                  <span class="inline-flex items-center gap-2">
                    <span v-if="item.colorValue" class="h-4 w-4 rounded-full border border-white/20" :style="{ backgroundColor: item.colorValue }" />
                    {{ item.color || "Default color" }}
                  </span>
                  <span class="rounded-full border border-white/10 px-3 py-1 font-bold text-white">{{ item.size }}</span>
                </div>
              </div>

              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="flex w-fit items-center overflow-hidden rounded-full border border-white/10">
                  <button class="flex h-11 w-11 items-center justify-center transition hover:bg-white/10" aria-label="Decrease quantity" @click="cartStore.decreaseQuantity(index)">
                    <Icon name="i-heroicons-minus" />
                  </button>
                  <div class="flex h-11 min-w-14 items-center justify-center border-x border-white/10 font-black">{{ item.quantity }}</div>
                  <button class="flex h-11 w-11 items-center justify-center transition hover:bg-white/10" aria-label="Increase quantity" @click="cartStore.increaseQuantity(index)">
                    <Icon name="i-heroicons-plus" />
                  </button>
                </div>

                <div class="flex items-center justify-between gap-5 md:justify-end">
                  <div class="text-right">
                    <p class="text-sm text-neutral-500">Subtotal</p>
                    <h3 class="text-2xl font-black text-[#FF4D00]">${{ item.price * item.quantity }}</h3>
                  </div>
                  <button class="flex h-11 w-11 items-center justify-center rounded-full border border-red-500/30 text-red-300 transition hover:bg-red-500 hover:text-white" aria-label="Remove item" @click="cartStore.removeFromCart(index)">
                    <Icon name="i-heroicons-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="lg:col-span-4">
        <aside class="premium-panel sticky top-28 rounded-2xl p-6">
          <p class="eyebrow">Summary</p>
          <h2 class="mt-2 text-3xl font-black">Order Total</h2>

          <div class="mt-8 space-y-5">
            <div class="flex items-center justify-between">
              <p class="text-neutral-400">Items</p>
              <span class="font-bold">{{ cartStore.totalItems }}</span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-neutral-400">Shipping</p>
              <span class="font-bold text-emerald-400">Free</span>
            </div>
            <div class="border-t border-white/10 pt-5">
              <div class="flex items-center justify-between">
                <p class="text-xl font-black">Total</p>
                <span class="text-3xl font-black text-[#FF4D00]">${{ cartStore.totalPrice }}</span>
              </div>
            </div>
          </div>

          <button class="premium-button premium-button-primary mt-8 w-full" @click="handleCheckout">
            Checkout
          </button>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore(usePinia());
const router = useRouter();

const handleCheckout = () => {
  router.push("/checkout");
};

onMounted(() => {
  cartStore.loadCart();
});
</script>

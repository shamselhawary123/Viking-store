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
      class="fixed top-0 z-[100] flex h-dvh w-full max-w-md flex-col border-white/10 bg-[#070707]"
      :class="isRtl ? 'left-0 border-r' : 'right-0 border-l'"
      :aria-label="t('nav.cart')"
    >
      <div class="flex items-center justify-between border-b border-white/10 p-6">
        <div>
          <p class="eyebrow">{{ t('cart.vikingCart') }}</p>
          <h2 class="mt-2 text-3xl font-black">{{ t('cart.yourBag') }}</h2>
          <p class="mt-1 text-sm text-neutral-400">{{ t('cart.itemsSelected', { count: cartStore.totalItems }) }}</p>
        </div>

        <button
          class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition hover:border-[#FF4D00] hover:text-[#FF4D00]"
          :aria-label="t('cart.closeCart')"
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
          <h3 class="text-3xl font-black">{{ t('cart.emptyBag') }}</h3>
          <p class="mt-3 text-neutral-400">{{ t('cart.emptyBagText') }}</p>
        </div>
        <NuxtLink to="/shop" class="premium-button premium-button-primary" @click="cartStore.closeCart()">
          {{ t('cart.continueShopping') }}
        </NuxtLink>
      </div>

      <div v-else class="flex-1 space-y-4 overflow-y-auto p-5">
        <article
          v-for="(item, index) in cartStore.items"
          :key="`${item.id}-${item.color}-${item.size}-${index}`"
          class="premium-panel rounded-2xl p-4"
        >
          <div class="flex gap-4">
            <img :src="item.image" :alt="item.title" width="96" height="96" class="h-24 w-24 rounded-xl object-cover" loading="lazy" decoding="async" />

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate text-base font-black">{{ item.title }}</h3>
                  <p class="mt-1 text-sm text-neutral-400">{{ item.color }} / {{ item.size }}</p>
                </div>
                <button
                  class="text-neutral-500 transition hover:text-red-400"
                  :aria-label="t('cart.removeItemFromCart')"
                  @click="cartStore.removeFromCart(index)"
                >
                  <Icon name="i-heroicons-trash" class="text-lg" />
                </button>
              </div>

              <div class="mt-4 flex items-center justify-between gap-3">
                <div class="flex items-center overflow-hidden rounded-full border border-white/10">
                  <button
                    class="flex h-9 w-9 items-center justify-center transition hover:bg-white/10"
                    :aria-label="t('cart.decreaseQuantity')"
                    @click="cartStore.decreaseQuantity(index)"
                  >
                    <Icon name="i-heroicons-minus" />
                  </button>
                  <div class="flex h-9 min-w-10 items-center justify-center border-x border-white/10 text-sm font-black">
                    {{ item.quantity }}
                  </div>
                  <button
                    class="flex h-9 w-9 items-center justify-center transition hover:bg-white/10"
                    :aria-label="t('cart.increaseQuantity')"
                    @click="cartStore.increaseQuantity(index)"
                  >
                    <Icon name="i-heroicons-plus" />
                  </button>
                </div>

                <p class="text-xl font-black text-[#FF4D00]">{{ formatStorePrice(item.price * item.quantity, locale) }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-if="cartStore.items.length" class="border-t border-white/10 p-6">
        <div class="mb-6 space-y-3">
          <div class="flex items-center justify-between text-sm text-neutral-400">
            <span>{{ t('common.subtotal') }}</span>
            <span class="font-bold text-white">{{ formatStorePrice(cartStore.totalPrice, locale) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm text-neutral-400">
            <span>{{ t('common.shipping') }}</span>
            <span class="font-bold text-emerald-400">{{ t('common.free') }}</span>
          </div>
          <div class="flex items-center justify-between border-t border-white/10 pt-4">
            <span class="text-lg font-black">{{ t('common.total') }}</span>
            <span class="text-3xl font-black text-[#FF4D00]">{{ formatStorePrice(cartStore.totalPrice, locale) }}</span>
          </div>
        </div>

        <div class="grid gap-3">
          <NuxtLink to="/cart" class="premium-button premium-button-secondary w-full" @click="cartStore.closeCart()">
            {{ t('cart.viewCart') }}
          </NuxtLink>
          <button class="premium-button premium-button-primary w-full" @click="handleCheckout">
            {{ t('cart.checkout') }}
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { useCartStore } from "../../stores/cart";
import { formatStorePrice } from "../../utils/localizationFormat";

const router = useRouter();
const cartStore = useCartStore(usePinia());
const { locale, t } = useI18n();
const isRtl = computed(() => locale.value === "ar");

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

html[dir="rtl"] .drawer-enter-from,
html[dir="rtl"] .drawer-leave-to {
  transform: translateX(-100%);
}
</style>

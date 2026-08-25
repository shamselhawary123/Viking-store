<template>
  <section class="container-premium section-premium">
    <div class="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="eyebrow">{{ t('cart.shoppingBag') }}</p>
          <h1 class="display-heading mt-3 text-6xl text-white md:text-8xl">{{ t('cart.title') }}</h1>
          <p class="mt-3 max-w-2xl text-neutral-400">{{ t('cart.itemsReady', { count: cartStore.totalItems }) }}</p>
      </div>

        <button v-if="cartStore.items.length" class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-500/30 px-5 font-extrabold text-red-300 transition duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white active:scale-[0.98]" @click="cartStore.clearCart()">
        <Icon name="i-heroicons-trash" />
        {{ t('cart.clear') }}
      </button>
      </div>
    </div>

    <div v-if="!cartStore.items.length" class="premium-panel relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center">
      <img
        src="https://images.unsplash.com/photo-1517438476312-10d79c077509?q=60&w=900&auto=format&fit=crop"
        alt=""
        width="900"
        height="600"
        class="absolute inset-0 h-full w-full object-cover opacity-15"
        loading="lazy"
        decoding="async"
      />
      <div class="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-[#CF1D1D]">
        <Icon name="i-heroicons-shopping-bag" class="text-4xl" />
      </div>
      <div class="relative">
        <h2 class="text-4xl font-black text-white">{{ t('cart.empty') }}</h2>
        <p class="mx-auto mt-3 max-w-md leading-7 text-neutral-400">{{ t('cart.emptyText') }}</p>
      </div>
      <NuxtLink to="/shop" class="premium-button premium-button-primary relative">{{ t('cart.continueShopping') }}</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div class="space-y-5 lg:col-span-8">
        <div class="rounded-2xl border border-white/10 bg-[#171717] p-5">
          <div class="mb-3 flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-black uppercase tracking-[0.16em] text-[#CF1D1D]">{{ t('cart.shippingProgress') }}</p>
              <p class="mt-1 text-sm text-neutral-400">{{ t('cart.freeShippingUnlocked') }}</p>
            </div>
            <Icon name="i-heroicons-truck" class="text-2xl text-[#CF1D1D]" />
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full bg-[#CF1D1D] transition-all duration-700" :style="{ width: `${shippingProgress}%` }" />
          </div>
        </div>

        <TransitionGroup name="cart-item" tag="div" class="space-y-5">
        <article
          v-for="(item, index) in cartStore.items"
          :key="`${item.id}-${item.color}-${item.size}-${index}`"
            class="premium-panel group rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-[#CF1D1D]/60"
        >
          <div class="flex flex-col gap-5 md:flex-row">
              <img :src="item.image" :alt="item.title" width="320" height="320" class="h-48 w-full rounded-xl object-cover md:h-40 md:w-40" loading="lazy" decoding="async" />

            <div class="flex flex-1 flex-col justify-between gap-5">
              <div>
                <p class="eyebrow text-[0.65rem]">{{ item.category || t('shop.combatGear') }}</p>
                <h2 class="mt-2 text-2xl font-black">{{ item.title }}</h2>
                <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                  <span class="inline-flex items-center gap-2">
                    <span v-if="item.colorValue" class="h-4 w-4 rounded-full border border-white/20" :style="{ backgroundColor: item.colorValue }" />
                    {{ item.color || t('cart.defaultColor') }}
                  </span>
                  <span class="rounded-full border border-white/10 px-3 py-1 font-bold text-white">{{ item.size }}</span>
                </div>
              </div>

              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div class="flex w-fit items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
                    <button class="flex h-12 w-12 items-center justify-center transition hover:bg-white/10 active:scale-95" :aria-label="t('cart.decreaseQuantity')" @click="cartStore.decreaseQuantity(index)">
                    <Icon name="i-heroicons-minus" />
                  </button>
                    <div class="flex h-12 min-w-16 items-center justify-center border-x border-white/10 font-black">{{ item.quantity }}</div>
                    <button class="flex h-12 w-12 items-center justify-center transition hover:bg-white/10 active:scale-95" :aria-label="t('cart.increaseQuantity')" @click="cartStore.increaseQuantity(index)">
                    <Icon name="i-heroicons-plus" />
                  </button>
                </div>

                <div class="flex items-center justify-between gap-5 md:justify-end">
                  <div class="text-right">
                    <p class="text-sm text-neutral-500">{{ t('common.subtotal') }}</p>
                    <h3 class="text-2xl font-black text-[#CF1D1D]">{{ formatStorePrice(item.price * item.quantity, locale) }}</h3>
                  </div>
                    <button class="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 text-red-300 transition hover:-translate-y-0.5 hover:bg-red-500 hover:text-white active:scale-95" :aria-label="t('cart.removeItem')" @click="cartStore.removeFromCart(index)">
                    <Icon name="i-heroicons-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
        </TransitionGroup>
      </div>

      <div class="lg:col-span-4">
        <aside class="premium-panel sticky top-28 rounded-2xl p-6">
          <p class="eyebrow">{{ t('cart.summary') }}</p>
          <h2 class="mt-2 text-3xl font-black">{{ t('cart.orderTotal') }}</h2>
          <p v-if="cartStore.quantityErrorKey" class="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
            {{ t(cartStore.quantityErrorKey) }}
          </p>

          <div class="mt-8 space-y-5">
            <div class="flex items-center justify-between">
              <p class="text-neutral-400">{{ t('cart.items') }}</p>
              <span class="font-bold">{{ cartStore.totalItems }}</span>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-neutral-400">{{ t('common.shipping') }}</p>
              <span class="font-bold text-emerald-400">{{ t('common.free') }}</span>
            </div>
            <div class="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div class="flex items-start gap-3">
                <Icon name="i-heroicons-calendar-days" class="mt-1 text-xl text-[#CF1D1D]" />
                <div>
                  <p class="font-black text-white">{{ t('cart.estimatedDelivery') }}</p>
                  <p class="mt-1 text-sm leading-6 text-neutral-400">{{ estimatedDelivery }}</p>
                </div>
              </div>
            </div>
            <div class="border-t border-white/10 pt-5">
              <div class="flex items-center justify-between">
                <p class="text-xl font-black">{{ t('common.total') }}</p>
                <span class="text-3xl font-black text-[#CF1D1D]">{{ formatStorePrice(cartStore.totalPrice, locale) }}</span>
              </div>
            </div>
          </div>

          <button class="premium-button premium-button-primary mt-8 w-full" @click="handleCheckout">
            {{ t('cart.secureCheckout') }}
            <Icon name="i-heroicons-lock-closed" />
          </button>

          <div class="mt-5 grid grid-cols-3 gap-2 text-center">
            <div v-for="badge in trustBadges" :key="badge.label" class="rounded-xl border border-white/10 bg-black/25 p-3">
              <Icon :name="badge.icon" class="mx-auto text-xl text-[#CF1D1D]" />
              <p class="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-neutral-400">{{ t(badge.labelKey) }}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCartStore } from "../stores/cart";
import { formatStorePrice } from "../utils/localizationFormat";

const cartStore = useCartStore(usePinia());
const router = useRouter();
const { locale, t } = useI18n();
const estimatedDelivery = computed(() => t("cart.estimatedDeliveryValue"));
const trustBadges = [
  { icon: "i-heroicons-lock-closed", labelKey: "cart.secure" },
  { icon: "i-heroicons-shield-check", labelKey: "cart.protected" },
  { icon: "i-heroicons-arrow-path-rounded-square", labelKey: "cart.returns" },
];
const shippingProgress = computed(() => (cartStore.items.length ? 100 : 0));

const handleCheckout = () => {
  router.push("/checkout");
};

onMounted(() => {
  cartStore.loadCart();
});
</script>

<style scoped>
.cart-item-enter-active,
.cart-item-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.cart-item-enter-from,
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>

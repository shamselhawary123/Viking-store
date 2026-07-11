<template>
  <section class="container-premium section-premium">
    <div class="mb-10">
      <p class="eyebrow">Secure checkout</p>
      <h1 class="display-heading mt-3 text-6xl text-white md:text-7xl">Checkout</h1>
      <p class="mt-4 max-w-2xl text-neutral-400">Confirm shipping details and place your Viking Store order.</p>
    </div>

    <div v-if="!cartStore.items.length" class="premium-panel rounded-2xl p-10 text-center md:p-16">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-[#FF4D00]">
        <Icon name="i-heroicons-shopping-bag" class="text-4xl" />
      </div>
      <h2 class="mt-6 text-3xl font-black">Your Cart Is Empty</h2>
      <p class="mx-auto mt-3 max-w-md text-neutral-400">Add training gear before starting checkout.</p>
      <NuxtLink to="/shop" class="premium-button premium-button-primary mt-8">Shop Products</NuxtLink>
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form class="premium-panel space-y-8 rounded-2xl p-6 md:p-8" @submit.prevent="handleCheckout">
        <div>
          <h2 class="text-2xl font-black">Shipping Details</h2>
          <p class="mt-2 text-sm text-neutral-400">Use accurate details so delivery can be confirmed quickly.</p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            First Name
            <input v-model="firstName" required class="premium-input" autocomplete="given-name" />
          </label>
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            Last Name
            <input v-model="lastName" required class="premium-input" autocomplete="family-name" />
          </label>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            Phone Number
            <input v-model="phone" required class="premium-input" autocomplete="tel" />
          </label>
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            Address
            <input v-model="address" required class="premium-input" autocomplete="street-address" />
          </label>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            City
            <input v-model="city" required class="premium-input" autocomplete="address-level2" />
          </label>
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            Governorate
            <input v-model="governorate" class="premium-input" autocomplete="address-level1" />
          </label>
        </div>

        <label class="grid gap-2 text-sm font-bold text-neutral-300">
          Notes
          <textarea v-model="notes" rows="4" placeholder="Optional delivery notes" class="premium-input h-auto py-4" />
        </label>

        <div>
          <h2 class="mb-4 text-2xl font-black">Payment Method</h2>
          <div class="flex items-center gap-4 rounded-2xl border border-[#FF4D00] bg-[#FF4D00]/10 p-5">
            <Icon name="i-heroicons-banknotes" class="text-3xl text-[#FF4D00]" />
            <div>
              <p class="font-black text-white">Cash On Delivery</p>
              <p class="mt-1 text-sm text-neutral-400">Pay when your order arrives.</p>
            </div>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="premium-button premium-button-primary w-full">
          {{ loading ? "Placing Order..." : "Place Order" }}
        </button>
      </form>

      <aside class="space-y-6">
        <div class="premium-panel rounded-2xl p-6 md:p-8">
          <h2 class="mb-6 text-2xl font-black">Order Summary</h2>

          <div class="space-y-5">
            <div v-for="item in cartStore.items" :key="`${item.id}-${item.size}-${item.color}`" class="flex gap-4 border-b border-white/10 pb-5">
              <img :src="item.image" :alt="item.title" class="h-20 w-20 rounded-xl object-cover" />
              <div class="min-w-0 flex-1">
                <h3 class="truncate font-black">{{ item.title }}</h3>
                <p class="mt-1 text-sm text-neutral-400">{{ item.color }} / {{ item.size }} / Qty {{ item.quantity }}</p>
              </div>
              <div class="font-black">${{ item.price * item.quantity }}</div>
            </div>
          </div>

          <div class="space-y-4 pt-6">
            <div class="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span class="font-bold text-white">${{ cartStore.totalPrice }}</span>
            </div>
            <div class="flex justify-between text-neutral-400">
              <span>Shipping</span>
              <span class="font-bold text-emerald-400">Free</span>
            </div>
            <div class="flex justify-between border-t border-white/10 pt-6 text-2xl font-black">
              <span>Total</span>
              <span class="text-[#FF4D00]">${{ cartStore.totalPrice }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";

const cartStore = useCartStore(usePinia());
const authStore = useAuthStore(usePinia());

const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const city = ref("");
const notes = ref("");
const address = ref("");
const governorate = ref("");
const loading = ref(false);

onMounted(() => {
  cartStore.loadCart();
});

const handleCheckout = async () => {
  try {
    loading.value = true;

    await authStore.createOrder(cartStore.items, cartStore.totalPrice, {
      fullName: `${firstName.value} ${lastName.value}`,
      phone: phone.value,
      city: city.value,
      notes: notes.value,
      address: address.value,
      governorate: governorate.value,
    });

    cartStore.clearCart();
    await navigateTo("/profile/orders");
  } catch (error: any) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
};
</script>

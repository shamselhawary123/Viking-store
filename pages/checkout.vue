<template>
  <section class="container-premium section-premium">
    <div class="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <p class="eyebrow">Secure checkout</p>
      <h1 class="display-heading mt-3 text-6xl text-white md:text-8xl">Checkout</h1>
      <p class="mt-4 max-w-2xl leading-7 text-neutral-400">Choose guest checkout or continue with your Viking account.</p>
    </div>

    <div v-if="!cartStore.items.length" class="premium-panel relative overflow-hidden rounded-2xl p-10 text-center md:p-16">
      <img src="https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=1400&auto=format&fit=crop" alt="" class="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div class="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-[#FF4D00]">
        <Icon name="i-heroicons-shopping-bag" class="text-4xl" />
      </div>
      <h2 class="relative mt-6 text-3xl font-black text-white">Your Cart Is Empty</h2>
      <p class="relative mx-auto mt-3 max-w-md text-neutral-400">Add training gear before starting checkout.</p>
      <NuxtLink to="/shop" class="premium-button premium-button-primary relative mt-8">Shop Products</NuxtLink>
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form class="space-y-6" @submit.prevent="handleCheckout">
        <div class="grid gap-4 md:grid-cols-2">
          <button type="button" class="checkout-choice" :class="{ active: checkoutMode === 'guest' }" @click="checkoutMode = 'guest'">
            <Icon name="i-heroicons-user" class="text-3xl text-[#FF4D00]" />
            <span class="mt-4 block text-2xl font-black text-white">Continue as Guest</span>
            <span class="mt-2 block leading-7 text-neutral-400">No account required. We only need delivery details.</span>
          </button>
          <button type="button" class="checkout-choice" :class="{ active: checkoutMode === 'account' }" @click="checkoutMode = 'account'">
            <Icon name="i-heroicons-identification" class="text-3xl text-[#FF4D00]" />
            <span class="mt-4 block text-2xl font-black text-white">Continue with Account</span>
            <span class="mt-2 block leading-7 text-neutral-400">Use your profile details and keep order history.</span>
          </button>
        </div>

        <div v-if="checkoutMode === 'account' && !authStore.user" class="premium-panel rounded-2xl p-6 md:p-8">
          <h2 class="text-2xl font-black text-white">Sign in to continue with account</h2>
          <p class="mt-3 leading-7 text-neutral-400">Login or create an account to save this order under your profile.</p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/auth/login" class="premium-button premium-button-primary">Login</NuxtLink>
            <NuxtLink to="/auth/register" class="premium-button premium-button-secondary">Register</NuxtLink>
          </div>
        </div>

        <div v-else class="premium-panel rounded-2xl p-6 md:p-8">
          <div class="mb-7 flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#FF4D00]/30 bg-[#FF4D00]/10 text-[#FF4D00]">
              <Icon name="i-heroicons-map-pin" class="text-2xl" />
            </div>
            <div>
              <h2 class="text-2xl font-black text-white">Shipping Information</h2>
              <p class="mt-2 text-sm leading-6 text-neutral-400">
                {{ checkoutMode === "guest" ? "Guest checkout does not require email." : "Profile information is prefilled when available." }}
              </p>
            </div>
          </div>

          <label class="floating-field">
            <input v-model="fullName" required class="floating-input" autocomplete="name" placeholder=" " />
            <span>Full Name</span>
          </label>

          <div class="mt-5 grid gap-5 md:grid-cols-2">
            <label class="floating-field">
              <input v-model="phone" required class="floating-input" autocomplete="tel" placeholder=" " />
              <span>Phone</span>
            </label>
            <label class="floating-field">
              <input v-model="city" required class="floating-input" autocomplete="address-level2" placeholder=" " />
              <span>City</span>
            </label>
          </div>

          <label class="floating-field mt-5">
            <input v-model="address" required class="floating-input" autocomplete="street-address" placeholder=" " />
            <span>Address</span>
          </label>

          <label class="floating-field mt-5">
            <textarea v-model="notes" rows="4" placeholder=" " class="floating-input h-auto min-h-32 py-5" />
            <span>Notes Optional</span>
          </label>
        </div>

        <div v-if="canSubmit" class="premium-panel rounded-2xl p-6 md:p-8">
          <div class="flex items-center gap-4 rounded-2xl border border-[#FF4D00] bg-[#FF4D00]/10 p-5">
            <Icon name="i-heroicons-banknotes" class="text-3xl text-[#FF4D00]" />
            <div>
              <p class="font-black text-white">Cash On Delivery</p>
              <p class="mt-1 text-sm text-neutral-400">Pay when your order arrives.</p>
            </div>
            <Icon name="i-heroicons-check-circle-solid" class="ml-auto text-2xl text-emerald-400" />
          </div>
        </div>

        <p v-if="errorMessage" class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-300">
          {{ errorMessage }}
        </p>

        <button v-if="canSubmit" type="submit" :disabled="loading" class="premium-button premium-button-primary w-full text-base active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50">
          <Icon :name="loading ? 'i-heroicons-arrow-path' : 'i-heroicons-lock-closed'" :class="{ 'animate-spin': loading }" />
          {{ loading ? "Placing Order..." : checkoutMode === "guest" ? "Place Guest Order" : "Place Account Order" }}
        </button>
      </form>

      <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <div class="premium-panel rounded-2xl p-6 md:p-8">
          <p class="eyebrow">Summary</p>
          <h2 class="mt-2 text-2xl font-black text-white">Order Summary</h2>
          <div class="mt-6 space-y-5">
            <div v-for="item in cartStore.items" :key="`${item.id}-${item.size}-${item.color}`" class="flex gap-4 border-b border-white/10 pb-5">
              <img :src="item.image" :alt="item.title" class="h-20 w-20 rounded-xl object-cover" loading="lazy" />
              <div class="min-w-0 flex-1">
                <h3 class="truncate font-black">{{ item.title }}</h3>
                <p class="mt-1 text-sm text-neutral-400">{{ item.color }} / {{ item.size }} / Qty {{ item.quantity }}</p>
              </div>
              <div class="font-black">${{ item.price * item.quantity }}</div>
            </div>
          </div>
          <div class="space-y-4 pt-6">
            <div class="flex justify-between text-neutral-400"><span>Subtotal</span><span class="font-bold text-white">${{ cartStore.totalPrice }}</span></div>
            <div class="flex justify-between text-neutral-400"><span>Shipping</span><span class="font-bold text-emerald-400">Free</span></div>
            <div class="flex justify-between border-t border-white/10 pt-6 text-2xl font-black"><span>Total</span><span class="text-[#FF4D00]">${{ cartStore.totalPrice }}</span></div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";

const cartStore = useCartStore(usePinia());
const authStore = useAuthStore(usePinia());
const supabase = useSupabase();

const checkoutMode = ref<"guest" | "account">("guest");
const fullName = ref("");
const phone = ref("");
const city = ref("");
const notes = ref("");
const address = ref("");
const loading = ref(false);
const errorMessage = ref("");
const canSubmit = computed(() => checkoutMode.value === "guest" || Boolean(authStore.user));

onMounted(async () => {
  cartStore.loadCart();
  if (!authStore.user) {
    await authStore.getUser();
  }

  if (authStore.user) {
    checkoutMode.value = "account";

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authStore.user.id)
        .single();

      fullName.value = profile?.full_name || authStore.user?.user_metadata?.full_name || "";
      phone.value = profile?.phone || "";
      city.value = profile?.city || "";
      address.value = profile?.address || "";
    } catch {
      fullName.value = authStore.user?.user_metadata?.full_name || "";
    }
  }
});

const handleCheckout = async () => {
  try {
    if (!canSubmit.value) return;

    errorMessage.value = "";
    loading.value = true;

    const order = await authStore.createOrder(cartStore.items, cartStore.totalPrice, {
      isGuest: checkoutMode.value === "guest",
      user: checkoutMode.value === "account" ? authStore.user : null,
      fullName: fullName.value,
      phone: phone.value,
      city: city.value,
      notes: notes.value,
      address: address.value,
    });

    cartStore.clearCart();
    await navigateTo(`/order-success?order=${order.id}`);
  } catch (error: any) {
    errorMessage.value = error?.message || "Could not place order. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.checkout-choice {
  min-height: 12rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  text-align: left;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.checkout-choice:hover,
.checkout-choice.active {
  border-color: rgba(255, 77, 0, 0.75);
  background: rgba(255, 77, 0, 0.08);
  transform: translateY(-2px);
}

.checkout-choice.active {
  box-shadow: 0 0 0 4px rgba(255, 77, 0, 0.1);
}

.floating-field {
  position: relative;
  display: block;
}

.floating-input {
  min-height: 3.75rem;
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.42);
  padding: 1.35rem 1rem 0.55rem;
  color: #ffffff;
  outline: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.floating-input:focus {
  border-color: #ff4d00;
  box-shadow: 0 0 0 4px rgba(255, 77, 0, 0.12);
}

.floating-input:invalid:not(:placeholder-shown) {
  border-color: rgba(248, 113, 113, 0.65);
}

.floating-field span {
  pointer-events: none;
  position: absolute;
  left: 1rem;
  top: 1.15rem;
  color: #a3a3a3;
  font-size: 0.875rem;
  font-weight: 800;
  transition:
    color 180ms ease,
    transform 180ms ease,
    font-size 180ms ease;
}

.floating-input:focus + span,
.floating-input:not(:placeholder-shown) + span {
  color: #ff4d00;
  font-size: 0.7rem;
  transform: translateY(-0.68rem);
}
</style>

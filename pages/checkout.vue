<template>
  <section class="container-premium section-premium">
    <div
      class="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
    >
      <p class="eyebrow">{{ t("checkout.eyebrow") }}</p>
      <h1 class="display-heading mt-3 text-6xl text-white md:text-8xl">
        {{ t("checkout.title") }}
      </h1>
      <p class="mt-4 max-w-2xl leading-7 text-neutral-400">
        {{ t("checkout.lead") }}
      </p>
    </div>

    <div
      v-if="!cartStore.items.length"
      class="premium-panel relative overflow-hidden rounded-2xl p-10 text-center md:p-16"
    >
      <img
        src="https://images.unsplash.com/photo-1517438476312-10d79c077509?q=60&w=900&auto=format&fit=crop"
        alt=""
        width="900"
        height="600"
        class="absolute inset-0 h-full w-full object-cover opacity-15"
        loading="lazy"
        decoding="async"
      />
      <div
        class="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black text-[#CF1D1D]"
      >
        <Icon name="i-heroicons-shopping-bag" class="text-4xl" />
      </div>
      <h2 class="relative mt-6 text-3xl font-black text-white">
        {{ t("cart.empty") }}
      </h2>
      <p class="relative mx-auto mt-3 max-w-md text-neutral-400">
        {{ t("cart.emptyText") }}
      </p>
      <NuxtLink
        to="/shop"
        class="premium-button premium-button-primary relative mt-8"
        >{{ t("common.products") }}</NuxtLink
      >
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <form class="space-y-6" @submit.prevent="handleCheckout">
        <div class="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            class="checkout-choice"
            :class="{ active: checkoutMode === 'guest' }"
            @click="checkoutMode = 'guest'"
          >
            <Icon name="i-heroicons-user" class="text-3xl text-[#CF1D1D]" />
            <span class="mt-4 block text-2xl font-black text-white">{{
              t("checkout.guestTitle")
            }}</span>
            <span class="mt-2 block leading-7 text-neutral-400">{{
              t("checkout.guestText")
            }}</span>
          </button>
          <button
            type="button"
            class="checkout-choice"
            :class="{ active: checkoutMode === 'account' }"
            @click="checkoutMode = 'account'"
          >
            <Icon
              name="i-heroicons-identification"
              class="text-3xl text-[#CF1D1D]"
            />
            <span class="mt-4 block text-2xl font-black text-white">{{
              t("checkout.accountTitle")
            }}</span>
            <span class="mt-2 block leading-7 text-neutral-400">{{
              t("checkout.accountText")
            }}</span>
          </button>
        </div>

        <div
          v-if="checkoutMode === 'account' && !authStore.user"
          class="premium-panel rounded-2xl p-6 md:p-8"
        >
          <h2 class="text-2xl font-black text-white">
            {{ t("checkout.signInTitle") }}
          </h2>
          <p class="mt-3 leading-7 text-neutral-400">
            {{ t("checkout.signInText") }}
          </p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <NuxtLink
              to="/auth/login"
              class="premium-button premium-button-primary"
              >{{ t("nav.login") }}</NuxtLink
            >
            <NuxtLink
              to="/auth/register"
              class="premium-button premium-button-secondary"
              >{{ t("nav.register") }}</NuxtLink
            >
          </div>
        </div>

        <div v-else class="premium-panel rounded-2xl p-6 md:p-8">
          <div class="mb-7 flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#CF1D1D]/30 bg-[#CF1D1D]/10 text-[#CF1D1D]"
            >
              <Icon name="i-heroicons-map-pin" class="text-2xl" />
            </div>
            <div>
              <h2 class="text-2xl font-black text-white">
                {{ t("checkout.shippingInfo") }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-neutral-400">
                {{
                  checkoutMode === "guest"
                    ? t("checkout.guestInfo")
                    : t("checkout.profileInfo")
                }}
              </p>
            </div>
          </div>

          <label class="floating-field checkout-field">
            <input
              v-model="fullName"
              required
              class="floating-input"
              autocomplete="name"
              placeholder=" "
            />
            <span>{{ t("common.fullName") }}</span>
          </label>

          <div class="mt-5 grid gap-5 md:grid-cols-2">
            <label class="floating-field checkout-field">
              <input
                v-model="phone"
                required
                class="floating-input"
                autocomplete="tel"
                placeholder=" "
              />
              <span>{{ t("common.phone") }}</span>
            </label>
            <div class="field-block checkout-field">
              <GovernorateSelect
                v-model="selectedGovernorateCode"
                :governorates="shippingGovernorates"
                class="mt-2"
              />
            </div>
          </div>

          <div class="mt-5 grid gap-5 md:grid-cols-2">
            <label class="floating-field checkout-field">
              <input
                v-model="city"
                required
                class="floating-input"
                autocomplete="address-level2"
                placeholder=" "
              />
              <span>{{ t("common.city") }}</span>
            </label>
          </div>

          <label class="floating-field checkout-field mt-5">
            <input
              v-model="address"
              required
              class="floating-input"
              autocomplete="street-address"
              placeholder=" "
            />
            <span>{{ t("common.address") }}</span>
          </label>

          <label class="floating-field checkout-field mt-5">
            <textarea
              v-model="notes"
              rows="4"
              placeholder=" "
              class="floating-input h-auto min-h-32 py-5"
            />
            <span>{{ t("checkout.notesOptional") }}</span>
          </label>
        </div>

        <div v-if="canSubmit" class="premium-panel rounded-2xl p-6 md:p-8">
          <div
            class="flex items-center gap-4 rounded-2xl border border-[#CF1D1D] bg-[#CF1D1D]/10 p-5"
          >
            <Icon
              name="i-heroicons-banknotes"
              class="text-3xl text-[#CF1D1D]"
            />
            <div>
              <p class="font-black text-white">
                {{ t("checkout.cashOnDelivery") }}
              </p>
              <p class="mt-1 text-sm text-neutral-400">
                {{ t("checkout.cashText") }}
              </p>
            </div>
            <Icon
              name="i-heroicons-check-circle-solid"
              class="ml-auto text-2xl text-emerald-400"
            />
          </div>
        </div>

        <p
          v-if="errorMessage"
          class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-300"
        >
          {{ errorMessage }}
        </p>

        <button
          v-if="canSubmit"
          type="submit"
          :disabled="loading"
          class="premium-button premium-button-primary w-full text-base active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon
            :name="
              loading ? 'i-heroicons-arrow-path' : 'i-heroicons-lock-closed'
            "
            :class="{ 'animate-spin': loading }"
          />
          {{
            loading
              ? t("checkout.placing")
              : checkoutMode === "guest"
                ? t("checkout.placeGuest")
                : t("checkout.placeAccount")
          }}
        </button>
      </form>

      <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <div class="premium-panel rounded-2xl p-5 md:p-7">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="eyebrow">{{ t("checkout.summary") }}</p>
              <h2 class="mt-2 text-2xl font-black text-white">
                {{ t("checkout.orderSummary") }}
              </h2>
            </div>
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#CF1D1D]/30 bg-[#CF1D1D]/10 text-[#CF1D1D]"
            >
              <Icon name="i-heroicons-receipt-percent" class="text-xl" />
            </div>
          </div>
          <div class="mt-6 space-y-4">
            <div
              v-for="item in cartStore.items"
              :key="`${item.id}-${item.variant_id || 'legacy'}-${item.size}-${item.color}`"
              class="summary-item"
            >
              <img
                :src="item.image"
                :alt="item.title"
                width="80"
                height="80"
                class="h-20 w-20 rounded-xl object-cover"
                loading="lazy"
                decoding="async"
              />
              <div class="min-w-0 flex-1">
                <h3 class="line-clamp-2 font-black leading-6 text-white">
                  {{ item.title }}
                </h3>
                <p class="mt-1 text-sm leading-6 text-neutral-400">
                  {{ item.color }} / {{ item.size }} / {{ t("admin.qty") }}
                  {{ item.quantity }}
                </p>
              </div>
              <div class="shrink-0 text-sm font-black text-white sm:text-base">
                {{ formatStorePrice(item.price * item.quantity, locale) }}
              </div>
            </div>
          </div>
          <div class="coupon-box">
            <label
              class="block text-sm font-black uppercase tracking-[0.18em] text-neutral-400"
              for="coupon-code"
              >{{ t("checkout.promoCode") }}</label
            >
            <div class="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                id="coupon-code"
                v-model="couponCode"
                :disabled="Boolean(appliedCoupon) || couponLoading"
                class="coupon-input"
                :placeholder="t('checkout.enterCode')"
                @keyup.enter.prevent="applyCoupon"
              />
              <button
                v-if="!appliedCoupon"
                type="button"
                :disabled="couponLoading || !couponCode.trim()"
                class="premium-button premium-button-secondary shrink-0 disabled:pointer-events-none disabled:opacity-50"
                @click="applyCoupon"
              >
                {{
                  couponLoading
                    ? t("checkout.applying")
                    : t("checkout.applyCoupon")
                }}
              </button>
              <button
                v-else
                type="button"
                class="premium-button premium-button-secondary shrink-0"
                @click="removeCoupon"
              >
                {{ t("checkout.removeCoupon") }}
              </button>
            </div>
            <p
              v-if="couponMessage"
              class="mt-3 text-sm font-bold text-emerald-300"
            >
              {{ couponMessage }}
            </p>
            <p v-if="couponError" class="mt-3 text-sm font-bold text-red-300">
              {{ couponError }}
            </p>
          </div>
          <p
            v-if="shippingError"
            class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-300"
          >
            {{ shippingError }}
          </p>
          <div class="summary-totals">
            <div class="summary-row">
              <span>{{ t("common.subtotal") }}</span
              ><span class="font-bold text-white">{{
                formatStorePrice(displaySubtotal, locale)
              }}</span>
            </div>
            <div class="summary-row">
              <span>{{ t("common.shipping") }}</span
              ><span
                class="font-bold"
                :class="shippingCost > 0 ? 'text-white' : 'text-emerald-400'"
                >{{ shippingSummary }}</span
              >
            </div>
            <div v-if="appliedCoupon" class="summary-row">
              <span>{{ t("common.discount") }}</span>
              <span class="font-bold text-emerald-400"
                >-{{ formatStorePrice(displayDiscount, locale) }}</span
              >
            </div>
            <div class="summary-total-row">
              <span>{{ t("common.total") }}</span
              ><span class="text-[#CF1D1D]">{{
                formatStorePrice(displayTotal, locale)
              }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import GovernorateSelect from "../components/checkout/GovernorateSelect.vue";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import { normalizeCheckoutCouponCode } from "../utils/checkoutCoupons";
import { formatStorePrice } from "../utils/localizationFormat";

const cartStore = useCartStore(usePinia());
const authStore = useAuthStore(usePinia());
const supabase = useSupabase();
const { locale, t } = useI18n();

const checkoutMode = ref<"guest" | "account">("guest");
const fullName = ref("");
const phone = ref("");
const city = ref("");
const notes = ref("");
const address = ref("");
const selectedGovernorateCode = ref("");
const loading = ref(false);
const errorMessage = ref("");
const couponCode = ref("");
const couponLoading = ref(false);
const couponMessage = ref("");
const couponError = ref("");
const shippingLoading = ref(false);
const shippingError = ref("");
const shippingGovernorates = ref<
  Array<{
    code: string;
    name_ar: string;
    name_en: string;
    shipping_fee?: number | string | null;
  }>
>([]);
const shippingPreview = ref<null | {
  ok?: boolean;
  error?: string;
  subtotal?: number | string;
  discount_amount?: number | string;
  shipping_cost?: number | string;
  total?: number | string;
  shipping_enabled?: boolean;
  shipping_required?: boolean;
}>(null);
const appliedCoupon = ref<null | {
  couponId: string;
  code: string;
  discountAmount: number;
  total: number;
}>(null);
const canSubmit = computed(
  () => checkoutMode.value === "guest" || Boolean(authStore.user),
);
const displaySubtotal = computed(() =>
  Number(shippingPreview.value?.subtotal ?? cartStore.totalPrice),
);
const displayDiscount = computed(() =>
  Number(
    shippingPreview.value?.discount_amount ??
      appliedCoupon.value?.discountAmount ??
      0,
  ),
);
const shippingCost = computed(() =>
  Number(shippingPreview.value?.shipping_cost ?? 0),
);
const shippingRequired = computed(() =>
  Boolean(shippingPreview.value?.shipping_required ?? true),
);
const displayTotal = computed(() =>
  Number(
    shippingPreview.value?.total ??
      appliedCoupon.value?.total ??
      cartStore.totalPrice,
  ),
);
const shippingSummary = computed(() => {
  if (shippingLoading.value) return t("common.loading");
  if (shippingPreview.value?.shipping_enabled === false) {
    return t("checkout.shippingUnavailable");
  }
  if (!selectedGovernorateCode.value && shippingRequired.value) {
    return t("checkout.selectGovernorate");
  }
  if (shippingCost.value <= 0) return t("common.free");

  return formatStorePrice(shippingCost.value, locale.value);
});

let previewRequestId = 0;

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

      fullName.value =
        profile?.full_name || authStore.user?.user_metadata?.full_name || "";
      phone.value = profile?.phone || "";
      city.value = profile?.city || "";
      address.value = profile?.address || "";
    } catch {
      fullName.value = authStore.user?.user_metadata?.full_name || "";
    }
  }

  await loadShippingGovernorates();
  await refreshCheckoutPreview();
});

const checkoutRpcItems = () =>
  cartStore.items.map((item) => ({
    id: item.id,
    variant_id: item.variant_id || null,
    title: item.title,
    image: item.image,
    price: item.price,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
  }));

const loadShippingGovernorates = async () => {
  const { data, error } = await supabase
    .from("shipping_governorates")
    .select("code,name_ar,name_en,shipping_fee,is_enabled,sort_order")
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true });

  if (error) {
    shippingError.value = error.message;
    return;
  }

  shippingGovernorates.value = data || [];
};

const refreshCheckoutPreview = async (
  code = appliedCoupon.value?.code || "",
) => {
  if (!cartStore.items.length) return null;

  const requestId = ++previewRequestId;
  shippingLoading.value = true;
  shippingError.value = "";

  const { data, error } = await supabase.rpc("preview_checkout_totals", {
    p_items: checkoutRpcItems(),
    p_coupon_code: code || null,
    p_governorate_code: selectedGovernorateCode.value || null,
  });

  if (requestId !== previewRequestId) return null;

  shippingLoading.value = false;

  if (error) {
    shippingError.value = error.message;
    return null;
  }

  shippingPreview.value = data || null;

  if (data?.ok === false) {
    shippingError.value = data.error || t("checkout.shippingRateUnavailable");
    return data;
  }

  if (appliedCoupon.value && data?.code) {
    appliedCoupon.value = {
      ...appliedCoupon.value,
      couponId: data.coupon_id || appliedCoupon.value.couponId,
      code: data.code,
      discountAmount: Number(data.discount_amount || 0),
      total: Number(data.total || cartStore.totalPrice),
    };
  }

  return data;
};

const applyCoupon = async () => {
  const code = normalizeCheckoutCouponCode(couponCode.value);
  if (!code) return;

  couponLoading.value = true;
  couponError.value = "";
  couponMessage.value = "";

  const { data, error } = await supabase.rpc("preview_checkout_totals", {
    p_items: checkoutRpcItems(),
    p_coupon_code: code,
    p_governorate_code: selectedGovernorateCode.value || null,
  });

  couponLoading.value = false;

  if (error) {
    couponError.value = error.message;
    return;
  }

  if (!data?.ok) {
    couponError.value = data?.error || t("checkout.couponFailed");
    return;
  }

  appliedCoupon.value = {
    couponId: data.coupon_id,
    code: data.code || code,
    discountAmount: Number(data.discount_amount || 0),
    total: Number(data.total || cartStore.totalPrice),
  };
  shippingPreview.value = data;
  couponCode.value = appliedCoupon.value.code;
  couponMessage.value = t("checkout.applied", {
    code: appliedCoupon.value.code,
  });
};

const removeCoupon = () => {
  appliedCoupon.value = null;
  couponCode.value = "";
  couponMessage.value = "";
  couponError.value = "";
  refreshCheckoutPreview("");
};

watch(selectedGovernorateCode, () => {
  refreshCheckoutPreview();
});

const handleCheckout = async () => {
  try {
    if (!canSubmit.value) return;

    errorMessage.value = "";

    if (!selectedGovernorateCode.value) {
      errorMessage.value = t("checkout.governorateRequired");
      return;
    }

    const preview = await refreshCheckoutPreview();
    if (preview?.ok === false) {
      errorMessage.value =
        preview.error || t("checkout.shippingRateUnavailable");
      return;
    }

    loading.value = true;

    const order = await authStore.createOrder(
      cartStore.items,
      cartStore.totalPrice,
      {
        isGuest: checkoutMode.value === "guest",
        user: checkoutMode.value === "account" ? authStore.user : null,
        fullName: fullName.value,
        phone: phone.value,
        city: city.value,
        governorateCode: selectedGovernorateCode.value,
        notes: notes.value,
        address: address.value,
      },
      appliedCoupon.value ? { code: appliedCoupon.value.code } : null,
    );

    cartStore.clearCart();
    await navigateTo(`/order-success?order=${order.id}`);
  } catch (error: any) {
    errorMessage.value = error?.message || t("checkout.orderFailed");
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
  border-color: rgba(207, 29, 29, 0.75);
  background: rgba(207, 29, 29, 0.08);
  transform: translateY(-2px);
}

.checkout-choice.active {
  box-shadow: 0 0 0 4px rgba(207, 29, 29, 0.1);
}

.floating-field {
  position: relative;
  display: block;
}

.field-block {
  display: block;
}

.field-block span {
  display: block;
  color: #a3a3a3;
  font-size: 0.875rem;
  font-weight: 800;
}

.field-input {
  min-height: 3.75rem;
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.42);
  padding: 0 1rem;
  color: #ffffff;
  outline: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.field-input:focus {
  border-color: #cf1d1d;
  box-shadow: 0 0 0 4px rgba(207, 29, 29, 0.12);
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
  border-color: #cf1d1d;
  box-shadow: 0 0 0 4px rgba(207, 29, 29, 0.12);
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
  color: #cf1d1d;
  font-size: 0.7rem;
  transform: translateY(-0.68rem);
}

.coupon-input {
  min-height: 3rem;
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.42);
  padding: 0.75rem 1rem;
  color: #ffffff;
  font-weight: 800;
  outline: none;
  text-transform: uppercase;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.coupon-input:focus {
  border-color: #cf1d1d;
  box-shadow: 0 0 0 4px rgba(207, 29, 29, 0.12);
}

.summary-item {
  display: flex;
  gap: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.28);
  padding: 0.85rem;
}

.coupon-box {
  margin-top: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.34);
  padding: 1rem;
}

.summary-totals {
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}

.summary-row,
.summary-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.summary-row {
  color: #a3a3a3;
}

.summary-total-row {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.25rem;
  font-size: 1.35rem;
  font-weight: 900;
}
</style>

<template>
  <section class="container-premium section-premium">
    <div v-if="loading" class="premium-panel mx-auto max-w-4xl rounded-2xl p-10 text-center text-neutral-400">
      {{ t("common.loading") }}
    </div>

    <div v-else-if="errorMessage" class="premium-panel mx-auto max-w-3xl rounded-2xl p-8 text-center">
      <Icon name="i-heroicons-exclamation-triangle" class="mx-auto text-5xl text-[#CF1D1D]" />
      <h1 class="mt-5 text-3xl font-black text-white">{{ t("payments.invalidAccess") }}</h1>
      <p class="mt-3 text-neutral-400">{{ errorMessage }}</p>
      <NuxtLink to="/shop" class="premium-button premium-button-primary mt-7">{{ t("cart.continueShopping") }}</NuxtLink>
    </div>

    <div v-else-if="order" class="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
      <div class="premium-panel rounded-2xl p-5 md:p-8">
        <p class="eyebrow">{{ t("payments.instapay") }}</p>
        <h1 class="mt-3 text-4xl font-black text-white md:text-6xl">
          {{ paymentTitle }}
        </h1>
        <p class="mt-3 text-neutral-400">#{{ orderLabel }}</p>

        <div class="mt-7 rounded-2xl border border-[#CF1D1D]/30 bg-[#CF1D1D]/10 p-5">
          <p class="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
            {{ t("payments.requiredAmount") }}
          </p>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-4">
            <p class="text-4xl font-black text-white">{{ formatStorePrice(order.total_price, locale) }}</p>
            <button type="button" class="premium-button premium-button-secondary" @click="copyText(String(order.total_price), 'amount')">
              <Icon name="i-heroicons-clipboard" />
              {{ copied === "amount" ? t("payments.copied") : t("payments.copyAmount") }}
            </button>
          </div>
        </div>

        <div v-if="isPayable" class="mt-7 grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
          <div class="rounded-2xl border border-white/10 bg-black/35 p-4">
            <img
              v-if="qrUrl"
              :src="qrUrl"
              alt="InstaPay QR"
              width="360"
              height="360"
              class="aspect-square w-full rounded-xl bg-white object-contain p-3"
            />
            <div v-else class="flex aspect-square items-center justify-center rounded-xl border border-white/10 bg-black text-center text-sm text-neutral-500">
              {{ t("payments.qrUnavailable") }}
            </div>
          </div>

          <div class="space-y-4">
            <div class="rounded-2xl border border-white/10 bg-black/35 p-5">
              <p class="text-sm text-neutral-500">{{ t("payments.timeRemaining") }}</p>
              <p class="mt-2 text-3xl font-black text-white" aria-live="off">{{ timeRemaining }}</p>
            </div>

            <div class="rounded-2xl border border-white/10 bg-black/35 p-5">
              <p class="text-sm text-neutral-500">{{ t("payments.accountName") }}</p>
              <p class="mt-2 font-black text-white">{{ settings.instapay_account_name || "Viking Store" }}</p>
              <p class="mt-4 text-sm text-neutral-500">{{ t("payments.instapayId") }}</p>
              <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p class="font-black text-white">{{ settings.instapay_id || "-" }}</p>
                <button v-if="settings.instapay_id" type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#CF1D1D]" @click="copyText(settings.instapay_id, 'id')">
                  {{ copied === "id" ? t("payments.copied") : t("common.copy") }}
                </button>
              </div>
            </div>

            <a v-if="settings.instapay_payment_link" :href="settings.instapay_payment_link" target="_blank" rel="noopener" class="premium-button premium-button-primary w-full">
              <Icon name="i-heroicons-arrow-top-right-on-square" />
              {{ t("payments.openInstapay") }}
            </a>
          </div>
        </div>

        <div v-if="isPayable" class="mt-7 rounded-2xl border border-white/10 bg-black/35 p-5">
          <h2 class="text-2xl font-black text-white">{{ t("payments.uploadPaymentProof") }}</h2>
          <p class="mt-2 text-sm leading-6 text-neutral-400">{{ t("payments.uploadHint") }}</p>

          <form class="mt-5 space-y-4" @submit.prevent="submitProof">
            <label class="block">
              <span class="text-sm font-bold text-neutral-400">{{ t("payments.transactionReference") }}</span>
              <input v-model="transactionReference" class="payment-input mt-2" :placeholder="t('payments.transactionReferencePlaceholder')" />
            </label>
            <label class="block rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-center transition hover:border-[#CF1D1D]/70">
              <input type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" @change="handleProofFile" />
              <Icon name="i-heroicons-cloud-arrow-up" class="mx-auto text-4xl text-[#CF1D1D]" />
              <span class="mt-3 block font-bold text-white">{{ proofFile?.name || t("payments.chooseProof") }}</span>
              <span class="mt-1 block text-sm text-neutral-500">{{ t("payments.proofRules") }}</span>
            </label>
            <img v-if="proofPreview" :src="proofPreview" alt="" class="max-h-72 rounded-xl border border-white/10 object-contain" />
            <p v-if="proofError" class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-300">{{ proofError }}</p>
            <p v-if="proofSuccess" class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-bold text-emerald-300">{{ proofSuccess }}</p>
            <button type="submit" :disabled="proofSubmitting || !proofFile" class="premium-button premium-button-primary w-full disabled:pointer-events-none disabled:opacity-50">
              <Icon :name="proofSubmitting ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'" :class="{ 'animate-spin': proofSubmitting }" />
              {{ proofSubmitting ? t("payments.uploadingProof") : t("payments.submitProof") }}
            </button>
          </form>
        </div>

        <div v-else class="mt-7 rounded-2xl border border-white/10 bg-black/35 p-6">
          <h2 class="text-2xl font-black text-white">{{ statusMessageTitle }}</h2>
          <p class="mt-3 leading-7 text-neutral-400">{{ statusMessageText }}</p>
          <p v-if="order.payment_rejection_reason" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {{ order.payment_rejection_reason }}
          </p>
          <div v-if="order.payment_status === 'expired'" class="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" class="premium-button premium-button-primary" @click="reorderExpired">
              {{ t("payments.reorder") }}
            </button>
            <NuxtLink to="/shop" class="premium-button premium-button-secondary">{{ t("payments.continueShopping") }}</NuxtLink>
          </div>
        </div>
      </div>

      <aside class="space-y-5">
        <div class="premium-panel rounded-2xl p-5">
          <h2 class="text-xl font-black text-white">{{ t("checkout.orderSummary") }}</h2>
          <div class="mt-5 space-y-3">
            <article v-for="item in items" :key="item.id" class="rounded-xl border border-white/10 bg-black/30 p-3">
              <p class="font-bold text-white">{{ item.product_name }}</p>
              <p class="mt-1 text-sm text-neutral-500">{{ item.color || t("shop.default") }} / {{ item.size || t("shop.default") }} / {{ t("admin.qty") }} {{ item.quantity }}</p>
            </article>
          </div>
        </div>

        <a v-if="whatsappLink" :href="whatsappLink" target="_blank" rel="noopener" class="premium-button premium-button-secondary w-full">
          <Icon name="simple-icons:whatsapp" />
          {{ t("payments.whatsappProof") }}
        </a>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useCartStore } from "../../../stores/cart";
import { formatStorePrice } from "../../../utils/localizationFormat";
import { buildInstapayWhatsAppLink } from "../../../utils/whatsapp";

const route = useRoute();
const supabase = useSupabase();
const cartStore = useCartStore(usePinia());
const { locale, t } = useI18n();

const order = ref<any>(null);
const items = ref<any[]>([]);
const proofs = ref<any[]>([]);
const settings = ref<any>({});
const loading = ref(true);
const errorMessage = ref("");
const copied = ref("");
const proofFile = ref<File | null>(null);
const proofPreview = ref("");
const proofError = ref("");
const proofSuccess = ref("");
const proofSubmitting = ref(false);
const transactionReference = ref("");
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | null = null;

const accessToken = computed(() => String(route.query.token || ""));
const orderLabel = computed(() => order.value?.order_number || String(order.value?.id || "").slice(0, 8));
const expiresAt = computed(() => (order.value?.payment_expires_at ? new Date(order.value.payment_expires_at).getTime() : 0));
const secondsLeft = computed(() => Math.max(0, Math.floor((expiresAt.value - now.value) / 1000)));
const isPayable = computed(() =>
  ["awaiting_payment", "rejected"].includes(String(order.value?.payment_status || "")) && secondsLeft.value > 0,
);
const timeRemaining = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60);
  const seconds = secondsLeft.value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});
const paymentTitle = computed(() => {
  if (order.value?.payment_status === "proof_submitted") return t("payments.proofSubmittedTitle");
  if (order.value?.payment_status === "paid") return t("payments.paidTitle");
  if (order.value?.payment_status === "expired" || secondsLeft.value <= 0) return t("payments.expiredTitle");
  if (order.value?.payment_status === "rejected") return t("payments.rejectedTitle");
  return t("payments.completePayment");
});
const statusMessageTitle = computed(() => paymentTitle.value);
const statusMessageText = computed(() => {
  if (order.value?.payment_status === "proof_submitted") return t("payments.proofSubmittedText");
  if (order.value?.payment_status === "paid") return t("payments.paidText");
  if (order.value?.payment_status === "rejected") return t("payments.rejectedText");
  return t("payments.expiredText");
});
const qrUrl = computed(() => {
  if (!settings.value.instapay_qr_path) return "";
  const { data } = supabase.storage.from("payment-assets").getPublicUrl(settings.value.instapay_qr_path);
  return data.publicUrl;
});
const whatsappLink = computed(() =>
  buildInstapayWhatsAppLink({
    phoneNumber: settings.value.whatsapp_number,
    orderNumber: orderLabel.value,
    total: order.value?.total_price || 0,
    items: items.value,
    locale: locale.value,
  }),
);

const loadPayment = async () => {
  loading.value = true;
  const { data, error } = await supabase.rpc("get_instapay_payment_order", {
    p_order_id: route.params.orderId,
    p_access_token: accessToken.value || null,
  });

  if (error || data?.ok === false) {
    errorMessage.value = error?.message || data?.error || t("payments.invalidAccessText");
    loading.value = false;
    return;
  }

  order.value = data.order;
  items.value = data.items || [];
  proofs.value = data.proofs || [];
  settings.value = data.settings || {};
  loading.value = false;
};

const copyText = async (value: string, key: string) => {
  if (!import.meta.client || !value) return;
  await navigator.clipboard.writeText(value);
  copied.value = key;
  window.setTimeout(() => {
    if (copied.value === key) copied.value = "";
  }, 1400);
};

const handleProofFile = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] || null;
  proofError.value = "";
  proofSuccess.value = "";

  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    proofError.value = t("payments.invalidProofType");
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    proofError.value = t("payments.proofTooLarge");
    return;
  }

  proofFile.value = file;
  if (proofPreview.value) URL.revokeObjectURL(proofPreview.value);
  proofPreview.value = URL.createObjectURL(file);
};

const submitProof = async () => {
  if (!proofFile.value || proofSubmitting.value) return;

  proofSubmitting.value = true;
  proofError.value = "";
  proofSuccess.value = "";

  const form = new FormData();
  form.set("order_id", String(order.value.id));
  form.set("access_token", accessToken.value);
  form.set("transaction_reference", transactionReference.value);
  form.set("proof", proofFile.value);

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const headers = sessionData.session?.access_token
      ? { Authorization: `Bearer ${sessionData.session.access_token}` }
      : undefined;
    await $fetch("/api/payments/instapay/proof", { method: "POST", body: form, headers });
    proofSuccess.value = t("payments.proofUploaded");
    proofFile.value = null;
    if (proofPreview.value) URL.revokeObjectURL(proofPreview.value);
    proofPreview.value = "";
    await loadPayment();
  } catch (error: any) {
    proofError.value = error?.statusMessage || error?.data?.statusMessage || t("payments.proofUploadFailed");
  } finally {
    proofSubmitting.value = false;
  }
};

const reorderExpired = async () => {
  const productIds = [...new Set(items.value.map((item) => Number(item.product_id)).filter(Boolean))];
  if (!productIds.length) {
    await navigateTo("/shop");
    return;
  }

  const { data } = await supabase
    .from("products")
    .select("id,title,slug,price,cover_image,image,product_variants(id,price,stock_quantity,is_active)")
    .in("id", productIds);
  const products = new Map((data || []).map((product: any) => [Number(product.id), product]));
  const nextItems: any[] = [];

  for (const item of items.value) {
    const product = products.get(Number(item.product_id));
    if (!product) continue;
    const variant = item.variant_id
      ? (product.product_variants || []).find((candidate: any) => Number(candidate.id) === Number(item.variant_id) && candidate.is_active && Number(candidate.stock_quantity || 0) >= Number(item.quantity || 1))
      : null;
    if (item.variant_id && !variant) continue;
    nextItems.push({
      id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.cover_image || product.image || item.product_image,
      price: Number(variant?.price ?? product.price ?? item.product_price),
      color: item.color || "",
      size: item.size || t("shop.default"),
      quantity: Number(item.quantity || 1),
      variant_id: variant?.id || null,
    });
  }

  cartStore.items = nextItems;
  localStorage.setItem("cart", JSON.stringify(nextItems));
  await navigateTo("/checkout?payment=instapay");
};

onMounted(() => {
  loadPayment();
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  if (proofPreview.value) URL.revokeObjectURL(proofPreview.value);
});
</script>

<style scoped>
.payment-input {
  min-height: 3.25rem;
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.42);
  padding: 0 1rem;
  color: #fff;
  outline: none;
}

.payment-input:focus {
  border-color: #cf1d1d;
  box-shadow: 0 0 0 4px rgba(207, 29, 29, 0.12);
}
</style>

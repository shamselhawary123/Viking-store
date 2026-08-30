<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t("admin.sales") }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ t("admin.orders") }}</h2>
      </div>
    </div>

    <div class="grid gap-3 rounded-3xl border border-white/10 bg-[#111111] p-4 md:grid-cols-[1fr_12rem_12rem]">
      <input v-model="search" type="search" :placeholder="t('admin.searchOrders')" class="field" />
      <select v-model="statusFilter" class="field">
        <option value="all">{{ t("admin.allStatuses") }}</option>
        <option v-for="status in ADMIN_ORDER_STATUSES" :key="status" :value="status">{{ t(adminOrderStatusLabelKey(status)) }}</option>
      </select>
      <select v-model="paymentStatusFilter" class="field">
        <option value="all">{{ t("admin.allPayments") }}</option>
        <option v-for="status in paymentStatusOptions" :key="status" :value="status">{{ t(adminPaymentStatusLabelKey(status)) }}</option>
      </select>
    </div>

    <p v-if="successMessage" class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      {{ errorMessage }}
    </p>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full min-w-[1220px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">{{ t("admin.order") }}</th>
              <th class="px-5 py-4">{{ t("admin.customer") }}</th>
              <th class="px-5 py-4">{{ t("common.type") }}</th>
              <th class="px-5 py-4">{{ t("common.phone") }}</th>
              <th class="px-5 py-4 text-right">{{ t("common.total") }}</th>
              <th class="px-5 py-4">{{ t("common.payment") }}</th>
              <th class="px-5 py-4">{{ t("admin.paymentStatus") }}</th>
              <th class="px-5 py-4">{{ t("admin.orderStatus") }}</th>
              <th class="px-5 py-4">{{ t("common.created") }}</th>
              <th class="px-5 py-4 text-right">{{ t("common.actions") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="px-5 py-4 font-bold">#{{ getAdminOrderLabel(order) }}</td>
              <td class="px-5 py-4">{{ getOrderCustomer(order).name }}</td>
              <td class="px-5 py-4 text-gray-400">{{ customerTypeLabel(order) }}</td>
              <td class="px-5 py-4 text-gray-400">{{ getOrderCustomer(order).phone }}</td>
              <td class="px-5 py-4 text-right font-black">{{ formatCurrency(order.total_price) }}</td>
              <td class="px-5 py-4 text-gray-400">{{ order.payment_method || "-" }}</td>
              <td class="px-5 py-4">
                <span class="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black capitalize text-gray-300">
                  {{ order.payment_status ? t(adminPaymentStatusLabelKey(order.payment_status)) : "-" }}
                </span>
              </td>
              <td class="px-5 py-4">
                <select
                  :value="order.status || 'pending'"
                  :disabled="updatingOrderId === order.id"
                  class="rounded-xl border border-white/10 bg-black px-3 py-2 text-[#FF4D00] outline-none disabled:opacity-50"
                  @change="updateStatus(order, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="status in ADMIN_ORDER_STATUSES" :key="status" :value="status">{{ t(adminOrderStatusLabelKey(status)) }}</option>
                </select>
              </td>
              <td class="px-5 py-4 text-gray-400">{{ formatDateTime(order.created_at) }}</td>
              <td class="px-5 py-4 text-right">
                <button class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]" @click="openDetails(order)">
                  {{ t("common.details") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid gap-3 p-3 md:hidden">
        <article v-for="order in filteredOrders" :key="order.id" class="admin-mobile-card rounded-2xl border border-white/10 bg-black p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-black">#{{ getAdminOrderLabel(order) }}</p>
              <p class="mt-1 truncate text-sm text-gray-300">{{ getOrderCustomer(order).name }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ customerTypeLabel(order) }} · {{ formatDateTime(order.created_at) }}</p>
            </div>
            <p class="shrink-0 font-black text-[#FF4D00]">{{ formatCurrency(order.total_price) }}</p>
          </div>

          <div class="mt-3 grid gap-2 text-sm">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full border border-white/10 bg-[#111111] px-3 py-1 text-xs font-black text-gray-300">
                {{ order.payment_status ? t(adminPaymentStatusLabelKey(order.payment_status)) : "-" }}
              </span>
              <span class="text-xs text-gray-500">{{ order.payment_method || "-" }}</span>
            </div>
            <select
              :value="order.status || 'pending'"
              :disabled="updatingOrderId === order.id"
              class="field"
              @change="updateStatus(order, ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="status in ADMIN_ORDER_STATUSES" :key="status" :value="status">{{ t(adminOrderStatusLabelKey(status)) }}</option>
            </select>
          </div>

          <button class="mt-3 min-h-11 w-full rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]" @click="openDetails(order)">
            {{ t("common.details") }}
          </button>
        </article>
      </div>

      <div class="flex flex-col gap-3 border-t border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-gray-500">{{ t("admin.showingLoadedOrders", { visible: filteredOrders.length, total: orders.length }) }}</p>
        <button
          v-if="hasMore"
          :disabled="loading"
          class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00] disabled:opacity-50"
          @click="loadOrders"
        >
          {{ loading ? t("common.loading") : t("admin.loadMore") }}
        </button>
      </div>

      <p v-if="loading && !orders.length" class="p-6 text-sm text-gray-500">{{ t("admin.loadingOrders") }}</p>
      <p v-else-if="!filteredOrders.length" class="p-6 text-sm text-gray-500">{{ t("admin.noOrders") }}</p>
    </div>

    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div class="max-h-[calc(100dvh-1rem)] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111111] p-4 sm:rounded-3xl sm:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t("admin.orderDetails") }}</p>
            <h3 class="mt-2 text-2xl font-black">#{{ getAdminOrderLabel(selectedOrder) }}</h3>
          </div>
          <button class="text-gray-400 hover:text-white" @click="closeDetails">{{ t("admin.modalClose") }}</button>
        </div>

        <div class="mt-6 grid gap-5 lg:grid-cols-2">
          <section class="rounded-2xl bg-black p-5">
            <h4 class="font-black">{{ t("admin.customer") }}</h4>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoBlock :label="t('common.name')" :value="selectedCustomer.name" />
              <InfoBlock :label="t('common.type')" :value="customerTypeLabel(selectedOrder)" />
              <InfoBlock :label="t('common.phone')" :value="selectedCustomer.phone" />
              <InfoBlock :label="t('common.email')" :value="selectedCustomer.email" />
              <InfoBlock :label="t('admin.governorate')" :value="selectedGovernorateName" />
              <InfoBlock :label="t('common.city')" :value="selectedCustomer.city" />
              <InfoBlock :label="t('common.address')" :value="selectedCustomer.address" />
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-500">{{ t("common.notes") }}</p>
              <p class="mt-2 text-gray-300">{{ selectedCustomer.notes }}</p>
            </div>
          </section>

          <section class="rounded-2xl bg-black p-5">
            <h4 class="font-black">{{ t("admin.order") }}</h4>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoBlock :label="t('admin.orderNumber')" :value="getAdminOrderLabel(selectedOrder)" />
              <InfoBlock :label="t('common.created')" :value="formatDateTime(selectedOrder.created_at)" />
              <InfoBlock :label="t('admin.paymentMethod')" :value="selectedOrder.payment_method || '-'" />
              <InfoBlock :label="t('admin.paymentStatus')" :value="selectedOrder.payment_status ? t(adminPaymentStatusLabelKey(selectedOrder.payment_status)) : '-'" />
              <InfoBlock :label="t('admin.paymentDeadline')" :value="formatDateTime(selectedOrder.payment_expires_at)" />
              <InfoBlock :label="t('common.shipping')" :value="formatCurrency(selectedOrder.shipping_cost)" />
              <InfoBlock :label="t('common.discount')" :value="formatCurrency(selectedOrder.discount)" />
              <InfoBlock :label="t('common.subtotal')" :value="formatCurrency(selectedSubtotal)" />
              <InfoBlock :label="t('common.total')" :value="formatCurrency(selectedOrder.total_price)" />
            </div>
            <label class="mt-4 block">
              <span class="text-sm text-gray-500">{{ t("admin.orderStatus") }}</span>
              <select
                :value="selectedOrder.status || 'pending'"
                :disabled="updatingOrderId === selectedOrder.id"
                class="field mt-2"
                @change="updateStatus(selectedOrder, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="status in ADMIN_ORDER_STATUSES" :key="status" :value="status">{{ t(adminOrderStatusLabelKey(status)) }}</option>
              </select>
            </label>
          </section>
        </div>

        <section v-if="selectedOrder.payment_method === 'instapay'" class="mt-6 rounded-2xl bg-black p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 class="font-black">{{ t("admin.paymentProofs") }}</h4>
              <p class="mt-1 text-sm text-gray-500">{{ t("admin.paymentProofsText") }}</p>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <article v-for="proof in paymentProofs" :key="proof.id" class="rounded-2xl border border-white/10 bg-[#111111] p-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p class="font-bold text-white">{{ t(adminPaymentProofStatusLabelKey(proof.status)) }}</p>
                  <p class="mt-1 text-sm text-gray-500">{{ formatDateTime(proof.submitted_at) }}</p>
                  <p v-if="proof.transaction_reference" class="mt-1 text-sm text-gray-400">{{ proof.transaction_reference }}</p>
                  <p v-if="proof.rejection_reason" class="mt-2 text-sm text-red-300">{{ proof.rejection_reason }}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]" @click="openProof(proof)">
                    {{ t("admin.viewProof") }}
                  </button>
                  <template v-if="selectedOrder.payment_status === 'proof_submitted' && proof.status === 'submitted'">
                    <button class="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-white" @click="reviewPayment(proof, 'confirm')">
                      {{ t("admin.confirmPayment") }}
                    </button>
                    <button class="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500 hover:text-white" @click="startRejectProof(proof)">
                      {{ t("admin.rejectProof") }}
                    </button>
                  </template>
                </div>
              </div>
            </article>
            <p v-if="proofsLoading" class="text-sm text-gray-500">{{ t("common.loading") }}</p>
            <p v-else-if="!paymentProofs.length" class="text-sm text-gray-500">{{ t("admin.noPaymentProofs") }}</p>
          </div>
        </section>

        <section class="mt-6">
          <h4 class="text-xl font-black">{{ t("admin.items") }}</h4>
          <div class="mt-4 space-y-3">
            <div v-for="item in orderItems" :key="item.id" class="flex flex-col gap-4 rounded-2xl bg-black p-4 md:flex-row md:items-center">
              <img :src="item.product_image || '/logo.png'" alt="" class="h-20 w-20 rounded-xl object-cover" />
              <div class="flex-1">
                <p class="font-bold">{{ item.product_name || t("common.product") }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ item.color || "-" }} / {{ item.size || "-" }} / {{ t("admin.qty") }} {{ item.quantity || 0 }}</p>
              </div>
              <div class="text-left md:text-right">
                <p class="font-black text-[#FF4D00]">{{ formatCurrency(item.product_price) }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ t("admin.productId") }}: {{ item.product_id || "-" }}</p>
              </div>
            </div>
            <p v-if="itemsLoading" class="text-sm text-gray-500">{{ t("admin.loadingOrderItems") }}</p>
            <p v-else-if="!orderItems.length" class="text-sm text-gray-500">{{ t("admin.noOrderItems") }}</p>
          </div>
        </section>
      </div>
    </div>

    <div v-if="proofViewer" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4" @click="closeProof">
      <div class="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#111111] p-4" @click.stop>
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-xl font-black">{{ t("admin.paymentProof") }}</h3>
          <button class="text-gray-400 hover:text-white" @click="closeProof">{{ t("admin.modalClose") }}</button>
        </div>
        <img :src="proofViewer" alt="" class="mt-4 max-h-[76vh] w-full rounded-2xl object-contain" />
      </div>
    </div>

    <div v-if="rejectingProof" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4">
      <form class="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111111] p-5" @submit.prevent="submitRejectProof">
        <h3 class="text-xl font-black">{{ t("admin.rejectProof") }}</h3>
        <label class="mt-4 block">
          <span class="text-sm text-gray-500">{{ t("admin.rejectionReason") }}</span>
          <textarea v-model="rejectionReason" required class="field mt-2 min-h-32" />
        </label>
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="submit" class="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white">{{ t("admin.rejectProof") }}</button>
          <button type="button" class="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold" @click="rejectingProof = null">{{ t("common.cancel") }}</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from "vue";
import {
  ADMIN_ORDER_STATUSES,
  type AdminOrderStatus,
  adminOrderStatusLabelKey,
  adminPaymentStatusLabelKey,
  filterAdminOrders,
  formatCurrency,
  getAdminOrderLabel,
  getOrderCustomer,
} from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type OrderRow = {
  id: string;
  user_id?: string | null;
  total_price?: number | string | null;
  status?: AdminOrderStatus | string | null;
  payment_method?: string | null;
  created_at?: string | null;
  full_name?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  guest_city?: string | null;
  guest_address?: string | null;
  guest_notes?: string | null;
  order_number?: number | string | null;
  shipping_cost?: number | string | null;
  governorate_code?: string | null;
  discount?: number | string | null;
  payment_status?: string | null;
  payment_expires_at?: string | null;
  payment_rejection_reason?: string | null;
  [key: string]: any;
};

type OrderItemRow = {
  id: string;
  order_id?: string;
  product_id?: string;
  product_name?: string;
  product_image?: string;
  product_price?: number | string | null;
  color?: string;
  size?: string;
  quantity?: number;
};

type ShippingGovernorateRow = {
  code: string;
  name_ar: string;
  name_en: string;
};

type PaymentProofRow = {
  id: string;
  order_id: string;
  storage_path?: string;
  status: string;
  transaction_reference?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
};

const InfoBlock = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], default: "-" },
  },
  setup(props) {
    return () =>
      h("div", [
        h("p", { class: "text-sm text-gray-500" }, props.label),
        h("p", { class: "mt-2 break-words font-bold text-white" }, String(props.value || "-")),
      ]);
  },
});

const supabase = useSupabase();
const { locale, t } = useI18n();
const orders = ref<OrderRow[]>([]);
const selectedOrder = ref<OrderRow | null>(null);
const orderItems = ref<OrderItemRow[]>([]);
const paymentProofs = ref<PaymentProofRow[]>([]);
const shippingGovernorates = ref<ShippingGovernorateRow[]>([]);
const search = ref("");
const statusFilter = ref("all");
const paymentStatusFilter = ref("all");
const loading = ref(true);
const hasMore = ref(true);
const itemsLoading = ref(false);
const proofsLoading = ref(false);
const updatingOrderId = ref<string | null>(null);
const proofViewer = ref("");
const rejectingProof = ref<PaymentProofRow | null>(null);
const rejectionReason = ref("");
const successMessage = ref("");
const errorMessage = ref("");
const pageSize = 20;

const filteredOrders = computed(() =>
  filterAdminOrders(orders.value, {
    search: search.value,
    status: statusFilter.value,
    paymentStatus: paymentStatusFilter.value,
  }),
);

const paymentStatusOptions = computed(() =>
  [...new Set(orders.value.map((order) => order.payment_status).filter(Boolean).map(String))].sort(),
);

const selectedCustomer = computed(() => getOrderCustomer(selectedOrder.value || {}));
const customerTypeLabel = (order: OrderRow | null) =>
  order?.user_id ? t("admin.authenticated") : t("common.guest");
const governorateName = (code?: string | null) => {
  if (!code) return "-";

  const governorate = shippingGovernorates.value.find((item) => item.code === code);
  if (!governorate) return code;

  return locale.value === "ar" ? governorate.name_ar : governorate.name_en;
};
const selectedGovernorateName = computed(() =>
  governorateName(selectedOrder.value?.governorate_code),
);
const selectedSubtotal = computed(() => {
  if (!selectedOrder.value) return 0;

  return (
    Number(selectedOrder.value.total_price || 0) -
    Number(selectedOrder.value.shipping_cost || 0) +
    Number(selectedOrder.value.discount || 0)
  );
});

const formatDateTime = (date?: string | null) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const setMessage = (type: "success" | "error", message: string) => {
  successMessage.value = type === "success" ? message : "";
  errorMessage.value = type === "error" ? message : "";
};

const loadOrders = async () => {
  loading.value = true;
  setMessage("error", "");

  const from = orders.value.length;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    setMessage("error", error.message);
    loading.value = false;
    return;
  }

  const nextOrders = (data || []) as OrderRow[];
  orders.value = [...orders.value, ...nextOrders];
  hasMore.value = nextOrders.length === pageSize;
  loading.value = false;
};

const loadShippingGovernorates = async () => {
  const { data } = await supabase
    .from("shipping_governorates")
    .select("code,name_ar,name_en")
    .order("sort_order", { ascending: true });

  shippingGovernorates.value = (data || []) as ShippingGovernorateRow[];
};

const adminPaymentProofStatusLabelKey = (status?: string | null) =>
  `admin.paymentProofStatus.${String(status || "submitted").toLowerCase()}`;

const updateStatus = async (order: OrderRow, status: string) => {
  const nextStatus = status as AdminOrderStatus;
  const previousStatus = order.status;

  updatingOrderId.value = order.id;
  order.status = nextStatus;
  setMessage("error", "");

  const { error } = await supabase.rpc("admin_update_order_status", {
    p_order_id: order.id,
    p_status: nextStatus,
  });

  if (error) {
    order.status = previousStatus;
    setMessage("error", error.message);
  } else {
    setMessage("success", `Order #${getAdminOrderLabel(order)} updated.`);
  }

  updatingOrderId.value = null;
};

const openDetails = async (order: OrderRow) => {
  selectedOrder.value = order;
  orderItems.value = [];
  paymentProofs.value = [];
  itemsLoading.value = true;
  proofsLoading.value = order.payment_method === "instapay";
  setMessage("error", "");

  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  if (error) {
    setMessage("error", error.message);
    itemsLoading.value = false;
    return;
  }

  orderItems.value = (data || []) as OrderItemRow[];
  itemsLoading.value = false;

  if (order.payment_method === "instapay") {
    const { data: proofs, error: proofError } = await supabase
      .from("payment_proofs")
      .select("*")
      .eq("order_id", order.id)
      .order("submitted_at", { ascending: false });

    if (proofError) {
      setMessage("error", proofError.message);
    } else {
      paymentProofs.value = (proofs || []) as PaymentProofRow[];
    }
    proofsLoading.value = false;
  }
};

const closeDetails = () => {
  selectedOrder.value = null;
  orderItems.value = [];
  paymentProofs.value = [];
};

const openProof = async (proof: PaymentProofRow) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { signedUrl } = await $fetch<{ signedUrl: string }>("/api/admin/payments/proof-url", {
    query: { proof_id: proof.id },
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });
  proofViewer.value = signedUrl;
};

const closeProof = () => {
  proofViewer.value = "";
};

const reviewPayment = async (proof: PaymentProofRow, action: "confirm" | "reject") => {
  if (!selectedOrder.value) return;

  const { error } = await supabase.rpc("admin_review_instapay_payment", {
    p_order_id: selectedOrder.value.id,
    p_proof_id: proof.id,
    p_action: action,
    p_rejection_reason: action === "reject" ? rejectionReason.value : null,
  });

  if (error) {
    setMessage("error", error.message);
    return;
  }

  setMessage("success", t(action === "confirm" ? "admin.paymentConfirmed" : "admin.paymentRejected"));
  selectedOrder.value.payment_status = action === "confirm" ? "paid" : "rejected";
  if (action === "reject") {
    selectedOrder.value.payment_rejection_reason = rejectionReason.value;
  }
  rejectingProof.value = null;
  rejectionReason.value = "";
  await openDetails(selectedOrder.value);
};

const startRejectProof = (proof: PaymentProofRow) => {
  rejectingProof.value = proof;
  rejectionReason.value = "";
};

const submitRejectProof = async () => {
  if (rejectingProof.value) {
    await reviewPayment(rejectingProof.value, "reject");
  }
};

onMounted(() => {
  loadShippingGovernorates();
  loadOrders();
});
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: #000;
  padding: 0.875rem 1rem;
  color: #fff;
  outline: none;
}

.field:focus {
  border-color: #ff4d00;
}
</style>

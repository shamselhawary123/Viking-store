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
  discount?: number | string | null;
  payment_status?: string | null;
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
const { t } = useI18n();
const orders = ref<OrderRow[]>([]);
const selectedOrder = ref<OrderRow | null>(null);
const orderItems = ref<OrderItemRow[]>([]);
const search = ref("");
const statusFilter = ref("all");
const paymentStatusFilter = ref("all");
const loading = ref(true);
const hasMore = ref(true);
const itemsLoading = ref(false);
const updatingOrderId = ref<string | null>(null);
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
  itemsLoading.value = true;
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
};

const closeDetails = () => {
  selectedOrder.value = null;
  orderItems.value = [];
};

onMounted(loadOrders);
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

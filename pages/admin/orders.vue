<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">Sales</p>
        <h2 class="mt-2 text-3xl font-black">Orders</h2>
      </div>
    </div>

    <div class="grid gap-3 rounded-3xl border border-white/10 bg-[#111111] p-4 md:grid-cols-[1fr_12rem_12rem]">
      <input v-model="search" type="search" placeholder="Search order, customer, phone..." class="field" />
      <select v-model="statusFilter" class="field">
        <option value="all">All statuses</option>
        <option v-for="status in ADMIN_ORDER_STATUSES" :key="status" :value="status">{{ status }}</option>
      </select>
      <select v-model="paymentStatusFilter" class="field">
        <option value="all">All payments</option>
        <option v-for="status in paymentStatusOptions" :key="status" :value="status">{{ status }}</option>
      </select>
    </div>

    <p v-if="successMessage" class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      {{ errorMessage }}
    </p>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1220px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">Order</th>
              <th class="px-5 py-4">Customer</th>
              <th class="px-5 py-4">Type</th>
              <th class="px-5 py-4">Phone</th>
              <th class="px-5 py-4 text-right">Total</th>
              <th class="px-5 py-4">Payment</th>
              <th class="px-5 py-4">Payment Status</th>
              <th class="px-5 py-4">Order Status</th>
              <th class="px-5 py-4">Created</th>
              <th class="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="px-5 py-4 font-bold">#{{ getAdminOrderLabel(order) }}</td>
              <td class="px-5 py-4">{{ getOrderCustomer(order).name }}</td>
              <td class="px-5 py-4 text-gray-400">{{ getOrderCustomerType(order) }}</td>
              <td class="px-5 py-4 text-gray-400">{{ getOrderCustomer(order).phone }}</td>
              <td class="px-5 py-4 text-right font-black">{{ formatCurrency(order.total_price) }}</td>
              <td class="px-5 py-4 text-gray-400">{{ order.payment_method || "-" }}</td>
              <td class="px-5 py-4">
                <span class="rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-black capitalize text-gray-300">
                  {{ order.payment_status || "-" }}
                </span>
              </td>
              <td class="px-5 py-4">
                <select
                  :value="order.status || 'pending'"
                  :disabled="updatingOrderId === order.id"
                  class="rounded-xl border border-white/10 bg-black px-3 py-2 text-[#FF4D00] outline-none disabled:opacity-50"
                  @change="updateStatus(order, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="status in ADMIN_ORDER_STATUSES" :key="status" :value="status">{{ status }}</option>
                </select>
              </td>
              <td class="px-5 py-4 text-gray-400">{{ formatDateTime(order.created_at) }}</td>
              <td class="px-5 py-4 text-right">
                <button class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]" @click="openDetails(order)">
                  Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 border-t border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-gray-500">Showing {{ filteredOrders.length }} of {{ orders.length }} loaded orders</p>
        <button
          v-if="hasMore"
          :disabled="loading"
          class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00] disabled:opacity-50"
          @click="loadOrders"
        >
          {{ loading ? "Loading..." : "Load More" }}
        </button>
      </div>

      <p v-if="loading && !orders.length" class="p-6 text-sm text-gray-500">Loading orders...</p>
      <p v-else-if="!filteredOrders.length" class="p-6 text-sm text-gray-500">No orders found.</p>
    </div>

    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div class="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">Order Details</p>
            <h3 class="mt-2 text-2xl font-black">#{{ getAdminOrderLabel(selectedOrder) }}</h3>
          </div>
          <button class="text-gray-400 hover:text-white" @click="closeDetails">Close</button>
        </div>

        <div class="mt-6 grid gap-5 lg:grid-cols-2">
          <section class="rounded-2xl bg-black p-5">
            <h4 class="font-black">Customer</h4>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoBlock label="Name" :value="selectedCustomer.name" />
              <InfoBlock label="Type" :value="getOrderCustomerType(selectedOrder)" />
              <InfoBlock label="Phone" :value="selectedCustomer.phone" />
              <InfoBlock label="Email" :value="selectedCustomer.email" />
              <InfoBlock label="City" :value="selectedCustomer.city" />
              <InfoBlock label="Address" :value="selectedCustomer.address" />
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-500">Notes</p>
              <p class="mt-2 text-gray-300">{{ selectedCustomer.notes }}</p>
            </div>
          </section>

          <section class="rounded-2xl bg-black p-5">
            <h4 class="font-black">Order</h4>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoBlock label="Order Number" :value="getAdminOrderLabel(selectedOrder)" />
              <InfoBlock label="Created" :value="formatDateTime(selectedOrder.created_at)" />
              <InfoBlock label="Payment Method" :value="selectedOrder.payment_method || '-'" />
              <InfoBlock label="Payment Status" :value="selectedOrder.payment_status || '-'" />
              <InfoBlock label="Shipping" :value="formatCurrency(selectedOrder.shipping_cost)" />
              <InfoBlock label="Discount" :value="formatCurrency(selectedOrder.discount)" />
              <InfoBlock label="Subtotal" :value="formatCurrency(selectedSubtotal)" />
              <InfoBlock label="Total" :value="formatCurrency(selectedOrder.total_price)" />
            </div>
            <label class="mt-4 block">
              <span class="text-sm text-gray-500">Order Status</span>
              <select
                :value="selectedOrder.status || 'pending'"
                :disabled="updatingOrderId === selectedOrder.id"
                class="field mt-2"
                @change="updateStatus(selectedOrder, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="status in ADMIN_ORDER_STATUSES" :key="status" :value="status">{{ status }}</option>
              </select>
            </label>
          </section>
        </div>

        <section class="mt-6">
          <h4 class="text-xl font-black">Items</h4>
          <div class="mt-4 space-y-3">
            <div v-for="item in orderItems" :key="item.id" class="flex flex-col gap-4 rounded-2xl bg-black p-4 md:flex-row md:items-center">
              <img :src="item.product_image || '/logo.png'" alt="" class="h-20 w-20 rounded-xl object-cover" />
              <div class="flex-1">
                <p class="font-bold">{{ item.product_name || "Product" }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ item.color || "-" }} / {{ item.size || "-" }} / Qty {{ item.quantity || 0 }}</p>
              </div>
              <div class="text-left md:text-right">
                <p class="font-black text-[#FF4D00]">{{ formatCurrency(item.product_price) }}</p>
                <p class="mt-1 text-xs text-gray-500">Product ID: {{ item.product_id || "-" }}</p>
              </div>
            </div>
            <p v-if="itemsLoading" class="text-sm text-gray-500">Loading order items...</p>
            <p v-else-if="!orderItems.length" class="text-sm text-gray-500">No order items found.</p>
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
  filterAdminOrders,
  formatCurrency,
  getAdminOrderLabel,
  getOrderCustomer,
  getOrderCustomerType,
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

  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", order.id);

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

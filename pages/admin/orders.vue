<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">Sales</p>
        <h2 class="mt-2 text-3xl font-black">Orders</h2>
      </div>

      <input
        v-model="search"
        type="search"
        placeholder="Search orders..."
        class="h-12 w-full rounded-2xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition focus:border-[#FF4D00] md:max-w-sm"
      />
    </div>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">Order</th>
              <th class="px-5 py-4">Customer</th>
              <th class="px-5 py-4">Phone</th>
              <th class="px-5 py-4">City</th>
              <th class="px-5 py-4">Status</th>
              <th class="px-5 py-4 text-right">Total</th>
              <th class="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="px-5 py-4 font-bold">#{{ shortOrderId(order) }}</td>
              <td class="px-5 py-4">{{ getOrderCustomer(order).name }}</td>
              <td class="px-5 py-4 text-gray-400">{{ getOrderCustomer(order).phone }}</td>
              <td class="px-5 py-4 text-gray-400">{{ getOrderCustomer(order).city }}</td>
              <td class="px-5 py-4">
                <select
                  :value="order.status || 'pending'"
                  class="rounded-xl border border-white/10 bg-black px-3 py-2 text-[#FF4D00] outline-none"
                  @change="updateStatus(order, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="status in ADMIN_ORDER_STATUSES" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </td>
              <td class="px-5 py-4 text-right font-black">{{ formatCurrency(order.total_price) }}</td>
              <td class="px-5 py-4 text-right">
                <button class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]" @click="openDetails(order)">
                  Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!loading && !filteredOrders.length" class="p-6 text-sm text-gray-500">No orders found.</p>
    </div>

    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">Order Details</p>
            <h3 class="mt-2 text-2xl font-black">#{{ shortOrderId(selectedOrder) }}</h3>
          </div>
          <button class="text-gray-400 hover:text-white" @click="selectedOrder = null">Close</button>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl bg-black p-4">
            <p class="text-sm text-gray-500">Customer</p>
            <p class="mt-2 font-bold">{{ selectedCustomer.name }}</p>
          </div>
          <div class="rounded-2xl bg-black p-4">
            <p class="text-sm text-gray-500">Phone</p>
            <p class="mt-2 font-bold">{{ selectedCustomer.phone }}</p>
          </div>
          <div class="rounded-2xl bg-black p-4">
            <p class="text-sm text-gray-500">City</p>
            <p class="mt-2 font-bold">{{ selectedCustomer.city }}</p>
          </div>
          <div class="rounded-2xl bg-black p-4">
            <p class="text-sm text-gray-500">Address</p>
            <p class="mt-2 font-bold">{{ selectedCustomer.address }}</p>
          </div>
          <div class="rounded-2xl bg-black p-4">
            <p class="text-sm text-gray-500">Status</p>
            <p class="mt-2 font-bold capitalize text-[#FF4D00]">{{ selectedOrder.status || "pending" }}</p>
          </div>
          <div class="rounded-2xl bg-black p-4">
            <p class="text-sm text-gray-500">Total</p>
            <p class="mt-2 text-2xl font-black">{{ formatCurrency(selectedOrder.total_price) }}</p>
          </div>
        </div>

        <div class="mt-6 rounded-2xl bg-black p-4">
          <p class="text-sm text-gray-500">Notes</p>
          <p class="mt-2 text-gray-300">{{ selectedCustomer.notes }}</p>
        </div>

        <div class="mt-6">
          <h4 class="text-xl font-black">Items</h4>
          <div class="mt-4 space-y-3">
            <div v-for="item in orderItems" :key="item.id" class="flex flex-col gap-4 rounded-2xl bg-black p-4 md:flex-row md:items-center">
              <img :src="item.product_image || '/logo.png'" alt="" class="h-20 w-20 rounded-xl object-cover" />
              <div class="flex-1">
                <p class="font-bold">{{ item.product_name }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ item.color || "-" }} / {{ item.size || "-" }} / Qty {{ item.quantity }}</p>
              </div>
              <p class="font-black text-[#FF4D00]">{{ formatCurrency(item.product_price) }}</p>
            </div>
            <p v-if="!itemsLoading && !orderItems.length" class="text-sm text-gray-500">No order items found.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ADMIN_ORDER_STATUSES, type AdminOrderStatus, formatCurrency, getOrderCustomer } from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type OrderRow = {
  id: string;
  order_number?: number | string;
  status?: AdminOrderStatus;
  total_price: number;
  [key: string]: any;
};

type OrderItemRow = {
  id: string;
  product_name?: string;
  product_image?: string;
  product_price: number;
  color?: string;
  size?: string;
  quantity: number;
};

const supabase = useSupabase();
const orders = ref<OrderRow[]>([]);
const selectedOrder = ref<OrderRow | null>(null);
const orderItems = ref<OrderItemRow[]>([]);
const search = ref("");
const loading = ref(true);
const itemsLoading = ref(false);

const filteredOrders = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return orders.value;

  return orders.value.filter((order) => {
    const customer = getOrderCustomer(order);
    return [order.id, order.order_number, order.status, customer.name, customer.phone, customer.city]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });
});

const selectedCustomer = computed(() => getOrderCustomer(selectedOrder.value || {}));
const shortOrderId = (order: OrderRow) => order.order_number || order.id.slice(0, 8);

const loadOrders = async () => {
  loading.value = true;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    loading.value = false;
    return;
  }

  orders.value = (data || []) as OrderRow[];
  loading.value = false;
};

const updateStatus = async (order: OrderRow, status: string) => {
  const nextStatus = status as AdminOrderStatus;
  const previousStatus = order.status;

  order.status = nextStatus;

  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", order.id);

  if (error) {
    order.status = previousStatus;
    alert(error.message);
  }
};

const openDetails = async (order: OrderRow) => {
  selectedOrder.value = order;
  orderItems.value = [];
  itemsLoading.value = true;

  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  if (error) {
    alert(error.message);
    itemsLoading.value = false;
    return;
  }

  orderItems.value = (data || []) as OrderItemRow[];
  itemsLoading.value = false;
};

onMounted(loadOrders);
</script>

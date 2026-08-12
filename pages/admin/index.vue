<template>
  <section class="space-y-8">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">Overview</p>
      <h2 class="mt-2 text-3xl font-black">Dashboard Home</h2>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="card in statCards" :key="card.label" class="rounded-3xl border border-white/10 bg-[#111111] p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm text-gray-400">{{ card.label }}</p>
          <Icon :name="card.icon" class="text-2xl text-[#FF4D00]" />
        </div>
        <h3 class="mt-4 text-3xl font-black">{{ card.value }}</h3>
      </div>
    </div>

    <div class="rounded-3xl border border-white/10 bg-[#111111]">
      <div class="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-xl font-black">Latest Orders</h3>
          <p class="mt-1 text-sm text-gray-500">Most recent customer orders.</p>
        </div>
        <NuxtLink to="/admin/orders" class="w-fit rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]">
          Manage Orders
        </NuxtLink>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">Order</th>
              <th class="px-5 py-4">Customer</th>
              <th class="px-5 py-4">Status</th>
              <th class="px-5 py-4">Created</th>
              <th class="px-5 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="order in latestOrders" :key="order.id">
              <td class="px-5 py-4 font-bold">#{{ shortOrderId(order) }}</td>
              <td class="px-5 py-4">{{ getOrderCustomer(order).name }}</td>
              <td class="px-5 py-4">
                <span class="rounded-full border border-[#FF4D00]/30 bg-[#FF4D00]/10 px-3 py-1 text-xs font-black capitalize text-[#FF4D00]">
                  {{ order.status || "pending" }}
                </span>
              </td>
              <td class="px-5 py-4 text-gray-400">{{ formatDate(order.created_at) }}</td>
              <td class="px-5 py-4 text-right font-black">{{ formatCurrency(order.total_price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!loading && !latestOrders.length" class="p-6 text-sm text-gray-500">No orders found.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { formatCurrency, formatDate, getOrderCustomer } from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type OrderRow = {
  id: string;
  order_number?: number | string;
  total_price: number;
  status?: string;
  created_at?: string;
  [key: string]: any;
};

const supabase = useSupabase();
const loading = ref(true);
const totalOrders = ref(0);
const totalRevenue = ref(0);
const totalProducts = ref(0);
const totalCustomers = ref(0);
const latestOrders = ref<OrderRow[]>([]);

const statCards = computed(() => [
  { label: "Total Orders", value: totalOrders.value, icon: "i-heroicons-clipboard-document-list" },
  { label: "Total Revenue", value: formatCurrency(totalRevenue.value), icon: "i-heroicons-banknotes" },
  { label: "Total Products", value: totalProducts.value, icon: "i-heroicons-shopping-bag" },
  { label: "Total Customers", value: totalCustomers.value, icon: "i-heroicons-users" },
]);

const getCount = async (table: string) => {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
};

const shortOrderId = (order: OrderRow) => order.order_number || order.id.slice(0, 8);

const loadDashboard = async () => {
  loading.value = true;

  const [
    { data: latest, error: latestError },
    { data: revenueOrders, error: revenueError },
    ordersCount,
    productsCount,
    customersCount,
  ] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("orders").select("total_price"),
    getCount("orders"),
    getCount("products"),
    getCount("profiles"),
  ]);

  if (latestError) throw latestError;
  if (revenueError) throw revenueError;

  latestOrders.value = (latest || []) as OrderRow[];
  totalRevenue.value = (revenueOrders || []).reduce((sum, order) => sum + Number(order.total_price || 0), 0);
  totalOrders.value = ordersCount;
  totalProducts.value = productsCount;
  totalCustomers.value = customersCount;
  loading.value = false;
};

onMounted(loadDashboard);
</script>

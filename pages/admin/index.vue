<template>
  <section class="space-y-8">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">
        Overview
      </p>
      <h2 class="mt-2 text-3xl font-black">Dashboard Home</h2>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="rounded-3xl border border-white/10 bg-[#111111] p-6"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-400">{{ card.label }}</p>
          <Icon :name="card.icon" class="text-2xl text-[#FF4D00]" />
        </div>
        <h3 class="mt-4 text-3xl font-black">{{ card.value }}</h3>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div class="rounded-3xl border border-white/10 bg-[#111111] p-6">
        <h3 class="text-xl font-black">Monthly Revenue</h3>
        <div class="mt-8 flex h-64 items-end gap-3">
          <div
            v-for="month in monthlyRevenue"
            :key="month.label"
            class="flex flex-1 flex-col items-center gap-3"
          >
            <div class="flex h-48 w-full items-end rounded-xl bg-black">
              <div
                class="w-full rounded-xl bg-[#FF4D00]"
                :style="{ height: `${month.percent}%` }"
              />
            </div>
            <p class="text-xs font-bold text-gray-500">{{ month.label }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-white/10 bg-[#111111] p-6">
        <h3 class="text-xl font-black">Top Selling Products</h3>
        <div class="mt-6 space-y-4">
          <div
            v-for="product in topProducts"
            :key="product.id"
            class="flex items-center justify-between gap-4 rounded-2xl bg-black p-4"
          >
            <div class="min-w-0">
              <p class="truncate font-bold">{{ product.name }}</p>
              <p class="text-sm text-gray-500">{{ product.quantity }} sold</p>
            </div>
            <p class="font-black text-[#FF4D00]">${{ product.revenue }}</p>
          </div>
          <p v-if="!topProducts.length" class="text-sm text-gray-500">
            No sales data yet.
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div class="rounded-3xl border border-white/10 bg-[#111111] p-6">
        <h3 class="text-xl font-black">Recent Orders</h3>
        <div class="mt-6 overflow-x-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="text-gray-500">
              <tr>
                <th class="py-3">Order</th>
                <th class="py-3">Customer</th>
                <th class="py-3">Status</th>
                <th class="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="order in recentOrders" :key="order.id">
                <td class="py-4 font-bold">#{{ order.id.slice(0, 8) }}</td>
                <td class="py-4 text-gray-300">{{ order.full_name || "Customer" }}</td>
                <td class="py-4 capitalize text-[#FF4D00]">{{ order.status }}</td>
                <td class="py-4 text-right font-black">${{ order.total_price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-3xl border border-white/10 bg-[#111111] p-6">
        <h3 class="text-xl font-black">Latest Users</h3>
        <div class="mt-6 space-y-4">
          <div
            v-for="user in latestUsers"
            :key="user.id"
            class="flex items-center gap-4 rounded-2xl bg-black p-4"
          >
            <img
              :src="user.avatar || 'https://ui-avatars.com/api/?name=User'"
              alt=""
              class="h-11 w-11 rounded-full object-cover"
            />
            <div class="min-w-0">
              <p class="truncate font-bold">{{ user.full_name || "User" }}</p>
              <p class="truncate text-sm text-gray-500">{{ user.email }}</p>
            </div>
          </div>
          <p v-if="!latestUsers.length" class="text-sm text-gray-500">
            No users found.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type OrderRow = {
  id: string;
  total_price: number;
  status: string;
  full_name?: string;
  created_at?: string;
};

type UserRow = {
  id: string;
  full_name?: string;
  email?: string;
  avatar?: string;
};

type OrderItemRow = {
  product_id?: number;
  product_name?: string;
  quantity?: number;
  product_price?: number;
};

const supabase = useSupabase();

const totalRevenue = ref(0);
const totalOrders = ref(0);
const totalUsers = ref(0);
const totalProducts = ref(0);
const recentOrders = ref<OrderRow[]>([]);
const latestUsers = ref<UserRow[]>([]);
const topProducts = ref<{ id: string; name: string; quantity: number; revenue: number }[]>([]);
const monthlyRevenue = ref<{ label: string; value: number; percent: number }[]>([]);

const statCards = computed(() => [
  { label: "Total Revenue", value: `$${totalRevenue.value}`, icon: "i-heroicons-banknotes" },
  { label: "Total Orders", value: totalOrders.value, icon: "i-heroicons-clipboard-document-list" },
  { label: "Total Users", value: totalUsers.value, icon: "i-heroicons-users" },
  { label: "Total Products", value: totalProducts.value, icon: "i-heroicons-shopping-bag" },
]);

const getCount = async (table: string) => {
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count || 0;
};

const buildMonthlyRevenue = (orders: OrderRow[]) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
      value: 0,
      percent: 0,
    };
  });

  orders.forEach((order) => {
    if (!order.created_at) return;
    const date = new Date(order.created_at);
    const item = months.find((month) => month.key === `${date.getFullYear()}-${date.getMonth()}`);
    if (item) item.value += Number(order.total_price || 0);
  });

  const max = Math.max(...months.map((month) => month.value), 1);
  monthlyRevenue.value = months.map((month) => ({
    ...month,
    percent: Math.max(6, Math.round((month.value / max) * 100)),
  }));
};

onMounted(async () => {
  const [{ data: orders }, { data: users }, { data: orderItems }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, email, avatar, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("order_items").select("product_id, product_name, quantity, product_price"),
  ]);

  const orderRows = (orders || []) as OrderRow[];
  recentOrders.value = orderRows.slice(0, 6);
  latestUsers.value = (users || []) as UserRow[];
  totalRevenue.value = orderRows.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
  buildMonthlyRevenue(orderRows);

  const totals = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  ((orderItems || []) as OrderItemRow[]).forEach((item) => {
    const id = String(item.product_id || item.product_name || "unknown");
    const current = totals.get(id) || {
      id,
      name: item.product_name || "Product",
      quantity: 0,
      revenue: 0,
    };
    current.quantity += Number(item.quantity || 0);
    current.revenue += Number(item.product_price || 0) * Number(item.quantity || 0);
    totals.set(id, current);
  });
  topProducts.value = Array.from(totals.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const [ordersCount, usersCount, productsCount] = await Promise.all([
    getCount("orders"),
    getCount("profiles"),
    getCount("products"),
  ]);

  totalOrders.value = ordersCount;
  totalUsers.value = usersCount;
  totalProducts.value = productsCount;
});
</script>

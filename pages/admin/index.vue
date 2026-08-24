<template>
  <section class="space-y-6 lg:space-y-8">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t('admin.overview') }}</p>
      <h2 class="mt-2 text-3xl font-black">{{ t('admin.dashboardHome') }}</h2>
    </div>

    <p v-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      {{ errorMessage }}
    </p>

    <div class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
      <div v-for="card in statCards" :key="card.labelKey" class="rounded-2xl border border-white/10 bg-[#111111] p-4 sm:rounded-3xl sm:p-6">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm text-gray-400">{{ t(card.labelKey) }}</p>
          <Icon :name="card.icon" class="hidden text-2xl text-[#FF4D00] sm:block" />
        </div>
        <h3 class="mt-3 break-words text-2xl font-black sm:mt-4 sm:text-3xl">{{ card.value }}</h3>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <section class="rounded-3xl border border-white/10 bg-[#111111]">
        <div class="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-xl font-black">{{ t('admin.recentOrders') }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ t('admin.latestCustomerOrders') }}</p>
          </div>
          <NuxtLink to="/admin/orders" class="w-fit rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]">
            {{ t('admin.manageOrders') }}
          </NuxtLink>
        </div>

        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-black text-gray-500">
              <tr>
                <th class="px-5 py-4">{{ t('admin.order') }}</th>
                <th class="px-5 py-4">{{ t('common.customer') }}</th>
                <th class="px-5 py-4">{{ t('common.status') }}</th>
                <th class="px-5 py-4">{{ t('common.created') }}</th>
                <th class="px-5 py-4 text-right">{{ t('common.total') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="order in recentOrders" :key="order.id">
                <td class="px-5 py-4 font-bold">#{{ getAdminOrderLabel(order) }}</td>
                <td class="px-5 py-4">{{ getOrderCustomer(order).name }}</td>
                <td class="px-5 py-4">
                  <span class="rounded-full border border-[#FF4D00]/30 bg-[#FF4D00]/10 px-3 py-1 text-xs font-black capitalize text-[#FF4D00]">
                    {{ t(statusLabelKey(order.status)) }}
                  </span>
                </td>
                <td class="px-5 py-4 text-gray-400">{{ formatDate(order.created_at) }}</td>
                <td class="px-5 py-4 text-right font-black">{{ formatCurrency(order.total_price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid gap-3 p-4 md:hidden">
          <article v-for="order in recentOrders" :key="order.id" class="admin-mobile-card rounded-2xl border border-white/10 bg-black p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-black">#{{ getAdminOrderLabel(order) }}</p>
                <p class="mt-1 truncate text-sm text-gray-400">{{ getOrderCustomer(order).name }}</p>
              </div>
              <p class="shrink-0 font-black text-[#FF4D00]">{{ formatCurrency(order.total_price) }}</p>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span class="rounded-full border border-[#FF4D00]/30 bg-[#FF4D00]/10 px-3 py-1 font-black text-[#FF4D00]">
                {{ t(statusLabelKey(order.status)) }}
              </span>
              <span>{{ formatDate(order.created_at) }}</span>
            </div>
          </article>
        </div>

        <p v-if="loading && !recentOrders.length" class="p-6 text-sm text-gray-500">{{ t('admin.loadingOrders') }}</p>
        <p v-else-if="!recentOrders.length" class="p-6 text-sm text-gray-500">{{ t('admin.noOrders') }}</p>
      </section>

      <section class="rounded-3xl border border-white/10 bg-[#111111]">
        <div class="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 class="text-xl font-black">{{ t('admin.recentProducts') }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ t('admin.latestCatalogItems') }}</p>
          </div>
          <NuxtLink to="/admin/products" class="w-fit rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]">
            {{ t('admin.manageProducts') }}
          </NuxtLink>
        </div>

        <div class="hidden overflow-x-auto md:block">
          <table class="w-full min-w-[700px] text-left text-sm">
            <thead class="bg-black text-gray-500">
              <tr>
                <th class="px-5 py-4">{{ t('common.product') }}</th>
                <th class="px-5 py-4">{{ t('common.category') }}</th>
                <th class="px-5 py-4">{{ t('common.created') }}</th>
                <th class="px-5 py-4 text-right">{{ t('common.price') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr v-for="product in recentProducts" :key="product.id">
                <td class="px-5 py-4">
                  <p class="font-bold">{{ product.title || t('admin.untitledProduct') }}</p>
                  <p class="mt-1 text-xs text-gray-500">{{ product.slug }}</p>
                </td>
                <td class="px-5 py-4 text-gray-400">{{ product.categories?.name || t('admin.uncategorized') }}</td>
                <td class="px-5 py-4 text-gray-400">{{ formatDate(product.created_at) }}</td>
                <td class="px-5 py-4 text-right font-black">{{ formatCurrency(product.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="grid gap-3 p-4 md:hidden">
          <article v-for="product in recentProducts" :key="product.id" class="admin-mobile-card rounded-2xl border border-white/10 bg-black p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-black">{{ product.title || t('admin.untitledProduct') }}</p>
                <p class="mt-1 truncate text-xs text-gray-500">{{ product.slug }}</p>
              </div>
              <p class="shrink-0 font-black text-[#FF4D00]">{{ formatCurrency(product.price) }}</p>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>{{ product.categories?.name || t('admin.uncategorized') }}</span>
              <span>{{ formatDate(product.created_at) }}</span>
            </div>
          </article>
        </div>

        <p v-if="loading && !recentProducts.length" class="p-6 text-sm text-gray-500">{{ t('admin.loadingProducts') }}</p>
        <p v-else-if="!recentProducts.length" class="p-6 text-sm text-gray-500">{{ t('admin.noProducts') }}</p>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  calculateAdminDashboardStats,
  formatCurrency,
  formatDate,
  getAdminOrderLabel,
  getOrderCustomer,
} from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type OrderRow = {
  id: string;
  order_number?: number | string | null;
  total_price?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  [key: string]: any;
};

type ProductRow = {
  id: number;
  title?: string | null;
  slug?: string | null;
  price?: number | string | null;
  created_at?: string | null;
  categories?: { name?: string | null } | null;
};

const supabase = useSupabase();
const { t } = useI18n();
const loading = ref(true);
const errorMessage = ref("");
const allOrders = ref<OrderRow[]>([]);
const recentOrders = ref<OrderRow[]>([]);
const recentProducts = ref<ProductRow[]>([]);
const totalProducts = ref(0);
const totalCategories = ref(0);
const dashboardStats = computed(() => calculateAdminDashboardStats(allOrders.value));

const statCards = computed(() => [
  { labelKey: "admin.totalOrders", value: dashboardStats.value.totalOrders, icon: "i-heroicons-clipboard-document-list" },
  { labelKey: "admin.pendingOrders", value: dashboardStats.value.pendingOrders, icon: "i-heroicons-clock" },
  { labelKey: "admin.completedOrders", value: dashboardStats.value.completedOrders, icon: "i-heroicons-check-circle" },
  { labelKey: "admin.totalRevenue", value: formatCurrency(dashboardStats.value.totalRevenue), icon: "i-heroicons-banknotes" },
  { labelKey: "admin.totalProducts", value: totalProducts.value, icon: "i-heroicons-shopping-bag" },
  { labelKey: "admin.totalCategories", value: totalCategories.value, icon: "i-heroicons-tag" },
]);

const statusLabelKey = (status?: string | null) => {
  const normalized = status || "pending";
  return `orders.${normalized}`;
};

const getCount = async (table: "products" | "categories") => {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
};

const loadDashboard = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [
      { data: ordersData, error: ordersError },
      { data: latestOrdersData, error: latestOrdersError },
      { data: latestProductsData, error: latestProductsError },
      productsCount,
      categoriesCount,
    ] = await Promise.all([
      supabase.from("orders").select("id,status,total_price"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
      supabase
        .from("products")
        .select("id,title,slug,price,created_at,categories(name)")
        .order("created_at", { ascending: false })
        .limit(8),
      getCount("products"),
      getCount("categories"),
    ]);

    if (ordersError) throw ordersError;
    if (latestOrdersError) throw latestOrdersError;
    if (latestProductsError) throw latestProductsError;

    allOrders.value = (ordersData || []) as OrderRow[];
    recentOrders.value = (latestOrdersData || []) as OrderRow[];
    recentProducts.value = (latestProductsData || []) as ProductRow[];
    totalProducts.value = productsCount;
    totalCategories.value = categoriesCount;
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : t("admin.dashboardLoadFailed");
  } finally {
    loading.value = false;
  }
};

onMounted(loadDashboard);
</script>

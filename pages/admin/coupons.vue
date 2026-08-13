<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">Promotions</p>
        <h2 class="mt-2 text-3xl font-black">Coupons</h2>
      </div>

      <button class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white transition hover:opacity-90" @click="openCreate">
        Add Coupon
      </button>
    </div>

    <div class="grid gap-3 rounded-3xl border border-white/10 bg-[#111111] p-4 md:grid-cols-[1fr_11rem_12rem_12rem_10rem]">
      <input v-model="search" type="search" placeholder="Search code or name..." class="field" />
      <select v-model="activeFilter" class="field">
        <option value="all">All states</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select v-model="typeFilter" class="field">
        <option value="all">All discounts</option>
        <option value="percentage">Percentage</option>
        <option value="fixed_amount">Fixed amount</option>
      </select>
      <select v-model="lifecycleFilter" class="field">
        <option value="all">Any timing</option>
        <option value="active">Live</option>
        <option value="scheduled">Scheduled</option>
        <option value="expired">Expired</option>
        <option value="inactive">Inactive</option>
      </select>
      <select v-model="sortBy" class="field">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="code">Code</option>
        <option value="usage">Usage</option>
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
        <table class="w-full min-w-[1480px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">Coupon</th>
              <th class="px-5 py-4">Discount</th>
              <th class="px-5 py-4">Minimum</th>
              <th class="px-5 py-4">Max Discount</th>
              <th class="px-5 py-4">Starts</th>
              <th class="px-5 py-4">Expires</th>
              <th class="px-5 py-4">State</th>
              <th class="px-5 py-4">Usage</th>
              <th class="px-5 py-4">Limits</th>
              <th class="px-5 py-4">Restrictions</th>
              <th class="px-5 py-4">Created</th>
              <th class="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="coupon in visibleCoupons" :key="coupon.id">
              <td class="px-5 py-4">
                <p class="font-black text-[#FF4D00]">{{ coupon.code }}</p>
                <p class="mt-1 font-bold">{{ coupon.name }}</p>
                <p v-if="coupon.description" class="mt-1 max-w-xs truncate text-xs text-gray-500">{{ coupon.description }}</p>
              </td>
              <td class="px-5 py-4">
                <p class="font-black">{{ formatCouponDiscount(coupon) }}</p>
                <p class="mt-1 text-xs capitalize text-gray-500">{{ coupon.discount_type?.replace("_", " ") }}</p>
              </td>
              <td class="px-5 py-4 text-gray-300">{{ formatCurrency(coupon.minimum_order_amount) }}</td>
              <td class="px-5 py-4 text-gray-300">{{ coupon.maximum_discount_amount ? formatCurrency(coupon.maximum_discount_amount) : "-" }}</td>
              <td class="px-5 py-4 text-gray-400">{{ formatDateTime(coupon.starts_at) }}</td>
              <td class="px-5 py-4 text-gray-400">{{ formatDateTime(coupon.expires_at) }}</td>
              <td class="px-5 py-4">
                <button
                  :disabled="savingId === coupon.id"
                  class="rounded-full border px-3 py-1 text-xs font-black capitalize transition disabled:opacity-50"
                  :class="statusClass(coupon)"
                  @click="toggleActive(coupon)"
                >
                  {{ getCouponLifecycleStatus(coupon) }}
                </button>
              </td>
              <td class="px-5 py-4 font-black">{{ getCouponUsageCount(coupon) }}</td>
              <td class="px-5 py-4 text-gray-300">
                <p>Total: {{ coupon.max_total_uses ?? "Unlimited" }}</p>
                <p class="mt-1">Per user: {{ coupon.max_uses_per_user ?? "Unlimited" }}</p>
              </td>
              <td class="px-5 py-4 text-gray-300">{{ getCouponRestrictionSummary(coupon) }}</td>
              <td class="px-5 py-4 text-gray-400">{{ formatDate(coupon.created_at) }}</td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <button class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]" @click="openEdit(coupon)">
                    Edit
                  </button>
                  <button class="rounded-xl border border-red-500/40 px-4 py-2 font-bold text-red-400 transition hover:bg-red-500 hover:text-white" @click="deleteCoupon(coupon)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 border-t border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-gray-500">Showing {{ visibleCoupons.length }} of {{ filteredCoupons.length }}</p>
        <button v-if="visibleCoupons.length < filteredCoupons.length" class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]" @click="limit += pageSize">
          Load More
        </button>
      </div>

      <p v-if="loading" class="p-6 text-sm text-gray-500">Loading coupons...</p>
      <p v-else-if="!filteredCoupons.length" class="p-6 text-sm text-gray-500">No coupons found.</p>
    </div>

    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <form class="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6" @submit.prevent="saveCoupon">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ editingId ? "Edit Coupon" : "Create Coupon" }}</p>
            <h3 class="mt-2 text-2xl font-black">{{ form.code || "Coupon Details" }}</h3>
          </div>
          <button type="button" class="text-gray-400 hover:text-white" @click="closeModal">Close</button>
        </div>

        <div class="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <section class="rounded-2xl border border-white/10 bg-black p-5">
            <h4 class="font-black">Configuration</h4>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="field-label">Code</span>
                <input v-model="form.code" required class="field mt-2 uppercase" @blur="form.code = normalizeCouponCode(form.code)" />
              </label>
              <label class="block">
                <span class="field-label">Name</span>
                <input v-model="form.name" required class="field mt-2" />
              </label>
              <label class="block">
                <span class="field-label">Discount Type</span>
                <select v-model="form.discount_type" class="field mt-2">
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed amount</option>
                </select>
              </label>
              <label class="block">
                <span class="field-label">Discount Value</span>
                <input v-model.number="form.discount_value" required type="number" min="0" step="0.01" class="field mt-2" />
              </label>
              <label class="block">
                <span class="field-label">Minimum Order</span>
                <input v-model.number="form.minimum_order_amount" type="number" min="0" step="0.01" class="field mt-2" />
              </label>
              <label class="block">
                <span class="field-label">Maximum Discount</span>
                <input v-model.number="form.maximum_discount_amount" :disabled="form.discount_type !== 'percentage'" type="number" min="0" step="0.01" class="field mt-2 disabled:opacity-40" />
              </label>
              <label class="block">
                <span class="field-label">Starts At</span>
                <input v-model="form.starts_at" type="datetime-local" class="field mt-2" />
              </label>
              <label class="block">
                <span class="field-label">Expires At</span>
                <input v-model="form.expires_at" type="datetime-local" class="field mt-2" />
              </label>
              <label class="block">
                <span class="field-label">Max Total Uses</span>
                <input v-model.number="form.max_total_uses" type="number" min="0" step="1" class="field mt-2" />
              </label>
              <label class="block">
                <span class="field-label">Max Uses Per User</span>
                <input v-model.number="form.max_uses_per_user" type="number" min="0" step="1" class="field mt-2" />
              </label>
              <label class="flex items-center gap-3 md:col-span-2">
                <input v-model="form.active" type="checkbox" class="h-4 w-4 accent-[#FF4D00]" />
                <span class="font-bold text-gray-300">Active</span>
              </label>
              <label class="block md:col-span-2">
                <span class="field-label">Description</span>
                <textarea v-model="form.description" rows="4" class="field mt-2" />
              </label>
            </div>
          </section>

          <section class="rounded-2xl border border-white/10 bg-black p-5">
            <h4 class="font-black">Restrictions</h4>
            <div class="mt-4 grid gap-3">
              <label class="restriction-option">
                <input v-model="restrictionMode" type="radio" value="all" class="accent-[#FF4D00]" />
                <span>All products</span>
              </label>
              <label class="restriction-option">
                <input v-model="restrictionMode" type="radio" value="products" class="accent-[#FF4D00]" />
                <span>Specific products</span>
              </label>
              <label class="restriction-option">
                <input v-model="restrictionMode" type="radio" value="categories" class="accent-[#FF4D00]" />
                <span>Specific categories</span>
              </label>
            </div>

            <div v-if="restrictionMode === 'products'" class="mt-5 max-h-72 space-y-2 overflow-y-auto pr-1">
              <label v-for="product in products" :key="product.id" class="selection-row">
                <input v-model="selectedProductIds" type="checkbox" :value="product.id" class="accent-[#FF4D00]" />
                <span>{{ product.title }}</span>
              </label>
              <p v-if="!products.length" class="text-sm text-gray-500">No products found.</p>
            </div>

            <div v-if="restrictionMode === 'categories'" class="mt-5 max-h-72 space-y-2 overflow-y-auto pr-1">
              <label v-for="category in categories" :key="category.id" class="selection-row">
                <input v-model="selectedCategoryIds" type="checkbox" :value="category.id" class="accent-[#FF4D00]" />
                <span>{{ category.name }}</span>
              </label>
              <p v-if="!categories.length" class="text-sm text-gray-500">No categories found.</p>
            </div>
          </section>
        </div>

        <p v-if="modalError" class="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{{ modalError }}</p>

        <div class="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <button type="button" class="rounded-2xl border border-white/10 px-5 py-3 font-bold" @click="closeModal">Cancel</button>
          <button type="submit" :disabled="saving" class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white disabled:opacity-50">
            {{ saving ? "Saving..." : "Save Coupon" }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  buildCouponPayload,
  canDeleteCoupon,
  filterAdminCoupons,
  formatCouponDiscount,
  getCouponLifecycleStatus,
  getCouponRestrictionMode,
  getCouponRestrictionSummary,
  getCouponUsageCount,
  normalizeCouponCode,
  validateCouponForm,
  type AdminCouponDiscountType,
  type AdminCouponRestrictionMode,
} from "../../utils/adminCoupons";
import { formatCurrency, formatDate } from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type ProductRow = {
  id: number;
  title: string;
};

type CategoryRow = {
  id: number;
  name: string;
};

type CouponRow = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discount_type: AdminCouponDiscountType;
  discount_value: number | string;
  minimum_order_amount?: number | string | null;
  maximum_discount_amount?: number | string | null;
  starts_at?: string | null;
  expires_at?: string | null;
  active: boolean;
  max_total_uses?: number | null;
  max_uses_per_user?: number | null;
  created_at?: string | null;
  coupon_products?: Array<{ product_id: number; products?: { title?: string } | null }>;
  coupon_categories?: Array<{ category_id: number; categories?: { name?: string } | null }>;
  coupon_redemptions?: Array<{ id: string }>;
};

const supabase = useSupabase();
const coupons = ref<CouponRow[]>([]);
const products = ref<ProductRow[]>([]);
const categories = ref<CategoryRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const savingId = ref<string | null>(null);
const modalOpen = ref(false);
const editingId = ref<string | null>(null);
const search = ref("");
const activeFilter = ref<"all" | "active" | "inactive">("all");
const typeFilter = ref<"all" | AdminCouponDiscountType>("all");
const lifecycleFilter = ref("all");
const sortBy = ref<"newest" | "oldest" | "code" | "usage">("newest");
const limit = ref(12);
const pageSize = 12;
const errorMessage = ref("");
const successMessage = ref("");
const modalError = ref("");
const restrictionMode = ref<AdminCouponRestrictionMode>("all");
const selectedProductIds = ref<number[]>([]);
const selectedCategoryIds = ref<number[]>([]);

const defaultForm = () => ({
  code: "",
  name: "",
  description: "",
  discount_type: "percentage" as AdminCouponDiscountType,
  discount_value: 0,
  minimum_order_amount: 0,
  maximum_discount_amount: null as number | null,
  starts_at: "",
  expires_at: "",
  active: true,
  max_total_uses: null as number | null,
  max_uses_per_user: null as number | null,
});

const form = ref(defaultForm());

const filteredCoupons = computed(() =>
  filterAdminCoupons(coupons.value, {
    search: search.value,
    active: activeFilter.value,
    type: typeFilter.value,
    lifecycle: lifecycleFilter.value as any,
    sort: sortBy.value,
  }),
);

const visibleCoupons = computed(() => filteredCoupons.value.slice(0, limit.value));

watch([search, activeFilter, typeFilter, lifecycleFilter, sortBy], () => {
  limit.value = pageSize;
});

watch(restrictionMode, (mode) => {
  if (mode !== "products") selectedProductIds.value = [];
  if (mode !== "categories") selectedCategoryIds.value = [];
});

const setMessage = (type: "success" | "error", message: string) => {
  successMessage.value = type === "success" ? message : "";
  errorMessage.value = type === "error" ? message : "";
};

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

const toDatetimeLocal = (date?: string | null) => {
  if (!date) return "";
  const parsed = new Date(date);
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoDate = (date?: string | null) => (date ? new Date(date).toISOString() : null);

const statusClass = (coupon: CouponRow) => {
  const status = getCouponLifecycleStatus(coupon);

  if (status === "active") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  if (status === "scheduled") return "border-sky-400/30 bg-sky-400/10 text-sky-300";
  if (status === "expired") return "border-yellow-400/30 bg-yellow-400/10 text-yellow-200";
  return "border-red-400/30 bg-red-400/10 text-red-300";
};

const loadData = async () => {
  loading.value = true;
  setMessage("error", "");

  const [{ data: couponsData, error: couponsError }, { data: productsData, error: productsError }, { data: categoriesData, error: categoriesError }] = await Promise.all([
    supabase
      .from("coupons")
      .select("*, coupon_products(product_id, products(id, title)), coupon_categories(category_id, categories(id, name)), coupon_redemptions(id)")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("id, title").order("title"),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (couponsError) setMessage("error", couponsError.message);
  if (productsError) setMessage("error", productsError.message);
  if (categoriesError) setMessage("error", categoriesError.message);

  coupons.value = (couponsData || []) as CouponRow[];
  products.value = (productsData || []) as ProductRow[];
  categories.value = (categoriesData || []) as CategoryRow[];
  loading.value = false;
};

const openCreate = () => {
  editingId.value = null;
  form.value = defaultForm();
  restrictionMode.value = "all";
  selectedProductIds.value = [];
  selectedCategoryIds.value = [];
  modalError.value = "";
  modalOpen.value = true;
};

const openEdit = (coupon: CouponRow) => {
  editingId.value = coupon.id;
  form.value = {
    code: coupon.code,
    name: coupon.name,
    description: coupon.description || "",
    discount_type: coupon.discount_type,
    discount_value: Number(coupon.discount_value || 0),
    minimum_order_amount: Number(coupon.minimum_order_amount || 0),
    maximum_discount_amount: coupon.maximum_discount_amount === null || coupon.maximum_discount_amount === undefined ? null : Number(coupon.maximum_discount_amount),
    starts_at: toDatetimeLocal(coupon.starts_at),
    expires_at: toDatetimeLocal(coupon.expires_at),
    active: coupon.active !== false,
    max_total_uses: coupon.max_total_uses ?? null,
    max_uses_per_user: coupon.max_uses_per_user ?? null,
  };
  restrictionMode.value = getCouponRestrictionMode(coupon);
  selectedProductIds.value = (coupon.coupon_products || []).map((item) => item.product_id);
  selectedCategoryIds.value = (coupon.coupon_categories || []).map((item) => item.category_id);
  modalError.value = "";
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const saveRestrictions = async (couponId: string) => {
  const [{ error: productDeleteError }, { error: categoryDeleteError }] = await Promise.all([
    supabase.from("coupon_products").delete().eq("coupon_id", couponId),
    supabase.from("coupon_categories").delete().eq("coupon_id", couponId),
  ]);

  if (productDeleteError) throw productDeleteError;
  if (categoryDeleteError) throw categoryDeleteError;

  if (restrictionMode.value === "products" && selectedProductIds.value.length) {
    const { error } = await supabase.from("coupon_products").insert(
      selectedProductIds.value.map((productId) => ({
        coupon_id: couponId,
        product_id: productId,
      })),
    );
    if (error) throw error;
  }

  if (restrictionMode.value === "categories" && selectedCategoryIds.value.length) {
    const { error } = await supabase.from("coupon_categories").insert(
      selectedCategoryIds.value.map((categoryId) => ({
        coupon_id: couponId,
        category_id: categoryId,
      })),
    );
    if (error) throw error;
  }
};

const validateUniqueCode = () => {
  const code = normalizeCouponCode(form.value.code);
  const duplicate = coupons.value.find((coupon) => coupon.code.toUpperCase() === code && coupon.id !== editingId.value);
  return duplicate ? "Coupon code already exists." : "";
};

const saveCoupon = async () => {
  try {
    saving.value = true;
    modalError.value = "";
    form.value.code = normalizeCouponCode(form.value.code);

    const validationError =
      validateCouponForm(form.value) ||
      validateUniqueCode();

    if (validationError) {
      modalError.value = validationError;
      return;
    }

    const payload = buildCouponPayload({
      ...form.value,
      starts_at: toIsoDate(form.value.starts_at),
      expires_at: toIsoDate(form.value.expires_at),
    });

    let couponId = editingId.value;

    if (couponId) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", couponId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("coupons").insert(payload).select("id").single();
      if (error) throw error;
      couponId = data.id;
    }

    await saveRestrictions(couponId);
    await loadData();
    closeModal();
    setMessage("success", "Coupon saved.");
  } catch (error: unknown) {
    modalError.value = error instanceof Error ? error.message : "Unable to save coupon";
  } finally {
    saving.value = false;
  }
};

const toggleActive = async (coupon: CouponRow) => {
  savingId.value = coupon.id;
  setMessage("error", "");

  const nextActive = coupon.active === false;
  const { error } = await supabase.from("coupons").update({ active: nextActive }).eq("id", coupon.id);

  if (error) {
    setMessage("error", error.message);
  } else {
    coupon.active = nextActive;
    setMessage("success", `Coupon ${nextActive ? "activated" : "deactivated"}.`);
  }

  savingId.value = null;
};

const deleteCoupon = async (coupon: CouponRow) => {
  if (!canDeleteCoupon(coupon)) {
    setMessage("error", "This coupon has redemption history. Deactivate it instead of deleting it.");
    return;
  }

  if (!confirm(`Delete coupon ${coupon.code}? This cannot be undone.`)) return;

  const { error } = await supabase.from("coupons").delete().eq("id", coupon.id);
  if (error) {
    setMessage("error", error.message);
    return;
  }

  coupons.value = coupons.value.filter((item) => item.id !== coupon.id);
  setMessage("success", "Coupon deleted.");
};

onMounted(loadData);
</script>

<style scoped>
.field-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #d4d4d4;
}

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

.restriction-option,
.selection-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: #111111;
  padding: 0.875rem 1rem;
  font-weight: 700;
  color: #d4d4d4;
}
</style>

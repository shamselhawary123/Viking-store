<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">
          {{ t("admin.storeSection") }}
        </p>
        <h2 class="mt-2 text-3xl font-black">{{ t("admin.shippingSettings") }}</h2>
      </div>
      <button
        class="rounded-2xl bg-[#FF4D00] px-5 py-3 text-sm font-black text-white transition hover:bg-[#cf1d1d] disabled:opacity-50"
        :disabled="saving || loading"
        @click="saveShipping"
      >
        {{ saving ? t("admin.saving") : t("admin.saveShippingSettings") }}
      </button>
    </div>

    <p v-if="successMessage" class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      {{ errorMessage }}
    </p>

    <div class="rounded-3xl border border-white/10 bg-[#111111] p-4 sm:p-6">
      <h3 class="text-xl font-black">{{ t("admin.generalSettings") }}</h3>
      <div class="mt-5 grid gap-4 lg:grid-cols-2">
        <label class="setting-toggle">
          <input v-model="settings.shipping_enabled" type="checkbox" />
          <span>{{ t("admin.enableShipping") }}</span>
        </label>
        <label class="setting-toggle">
          <input v-model="settings.free_shipping_all_orders" type="checkbox" />
          <span>{{ t("admin.freeShippingAllOrders") }}</span>
        </label>
        <label class="setting-toggle">
          <input v-model="settings.free_shipping_threshold_enabled" type="checkbox" />
          <span>{{ t("admin.enableFreeShippingThreshold") }}</span>
        </label>
        <label class="block">
          <span class="field-label">{{ t("admin.freeShippingThreshold") }}</span>
          <input v-model="settings.free_shipping_threshold" class="field mt-2" min="0" step="0.01" type="number" />
        </label>
        <label class="block lg:col-span-2">
          <span class="field-label">{{ t("admin.defaultShippingFee") }}</span>
          <input v-model="settings.default_shipping_fee" class="field mt-2" min="0" step="0.01" type="number" />
        </label>
      </div>
    </div>

    <div class="rounded-3xl border border-white/10 bg-[#111111] p-4 sm:p-6">
      <h3 class="text-xl font-black">{{ t("admin.governorateRates") }}</h3>
      <p class="mt-2 text-sm text-gray-500">{{ t("admin.governorateRatesText") }}</p>

      <div class="mt-5 overflow-x-auto">
        <table class="w-full min-w-[720px] text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-4 py-3 text-start">{{ t("checkout.governorate") }}</th>
              <th class="px-4 py-3 text-start">{{ t("admin.feeEgp") }}</th>
              <th class="px-4 py-3 text-start">{{ t("common.active") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="governorate in governorates" :key="governorate.code">
              <td class="px-4 py-3 font-bold">{{ localizedName(governorate) }}</td>
              <td class="px-4 py-3">
                <input
                  v-model="governorate.shipping_fee"
                  class="field"
                  min="0"
                  step="0.01"
                  type="number"
                />
              </td>
              <td class="px-4 py-3">
                <input v-model="governorate.is_enabled" class="h-5 w-5 accent-[#FF4D00]" type="checkbox" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="loading" class="mt-5 text-sm text-gray-500">{{ t("common.loading") }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type ShippingSettings = {
  shipping_enabled: boolean;
  free_shipping_all_orders: boolean;
  free_shipping_threshold_enabled: boolean;
  free_shipping_threshold: string | number | null;
  default_shipping_fee: string | number | null;
};

type ShippingGovernorate = {
  code: string;
  name_ar: string;
  name_en: string;
  shipping_fee: string | number | null;
  is_enabled: boolean;
  sort_order?: number;
};

const supabase = useSupabase();
const { locale, t } = useI18n();
const loading = ref(true);
const saving = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const settings = reactive<ShippingSettings>({
  shipping_enabled: true,
  free_shipping_all_orders: true,
  free_shipping_threshold_enabled: false,
  free_shipping_threshold: null,
  default_shipping_fee: null,
});
const governorates = ref<ShippingGovernorate[]>([]);
const isRtl = computed(() => locale.value === "ar");

const localizedName = (governorate: ShippingGovernorate) =>
  isRtl.value ? governorate.name_ar : governorate.name_en;

const loadShippingSettings = async () => {
  loading.value = true;
  errorMessage.value = "";

  const [{ data: settingsRows, error: settingsError }, { data: governorateRows, error: governoratesError }] =
    await Promise.all([
      supabase.from("shipping_settings").select("*").limit(1),
      supabase
        .from("shipping_governorates")
        .select("code,name_ar,name_en,shipping_fee,is_enabled,sort_order")
        .order("sort_order", { ascending: true }),
    ]);

  if (settingsError || governoratesError) {
    errorMessage.value = settingsError?.message || governoratesError?.message || t("admin.shippingLoadFailed");
    loading.value = false;
    return;
  }

  const row = settingsRows?.[0];
  if (row) {
    settings.shipping_enabled = Boolean(row.shipping_enabled);
    settings.free_shipping_all_orders = Boolean(row.free_shipping_all_orders);
    settings.free_shipping_threshold_enabled = Boolean(row.free_shipping_threshold_enabled);
    settings.free_shipping_threshold = row.free_shipping_threshold;
    settings.default_shipping_fee = row.default_shipping_fee;
  }
  governorates.value = (governorateRows || []) as ShippingGovernorate[];
  loading.value = false;
};

const saveShipping = async () => {
  if (saving.value) return;

  saving.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  const { error } = await supabase.rpc("save_admin_shipping_settings", {
    p_settings: settings,
    p_governorates: governorates.value.map((governorate) => ({
      code: governorate.code,
      shipping_fee: governorate.shipping_fee === "" ? null : governorate.shipping_fee,
      is_enabled: governorate.is_enabled,
    })),
  });

  if (error) {
    errorMessage.value = error.message;
  } else {
    successMessage.value = t("admin.shippingSaved");
    await loadShippingSettings();
  }

  saving.value = false;
};

onMounted(loadShippingSettings);
</script>

<style scoped>
.field,
.setting-toggle {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: #000;
  color: #fff;
  outline: none;
}

.field {
  padding: 0.875rem 1rem;
}

.field:focus {
  border-color: #ff4d00;
}

.field-label {
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 800;
}

.setting-toggle {
  display: flex;
  min-height: 3.5rem;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  font-weight: 800;
}

.setting-toggle input {
  height: 1.25rem;
  width: 1.25rem;
  accent-color: #ff4d00;
}
</style>

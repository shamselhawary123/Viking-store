<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t("admin.storeSettings") }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ t("admin.paymentSettings") }}</h2>
      </div>
      <button
        type="button"
        class="rounded-2xl bg-[#FF4D00] px-5 py-3 text-sm font-black text-white transition hover:bg-[#CF1D1D] disabled:pointer-events-none disabled:opacity-50"
        :disabled="saving"
        @click="saveSettings"
      >
        {{ saving ? t("admin.saving") : t("admin.savePaymentSettings") }}
      </button>
    </div>

    <p v-if="successMessage" class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      {{ errorMessage }}
    </p>

    <div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section class="rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
        <h3 class="text-xl font-black">{{ t("admin.paymentMethods") }}</h3>
        <p class="mt-2 text-sm leading-6 text-gray-400">{{ t("admin.paymentMethodsText") }}</p>

        <div class="mt-6 grid gap-4">
          <label class="payment-toggle">
            <span>
              <strong>{{ t("checkout.cashOnDelivery") }}</strong>
              <small>{{ t("admin.codSettingsText") }}</small>
            </span>
            <input v-model="form.cod_enabled" type="checkbox" />
          </label>
          <label class="payment-toggle">
            <span>
              <strong>{{ t("checkout.payWithInstapay") }}</strong>
              <small>{{ t("admin.instapaySettingsText") }}</small>
            </span>
            <input v-model="form.instapay_enabled" type="checkbox" />
          </label>
        </div>
      </section>

      <section class="rounded-3xl border border-white/10 bg-[#111111] p-5 md:p-6">
        <h3 class="text-xl font-black">{{ t("admin.instapaySettings") }}</h3>
        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <label class="field-label">
            {{ t("admin.instapayAccountName") }}
            <input v-model="form.instapay_account_name" class="field mt-2" />
          </label>
          <label class="field-label">
            {{ t("admin.instapayId") }}
            <input v-model="form.instapay_id" class="field mt-2" dir="ltr" />
          </label>
          <label class="field-label md:col-span-2">
            {{ t("admin.instapayPaymentLink") }}
            <input v-model="form.instapay_payment_link" class="field mt-2" dir="ltr" placeholder="https://" />
          </label>
          <label class="field-label">
            {{ t("admin.paymentTimeout") }}
            <input v-model.number="form.instapay_timeout_minutes" class="field mt-2" type="number" min="5" max="120" />
          </label>
          <label class="field-label">
            {{ t("admin.whatsappNumber") }}
            <input v-model="form.whatsapp_number" class="field mt-2" dir="ltr" />
          </label>
        </div>

        <div class="mt-6 rounded-2xl border border-white/10 bg-black p-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              v-if="qrPreviewUrl"
              :src="qrPreviewUrl"
              alt="InstaPay QR"
              class="h-28 w-28 rounded-xl bg-white object-contain p-2"
            />
            <div class="flex-1">
              <p class="font-black">{{ t("admin.instapayQr") }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ t("admin.instapayQrText") }}</p>
              <label class="mt-4 inline-flex cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]">
                <input type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" @change="handleQrFile" />
                {{ uploadingQr ? t("admin.uploading") : qrPreviewUrl ? t("admin.replaceQr") : t("admin.uploadQr") }}
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { buildProductImagePath } from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

const supabase = useSupabase();
const { t } = useI18n();
const saving = ref(false);
const uploadingQr = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const qrPathToRemoveAfterSave = ref("");
const newQrPathPendingSave = ref("");
const form = ref({
  cod_enabled: true,
  instapay_enabled: false,
  instapay_account_name: "",
  instapay_id: "",
  instapay_payment_link: "",
  instapay_qr_path: "",
  instapay_timeout_minutes: 30,
  whatsapp_number: "",
});

const qrPreviewUrl = computed(() => {
  if (!form.value.instapay_qr_path) return "";
  const { data } = supabase.storage.from("payment-assets").getPublicUrl(form.value.instapay_qr_path);
  return data.publicUrl;
});

const loadSettings = async () => {
  const { data, error } = await supabase.from("payment_settings").select("*").eq("id", true).single();
  if (error) {
    errorMessage.value = error.message;
    return;
  }

  if (data) {
    form.value = {
      cod_enabled: data.cod_enabled !== false,
      instapay_enabled: data.instapay_enabled === true,
      instapay_account_name: data.instapay_account_name || "",
      instapay_id: data.instapay_id || "",
      instapay_payment_link: data.instapay_payment_link || "",
      instapay_qr_path: data.instapay_qr_path || "",
      instapay_timeout_minutes: Number(data.instapay_timeout_minutes || 30),
      whatsapp_number: data.whatsapp_number || "",
    };
  }
};

const handleQrFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
    errorMessage.value = t("admin.invalidQrImage");
    return;
  }

  uploadingQr.value = true;
  errorMessage.value = "";
  const path = buildProductImagePath(file.name).replace("product-images/", "payment-qr/");
  const { error } = await supabase.storage.from("payment-assets").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  uploadingQr.value = false;

  if (error) {
    errorMessage.value = error.message;
    return;
  }

  const oldPath = form.value.instapay_qr_path;
  if (newQrPathPendingSave.value && newQrPathPendingSave.value !== oldPath) {
    await supabase.storage.from("payment-assets").remove([newQrPathPendingSave.value]);
  }
  form.value.instapay_qr_path = path;
  qrPathToRemoveAfterSave.value ||= oldPath;
  newQrPathPendingSave.value = path;
};

const saveSettings = async () => {
  if (saving.value) return;

  saving.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  const { error } = await supabase.rpc("save_admin_payment_settings", {
    p_settings: form.value,
  });

  saving.value = false;
  if (error) {
    errorMessage.value = error.message;
    if (newQrPathPendingSave.value) {
      await supabase.storage.from("payment-assets").remove([newQrPathPendingSave.value]);
      form.value.instapay_qr_path = qrPathToRemoveAfterSave.value;
      newQrPathPendingSave.value = "";
      qrPathToRemoveAfterSave.value = "";
    }
    return;
  }

  if (qrPathToRemoveAfterSave.value) {
    await supabase.storage.from("payment-assets").remove([qrPathToRemoveAfterSave.value]);
  }
  newQrPathPendingSave.value = "";
  qrPathToRemoveAfterSave.value = "";
  successMessage.value = t("admin.paymentSettingsSaved");
  await loadSettings();
};

onMounted(loadSettings);
</script>

<style scoped>
.field,
.field-label {
  display: block;
  width: 100%;
}

.field-label {
  color: #a3a3a3;
  font-size: 0.875rem;
  font-weight: 800;
}

.field {
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

.payment-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: #000;
  padding: 1rem;
}

.payment-toggle strong,
.payment-toggle small {
  display: block;
}

.payment-toggle small {
  margin-top: 0.25rem;
  color: #737373;
}

.payment-toggle input {
  height: 1.35rem;
  width: 1.35rem;
  accent-color: #ff4d00;
}
</style>

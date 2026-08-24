<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">
        {{ t("admin.storeSection") }}
      </p>
      <h2 class="mt-2 text-3xl font-black">{{ t("admin.settings") }}</h2>
    </div>

    <div class="rounded-3xl border border-white/10 bg-[#111111] p-6">
      <h3 class="text-xl font-black">{{ t("admin.storeSettings") }}</h3>
      <p class="mt-2 text-sm text-gray-500">
        {{ t("admin.settingsTableConnected") }}
      </p>

      <div class="mt-6 grid gap-3 md:grid-cols-2 md:gap-4">
        <div
          v-for="setting in settings"
          :key="setting.id || setting.key"
          class="admin-mobile-card rounded-2xl border border-white/10 bg-black p-4 sm:p-5"
        >
          <p class="text-sm font-bold uppercase tracking-[0.18em] text-[#FF4D00]">
            {{ setting.key || setting.name || t("admin.setting") }}
          </p>
          <p class="mt-3 break-words text-gray-300">
            {{ setting.value || setting.content || "-" }}
          </p>
        </div>
      </div>

      <p v-if="!loading && !settings.length" class="mt-6 text-sm text-gray-500">
        {{ t("admin.noSettings") }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type SettingRow = {
  id?: string | number;
  key?: string;
  name?: string;
  value?: string;
  content?: string;
};

const supabase = useSupabase();
const { t } = useI18n();
const settings = ref<SettingRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  const { data } = await supabase.from("settings").select("*");
  settings.value = (data || []) as SettingRow[];
  loading.value = false;
});
</script>

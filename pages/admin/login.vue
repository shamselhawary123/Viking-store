<template>
  <section class="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10 text-white">
    <form
      class="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl shadow-black/40 md:p-8"
      @submit.prevent="login"
    >
      <div class="flex items-center gap-3">
        <img src="/logo.png" alt="Viking Store" class="h-12 w-12 object-contain" />
        <div>
          <p class="font-[Bebas_Neue] text-4xl leading-none">VIKING</p>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t('admin.admin') }}</p>
        </div>
      </div>

      <div class="mt-8">
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t('admin.secureAccess') }}</p>
        <h1 class="mt-3 text-3xl font-black">{{ t('admin.adminLogin') }}</h1>
      </div>

      <div class="mt-8 space-y-4">
        <label class="block">
          <span class="text-sm font-bold text-gray-300">{{ t('common.email') }}</span>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none transition focus:border-[#FF4D00]"
          />
        </label>

        <label class="block">
          <span class="text-sm font-bold text-gray-300">{{ t('common.password') }}</span>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none transition focus:border-[#FF4D00]"
          />
        </label>
      </div>

      <p v-if="errorMessage" class="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-300">
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="loading"
        class="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#FF4D00] px-5 font-black text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <Icon :name="loading ? 'i-heroicons-arrow-path' : 'i-heroicons-lock-closed'" :class="{ 'animate-spin': loading }" />
        {{ loading ? t('admin.checking') : t('auth.login') }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { isAdminProfile } from "../../utils/admin";

definePageMeta({
  layout: false,
});

const supabase = useSupabase();
const { t } = useI18n();
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const verifyAdmin = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !isAdminProfile(profile)) {
    await supabase.auth.signOut();
    throw new Error(t("admin.noAdminAccess"));
  }
};

const login = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;
    if (!data.user) throw new Error(t("admin.loadAdminFailed"));

    await verifyAdmin(data.user.id);
    await navigateTo("/admin");
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : t("admin.loginFailed");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  try {
    await verifyAdmin(user.id);
    await navigateTo("/admin");
  } catch {
    // Keep the login form visible for non-admin sessions.
  }
});
</script>

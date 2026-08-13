<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4 py-12">
    <div class="premium-panel w-full max-w-md rounded-2xl p-8">
      <p class="eyebrow">{{ t('auth.emailVerification') }}</p>
      <h1 class="mt-3 text-4xl font-black text-white">{{ t('auth.verifyOtp') }}</h1>
      <p class="mt-4 text-neutral-400">{{ t('auth.otpLead') }}</p>

      <form class="mt-10" @submit.prevent="verifyOtp">
        <label class="sr-only" for="otp">{{ t('auth.otpCode') }}</label>
        <input
          id="otp"
          v-model="otp"
          maxlength="8"
          :placeholder="t('auth.enterOtp')"
          class="premium-input h-16 text-center text-2xl font-black tracking-[0.35em]"
        />

        <p v-if="error" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {{ error }}
        </p>

        <button :disabled="loading" class="premium-button premium-button-primary mt-8 w-full">
          {{ loading ? t('auth.verifying') : t('auth.verifyOtp') }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSupabase } from "../../composables/useSupabase";
import { useAuthStore } from "../../stores/auth";
import type { PendingRegistrationProfile } from "../../utils/registrationProfile";

definePageMeta({
  middleware: ["guest"],
});

const router = useRouter();
const supabase = useSupabase();
const authStore = useAuthStore(usePinia());
const { t } = useI18n();

const otp = ref("");
const error = ref("");
const loading = ref(false);

const verifyOtp = async () => {
  try {
    loading.value = true;
    error.value = "";

    const email = localStorage.getItem("verify_email");

    if (!email) {
      error.value = t("auth.verificationEmailMissing");
      return;
    }

    if (!otp.value.trim()) {
      error.value = t("auth.otpRequired");
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.value.trim(),
      type: "signup",
    });

    if (verifyError) {
      throw verifyError;
    }

    const pendingProfile = localStorage.getItem("pending_profile");

    if (!pendingProfile) {
      throw new Error(t("auth.profileDataMissing"));
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(t("auth.userNotFound"));
    }

    const profileData = JSON.parse(pendingProfile) as PendingRegistrationProfile;
    await authStore.persistRegistrationProfile(profileData, user, localStorage.getItem("pending_avatar") || "");

    localStorage.removeItem("verify_email");
    localStorage.removeItem("pending_profile");
    localStorage.removeItem("pending_avatar");
    router.push("/profile/edit");
  } catch (err: any) {
    error.value = err?.message || t("auth.unableVerify");
  } finally {
    loading.value = false;
  }
};
</script>

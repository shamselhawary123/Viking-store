<template>
  <section
    class="flex min-h-screen items-center justify-center bg-black px-4 py-10"
  >
    <div
      class="grid w-full max-w-5xl overflow-hidden rounded-[40px] border border-white/10 bg-[#0b0b0b] lg:grid-cols-2"
    >
      <!-- LEFT -->
      <div class="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=70&w=1200&auto=format&fit=crop"
          alt=""
          width="1200"
          height="900"
          class="h-full w-full object-cover"
          fetchpriority="high"
          decoding="async"
        />

        <div class="absolute inset-0 bg-black/60" />

        <div class="absolute bottom-16 left-10 max-w-md">
          <p class="mb-4 text-sm uppercase tracking-[0.4em] text-[#CF1D1D]">
            Viking Store
          </p>

          <h1 class="text-5xl font-black leading-tight text-white">
            {{ t('auth.welcomeBack') }}
          </h1>

          <p class="mt-5 text-lg text-gray-300">
            {{ t('auth.loginLead') }}
          </p>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="flex items-center p-6 md:p-10">
        <div class="w-full">
          <h2 class="text-4xl font-black text-white">{{ t('auth.login') }}</h2>

          <p class="mt-3 text-gray-400">{{ t('auth.enterDetails') }}</p>

          <form @submit.prevent="handleLogin" class="mt-10 space-y-5">
            <!-- EMAIL -->
            <div>
              <input
                v-model="email"
                type="email"
                :placeholder="t('auth.emailAddress')"
                class="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
              />

              <p v-if="errors.email" class="mt-2 text-sm text-red-500">
                {{ errors.email }}
              </p>
            </div>

            <!-- PASSWORD -->
            <div>
              <input
                v-model="password"
                type="password"
                :placeholder="t('common.password')"
                class="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
              />

              <p v-if="errors.password" class="mt-2 text-sm text-red-500">
                {{ errors.password }}
              </p>
            </div>

            <!-- ERROR -->
            <div
              v-if="loginError"
              class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
            >
              {{ loginError }}
            </div>

            <!-- FORGOT -->
            <div class="flex items-center justify-between">
              <NuxtLink
                to="/auth/forgot-password"
                class="text-sm text-gray-400 hover:text-[#CF1D1D]"
              >
                {{ t('auth.forgotPassword') }}
              </NuxtLink>
            </div>

            <!-- LOGIN BUTTON -->
            <button
              type="submit"
              :disabled="loading"
              class="h-14 w-full rounded-2xl bg-[#CF1D1D] text-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {{ loading ? t('auth.loggingIn') : t('auth.login') }}
            </button>

            <!-- GOOGLE -->
            <button
              type="button"
              @click="continueWithGoogle"
              class="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#171717] font-semibold text-white transition hover:border-[#CF1D1D]"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                alt=""
                width="20"
                height="20"
                class="h-5 w-5"
                loading="lazy"
                decoding="async"
              />

              {{ t('auth.continueWithGoogle') }}
            </button>

            <!-- REGISTER -->
            <p class="text-center text-gray-400">
              {{ t('auth.noAccount') }}

              <NuxtLink
                to="/auth/register"
                class="font-bold text-white hover:text-[#CF1D1D]"
              >
                {{ t('auth.register') }}
              </NuxtLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
definePageMeta({
  middleware: ["guest"],
});

const authStore = useAuthStore(usePinia());
const router = useRouter();
const { t } = useI18n();

const email = ref("");
const password = ref("");

const loading = ref(false);
const loginError = ref("");

const errors = ref({
  email: "",
  password: "",
});

const validate = () => {
  errors.value.email = "";
  errors.value.password = "";

  let valid = true;

  if (!email.value) {
    errors.value.email = t("auth.emailRequired");
    valid = false;
  }

  if (!password.value) {
    errors.value.password = t("auth.passwordRequired");
    valid = false;
  }

  return valid;
};

const handleLogin = async () => {
  if (!validate()) return;

  try {
    loading.value = true;
    loginError.value = "";

    await authStore.login(email.value, password.value);

    router.push("/");
  } catch (error: any) {
    loginError.value = error?.message || t("auth.loginFailed");
  } finally {
    loading.value = false;
  }
};

const continueWithGoogle = async () => {
  try {
    await authStore.loginWithGoogle();
  } catch (error: any) {
    alert(error.message);
  }
};
</script>

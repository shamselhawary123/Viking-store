<template>
  <section
    class="flex min-h-screen items-center justify-center bg-black px-4 py-10"
  >
    <div
      class="grid w-full max-w-6xl overflow-hidden rounded-[40px] border border-white/10 bg-[#0b0b0b] lg:grid-cols-2"
    >
      <!-- LEFT -->
      <div class="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=70&w=1200&auto=format&fit=crop"
          alt=""
          width="1200"
          height="900"
          class="h-full w-full object-cover"
          fetchpriority="high"
          decoding="async"
        />

        <div class="absolute inset-0 bg-black/50" />

        <div class="absolute bottom-16 left-10 max-w-md">
          <p class="mb-4 text-sm uppercase tracking-[0.4em] text-[#CF1D1D]">
            Viking Store
          </p>

          <h1 class="text-5xl font-black leading-tight text-white">
            {{ t("auth.joinCommunity") }}
          </h1>

          <p class="mt-5 text-lg leading-relaxed text-gray-300">
            {{ t("auth.registerLead") }}
          </p>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="p-6 md:p-10">
        <div class="mx-auto max-w-xl">
          <h2 class="text-4xl font-black text-white">
            {{ t("auth.register") }}
          </h2>

          <p class="mt-3 text-gray-400">{{ t("auth.createToContinue") }}</p>

          <form class="mt-10 space-y-5" @submit.prevent="handleRegister">
            <!-- Avatar -->
            <div class="flex items-center gap-5">
              <img
                :src="avatarPreview"
                alt=""
                width="80"
                height="80"
                class="h-20 w-20 rounded-full border border-white/10 object-cover"
                loading="lazy"
                decoding="async"
              />

              <div>
                <label
                  class="inline-flex cursor-pointer items-center rounded-2xl bg-[#CF1D1D] px-5 py-3 font-bold text-white"
                >
                  {{ t("auth.uploadAvatar") }}

                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleAvatar"
                  />
                </label>
              </div>
            </div>

            <!-- Name -->
            <input
              v-model="form.fullName"
              type="text"
              :placeholder="t('common.fullName')"
              class="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
              required
            />

            <!-- Email -->
            <input
              v-model="form.email"
              type="email"
              :placeholder="t('auth.emailAddress')"
              class="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
              required
            />

            <!-- Phone + Gender -->
            <div class="grid gap-5 md:grid-cols-2">
              <input
                v-model="form.phone"
                type="text"
                :placeholder="t('auth.phoneNumber')"
                class="h-14 rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
                required
              />

              <select
                v-model="form.gender"
                class="h-14 rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
                required
              >
                <option value="">{{ t("auth.selectGender") }}</option>

                <option value="Male">{{ t("auth.male") }}</option>

                <option value="Female">{{ t("auth.female") }}</option>
              </select>
            </div>

            <!-- Address -->
            <input
              v-model="form.address"
              type="text"
              :placeholder="t('common.address')"
              class="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
              required
            />

            <!-- City Country Postal -->
            <div class="grid gap-5 md:grid-cols-3">
              <input
                v-model="form.city"
                type="text"
                :placeholder="t('common.city')"
                class="h-14 rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
                required
              />

              <input
                v-model="form.country"
                type="text"
                :placeholder="t('auth.country')"
                class="h-14 rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
                required
              />

              <input
                v-model="form.postalCode"
                type="text"
                :placeholder="t('auth.postalCode')"
                class="h-14 rounded-2xl border border-white/10 bg-[#171717] px-5 text-white outline-none transition focus:border-[#CF1D1D]"
              />
            </div>

            <!-- Bio -->
            <textarea
              v-model="form.bio"
              rows="4"
              :placeholder="t('auth.shortBio')"
              class="w-full rounded-2xl border border-white/10 bg-[#171717] p-5 text-white outline-none transition focus:border-[#CF1D1D]"
            />

            <!-- Password -->
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('common.password')"
                class="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-5 pr-20 text-white outline-none transition focus:border-[#CF1D1D]"
                required
              />

              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-gray-400"
              >
                {{ showPassword ? t("auth.hide") : t("auth.show") }}
              </button>
            </div>
            <!-- Confirm Password -->
            <div class="relative">
              <input
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('auth.confirmPassword')"
                class="h-14 w-full rounded-2xl border border-white/10 bg-[#171717] px-5 pr-20 text-white outline-none transition focus:border-[#CF1D1D]"
                required
              />
            </div>
            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
            >
              {{ errorMessage }}
            </div>

            <!-- Button -->
            <button
              type="submit"
              :disabled="loading"
              class="h-14 w-full rounded-2xl bg-[#CF1D1D] text-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {{ loading ? t("auth.creating") : t("auth.createAccount") }}
            </button>
            <!-- Login -->
            <p class="text-center text-gray-400">
              {{ t("auth.alreadyHaveAccount") }}

              <NuxtLink
                to="/auth/login"
                class="font-bold text-white hover:text-[#CF1D1D]"
              >
                {{ t("auth.login") }}
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
import { buildPendingRegistrationProfile } from "../../utils/registrationProfile";

definePageMeta({
  middleware: ["guest"],
});
const router = useRouter();
const authStore = useAuthStore(usePinia());
const { t } = useI18n();

const showPassword = ref(false);
const loading = ref(false);
const error = ref("");

const avatarPreview = ref("https://i.postimg.cc/ryHfSRKB/logo2.png");

const avatarFile = ref<File | null>(null);
const errorMessage = ref("");
const form = ref({
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  bio: "",
  password: "",
  confirmPassword: "",
});

const handleAvatar = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
};

const validate = () => {
  // if (!avatarFile.value) {
  //   errorMessage.value = "Avatar is required";
  //   return false;
  // }

  if (!form.value.fullName.trim()) {
    errorMessage.value = t("auth.nameRequired");
    return false;
  }

  if (!form.value.email.trim()) {
    errorMessage.value = t("auth.emailRequired");
    return false;
  }

  if (!form.value.phone.trim()) {
    errorMessage.value = t("auth.phoneRequired");
    return false;
  }

  if (!form.value.gender.trim()) {
    errorMessage.value = t("auth.genderRequired");
    return false;
  }

  if (!form.value.address.trim()) {
    errorMessage.value = t("auth.addressRequired");
    return false;
  }

  if (!form.value.city.trim()) {
    errorMessage.value = t("auth.cityRequired");
    return false;
  }

  if (!form.value.country.trim()) {
    errorMessage.value = t("auth.countryRequired");
    return false;
  }

  if (!form.value.password.trim()) {
    errorMessage.value = t("auth.passwordRequired");
    return false;
  }

  if (form.value.password.length < 6) {
    errorMessage.value = t("auth.passwordMin");

    return false;
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = t("auth.passwordMismatch");

    return false;
  }

  return true;
};
const handleRegister = async () => {
  if (!validate()) return;

  try {
    loading.value = true;
    errorMessage.value = "";

    // // Upload Avatar First
    // if (avatarFile.value) {
    //   avatarUrl = await authStore.uploadAvatar(avatarFile.value);

    //   localStorage.setItem("pending_avatar", avatarUrl);
    // }

    // Register User
    await authStore.register({
      fullName: form.value.fullName,
      email: form.value.email,
      password: form.value.password,
    });

    localStorage.setItem(
      "pending_profile",
      JSON.stringify(buildPendingRegistrationProfile(form.value)),
    );
    localStorage.setItem("verify_email", form.value.email);

    await router.push("/auth/verify-email");
  } catch (error: any) {
    errorMessage.value = error?.message || t("auth.somethingWrong");
  } finally {
    loading.value = false;
  }
};
</script>

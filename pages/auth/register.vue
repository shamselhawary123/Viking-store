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
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop"
          alt=""
          class="h-full w-full object-cover"
        />

        <div class="absolute inset-0 bg-black/50" />

        <div class="absolute bottom-16 left-10 max-w-md">
          <p class="mb-4 text-sm uppercase tracking-[0.4em] text-[#FF4D00]">
            Viking Store
          </p>

          <h1 class="text-5xl font-black leading-tight text-white">
            Join The Fighters Community
          </h1>

          <p class="mt-5 text-lg leading-relaxed text-gray-300">
            Create your account and start your combat sports journey.
          </p>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="p-6 md:p-10">
        <div class="mx-auto max-w-xl">
          <h2 class="text-4xl font-black text-white">Register</h2>

          <p class="mt-3 text-gray-400">Create your account to continue</p>

          <form class="mt-10 space-y-5" @submit.prevent="handleRegister">
            <!-- Avatar -->
            <div class="flex items-center gap-5">
              <img
                :src="avatarPreview"
                class="h-20 w-20 rounded-full border border-white/10 object-cover"
              />

              <div>
                <label
                  class="inline-flex cursor-pointer items-center rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white"
                >
                  Upload Avatar

                  <input
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleAvatar"
                    required
                  />
                </label>
              </div>
            </div>

            <!-- Name -->
            <input
              v-model="form.fullName"
              type="text"
              placeholder="Full Name"
              class="h-14 w-full rounded-2xl border border-white/10 bg-[#111111] px-5 text-white outline-none transition focus:border-[#FF4D00]"
              required
            />

            <!-- Email -->
            <input
              v-model="form.email"
              type="email"
              placeholder="Email Address"
              class="h-14 w-full rounded-2xl border border-white/10 bg-[#111111] px-5 text-white outline-none transition focus:border-[#FF4D00]"
              required
            />

            <!-- Phone + Gender -->
            <div class="grid gap-5 md:grid-cols-2">
              <input
                v-model="form.phone"
                type="text"
                placeholder="Phone Number"
                class="h-14 rounded-2xl border border-white/10 bg-[#111111] px-5 text-white outline-none transition focus:border-[#FF4D00]"
                required
              />

              <select
                v-model="form.gender"
                class="h-14 rounded-2xl border border-white/10 bg-[#111111] px-5 text-white outline-none transition focus:border-[#FF4D00]"
                required
              >
                <option value="">Select Gender</option>

                <option>Male</option>

                <option>Female</option>
              </select>
            </div>

            <!-- Address -->
            <input
              v-model="form.address"
              type="text"
              placeholder="Address"
              class="h-14 w-full rounded-2xl border border-white/10 bg-[#111111] px-5 text-white outline-none transition focus:border-[#FF4D00]"
              required
            />

            <!-- City Country Postal -->
            <div class="grid gap-5 md:grid-cols-3">
              <input
                v-model="form.city"
                type="text"
                placeholder="City"
                class="h-14 rounded-2xl border border-white/10 bg-[#111111] px-5 text-white outline-none transition focus:border-[#FF4D00]"
                required
              />

              <input
                v-model="form.country"
                type="text"
                placeholder="Country"
                class="h-14 rounded-2xl border border-white/10 bg-[#111111] px-5 text-white outline-none transition focus:border-[#FF4D00]"
                required
              />

              <input
                v-model="form.postalCode"
                type="text"
                placeholder="Postal Code"
                class="h-14 rounded-2xl border border-white/10 bg-[#111111] px-5 text-white outline-none transition focus:border-[#FF4D00]"
              />
            </div>

            <!-- Bio -->
            <textarea
              v-model="form.bio"
              rows="4"
              placeholder="Short Bio"
              class="w-full rounded-2xl border border-white/10 bg-[#111111] p-5 text-white outline-none transition focus:border-[#FF4D00]"
            />

            <!-- Password -->
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                class="h-14 w-full rounded-2xl border border-white/10 bg-[#111111] px-5 pr-20 text-white outline-none transition focus:border-[#FF4D00]"
                required
              />

              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-gray-400"
              >
                {{ showPassword ? "Hide" : "Show" }}
              </button>
            </div>
            <!-- Confirm Password -->
            <div class="relative">
              <input
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Confirm Password"
                class="h-14 w-full rounded-2xl border border-white/10 bg-[#111111] px-5 pr-20 text-white outline-none transition focus:border-[#FF4D00]"
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
              class="h-14 w-full rounded-2xl bg-[#FF4D00] text-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {{ loading ? "Creating..." : "Create Account" }}
            </button>
            <!-- Login -->
            <p class="text-center text-gray-400">
              Already have an account?

              <NuxtLink
                to="/auth/login"
                class="font-bold text-white hover:text-[#FF4D00]"
              >
                Login
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
const router = useRouter();
const authStore = useAuthStore();

const showPassword = ref(false);
const loading = ref(false);
const error = ref("");

const avatarPreview = ref(
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
);

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
  if (!avatarFile.value) {
    errorMessage.value = "Avatar is required";
    return false;
  }

  if (!form.value.fullName.trim()) {
    errorMessage.value = "Full Name is required";
    return false;
  }

  if (!form.value.email.trim()) {
    errorMessage.value = "Email is required";
    return false;
  }

  if (!form.value.phone.trim()) {
    errorMessage.value = "Phone Number is required";
    return false;
  }

  if (!form.value.gender.trim()) {
    errorMessage.value = "Gender is required";
    return false;
  }

  if (!form.value.address.trim()) {
    errorMessage.value = "Address is required";
    return false;
  }

  if (!form.value.city.trim()) {
    errorMessage.value = "City is required";
    return false;
  }

  if (!form.value.country.trim()) {
    errorMessage.value = "Country is required";
    return false;
  }

  if (!form.value.password.trim()) {
    errorMessage.value = "Password is required";
    return false;
  }

  if (form.value.password.length < 6) {
    errorMessage.value = "Password must be at least 6 characters";

    return false;
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = "Passwords do not match";

    return false;
  }

  return true;
};
const handleRegister = async () => {
  if (!validate()) return;

  try {
    loading.value = true;
    errorMessage.value = "";

    let avatarUrl = "";

    // Upload Avatar First
    if (avatarFile.value) {
      avatarUrl = await authStore.uploadAvatar(avatarFile.value);

      localStorage.setItem("pending_avatar", avatarUrl);
    }

    // Save User Data
    localStorage.setItem(
      "pending_profile",
      JSON.stringify({
        fullName: form.value.fullName,
        email: form.value.email,
        phone: form.value.phone,
        gender: form.value.gender,
        address: form.value.address,
        city: form.value.city,
        country: form.value.country,
        postalCode: form.value.postalCode,
        bio: form.value.bio,
        password: form.value.password,
      }),
    );

    // Register User
    await authStore.register({
      fullName: form.value.fullName,
      email: form.value.email,
      password: form.value.password,
    });

    localStorage.setItem("verify_email", form.value.email);

    await router.push("/auth/verify-email");
  } catch (error: any) {
    console.error(error);

    errorMessage.value = error?.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
};
</script>

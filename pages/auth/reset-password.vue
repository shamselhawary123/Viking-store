<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4">
    <div
      class="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8"
    >
      <h1 class="text-3xl font-black text-white">Reset Password</h1>

      <p class="mt-3 text-gray-400">Enter your new password</p>

      <form @submit.prevent="handleReset" class="mt-8 space-y-5">
        <input
          v-model="password"
          type="password"
          placeholder="New Password"
          class="h-14 w-full rounded-2xl border border-white/10 bg-black px-5 text-white outline-none focus:border-[#FF4D00]"
        />

        <input
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          class="h-14 w-full rounded-2xl border border-white/10 bg-black px-5 text-white outline-none focus:border-[#FF4D00]"
        />

        <p v-if="errorMessage" class="text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <button
          :disabled="loading"
          type="submit"
          class="h-14 w-full rounded-2xl bg-[#FF4D00] font-bold text-white disabled:opacity-50"
        >
          {{ loading ? "Updating..." : "Update Password" }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const password = ref("");
const confirmPassword = ref("");

const loading = ref(false);
const errorMessage = ref("");

const handleReset = async () => {
  try {
    errorMessage.value = "";

    if (!password.value) {
      errorMessage.value = "Password is required";
      return;
    }

    if (password.value.length < 6) {
      errorMessage.value = "Password must be at least 6 characters";
      return;
    }

    if (password.value !== confirmPassword.value) {
      errorMessage.value = "Passwords do not match";
      return;
    }

    loading.value = true;

    await authStore.updatePassword(password.value);

    alert("Password updated successfully 🔥");

    await router.push("/auth/login");
  } catch (error: any) {
    errorMessage.value = error?.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
};
</script>

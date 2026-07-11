<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4 py-12">
    <div class="premium-panel w-full max-w-md rounded-2xl p-8">
      <p class="eyebrow">Account security</p>
      <h1 class="mt-3 text-3xl font-black text-white">Reset Password</h1>
      <p class="mt-3 text-neutral-400">Enter and confirm your new password.</p>

      <form class="mt-8 space-y-5" @submit.prevent="handleReset">
        <label class="grid gap-2 text-sm font-bold text-neutral-300">
          New Password
          <input v-model="password" type="password" class="premium-input" autocomplete="new-password" />
        </label>

        <label class="grid gap-2 text-sm font-bold text-neutral-300">
          Confirm Password
          <input v-model="confirmPassword" type="password" class="premium-input" autocomplete="new-password" />
        </label>

        <p v-if="errorMessage" class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {{ errorMessage }}
        </p>

        <button :disabled="loading" type="submit" class="premium-button premium-button-primary w-full">
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
const authStore = useAuthStore(usePinia());

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
    alert("Password updated successfully.");
    await router.push("/auth/login");
  } catch (error: any) {
    errorMessage.value = error?.message || "Something went wrong";
  } finally {
    loading.value = false;
  }
};
</script>

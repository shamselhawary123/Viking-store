<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4 py-12">
    <div class="premium-panel w-full max-w-md rounded-2xl p-8">
      <p class="eyebrow">Account security</p>
      <h1 class="mt-3 text-3xl font-black text-white">Forgot Password</h1>
      <p class="mt-3 text-neutral-400">Enter your email to receive a reset link.</p>

      <form class="mt-8 space-y-5" @submit.prevent="handleForgot">
        <label class="grid gap-2 text-sm font-bold text-neutral-300">
          Email Address
          <input v-model="email" type="email" required class="premium-input" autocomplete="email" />
        </label>

        <button type="submit" class="premium-button premium-button-primary w-full">
          Send Reset Link
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore(usePinia());
const email = ref("");

const handleForgot = async () => {
  try {
    await authStore.forgotPassword(email.value);
    alert("Reset link sent to your email.");
  } catch (error: any) {
    alert(error.message);
  }
};
</script>

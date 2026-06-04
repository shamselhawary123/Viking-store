<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4">
    <div
      class="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8"
    >
      <h1 class="text-3xl font-black text-white">Forgot Password</h1>

      <p class="mt-3 text-gray-400">Enter your email to receive reset link</p>

      <form @submit.prevent="handleForgot" class="mt-8 space-y-5">
        <input
          v-model="email"
          type="email"
          placeholder="Email Address"
          class="h-14 w-full rounded-2xl border border-white/10 bg-black px-5 text-white outline-none focus:border-[#FF4D00]"
        />

        <button
          type="submit"
          class="h-14 w-full rounded-2xl bg-[#FF4D00] font-bold text-white"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();

const email = ref("");

const handleForgot = async () => {
  try {
    await authStore.forgotPassword(email.value);

    alert("Reset link sent to your email 🔥");
  } catch (error: any) {
    alert(error.message);
  }
};
</script>

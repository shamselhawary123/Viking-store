<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4">
    <div
      class="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8"
    >
      <h1 class="text-3xl font-black text-white">Reset Password</h1>

      <form @submit.prevent="handleReset" class="mt-8 space-y-5">
        <input
          v-model="password"
          type="password"
          placeholder="New Password"
          class="h-14 w-full rounded-2xl border border-white/10 bg-black px-5 text-white outline-none focus:border-[#FF4D00]"
        />

        <button
          type="submit"
          class="h-14 w-full rounded-2xl bg-[#FF4D00] font-bold text-white"
        >
          Update Password
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

const handleReset = async () => {
  try {
    await authStore.updatePassword(password.value);

    alert("Password updated successfully 🔥");

    await router.push("/auth/login");
  } catch (error: any) {
    alert(error.message);
  }
};
</script>

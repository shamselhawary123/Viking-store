<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4">
    <div
      class="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0b0b0b] p-8"
    >
      <h1 class="text-4xl font-black text-white">Verify OTP</h1>

      <p class="mt-4 text-gray-400">Enter the 8 digit code</p>

      <form @submit.prevent="verifyOtp" class="mt-10">
        <input
          v-model="otp"
          maxlength="8"
          placeholder="Enter OTP"
          class="h-16 w-full rounded-2xl border border-white/10 bg-[#111111] px-5 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none focus:border-[#FF4D00]"
        />

        <p v-if="error" class="mt-4 text-sm text-red-500">
          {{ error }}
        </p>

        <button
          class="mt-8 h-14 w-full rounded-2xl bg-[#FF4D00] font-bold text-white"
        >
          Verify OTP
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

definePageMeta({
  middleware: ["guest"],
});
const router = useRouter();
const supabase = useSupabase();
const authStore = useAuthStore();

const otp = ref("");
const error = ref("");
const loading = ref(false);

const verifyOtp = async () => {
  try {
    loading.value = true;
    error.value = "";

    const email = localStorage.getItem("verify_email");

    if (!email) {
      error.value = "Email not found";
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp.value,
      type: "signup",
    });

    if (verifyError) {
      throw verifyError;
    }

    const pendingProfile = localStorage.getItem("pending_profile");
    // const avatar = localStorage.getItem("pending_avatar") || "";
    const avatar = "";
    if (!pendingProfile) {
      throw new Error("Profile data not found");
    }

    const profileData = JSON.parse(pendingProfile);

    await authStore.login(profileData.email, profileData.password);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not found");
    }

    await authStore.createProfile({
      id: user.id,
      email: profileData.email,
      fullName: profileData.fullName,
      avatar: "",
      phone: profileData.phone,
      gender: profileData.gender,
      address: profileData.address,
      city: profileData.city,
      country: profileData.country,
      postalCode: profileData.postalCode,
      bio: profileData.bio,
    });

    localStorage.removeItem("verify_email");
    localStorage.removeItem("pending_profile");
    localStorage.removeItem("pending_avatar");
    router.push("/profile/edit");
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

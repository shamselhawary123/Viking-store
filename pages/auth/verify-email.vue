<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4 py-12">
    <div class="premium-panel w-full max-w-md rounded-2xl p-8">
      <p class="eyebrow">Email verification</p>
      <h1 class="mt-3 text-4xl font-black text-white">Verify OTP</h1>
      <p class="mt-4 text-neutral-400">Enter the 8 digit code sent to your email.</p>

      <form class="mt-10" @submit.prevent="verifyOtp">
        <label class="sr-only" for="otp">OTP code</label>
        <input
          id="otp"
          v-model="otp"
          maxlength="8"
          placeholder="Enter OTP"
          class="premium-input h-16 text-center text-2xl font-black tracking-[0.35em]"
        />

        <p v-if="error" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {{ error }}
        </p>

        <button :disabled="loading" class="premium-button premium-button-primary mt-8 w-full">
          {{ loading ? "Verifying..." : "Verify OTP" }}
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
const authStore = useAuthStore(usePinia());

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

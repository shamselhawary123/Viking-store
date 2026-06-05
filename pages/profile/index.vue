<template>
  <section class="min-h-screen bg-black pb-12">
    <!-- Hero Banner -->
    <div
      class="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#1a1a1a] via-black to-[#1a1a1a]"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#FF4D0030,transparent_40%)]"
      ></div>

      <div class="relative mx-auto max-w-6xl px-6 py-16">
        <div
          v-if="profile"
          class="flex flex-col items-center gap-6 md:flex-row md:items-center"
        >
          <div class="relative">
            <img
              :src="profile.avatar"
              class="h-36 w-36 rounded-full border-4 border-[#FF4D00] object-cover shadow-[0_0_40px_rgba(255,77,0,0.4)]"
            />

            <div
              class="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#FF4D00] px-4 py-1 text-xs font-bold text-white"
            >
              ⚔ WARRIOR
            </div>
          </div>

          <div class="text-center md:text-left">
            <p
              class="mb-2 font-[Bebas_Neue] text-xl tracking-[0.3em] text-[#FF4D00]"
            >
              VIKING STORE
            </p>

            <h1
              class="font-[Bebas_Neue] text-5xl tracking-wider text-white md:text-6xl"
            >
              {{ profile.full_name }}
            </h1>

            <p class="mt-2 text-gray-400">
              {{ profile.email }}
            </p>

            <p class="mt-3 text-sm text-gray-500">
              Member Since
              {{ new Date(profile.created_at).toLocaleDateString() }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-auto mt-10 max-w-6xl px-6" v-if="profile">
      <!-- Stats -->
      <div class="grid gap-5 md:grid-cols-3">
        <div
          class="rounded-3xl border border-white/10 bg-[#111111] p-6 transition hover:border-[#FF4D00]/50"
        >
          <p class="text-sm uppercase tracking-widest text-gray-500">Rank</p>

          <h3 class="mt-3 text-2xl font-black text-[#FF4D00]">
            Viking Warrior
          </h3>
        </div>

        <div
          class="rounded-3xl border border-white/10 bg-[#111111] p-6 transition hover:border-[#FF4D00]/50"
        >
          <p class="text-sm uppercase tracking-widest text-gray-500">Country</p>

          <h3 class="mt-3 text-2xl font-black text-white">
            {{ profile.country }}
          </h3>
        </div>

        <div
          class="rounded-3xl border border-white/10 bg-[#111111] p-6 transition hover:border-[#FF4D00]/50"
        >
          <p class="text-sm uppercase tracking-widest text-gray-500">City</p>

          <h3 class="mt-3 text-2xl font-black text-white">
            {{ profile.city }}
          </h3>
        </div>
      </div>

      <!-- Information -->
      <div class="mt-10 rounded-3xl border border-white/10 bg-[#111111] p-8">
        <div class="mb-8 flex items-center justify-between">
          <h2 class="text-2xl font-black text-white">⚔ Warrior Information</h2>

          <NuxtLink
            to="/profile/edit"
            class="rounded-xl bg-[#FF4D00] px-5 py-3 font-bold text-white transition hover:scale-105"
          >
            Edit Profile
          </NuxtLink>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="rounded-2xl bg-black p-5">
            <p class="text-sm text-gray-500">Phone</p>
            <p class="mt-2 font-semibold text-white">
              {{ profile.phone }}
            </p>
          </div>

          <div class="rounded-2xl bg-black p-5">
            <p class="text-sm text-gray-500">Gender</p>
            <p class="mt-2 font-semibold text-white">
              {{ profile.gender }}
            </p>
          </div>

          <div class="rounded-2xl bg-black p-5">
            <p class="text-sm text-gray-500">Address</p>
            <p class="mt-2 font-semibold text-white">
              {{ profile.address }}
            </p>
          </div>

          <div class="rounded-2xl bg-black p-5">
            <p class="text-sm text-gray-500">Postal Code</p>
            <p class="mt-2 font-semibold text-white">
              {{ profile.postal_code || "N/A" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="mt-10 rounded-3xl border border-white/10 bg-[#111111] p-8">
        <h2 class="mb-6 text-2xl font-black text-white">⚔ Warrior Story</h2>

        <p class="leading-8 text-gray-300">
          {{ profile.bio }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="mt-10 flex flex-col gap-4 md:flex-row">
        <NuxtLink
          to="/profile/orders"
          class="flex-1 rounded-2xl border border-white/10 bg-[#111111] py-4 text-center font-bold text-white transition hover:border-[#FF4D00]"
        >
          My Orders
        </NuxtLink>

        <NuxtLink
          to="/auth/forgot-password"
          class="flex-1 rounded-2xl bg-[#FF4D00] py-4 text-center font-bold text-white transition hover:scale-[1.02]"
        >
          Change Password
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore();

const profile = ref<any>(null);

const loading = ref(true);

onMounted(async () => {
  try {
    profile.value = await authStore.getProfile();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

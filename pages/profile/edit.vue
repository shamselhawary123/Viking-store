<template>
  <section class="min-h-screen bg-black pb-12">
    <div
      class="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#1a1a1a] via-black to-[#1a1a1a]"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#FF4D0030,transparent_40%)]"
      ></div>

      <div class="relative mx-auto max-w-6xl px-6 py-12">
        <h1
          class="font-[Bebas_Neue] text-5xl tracking-wider text-white md:text-6xl"
        >
          EDIT PROFILE
        </h1>

        <p class="mt-2 text-gray-400">Update your warrior information</p>
      </div>
    </div>

    <div class="mx-auto mt-10 max-w-5xl px-6">
      <div
        class="rounded-3xl border border-white/10 bg-[#111111] p-8 shadow-2xl"
      >
        <!-- Avatar -->

        <div class="mb-10 flex flex-col items-center">
          <div class="group relative">
            <img
              :src="avatarPreview"
              class="h-40 w-40 rounded-full border-4 border-[#FF4D00] object-cover shadow-[0_0_40px_rgba(255,77,0,.4)]"
            />

            <label
              class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/70 opacity-0 transition group-hover:opacity-100"
            >
              <span class="font-bold text-white"> Change Avatar </span>

              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatar"
              />
            </label>
          </div>

          <p class="mt-4 text-sm text-gray-400">
            Click avatar to upload new image
          </p>
        </div>

        <!-- Form -->

        <div class="grid gap-5 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm text-gray-400"> Full Name </label>

            <input
              v-model="form.full_name"
              class="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none focus:border-[#FF4D00]"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-400"> Phone </label>

            <input
              v-model="form.phone"
              class="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none focus:border-[#FF4D00]"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-400"> Gender </label>

            <select
              v-model="form.gender"
              class="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none focus:border-[#FF4D00]"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-400"> City </label>

            <input
              v-model="form.city"
              class="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none focus:border-[#FF4D00]"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-400"> Country </label>

            <input
              v-model="form.country"
              class="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none focus:border-[#FF4D00]"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm text-gray-400">
              Postal Code
            </label>

            <input
              v-model="form.postal_code"
              class="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none focus:border-[#FF4D00]"
            />
          </div>
        </div>

        <div class="mt-5">
          <label class="mb-2 block text-sm text-gray-400"> Address </label>

          <input
            v-model="form.address"
            class="h-14 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none focus:border-[#FF4D00]"
          />
        </div>

        <div class="mt-5">
          <label class="mb-2 block text-sm text-gray-400"> Bio </label>

          <textarea
            v-model="form.bio"
            rows="5"
            class="w-full rounded-2xl border border-white/10 bg-black p-4 text-white outline-none focus:border-[#FF4D00]"
          />
        </div>

        <!-- Buttons -->

        <div class="mt-10 flex flex-col gap-4 md:flex-row">
          <button
            @click="handleUpdate"
            :disabled="loading"
            class="flex-1 rounded-2xl bg-[#FF4D00] py-4 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50"
          >
            {{ loading ? "Saving..." : "Save Changes" }}
          </button>

          <button
            @click="$router.back()"
            class="flex-1 rounded-2xl border border-white/10 bg-[#111111] py-4 font-bold text-white transition hover:border-[#FF4D00]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);

const avatarFile = ref<File | null>(null);

const avatarPreview = ref("");

const form = ref({
  full_name: "",
  phone: "",
  gender: "",
  address: "",
  city: "",
  country: "",
  postal_code: "",
  bio: "",
});

const handleAvatar = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (!file) return;

  avatarFile.value = file;

  avatarPreview.value = URL.createObjectURL(file);
};

onMounted(async () => {
  const profile = await authStore.getProfile();

  form.value = {
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    gender: profile.gender || "",
    address: profile.address || "",
    city: profile.city || "",
    country: profile.country || "",
    postal_code: profile.postal_code || "",
    bio: profile.bio || "",
  };

  avatarPreview.value = profile.avatar || "";
});

const handleUpdate = async () => {
  try {
    loading.value = true;

    let avatarUrl = avatarPreview.value;

    if (avatarFile.value) {
      avatarUrl = await authStore.uploadAvatar(avatarFile.value);
    }

    await authStore.updateProfile({
      ...form.value,
      avatar: avatarUrl,
    });

    router.push("/profile");
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

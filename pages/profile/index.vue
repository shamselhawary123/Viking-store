<template>
  <section class="min-h-screen bg-black">
    <div class="relative overflow-hidden border-b border-white/10">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(207,29,29,0.22),transparent_32rem)]" />

      <div class="container-premium relative py-14">
        <div v-if="profile" class="flex flex-col items-center gap-6 md:flex-row md:items-center">
          <div class="relative">
            <img
              :src="profile.avatar || 'https://ui-avatars.com/api/?name=Viking+Member'"
              alt="Profile avatar"
              width="128"
              height="128"
              class="h-32 w-32 rounded-full border-4 border-[#CF1D1D] object-cover shadow-[0_0_40px_rgba(207,29,29,0.28)]"
              loading="lazy"
              decoding="async"
            />
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#CF1D1D] px-4 py-1 text-xs font-black uppercase tracking-[0.16em]">
              {{ t('profile.member') }}
            </div>
          </div>

          <div class="text-center md:text-left">
            <p class="eyebrow">Viking Store</p>
            <h1 class="display-heading mt-2 text-6xl text-white">{{ profile.full_name || t('profile.vikingMember') }}</h1>
            <p class="mt-2 text-neutral-400">{{ profile.email }}</p>
            <p class="mt-3 text-sm text-neutral-500">{{ t('profile.memberSince', { date: formatDate(profile.created_at) }) }}</p>
          </div>
        </div>

        <div v-else-if="loading" class="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
      </div>
    </div>

    <div v-if="profile" class="container-premium py-10">
      <div class="grid gap-5 md:grid-cols-3">
        <div v-for="stat in stats" :key="stat.label" class="premium-panel rounded-2xl p-6">
          <p class="text-sm font-black uppercase tracking-[0.18em] text-neutral-500">{{ stat.label }}</p>
          <h3 class="mt-3 text-2xl font-black" :class="stat.accent ? 'text-[#CF1D1D]' : 'text-white'">{{ stat.value }}</h3>
        </div>
      </div>

      <div class="premium-panel mt-8 rounded-2xl p-6 md:p-8">
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="eyebrow">{{ t('profile.title') }}</p>
            <h2 class="mt-2 text-2xl font-black text-white">{{ t('profile.memberInformation') }}</h2>
          </div>
          <NuxtLink to="/profile/edit" class="premium-button premium-button-primary">
            <Icon name="i-heroicons-pencil-square" />
            {{ t('profile.edit') }}
          </NuxtLink>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="item in profileFields" :key="item.label" class="rounded-xl border border-white/10 bg-black/45 p-5">
            <p class="text-sm text-neutral-500">{{ item.label }}</p>
            <p class="mt-2 font-bold text-white">{{ item.value || t('profile.notSet') }}</p>
          </div>
        </div>
      </div>

      <div class="premium-panel mt-8 rounded-2xl p-6 md:p-8">
        <p class="eyebrow">{{ t('profile.story') }}</p>
        <h2 class="mt-2 text-2xl font-black text-white">{{ t('profile.memberBio') }}</h2>
        <p class="mt-5 leading-8 text-neutral-300">{{ profile.bio || t('profile.noBio') }}</p>
      </div>

      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <NuxtLink to="/profile/orders" class="premium-button premium-button-secondary">{{ t('profile.myOrders') }}</NuxtLink>
        <NuxtLink to="/wishlist" class="premium-button premium-button-secondary">{{ t('pages.wishlist') }}</NuxtLink>
        <NuxtLink to="/auth/forgot-password" class="premium-button premium-button-primary">{{ t('profile.changePassword') }}</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";

definePageMeta({
  middleware: ["auth"],
});

const authStore = useAuthStore(usePinia());
const { locale, t } = useI18n();
const profile = ref<any>(null);
const loading = ref(true);

const formatDate = (date?: string) => {
  if (!date) return t("profile.recently");
  return new Date(date).toLocaleDateString(locale.value === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const stats = computed(() => [
  { label: t("profile.rank"), value: t("profile.vikingWarrior"), accent: true },
  { label: t("auth.country"), value: profile.value?.country || t("profile.notSet") },
  { label: t("common.city"), value: profile.value?.city || t("profile.notSet") },
]);

const profileFields = computed(() => [
  { label: t("common.phone"), value: profile.value?.phone },
  { label: t("auth.gender"), value: profile.value?.gender },
  { label: t("common.address"), value: profile.value?.address },
  { label: t("auth.postalCode"), value: profile.value?.postal_code },
]);

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

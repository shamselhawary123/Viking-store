<template>
  <div class="min-h-screen bg-[#050505] text-white">
    <aside
      class="fixed inset-y-0 z-40 hidden w-72 border-white/10 bg-black/90 p-5 lg:block"
      :class="isRtl ? 'right-0 border-l' : 'left-0 border-r'"
    >
      <NuxtLink to="/admin" class="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Viking Store"
          class="h-11 w-11 object-contain"
        />
        <div>
          <p class="font-[Bebas_Neue] text-3xl leading-none">VIKING</p>
          <p
            class="text-xs font-bold uppercase tracking-[0.25em] text-[#FF4D00]"
          >
            {{ t('admin.admin') }}
          </p>
        </div>
      </NuxtLink>

      <nav class="mt-10 space-y-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-400 transition hover:bg-white/5 hover:text-white"
          active-class="!bg-[#FF4D00] !text-white"
        >
          <Icon :name="item.icon" class="text-xl" />
          {{ t(item.labelKey) }}
        </NuxtLink>
      </nav>
    </aside>

    <div :class="isRtl ? 'lg:pr-72' : 'lg:pl-72'">
      <header
        class="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl"
      >
        <div class="flex min-h-16 items-center justify-between px-4 lg:px-8">
          <div>
            <p
              class="text-xs font-bold uppercase tracking-[0.25em] text-[#FF4D00]"
            >
              {{ t('admin.dashboardTitle') }}
            </p>
            <h1 class="text-lg font-black">{{ t('admin.store') }}</h1>
          </div>

          <div class="flex items-center gap-2">
            <SharedLanguageSwitcher />
            <button
              class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 lg:hidden"
              @click="mobileOpen = !mobileOpen"
            >
              <Icon
                :name="mobileOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
              />
            </button>
          </div>
        </div>

        <nav
          v-if="mobileOpen"
          class="grid gap-2 border-t border-white/10 bg-[#080808] p-4 lg:hidden"
        >
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-400"
            active-class="!bg-[#FF4D00] !text-white"
            @click="mobileOpen = false"
          >
            <Icon :name="item.icon" class="text-xl" />
            {{ t(item.labelKey) }}
          </NuxtLink>
        </nav>

        <button
          class="m-4 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-gray-400 transition hover:border-[#FF4D00] hover:text-white lg:flex lg:items-center lg:gap-3"
          @click="logout"
        >
          <Icon name="i-heroicons-arrow-right-on-rectangle" class="text-xl" />
          {{ t('admin.signOut') }}
        </button>
      </header>

      <main class="px-4 py-8 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const mobileOpen = ref(false);
const supabase = useSupabase();
const { locale, t } = useI18n();
const isRtl = computed(() => locale.value === "ar");

const navItems = [
  { labelKey: "admin.dashboard", to: "/admin", icon: "i-heroicons-squares-2x2" },
  {
    labelKey: "admin.orders",
    to: "/admin/orders",
    icon: "i-heroicons-clipboard-document-list",
  },
  {
    labelKey: "admin.products",
    to: "/admin/products",
    icon: "i-heroicons-shopping-bag",
  },
  { labelKey: "admin.categories", to: "/admin/categories", icon: "i-heroicons-tag" },
  {
    labelKey: "admin.coupons",
    to: "/admin/coupons",
    icon: "i-heroicons-ticket",
  },
  {
    labelKey: "admin.users",
    to: "/admin/users",
    icon: "i-heroicons-users",
  },
  { labelKey: "admin.settings", to: "/admin/settings", icon: "i-heroicons-cog-6-tooth" },
];

const logout = async () => {
  await supabase.auth.signOut();
  await navigateTo("/admin/login");
};
</script>

<template>
  <div
    class="min-h-screen bg-[#050505] text-white"
    :dir="isRtl ? 'rtl' : 'ltr'"
    :class="isRtl ? 'text-right' : 'text-left'"
  >
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

    <Teleport to="body">
      <button
        v-if="mobileOpen"
        class="admin-mobile-backdrop fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        type="button"
        :aria-label="t('nav.closeMenu')"
        @click="closeMobileNav"
      />
      <aside
        v-if="mobileOpen"
        class="admin-mobile-drawer fixed inset-y-0 z-50 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col border-white/10 bg-[#070707] p-4 shadow-2xl lg:hidden"
        :class="isRtl ? 'right-0 border-l' : 'left-0 border-r'"
      >
        <div class="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <NuxtLink to="/admin" class="flex items-center gap-3" @click="closeMobileNav">
            <img src="/logo.png" alt="Viking Store" class="h-10 w-10 object-contain" />
            <div>
              <p class="font-[Bebas_Neue] text-2xl leading-none">VIKING</p>
              <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF4D00]">
                {{ t('admin.admin') }}
              </p>
            </div>
          </NuxtLink>
          <button
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition hover:border-[#FF4D00] hover:text-white"
            :aria-label="t('nav.closeMenu')"
            @click="closeMobileNav"
          >
            <Icon name="i-heroicons-x-mark" class="text-xl" />
          </button>
        </div>

        <nav class="mt-5 grid gap-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-gray-400 transition hover:bg-white/5 hover:text-white"
            active-class="!bg-[#FF4D00] !text-white"
            @click="closeMobileNav"
          >
            <Icon :name="item.icon" class="text-xl" />
            {{ t(item.labelKey) }}
          </NuxtLink>
        </nav>

        <button
          class="mt-auto flex min-h-11 items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-gray-400 transition hover:border-[#FF4D00] hover:text-white"
          type="button"
          @click="logout"
        >
          <Icon name="i-heroicons-arrow-right-on-rectangle" class="text-xl" />
          {{ t('admin.signOut') }}
        </button>
      </aside>
    </Teleport>

    <div :class="isRtl ? 'lg:pr-72' : 'lg:pl-72'">
      <header
        class="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl"
      >
        <div class="flex min-h-14 items-center justify-between gap-3 px-3 sm:px-4 lg:min-h-16 lg:px-8">
          <button
            class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition hover:border-[#FF4D00] hover:text-white lg:hidden"
            type="button"
            :aria-label="t('nav.openMenu')"
            @click="mobileOpen = true"
          >
            <Icon name="i-heroicons-bars-3" class="text-xl" />
          </button>

          <div class="min-w-0 flex-1 lg:flex-none">
            <p
              class="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF4D00] sm:text-xs"
            >
              {{ t('admin.dashboardTitle') }}
            </p>
            <h1 class="truncate text-base font-black sm:text-lg">{{ t('admin.store') }}</h1>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <SharedLanguageSwitcher />
          </div>
        </div>

        <button
          class="m-4 hidden rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-gray-400 transition hover:border-[#FF4D00] hover:text-white lg:flex lg:items-center lg:gap-3"
          @click="logout"
        >
          <Icon name="i-heroicons-arrow-right-on-rectangle" class="text-xl" />
          {{ t('admin.signOut') }}
        </button>
      </header>

      <main class="overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const mobileOpen = ref(false);
const supabase = useSupabase();
const route = useRoute();
const { locale, t } = useI18n();
const isRtl = computed(() => locale.value === "ar");

const closeMobileNav = () => {
  mobileOpen.value = false;
};

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
    labelKey: "admin.blog",
    to: "/admin/blog",
    icon: "i-heroicons-newspaper",
  },
  {
    labelKey: "admin.users",
    to: "/admin/users",
    icon: "i-heroicons-users",
  },
  { labelKey: "admin.settings", to: "/admin/settings", icon: "i-heroicons-cog-6-tooth" },
];

const logout = async () => {
  closeMobileNav();
  await supabase.auth.signOut();
  await navigateTo("/admin/login");
};

watch(
  () => route.fullPath,
  () => closeMobileNav(),
);

watch(mobileOpen, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? "hidden" : "";
});

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") closeMobileNav();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (import.meta.client) document.body.style.overflow = "";
});
</script>

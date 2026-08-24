<template>
  <footer class="relative overflow-hidden border-t border-white/10 bg-black">
    <div
      class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#CF1D1D]/70 to-transparent"
    />

    <div class="container-premium py-6 sm:py-8 md:py-10">
      <div
        class="grid gap-5 sm:gap-7 lg:grid-cols-[1.1fr_0.8fr_0.9fr_1fr] lg:gap-8"
      >
        <div class="sm:col-span-2 lg:col-span-1">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-3"
            :aria-label="t('nav.home')"
          >
            <img
              :src="siteLogoSrc"
              alt="Viking Store"
              width="48"
              height="48"
              class="h-9 w-9 object-contain sm:h-10 sm:w-10"
              loading="lazy"
              decoding="async"
            />

            <div>
              <p
                class="text-[9px] font-black uppercase tracking-[0.22em] text-[#CF1D1D] sm:text-[10px]"
              >
                {{ t("footer.combatStore") }}
              </p>
            </div>
          </NuxtLink>

          <p class="mt-3 max-w-sm text-sm leading-6 text-neutral-400">
            {{ t("footer.description") }}
          </p>

          <div class="mt-5">
            <h3
              class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-xs sm:tracking-[0.2em]"
            >
              {{ t("footer.follow") }}
            </h3>

            <div class="mt-3 flex flex-wrap gap-2">
              <a
                v-for="social in socials"
                :key="social.label"
                :href="social.href"
                class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-neutral-300 transition duration-300 hover:-translate-y-0.5 hover:border-[#CF1D1D] hover:text-[#CF1D1D] sm:h-11 sm:w-11"
                :aria-label="social.label"
              >
                <Icon :name="social.icon" class="text-lg" />
              </a>
            </div>
          </div>
        </div>

        <div
          class="footer-navigation-grid grid grid-cols-2 gap-4 sm:gap-6 lg:contents"
        >
          <div>
            <h3
              class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-xs sm:tracking-[0.2em]"
            >
              {{ t("nav.categories") }}
            </h3>

            <div class="mt-3 grid gap-2">
              <NuxtLink
                v-for="category in footerCategories"
                :key="category.slug"
                :to="`/shop?category=${category.slug}`"
                class="footer-link text-sm"
              >
                {{
                  getLocalizedCategoryName(category, locale) || category.name
                }}
              </NuxtLink>
            </div>
          </div>

          <div v-for="group in linkGroups" :key="group.titleKey">
            <h3
              class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-xs sm:tracking-[0.2em]"
            >
              {{ t(group.titleKey) }}
            </h3>

            <div class="mt-3 grid gap-2">
              <NuxtLink
                v-for="link in group.links.filter((item) => item.to)"
                :key="`${group.titleKey}-${link.labelKey}`"
                :to="link.to"
                class="footer-link text-sm"
              >
                {{ t(link.labelKey) }}
              </NuxtLink>

              <a
                v-for="link in group.links.filter((item) => item.href)"
                :key="`${group.titleKey}-${link.labelKey}`"
                :href="link.href"
                class="footer-link text-sm"
              >
                {{ t(link.labelKey) }}
              </a>
            </div>
          </div>
        </div>

        <div class="footer-contact-panel">
          <h3
            class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-xs sm:tracking-[0.2em]"
          >
            {{ t("footer.contact") }}
          </h3>

          <div
            class="mt-3 grid gap-2 text-sm leading-5 text-neutral-400 sm:gap-3"
          >
            <p
              v-for="item in contactItems"
              :key="item.label"
              class="flex gap-2"
            >
              <Icon
                :name="item.icon"
                class="mt-0.5 shrink-0 text-base text-[#CF1D1D]"
              />

              <span>
                <strong class="block text-white">
                  {{ t(item.labelKey) }}
                </strong>

                {{ t(item.valueKey) }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        class="mt-5 grid gap-4 border-y border-white/10 py-4 sm:mt-6 sm:gap-5 sm:py-5 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8"
      >
        <div>
          <div class="grid gap-3 md:grid-cols-[0.7fr_1fr] md:items-center">
            <div>
              <p class="eyebrow">
                {{ t("footer.stayReady") }}
              </p>

              <h3 class="mt-1 text-lg font-black text-white sm:text-2xl">
                {{ t("footer.joinList") }}
              </h3>

              <p class="mt-1 text-sm leading-6 text-neutral-400">
                {{ t("footer.newsletterText") }}
              </p>
            </div>

            <form
              class="grid gap-2 sm:grid-cols-[1fr_auto]"
              @submit.prevent="newsletterSubmitted = true"
            >
              <label class="sr-only" for="footer-email">
                {{ t("footer.emailAddress") }}
              </label>

              <input
                id="footer-email"
                v-model="newsletterEmail"
                type="email"
                class="premium-input min-w-0 py-2.5 sm:py-3"
                :placeholder="t('footer.emailAddress')"
                autocomplete="email"
              />

              <button
                class="premium-button premium-button-primary min-h-10 px-5 sm:min-h-11"
                type="submit"
              >
                {{ t("footer.subscribe") }}
              </button>

              <p
                v-if="newsletterSubmitted"
                class="text-sm font-bold text-emerald-300 sm:col-span-2"
              >
                {{ t("footer.captured") }}
              </p>
            </form>
          </div>
        </div>

        <div>
          <h3
            class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-xs sm:tracking-[0.2em] lg:text-right"
          >
            {{ t("footer.paymentMethods") }}
          </h3>

          <div class="mt-3 flex flex-wrap gap-1.5 sm:gap-2 lg:justify-end">
            <span
              v-for="method in paymentMethods"
              :key="method.valueKey"
              class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-300 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
            >
              {{ t(method.valueKey) }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="mt-4 flex flex-col gap-3 text-xs text-neutral-500 sm:text-sm md:flex-row md:items-center md:justify-between"
      >
        <p>
          {{ t("footer.copyright") }}
        </p>

        <div class="flex flex-wrap gap-x-4 gap-y-2">
          <a
            v-for="link in bottomLinks"
            :key="link.label"
            :href="link.href"
            class="footer-link text-xs sm:text-sm"
          >
            {{ t(link.labelKey) }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCategoriesStore } from "../../stores/categories";
import { getLocalizedCategoryName } from "../../utils/localizationFormat";

const newsletterEmail = ref("");
const newsletterSubmitted = ref(false);
const categoriesStore = useCategoriesStore(usePinia());
const { locale, t } = useI18n();

const siteLogoSrc = "/logo.png";
const fallbackCategories = [
  { name: "Gloves", slug: "gloves" },
  { name: "Shorts", slug: "shorts" },
  { name: "Shin Guards", slug: "shin-guards" },
  { name: "Hand Wraps", slug: "hand-wraps" },
];

const footerCategories = computed(() => {
  const categories = categoriesStore.categories.filter(
    (category) => category.slug !== "all",
  );
  return categories.length ? categories.slice(0, 5) : fallbackCategories;
});

const linkGroups = [
  {
    titleKey: "footer.customerSupport",
    links: [
      { labelKey: "common.shipping", to: "/faq" },
      { labelKey: "footer.returns", to: "/faq" },
      { labelKey: "footer.orderTracking", to: "/profile/orders" },
      { labelKey: "footer.helpCenter", to: "/contact" },
    ],
  },
];

const contactItems = [
  {
    icon: "i-heroicons-phone",
    labelKey: "common.phone",
    valueKey: "footer.phoneValue",
  },
  {
    icon: "i-heroicons-envelope",
    labelKey: "common.email",
    valueKey: "footer.emailValue",
  },
  {
    icon: "i-heroicons-clock",
    labelKey: "footer.workingHours",
    valueKey: "footer.workingHoursValue",
  },
];

const socials = [
  {
    label: "Facebook",
    icon: "simple-icons:facebook",
    href: "https://www.facebook.com/profile.php?id=100025354200512",
  },
  {
    label: "Instagram",
    icon: "simple-icons:instagram",
    href: "https://www.instagram.com/vikingclubstore/",
  },
  {
    label: "TikTok",
    icon: "simple-icons:tiktok",
    href: "https://www.tiktok.com/@the_vikings22",
  },
];

const paymentMethods = [
  {
    valueKey: "footer.cashOnDelivery",
  },
  {
    valueKey: "footer.InstaPay",
  },
];
const bottomLinks = [
  { labelKey: "footer.privacy", href: "/privacy-policy" },
  { labelKey: "footer.terms", href: "/terms" },
  { labelKey: "footer.cookies", href: "/cookies" },
];

onMounted(async () => {
  if (!categoriesStore.categories.length) {
    try {
      await categoriesStore.getCategories();
    } catch {
      // Keep fallback categories when the shared category source is unavailable.
    }
  }
});
</script>

<style scoped>
.footer-link {
  color: #a3a3a3;
  transition:
    color 180ms ease,
    transform 180ms ease;
}

.footer-link:hover {
  color: #cf1d1d;
  transform: translateX(3px);
}
</style>

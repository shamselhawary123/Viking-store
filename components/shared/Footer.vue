<template>
  <footer class="relative overflow-hidden border-t border-white/10 bg-black">
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4D00]/70 to-transparent" />
    <div class="container-premium py-16 md:py-20">
      <div class="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
          <NuxtLink to="/" class="inline-flex items-center gap-4" :aria-label="t('nav.home')">
            <img src="/logo.png" alt="Viking Store" width="56" height="56" class="h-14 w-14 object-contain" loading="lazy" decoding="async" />
            <div>
              <h2 class="font-display text-5xl leading-none text-white md:text-6xl">VIKING</h2>
              <p class="text-xs font-black uppercase tracking-[0.34em] text-[#FF4D00]">{{ t('footer.combatStore') }}</p>
            </div>
          </NuxtLink>

          <p class="mt-6 max-w-xl leading-8 text-neutral-400">
            {{ t('footer.description') }}
          </p>

          <div class="mt-7 grid gap-3 sm:grid-cols-3">
            <div v-for="badge in securityBadges" :key="badge.label" class="rounded-xl border border-white/10 bg-black/25 p-4">
              <Icon :name="badge.icon" class="text-2xl text-[#FF4D00]" />
              <p class="mt-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-300">{{ t(badge.labelKey) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-[#FF4D00]/20 bg-[#120903] p-6 md:p-7">
          <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p class="eyebrow">{{ t('footer.stayReady') }}</p>
              <h3 class="mt-3 text-3xl font-black text-white">{{ t('footer.joinList') }}</h3>
              <p class="mt-3 leading-7 text-neutral-400">{{ t('footer.newsletterText') }}</p>
            </div>
            <form class="grid gap-3 sm:grid-cols-[1fr_auto]" @submit.prevent="newsletterSubmitted = true">
              <label class="sr-only" for="footer-email">{{ t('footer.emailAddress') }}</label>
              <input id="footer-email" v-model="newsletterEmail" type="email" class="premium-input min-w-0" :placeholder="t('footer.emailAddress')" autocomplete="email" />
              <button class="premium-button premium-button-primary" type="submit">{{ t('footer.subscribe') }}</button>
              <p v-if="newsletterSubmitted" class="text-sm font-bold text-emerald-300 sm:col-span-2">{{ t('footer.captured') }}</p>
            </form>
          </div>
        </div>
      </div>

      <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="group in linkGroups" :key="group.title">
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">{{ t(group.titleKey) }}</h3>
          <div class="mt-5 grid gap-3">
            <NuxtLink v-for="link in group.links.filter((item) => item.to)" :key="`${group.titleKey}-${link.labelKey}`" :to="link.to" class="footer-link">
              {{ t(link.labelKey) }}
            </NuxtLink>
            <a v-for="link in group.links.filter((item) => item.href)" :key="`${group.titleKey}-${link.labelKey}`" :href="link.href" class="footer-link">
              {{ t(link.labelKey) }}
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">{{ t('nav.categories') }}</h3>
          <div class="mt-5 grid gap-3">
            <NuxtLink v-for="category in footerCategories" :key="category.slug" :to="`/shop?category=${category.slug}`" class="footer-link">
              {{ getLocalizedCategoryName(category, locale) || category.name }}
            </NuxtLink>
          </div>
        </div>

        <div class="sm:col-span-2 lg:col-span-1">
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">{{ t('footer.contact') }}</h3>
          <div class="mt-5 grid gap-4 text-sm leading-6 text-neutral-400">
            <p v-for="item in contactItems" :key="item.label" class="flex gap-3">
              <Icon :name="item.icon" class="mt-1 shrink-0 text-lg text-[#FF4D00]" />
              <span><strong class="block text-white">{{ t(item.labelKey) }}</strong>{{ t(item.valueKey) }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="premium-divider my-10" />

      <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">{{ t('footer.follow') }}</h3>
          <div class="mt-4 flex flex-wrap gap-3">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-neutral-300 transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00] hover:text-[#FF4D00]"
              :aria-label="social.label"
            >
              <Icon :name="social.icon" class="text-xl" />
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white lg:text-right">{{ t('footer.paymentMethods') }}</h3>
          <div class="mt-4 flex flex-wrap gap-2 lg:justify-end">
            <span v-for="method in paymentMethods" :key="method" class="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
              {{ method }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
        <p>{{ t('footer.copyright') }}</p>
        <div class="flex flex-wrap gap-4">
          <a v-for="link in bottomLinks" :key="link.label" :href="link.href" class="footer-link">
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

const fallbackCategories = [
  { name: "Gloves", slug: "gloves" },
  { name: "Shorts", slug: "shorts" },
  { name: "Shin Guards", slug: "shin-guards" },
  { name: "Hand Wraps", slug: "hand-wraps" },
];

const footerCategories = computed(() => {
  const categories = categoriesStore.categories.filter((category) => category.slug !== "all");
  return categories.length ? categories.slice(0, 5) : fallbackCategories;
});

const linkGroups = [
  {
    titleKey: "footer.shop",
    links: [
      { labelKey: "nav.shop", to: "/shop" },
      { labelKey: "footer.newArrivals", to: "/shop" },
      { labelKey: "footer.bestSellers", to: "/shop" },
      { labelKey: "footer.sale", to: "/shop" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { labelKey: "nav.about", to: "/about" },
      { labelKey: "nav.contact", to: "/contact" },
      { labelKey: "nav.faq", to: "/faq" },
      { labelKey: "footer.privacyPolicy", href: "/privacy-policy" },
      { labelKey: "footer.terms", href: "/terms" },
    ],
  },
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
  { icon: "i-heroicons-phone", labelKey: "common.phone", valueKey: "footer.phoneValue" },
  { icon: "i-heroicons-envelope", labelKey: "common.email", valueKey: "footer.emailValue" },
  { icon: "i-heroicons-map-pin", labelKey: "common.address", valueKey: "footer.addressValue" },
  { icon: "i-heroicons-clock", labelKey: "footer.workingHours", valueKey: "footer.workingHoursValue" },
];

const socials = [
  { label: "Facebook", icon: "simple-icons:facebook", href: "https://facebook.com" },
  { label: "Instagram", icon: "simple-icons:instagram", href: "https://instagram.com" },
  { label: "TikTok", icon: "simple-icons:tiktok", href: "https://tiktok.com" },
  { label: "YouTube", icon: "simple-icons:youtube", href: "https://youtube.com" },
  { label: "LinkedIn", icon: "simple-icons:linkedin", href: "https://linkedin.com" },
];

const paymentMethods = ["Visa", "MasterCard", "PayPal", "Apple Pay", "Google Pay"];
const securityBadges = [
  { icon: "i-heroicons-lock-closed", labelKey: "footer.secureCheckout" },
  { icon: "i-heroicons-shield-check", labelKey: "footer.sslProtected" },
  { icon: "i-heroicons-truck", labelKey: "footer.fastDelivery" },
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
  color: #ff4d00;
  transform: translateX(3px);
}
</style>

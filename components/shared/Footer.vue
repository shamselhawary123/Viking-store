<template>
  <footer class="relative overflow-hidden border-t border-white/10 bg-black">
    <div
      class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4D00]/70 to-transparent"
    />

    <div class="container-premium py-8 sm:py-12 md:py-20">
      <!-- Main Footer -->
      <div class="grid gap-5 lg:grid-cols-[1.1fr_1.4fr] lg:gap-10">
        <!-- Brand -->
        <div
          class="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:rounded-2xl sm:p-6 md:p-7"
        >
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-3 sm:gap-4"
            :aria-label="t('nav.home')"
          >
            <img
              src="/logo.png"
              alt="Viking Store"
              width="56"
              height="56"
              class="h-10 w-10 object-contain sm:h-12 sm:w-12 md:h-14 md:w-14"
              loading="lazy"
              decoding="async"
            />

            <div>
              <p
                class="text-[10px] font-black uppercase tracking-[0.25em] text-[#FF4D00] sm:text-xs sm:tracking-[0.34em]"
              >
                {{ t("footer.combatStore") }}
              </p>
            </div>
          </NuxtLink>

          <p
            class="mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:mt-6 sm:leading-8"
          >
            {{ t("footer.description") }}
          </p>

          <!-- Security badges -->
          <div class="mt-5 grid grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
            <div
              v-for="badge in securityBadges"
              :key="badge.label"
              class="flex min-w-0 flex-col items-center rounded-lg border border-white/10 bg-black/25 px-2 py-3 text-center sm:rounded-xl sm:p-4"
            >
              <Icon
                :name="badge.icon"
                class="text-lg text-[#FF4D00] sm:text-2xl"
              />

              <p
                class="mt-2 line-clamp-2 text-[9px] font-black uppercase leading-3 tracking-[0.08em] text-neutral-300 sm:mt-3 sm:text-xs sm:tracking-[0.14em]"
              >
                {{ t(badge.labelKey) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Newsletter -->
        <div
          class="rounded-xl border border-[#FF4D00]/20 bg-[#120903] p-4 sm:rounded-2xl sm:p-6 md:p-7"
        >
          <div
            class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-6"
          >
            <div>
              <p class="eyebrow">
                {{ t("footer.stayReady") }}
              </p>

              <h3
                class="mt-2 text-2xl font-black text-white sm:mt-3 sm:text-3xl"
              >
                {{ t("footer.joinList") }}
              </h3>

              <p
                class="mt-2 text-sm leading-6 text-neutral-400 sm:mt-3 sm:leading-7"
              >
                {{ t("footer.newsletterText") }}
              </p>
            </div>

            <form
              class="grid gap-2 sm:grid-cols-[1fr_auto] sm:gap-3"
              @submit.prevent="newsletterSubmitted = true"
            >
              <label class="sr-only" for="footer-email">
                {{ t("footer.emailAddress") }}
              </label>

              <input
                id="footer-email"
                v-model="newsletterEmail"
                type="email"
                class="premium-input min-w-0"
                :placeholder="t('footer.emailAddress')"
                autocomplete="email"
              />

              <button
                class="premium-button premium-button-primary"
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
      </div>

      <!-- Links -->
      <div
        class="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 sm:mt-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5"
      >
        <div v-for="group in linkGroups" :key="group.title">
          <h3
            class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.22em]"
          >
            {{ t(group.titleKey) }}
          </h3>

          <div class="mt-3 grid gap-2 sm:mt-5 sm:gap-3">
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

        <!-- Categories -->
        <div>
          <h3
            class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.22em]"
          >
            {{ t("nav.categories") }}
          </h3>

          <div class="mt-3 grid gap-2 sm:mt-5 sm:gap-3">
            <NuxtLink
              v-for="category in footerCategories"
              :key="category.slug"
              :to="`/shop?category=${category.slug}`"
              class="footer-link text-sm"
            >
              {{ getLocalizedCategoryName(category, locale) || category.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- Contact -->
        <div class="col-span-2 sm:col-span-2 lg:col-span-1">
          <h3
            class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.22em]"
          >
            {{ t("footer.contact") }}
          </h3>

          <div
            class="mt-3 grid gap-3 text-sm leading-5 text-neutral-400 sm:mt-5 sm:gap-4 sm:leading-6"
          >
            <p
              v-for="item in contactItems"
              :key="item.label"
              class="flex gap-2 sm:gap-3"
            >
              <Icon
                :name="item.icon"
                class="mt-0.5 shrink-0 text-base text-[#FF4D00] sm:mt-1 sm:text-lg"
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

      <div class="premium-divider my-7 sm:my-10" />

      <!-- Social + Payment -->
      <div class="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <!-- Social -->
        <div>
          <h3
            class="text-[11px] font-black uppercase tracking-[0.16em] text-white sm:text-sm sm:tracking-[0.22em]"
          >
            {{ t("footer.follow") }}
          </h3>

          <div class="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-neutral-300 transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00] hover:text-[#FF4D00] sm:h-12 sm:w-12"
              :aria-label="social.label"
            >
              <Icon :name="social.icon" class="text-lg sm:text-xl" />
            </a>
          </div>
        </div>

        <!-- Payment -->
        <div>
          <h3
            class="text-[11px] font-black uppercase tracking-[0.16em] text-white lg:text-right sm:text-sm sm:tracking-[0.22em]"
          >
            {{ t("footer.paymentMethods") }}
          </h3>

          <div
            class="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2 lg:justify-end"
          >
            <span
              v-for="method in paymentMethods"
              :key="method"
              class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-300 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]"
            >
              {{ method }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div
        class="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-neutral-500 sm:mt-10 sm:gap-4 sm:pt-6 sm:text-sm md:flex-row md:items-center md:justify-between"
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
    icon: "i-heroicons-map-pin",
    labelKey: "common.address",
    valueKey: "footer.addressValue",
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
    href: "https://www.instagram.com/shams_elhawary123/",
  },
  {
    label: "TikTok",
    icon: "simple-icons:tiktok",
    href: "https://www.tiktok.com/@the_vikings22?is_from_webapp=1&sender_device=pc",
  },
  {
    label: "YouTube",
    icon: "simple-icons:youtube",
    href: "https://youtube.com",
  },
];

const paymentMethods = ["InstaPay", "cash on delivery"];
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

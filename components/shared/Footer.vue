<template>
  <footer class="relative overflow-hidden border-t border-white/10 bg-black">
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4D00]/70 to-transparent" />
    <div class="container-premium py-16 md:py-20">
      <div class="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
          <NuxtLink to="/" class="inline-flex items-center gap-4" aria-label="Viking Store home">
            <img src="/logo.png" alt="Viking Store" class="h-14 w-14 object-contain" loading="lazy" />
            <div>
              <h2 class="font-display text-5xl leading-none text-white md:text-6xl">VIKING</h2>
              <p class="text-xs font-black uppercase tracking-[0.34em] text-[#FF4D00]">Combat store</p>
            </div>
          </NuxtLink>

          <p class="mt-6 max-w-xl leading-8 text-neutral-400">
            Premium combat equipment for boxing, kickboxing, Muay Thai, and MMA athletes who demand fit, durability, and fight-night confidence.
          </p>

          <div class="mt-7 grid gap-3 sm:grid-cols-3">
            <div v-for="badge in securityBadges" :key="badge.label" class="rounded-xl border border-white/10 bg-black/25 p-4">
              <Icon :name="badge.icon" class="text-2xl text-[#FF4D00]" />
              <p class="mt-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-300">{{ badge.label }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-[#FF4D00]/20 bg-[#120903] p-6 md:p-7">
          <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p class="eyebrow">Stay fight ready</p>
              <h3 class="mt-3 text-3xl font-black text-white">Join The Viking List</h3>
              <p class="mt-3 leading-7 text-neutral-400">Product drops, training essentials, and member-only offers.</p>
            </div>
            <form class="grid gap-3 sm:grid-cols-[1fr_auto]" @submit.prevent="newsletterSubmitted = true">
              <label class="sr-only" for="footer-email">Email address</label>
              <input id="footer-email" v-model="newsletterEmail" type="email" class="premium-input min-w-0" placeholder="Email address" autocomplete="email" />
              <button class="premium-button premium-button-primary" type="submit">Subscribe</button>
              <p v-if="newsletterSubmitted" class="text-sm font-bold text-emerald-300 sm:col-span-2">Subscription captured locally.</p>
            </form>
          </div>
        </div>
      </div>

      <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        <div v-for="group in linkGroups" :key="group.title">
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">{{ group.title }}</h3>
          <div class="mt-5 grid gap-3">
            <NuxtLink v-for="link in group.links.filter((item) => item.to)" :key="`${group.title}-${link.label}`" :to="link.to" class="footer-link">
              {{ link.label }}
            </NuxtLink>
            <a v-for="link in group.links.filter((item) => item.href)" :key="`${group.title}-${link.label}`" :href="link.href" class="footer-link">
              {{ link.label }}
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">Categories</h3>
          <div class="mt-5 grid gap-3">
            <NuxtLink v-for="category in footerCategories" :key="category.slug" :to="`/shop?category=${category.slug}`" class="footer-link">
              {{ category.name }}
            </NuxtLink>
          </div>
        </div>

        <div class="sm:col-span-2 lg:col-span-1">
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">Contact</h3>
          <div class="mt-5 grid gap-4 text-sm leading-6 text-neutral-400">
            <p v-for="item in contactItems" :key="item.label" class="flex gap-3">
              <Icon :name="item.icon" class="mt-1 shrink-0 text-lg text-[#FF4D00]" />
              <span><strong class="block text-white">{{ item.label }}</strong>{{ item.value }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="premium-divider my-10" />

      <div class="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">Follow Viking</h3>
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
          <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white lg:text-right">Payment Methods</h3>
          <div class="mt-4 flex flex-wrap gap-2 lg:justify-end">
            <span v-for="method in paymentMethods" :key="method" class="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
              {{ method }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
        <p>Copyright 2026 Viking Store. All rights reserved.</p>
        <div class="flex flex-wrap gap-4">
          <a v-for="link in bottomLinks" :key="link.label" :href="link.href" class="footer-link">
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useCategoriesStore } from "../../stores/categories";

const newsletterEmail = ref("");
const newsletterSubmitted = ref(false);
const categoriesStore = useCategoriesStore(usePinia());

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
    title: "Shop",
    links: [
      { label: "Shop", to: "/shop" },
      { label: "New Arrivals", to: "/shop" },
      { label: "Best Sellers", to: "/shop" },
      { label: "Sale", to: "/shop" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "Shipping", to: "/faq" },
      { label: "Returns", to: "/faq" },
      { label: "Order Tracking", to: "/profile/orders" },
      { label: "Help Center", to: "/contact" },
    ],
  },
];

const contactItems = [
  { icon: "i-heroicons-phone", label: "Phone", value: "+20 100 000 0000" },
  { icon: "i-heroicons-envelope", label: "Email", value: "support@vikingstore.com" },
  { icon: "i-heroicons-map-pin", label: "Address", value: "Viking Store HQ, Cairo, Egypt" },
  { icon: "i-heroicons-clock", label: "Working Hours", value: "Sun - Thu, 10:00 AM - 8:00 PM" },
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
  { icon: "i-heroicons-lock-closed", label: "Secure Checkout" },
  { icon: "i-heroicons-shield-check", label: "SSL Protected" },
  { icon: "i-heroicons-truck", label: "Fast Delivery" },
];
const bottomLinks = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
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

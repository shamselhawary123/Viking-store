<template>
  <footer class="border-t border-white/10 bg-black">
    <div class="container-premium section-premium">
      <div class="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <NuxtLink to="/" class="inline-flex items-center gap-3" aria-label="Viking Store home">
            <img src="/logo.png" alt="Viking Store" class="h-12 w-12 object-contain" />
            <div>
              <h2 class="font-display text-5xl leading-none text-white">VIKING</h2>
              <p class="text-xs font-black uppercase tracking-[0.34em] text-[#FF4D00]">Combat store</p>
            </div>
          </NuxtLink>

          <p class="mt-6 max-w-md leading-8 text-neutral-400">
            Premium combat equipment for boxing, kickboxing, Muay Thai, and MMA athletes who care about fit, durability, and fight-night confidence.
          </p>

          <div class="mt-8 flex gap-3">
            <NuxtLink
              v-for="social in socials"
              :key="social.icon"
              :to="social.to"
              class="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition hover:border-[#FF4D00] hover:text-[#FF4D00]"
              :aria-label="social.label"
            >
              <Icon :name="social.icon" class="text-xl" />
            </NuxtLink>
          </div>
        </div>

        <div class="grid gap-8 sm:grid-cols-3">
          <div v-for="group in linkGroups" :key="group.title">
            <h3 class="text-sm font-black uppercase tracking-[0.22em] text-white">{{ group.title }}</h3>
            <div class="mt-5 grid gap-3">
              <NuxtLink v-for="link in group.links" :key="link.to" :to="link.to" class="premium-link">
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="premium-divider my-12" />

      <div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p class="eyebrow">Stay fight ready</p>
          <p class="mt-2 text-sm text-neutral-400">Product drops, training essentials, and member-only offers.</p>
        </div>
        <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent>
          <label class="sr-only" for="footer-email">Email address</label>
          <input id="footer-email" type="email" class="premium-input min-w-0 sm:w-80" placeholder="Email address" />
          <button class="premium-button premium-button-primary" type="submit">
            Subscribe
          </button>
        </form>
      </div>

      <div class="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
        <p>Copyright 2026 Viking Store. All rights reserved.</p>
        <div class="flex flex-wrap gap-4">
          <NuxtLink to="/faq" class="premium-link">FAQ</NuxtLink>
          <NuxtLink to="/contact" class="premium-link">Support</NuxtLink>
          <NuxtLink to="/shop" class="premium-link">Shop gear</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const socials = [
  { label: "Instagram", icon: "simple-icons:instagram", to: "/" },
  { label: "TikTok", icon: "simple-icons:tiktok", to: "/" },
  { label: "YouTube", icon: "simple-icons:youtube", to: "/" },
];

const linkGroups = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" },
      { label: "Gloves", to: "/shop?category=gloves" },
      { label: "Shorts", to: "/shop?category=shorts" },
      { label: "Categories", to: "/categories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Our Story", to: "/about" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Profile", to: "/profile" },
      { label: "Orders", to: "/profile/orders" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Login", to: "/auth/login" },
    ],
  },
];
</script>

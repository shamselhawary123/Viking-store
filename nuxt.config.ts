import { DEFAULT_SITE_URL } from "./utils/seo";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL,
    },
  },

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/image",
    "@nuxt/fonts",
    "@nuxtjs/i18n",
  ],

  css: ["~/assets/css/main.css"],

  nitro: {
    compressPublicAssets: true,
  },

  image: {
    domains: ["images.unsplash.com", "cdn-icons-png.flaticon.com"],
  },

  icon: {
    clientBundle: {
      scan: true,
    },
    fetchTimeout: 10000,
    serverBundle: {
      collections: ["heroicons", "simple-icons"],
    },
  },

  colorMode: {
    preference: "dark",
    fallback: "dark",
    classSuffix: "",
  },

  fonts: {
    families: [
      {
        name: "Inter",
        provider: "google",
      },
      {
        name: "IBM Plex Sans Arabic",
        provider: "google",
        weights: [400, 500, 600, 700, 800],
        styles: ["normal"],
      },
      {
        name: "Bebas Neue",
        provider: "google",
      },
    ],
  },

  i18n: {
    defaultLocale: "ar",
    strategy: "no_prefix",
    langDir: "../locales/",
    detectBrowserLanguage: false,

    locales: [
      {
        code: "en",
        language: "en-US",
        name: "English",
        file: "en.json",
        dir: "ltr",
      },

      {
        code: "ar",
        language: "ar-EG",
        name: "العربية",
        file: "ar.json",
        dir: "rtl",
      },
    ],
  },
});

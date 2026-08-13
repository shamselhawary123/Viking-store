export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
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
      collections: ["heroicons"],
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
        name: "Cairo",
        provider: "google",
      },
      {
        name: "Bebas Neue",
        provider: "google",
      },
    ],
  },

  i18n: {
    defaultLocale: "en",
    strategy: "no_prefix",
    langDir: "../locales/",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "viking_locale",
      fallbackLocale: "en",
      redirectOn: "root",
    },

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

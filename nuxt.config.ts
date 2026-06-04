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

    locales: [
      {
        code: "en",
        name: "English",
      },

      {
        code: "ar",
        name: "العربية",
      },
    ],
  },
});

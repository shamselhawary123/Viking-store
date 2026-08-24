<template>
  <main class="bg-black text-white">
    <section class="relative isolate overflow-hidden border-b border-white/10">
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(207,29,29,0.18),transparent_34%),linear-gradient(180deg,#170707_0%,#000_72%)]"
      />
      <div class="container-premium py-24 md:py-32">
        <div class="max-w-4xl">
          <p class="eyebrow">{{ t("legal.eyebrow") }}</p>
          <h1 class="display-heading mt-4 text-6xl text-white md:text-7xl">
            {{ t("legal.privacy.title") }}
          </h1>
          <p class="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            {{ t("legal.privacy.lead") }}
          </p>
          <p class="mt-5 text-sm font-bold text-neutral-500">
            {{ t("legal.lastUpdated") }}
          </p>
        </div>
      </div>
    </section>

    <section class="container-premium py-16 md:py-20">
      <div class="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside class="premium-panel h-fit rounded-2xl p-5 lg:sticky lg:top-28">
          <p class="eyebrow">{{ t("legal.onThisPage") }}</p>
          <nav class="mt-5 space-y-2" :aria-label="t('legal.onThisPage')">
            <a
              v-for="section in sections"
              :key="section.id"
              :href="`#${section.id}`"
              class="block rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-[#CF1D1D]/70 hover:text-white"
            >
              {{ rt(section.title) }}
            </a>
          </nav>
        </aside>

        <div class="space-y-5">
          <article
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            class="premium-panel rounded-2xl p-6 md:p-8"
          >
            <h2 class="text-2xl font-black text-white">{{ rt(section.title) }}</h2>
            <div class="mt-4 space-y-3 text-base leading-8 text-neutral-400">
              <p v-for="paragraph in section.body" :key="rt(paragraph)">
                {{ rt(paragraph) }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { buildCanonicalUrl, normalizeSiteUrl } from "../utils/seo";

type LegalSection = {
  id: string;
  title: string | Record<string, unknown>;
  body: Array<string | Record<string, unknown>>;
};

const { t, tm, rt } = useI18n();
const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = normalizeSiteUrl(String(config.public.siteUrl || ""));
const canonicalUrl = computed(() => buildCanonicalUrl(siteUrl, route.path));
const sections = computed<LegalSection[]>(
  () => tm("legal.privacy.sections") as unknown as LegalSection[],
);

useSeoMeta({
  title: () => t("seo.privacyTitle"),
  description: () => t("seo.privacyDescription"),
  ogTitle: () => t("seo.privacyTitle"),
  ogDescription: () => t("seo.privacyDescription"),
  ogUrl: () => canonicalUrl.value,
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
}));
</script>

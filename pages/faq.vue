<template>
  <main class="bg-black text-white">
    <section class="relative isolate overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1517438476312-10d79c077509?q=70&w=1400&auto=format&fit=crop"
        alt=""
        width="1400"
        height="900"
        class="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
        fetchpriority="high"
        decoding="async"
      />
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/85 to-black" />

      <div class="container-premium section-premium">
        <div class="mx-auto max-w-4xl text-center reveal-faq">
          <p class="eyebrow">{{ t('pages.vikingSupport') }}</p>
          <h1 class="display-heading mt-5 text-7xl text-white md:text-8xl">FAQ</h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            {{ t('pages.faqLead') }}
          </p>
        </div>

        <div class="mx-auto mt-12 max-w-4xl">
          <label class="relative block">
            <span class="sr-only">{{ t('pages.searchQuestions') }}</span>
            <Icon name="i-heroicons-magnifying-glass" class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-neutral-500" />
            <input
              v-model="search"
              type="search"
              class="premium-input h-16 rounded-2xl pl-14 pr-12 text-base"
              :placeholder="t('pages.faqSearchPlaceholder')"
            />
            <button
              v-if="search"
              class="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
              :aria-label="t('shop.clearSearch')"
              @click="search = ''"
            >
              <Icon name="i-heroicons-x-mark" />
            </button>
          </label>
        </div>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="mb-8 flex gap-3 overflow-x-auto pb-2">
        <button
          v-for="category in categories"
          :key="category"
          class="min-h-12 shrink-0 rounded-full border px-5 text-sm font-black uppercase tracking-[0.12em] transition duration-200 hover:-translate-y-0.5"
          :class="activeCategory === category ? 'border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]' : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:border-[#FF4D00]/70 hover:text-white'"
          @click="selectCategory(category)"
        >
          {{ t(category) }}
        </button>
      </div>

      <div class="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <aside class="premium-panel h-fit rounded-2xl p-6 lg:sticky lg:top-28">
          <p class="eyebrow">{{ t('pages.supportTopics') }}</p>
          <h2 class="mt-3 text-3xl font-black text-white">{{ t(activeCategory) }}</h2>
          <p class="mt-4 leading-7 text-neutral-400">
            {{ t('pages.supportTopicsText') }}
          </p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div v-for="item in supportStats" :key="item.label" class="rounded-xl border border-white/10 bg-black/25 p-4">
              <p class="text-2xl font-black text-white">{{ item.value }}</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{{ t(item.labelKey) }}</p>
            </div>
          </div>
        </aside>

        <div>
          <div class="mb-5 flex items-center justify-between gap-4">
            <p class="text-sm font-bold text-neutral-400">
              {{ t('pages.showingAnswers', { count: filteredFaqs.length }) }}
            </p>
            <button v-if="search || activeCategory !== 'pages.all'" class="text-sm font-black text-[#FF4D00] transition hover:text-white" @click="resetFilters">
              {{ t('shop.reset') }}
            </button>
          </div>

          <div v-if="filteredFaqs.length" class="space-y-4">
            <article
              v-for="faq in filteredFaqs"
              :key="faq.question"
              class="rounded-2xl border bg-white/[0.03] transition duration-300 hover:-translate-y-0.5 hover:border-[#FF4D00]/60"
              :class="openQuestion === faq.questionKey ? 'border-[#FF4D00]/70' : 'border-white/10'"
            >
              <button class="flex min-h-20 w-full items-center justify-between gap-5 p-5 text-left md:p-6" @click="toggleQuestion(faq.questionKey)">
                <div>
                  <span class="text-xs font-black uppercase tracking-[0.16em] text-[#FF4D00]">{{ t(faq.categoryKey) }}</span>
                  <h3 class="mt-2 text-lg font-black text-white md:text-xl">{{ t(faq.questionKey) }}</h3>
                </div>
                <Icon name="i-heroicons-chevron-down" class="shrink-0 text-2xl text-[#FF4D00] transition duration-300" :class="{ 'rotate-180': openQuestion === faq.questionKey }" />
              </button>

              <Transition name="accordion">
                <div v-show="openQuestion === faq.questionKey" class="px-5 pb-6 leading-8 text-neutral-400 md:px-6">
                  {{ t(faq.answerKey) }}
                </div>
              </Transition>
            </article>
          </div>

          <div v-else class="premium-panel rounded-2xl p-10 text-center">
            <Icon name="i-heroicons-magnifying-glass" class="mx-auto text-5xl text-[#FF4D00]" />
            <h2 class="mt-5 text-3xl font-black text-white">{{ t('pages.noAnswersFound') }}</h2>
            <p class="mx-auto mt-3 max-w-md text-neutral-400">{{ t('pages.tryAnotherSearch') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="relative overflow-hidden rounded-2xl border border-[#FF4D00]/30 bg-[#120903] p-8 text-center md:p-12">
        <div class="mx-auto max-w-3xl">
          <p class="eyebrow">{{ t('pages.stillNeedHelp') }}</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">{{ t('pages.talkSupport') }}</h2>
          <p class="mt-5 leading-8 text-neutral-300">
            {{ t('pages.supportHelpText') }}
          </p>
          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <NuxtLink to="/contact" class="premium-button premium-button-primary">{{ t('pages.contactSupport') }}</NuxtLink>
            <a href="mailto:support@vikingstore.com" class="premium-button premium-button-secondary">{{ t('pages.emailUs') }}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="container-premium pb-28">
      <div class="premium-panel rounded-2xl p-7 md:p-10">
        <div class="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p class="eyebrow">{{ t('pages.newsletter') }}</p>
            <h2 class="display-heading mt-4 text-5xl text-white md:text-7xl">{{ t('pages.supportUpdates') }}</h2>
            <p class="mt-5 max-w-2xl leading-8 text-neutral-400">
              {{ t('pages.supportUpdatesText') }}
            </p>
          </div>

          <form class="grid gap-3 sm:grid-cols-[1fr_auto]" @submit.prevent>
            <label class="sr-only" for="faq-newsletter">{{ t('footer.emailAddress') }}</label>
            <input id="faq-newsletter" type="email" class="premium-input" :placeholder="t('footer.emailAddress')" autocomplete="email" />
            <button class="premium-button premium-button-primary" type="submit">{{ t('pages.joinNewsletter') }}</button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const search = ref("");
const activeCategory = ref("pages.all");
const openQuestion = ref("pages.faqShippingQ");
const { t } = useI18n();

useSeoMeta({
  title: () => t("seo.faqTitle"),
  description: () => t("seo.faqDescription"),
  ogTitle: () => t("seo.faqTitle"),
  ogDescription: () => t("seo.faqDescription"),
});

const faqs = [
  { categoryKey: "pages.ordersTopic", questionKey: "pages.faqTrackQ", answerKey: "pages.faqTrackA" },
  { categoryKey: "pages.ordersTopic", questionKey: "pages.faqChangeQ", answerKey: "pages.faqChangeA" },
  { categoryKey: "pages.shippingTopic", questionKey: "pages.faqShippingQ", answerKey: "pages.faqShippingA" },
  { categoryKey: "pages.paymentsTopic", questionKey: "pages.faqPaymentQ", answerKey: "pages.faqPaymentA" },
  { categoryKey: "pages.paymentsTopic", questionKey: "pages.faqSecureQ", answerKey: "pages.faqSecureA" },
  { categoryKey: "pages.returnsTopic", questionKey: "pages.faqReturnQ", answerKey: "pages.faqReturnA" },
  { categoryKey: "pages.returnsTopic", questionKey: "pages.faqDamagedQ", answerKey: "pages.faqDamagedA" },
  { categoryKey: "pages.productsTopic", questionKey: "pages.faqSizeQ", answerKey: "pages.faqSizeA" },
  { categoryKey: "pages.productsTopic", questionKey: "pages.faqBeginnerQ", answerKey: "pages.faqBeginnerA" },
  { categoryKey: "pages.accountTopic", questionKey: "pages.faqAccountQ", answerKey: "pages.faqAccountA" },
  { categoryKey: "pages.accountTopic", questionKey: "pages.faqPastOrdersQ", answerKey: "pages.faqPastOrdersA" },
];

const categories = computed(() => ["pages.all", ...new Set(faqs.map((faq) => faq.categoryKey))]);
const filteredFaqs = computed(() => {
  const query = search.value.trim().toLowerCase();

  return faqs.filter((faq) => {
    const matchesCategory = activeCategory.value === "pages.all" || faq.categoryKey === activeCategory.value;
    const matchesSearch =
      !query ||
      `${t(faq.questionKey)} ${t(faq.answerKey)} ${t(faq.categoryKey)}`.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
});
const supportStats = computed(() => [
  { labelKey: "pages.topics", value: categories.value.length - 1 },
  { labelKey: "pages.answers", value: filteredFaqs.value.length },
]);

watch(filteredFaqs, (items) => {
  openQuestion.value = items[0]?.questionKey || "";
});

const selectCategory = (category: string) => {
  activeCategory.value = category;
};

const toggleQuestion = (question: string) => {
  openQuestion.value = openQuestion.value === question ? "" : question;
};

const resetFilters = () => {
  search.value = "";
  activeCategory.value = "pages.all";
};
</script>

<style scoped>
.reveal-faq {
  animation: reveal-faq 650ms ease both;
}

.accordion-enter-active,
.accordion-leave-active {
  overflow: hidden;
  transition:
    opacity 180ms ease,
    transform 180ms ease,
    max-height 220ms ease;
  max-height: 14rem;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}

@keyframes reveal-faq {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

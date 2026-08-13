<template>
  <main class="bg-black text-white">
    <section class="relative isolate min-h-[86vh] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=70&w=1400&auto=format&fit=crop"
        alt="Combat sports athlete training under arena lights"
        width="1400"
        height="900"
        class="absolute inset-0 -z-20 h-full w-full object-cover"
        fetchpriority="high"
        decoding="async"
      />
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/70 to-black"
      />

      <div
        class="container-premium flex min-h-[86vh] items-end pb-16 pt-32 md:pb-24"
      >
        <div class="max-w-5xl reveal-brand">
          <p class="eyebrow">{{ t("pages.vikingCombatCompany") }}</p>
          <h1
            class="display-heading mt-5 text-7xl text-white sm:text-8xl lg:text-[9rem]"
          >
            {{ t("pages.builtFor") }}
            <span class="block text-[#FF4D00]">{{ t("pages.warriors") }}</span>
          </h1>
          <p
            class="mt-6 max-w-2xl text-base leading-8 text-neutral-300 md:text-xl"
          >
            {{ t("pages.aboutLead") }}
          </p>
          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <NuxtLink
              to="/shop"
              class="premium-button premium-button-primary"
              >{{ t("pages.exploreGear") }}</NuxtLink
            >
            <a href="#story" class="premium-button premium-button-secondary">{{
              t("pages.ourStory")
            }}</a>
          </div>
        </div>
      </div>
    </section>

    <section id="story" class="container-premium section-premium">
      <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <p class="eyebrow">{{ t("pages.ourStory") }}</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
            {{ t("pages.forged") }}
          </h2>
          <p class="mt-6 text-lg leading-8 text-neutral-400">
            {{ t("pages.storyLead") }}
          </p>
        </div>

        <div class="relative space-y-5">
          <div
            class="absolute left-5 top-0 hidden h-full w-px bg-white/10 sm:block"
          />
          <article
            v-for="item in timeline"
            :key="item.year"
            class="premium-panel relative rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/60"
          >
            <div class="flex gap-5">
              <div
                class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FF4D00]/40 bg-black text-sm font-black text-[#FF4D00] sm:flex"
              >
                {{ item.step }}
              </div>
              <div>
                <p
                  class="text-sm font-black uppercase tracking-[0.18em] text-[#FF4D00]"
                >
                  {{ t(item.yearKey) }}
                </p>
                <h3 class="mt-2 text-2xl font-black text-white">
                  {{ t(item.titleKey) }}
                </h3>
                <p class="mt-3 leading-7 text-neutral-400">
                  {{ t(item.textKey) }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="grid gap-6 md:grid-cols-2">
        <article
          v-for="item in missionVision"
          :key="item.title"
          class="premium-panel rounded-2xl p-7 md:p-9"
        >
          <Icon :name="item.icon" class="text-4xl text-[#FF4D00]" />
          <p class="eyebrow mt-7">{{ t(item.labelKey) }}</p>
          <h2 class="mt-3 text-3xl font-black text-white">
            {{ t(item.titleKey) }}
          </h2>
          <p class="mt-4 leading-8 text-neutral-400">{{ t(item.textKey) }}</p>
        </article>
      </div>
    </section>

    <section class="border-y border-white/10 bg-white/[0.02] py-20">
      <div class="container-premium">
        <div class="mb-10 max-w-3xl">
          <p class="eyebrow">{{ t("pages.whyChoose") }}</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
            {{ t("pages.gearTrust") }}
          </h2>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="premium-panel group rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF4D00]/30 bg-[#FF4D00]/10 text-[#FF4D00] transition group-hover:scale-105"
            >
              <Icon :name="feature.icon" class="text-2xl" />
            </div>
            <h3 class="mt-6 text-2xl font-black text-white">
              {{ t(feature.titleKey) }}
            </h3>
            <p class="mt-3 leading-7 text-neutral-400">
              {{ t(feature.textKey) }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section ref="statsSection" class="container-premium py-20">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 text-center"
        >
          <p class="display-heading text-6xl text-white">
            {{ stat.current }}{{ stat.suffix }}
          </p>
          <p
            class="mt-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-500"
          >
            {{ t(stat.labelKey) }}
          </p>
        </article>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div
        class="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p class="eyebrow">{{ t("pages.team") }}</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
            {{ t("pages.cornerCrew") }}
          </h2>
        </div>
        <p class="max-w-xl leading-7 text-neutral-400">
          {{ t("pages.teamLead") }}
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <article
          v-for="member in team"
          :key="member.name"
          class="group overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-neutral-950">
            <img
              :src="member.image"
              :alt="member.alt"
              width="640"
              height="800"
              class="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"
            />
          </div>
          <div class="p-6">
            <p
              class="text-sm font-black uppercase tracking-[0.18em] text-[#FF4D00]"
            >
              {{ t(member.roleKey) }}
            </p>
            <h3 class="mt-2 text-2xl font-black text-white">
              {{ member.name }}
            </h3>
            <p class="mt-3 leading-7 text-neutral-400">
              {{ t(member.textKey) }}
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
      >
        <div class="mb-8">
          <p class="eyebrow">{{ t("pages.partners") }}</p>
          <h2 class="mt-3 text-3xl font-black text-white">
            {{ t("pages.trainingEcosystem") }}
          </h2>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="partner in partners"
            :key="partner"
            class="flex min-h-24 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-4 text-center text-sm font-black uppercase tracking-[0.18em] text-neutral-300 transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/60 hover:text-white"
          >
            {{ partner }}
          </div>
        </div>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="mb-10">
        <p class="eyebrow">{{ t("pages.testimonials") }}</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
          {{ t("pages.testedTraining") }}
        </h2>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <article
          v-for="quote in testimonials"
          :key="quote.name"
          class="premium-panel rounded-2xl p-7"
        >
          <div class="flex text-[#FF4D00]" :aria-label="t('shop.ratedFive')">
            <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" />
          </div>
          <p class="mt-6 leading-8 text-neutral-300">
            "{{ t(quote.textKey) }}"
          </p>
          <div class="mt-7 border-t border-white/10 pt-5">
            <h3 class="font-black text-white">{{ quote.name }}</h3>
            <p class="mt-1 text-sm text-neutral-500">{{ quote.role }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div
        class="relative overflow-hidden rounded-2xl border border-[#FF4D00]/30 bg-[#120903] p-8 md:p-12"
      >
        <img
          src="https://images.unsplash.com/photo-1517438476312-10d79c077509?q=60&w=900&auto=format&fit=crop"
          alt=""
          width="900"
          height="600"
          class="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="lazy"
          decoding="async"
        />
        <div class="relative max-w-3xl">
          <p class="eyebrow">{{ t("pages.joinClan") }}</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-8xl">
            {{ t("pages.becomeWarrior") }}
          </h2>
          <p class="mt-5 text-lg leading-8 text-neutral-300">
            {{ t("pages.becomeText") }}
          </p>
          <NuxtLink
            to="/shop"
            class="premium-button premium-button-primary mt-8"
            >{{ t("pages.shopVikingGear") }}</NuxtLink
          >
        </div>
      </div>
    </section>

    <section
      class="container-premium grid gap-8 pb-24 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div>
        <p class="eyebrow">{{ t("pages.faqPreview") }}</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
          {{ t("pages.quickAnswers") }}
        </h2>
        <NuxtLink
          to="/faq"
          class="premium-button premium-button-secondary mt-8"
          >{{ t("pages.viewFullFaq") }}</NuxtLink
        >
      </div>

      <div class="space-y-4">
        <details
          v-for="item in faqs"
          :key="item.question"
          class="group rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-white"
          >
            {{ t(item.questionKey) }}
            <Icon
              name="i-heroicons-chevron-down"
              class="shrink-0 text-[#FF4D00] transition group-open:rotate-180"
            />
          </summary>
          <p class="mt-4 leading-7 text-neutral-400">{{ t(item.answerKey) }}</p>
        </details>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const statsSection = ref<HTMLElement | null>(null);
const { t } = useI18n();
let observer: IntersectionObserver | null = null;

const timeline = [
  {
    step: "01",
    yearKey: "aboutData.origin",
    titleKey: "aboutData.bornTitle",
    textKey: "aboutData.bornText",
  },
  {
    step: "02",
    yearKey: "aboutData.philosophy",
    titleKey: "aboutData.disciplineTitle",
    textKey: "aboutData.disciplineText",
  },
  {
    step: "03",
    yearKey: "aboutData.today",
    titleKey: "aboutData.standardsTitle",
    textKey: "aboutData.standardsText",
  },
];

const missionVision = [
  {
    icon: "i-heroicons-flag",
    labelKey: "aboutData.mission",
    titleKey: "aboutData.missionTitle",
    textKey: "aboutData.missionText",
  },
  {
    icon: "i-heroicons-eye",
    labelKey: "aboutData.vision",
    titleKey: "aboutData.visionTitle",
    textKey: "aboutData.visionText",
  },
];

const features = [
  {
    icon: "i-heroicons-shield-check",
    titleKey: "shop.premiumQuality",
    textKey: "aboutData.qualityText",
  },
  {
    icon: "i-heroicons-truck",
    titleKey: "shop.fastShipping",
    textKey: "aboutData.fastShippingText",
  },
  {
    icon: "i-heroicons-lock-closed",
    titleKey: "shop.securePayment",
    textKey: "aboutData.securePaymentText",
  },
  {
    icon: "i-heroicons-bolt",
    titleKey: "home.stats",
    textKey: "aboutData.builtFightersText",
  },
  {
    icon: "i-heroicons-chat-bubble-left-right",
    titleKey: "aboutData.lifetimeSupport",
    textKey: "aboutData.lifetimeSupportText",
  },
  {
    icon: "i-heroicons-trophy",
    titleKey: "aboutData.trustedAthletes",
    textKey: "aboutData.trustedAthletesText",
  },
];

const stats = ref([
  { labelKey: "pages.productsStat", target: 120, current: "0", suffix: "+" },
  { labelKey: "pages.happyCustomers", target: 8400, current: "0", suffix: "+" },
  { labelKey: "pages.countries", target: 18, current: "0", suffix: "+" },
  { labelKey: "orders.orders", target: 12500, current: "0", suffix: "+" },
]);

const team = [
  {
    name: "Shams Elhawary",
    roleKey: "aboutData.founder",
    textKey: "aboutData.founderText",
    image: "https://i.postimg.cc/g08BZjbt/IMG-20250701-WA0090.jpg",
    alt: "Founder standing in a combat gym",
  },
  {
    name: "Mostafa Mohamed",
    roleKey: "aboutData.gearLead",
    textKey: "aboutData.gearLeadText",
    image: "https://i.postimg.cc/ydxqS9sS/mostafa.jpg",
    alt: "Gear lead preparing training equipment",
  },
  {
    name: "Shahd Ahmed",
    roleKey: "aboutData.athleteSupport",
    textKey: "aboutData.athleteSupportText",
    image: "https://i.postimg.cc/wjfq76dR/shahd.png",
    alt: "Athlete support specialist in a gym",
  },
];

const partners = [
  "Venum",
  "Everlast",
  "WOLON",
  "RDX",
  "Top Ten",
  " Combat Sports",
];

const testimonials = [
  {
    name: "Karim ABO ZAID",
    role: "Boxing Coach",
    textKey: "aboutData.testimonialOne",
  },
  {
    name: "ABD ELGLEL",
    role: "Kickboxing Coach",
    textKey: "aboutData.testimonialTwo",
  },
  {
    name: "Youssef H.",
    role: "MMA Coach",
    textKey: "aboutData.testimonialThree",
  },
];

const faqs = [
  { questionKey: "pages.faqSizeQ", answerKey: "pages.faqSizeA" },
  { questionKey: "pages.faqBeginnerQ", answerKey: "pages.faqBeginnerA" },
  { questionKey: "pages.faqReturnQ", answerKey: "pages.faqReturnA" },
];

const animateStats = () => {
  const duration = 1200;
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    stats.value = stats.value.map((stat) => ({
      ...stat,
      current: Math.round(stat.target * eased).toLocaleString(),
    }));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

onMounted(() => {
  if (!statsSection.value) return;

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      animateStats();
      observer?.disconnect();
    },
    { threshold: 0.35 },
  );

  observer.observe(statsSection.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.reveal-brand {
  animation: reveal-brand 700ms ease both;
}

@keyframes reveal-brand {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

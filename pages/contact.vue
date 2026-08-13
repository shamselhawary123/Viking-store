<template>
  <main class="bg-black text-white">
    <section class="relative isolate overflow-hidden">
      <img
        src="../logo.png"
        alt=""
        width="512"
        height="512"
        class="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
        loading="lazy"
        decoding="async"
      />
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/85 to-black"
      />

      <div class="container-premium section-premium">
        <div class="mx-auto max-w-4xl text-center reveal-contact">
          <p class="eyebrow">{{ t("pages.vikingSupport") }}</p>
          <h1 class="display-heading mt-5 text-7xl text-white md:text-8xl">
            {{ t("pages.getInTouch") }}
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            {{ t("pages.contactLead") }}
          </p>
        </div>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="item in contactCards"
          :key="item.title"
          class="premium-panel group rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF4D00]/30 bg-[#FF4D00]/10 text-[#FF4D00] transition group-hover:scale-105"
          >
            <Icon :name="item.icon" class="text-2xl" />
          </div>
          <h2 class="mt-5 text-xl font-black text-white">
            {{ t(item.titleKey) }}
          </h2>
          <p class="mt-2 leading-7 text-neutral-400">
            {{ item.textKey ? t(item.textKey) : item.text }}
          </p>
          <a
            v-if="item.href"
            :href="item.href"
            class="mt-4 inline-flex text-sm font-black text-[#FF4D00] transition hover:text-white"
          >
            {{ item.actionKey ? t(item.actionKey) : item.action }}
          </a>
        </article>
      </div>
    </section>

    <section
      class="container-premium grid gap-8 pb-24 lg:grid-cols-[1.05fr_0.95fr]"
    >
      <form
        class="premium-panel rounded-2xl p-6 md:p-8"
        novalidate
        @submit.prevent="handleSubmit"
      >
        <div class="mb-8">
          <p class="eyebrow">{{ t("pages.contactForm") }}</p>
          <h2 class="mt-3 text-3xl font-black text-white">
            {{ t("pages.sendMessage") }}
          </h2>
          <p class="mt-3 leading-7 text-neutral-400">
            {{ t("pages.contactFormNote") }}
          </p>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <label class="floating-field">
            <input
              v-model.trim="form.name"
              class="floating-input"
              :class="{ 'field-error': submitted && !form.name }"
              autocomplete="name"
              placeholder=" "
            />
            <span>{{ t("common.name") }}</span>
          </label>
          <label class="floating-field">
            <input
              v-model.trim="form.email"
              type="email"
              class="floating-input"
              :class="{ 'field-error': submitted && !isValidEmail }"
              autocomplete="email"
              placeholder=" "
            />
            <span>{{ t("common.email") }}</span>
          </label>
        </div>

        <label class="floating-field mt-5">
          <input
            v-model.trim="form.subject"
            class="floating-input"
            :class="{ 'field-error': submitted && !form.subject }"
            placeholder=" "
          />
          <span>{{ t("pages.subject") }}</span>
        </label>

        <label class="floating-field mt-5">
          <textarea
            v-model.trim="form.message"
            rows="6"
            class="floating-input h-auto min-h-40 py-5"
            :class="{ 'field-error': submitted && !form.message }"
            placeholder=" "
          />
          <span>{{ t("pages.message") }}</span>
        </label>

        <p
          v-if="submitted && !isFormValid"
          class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-300"
        >
          {{ t("pages.completeFields") }}
        </p>
        <p
          v-else-if="submitted && isFormValid"
          class="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-300"
        >
          {{ t("pages.messageReady") }}
        </p>

        <button
          class="premium-button premium-button-primary mt-6 w-full"
          type="submit"
        >
          {{ t("pages.sendMessage") }}
          <Icon name="i-heroicons-paper-airplane" />
        </button>
      </form>

      <div class="space-y-6">
        <div
          class="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f]"
        >
          <div class="p-6">
            <p class="eyebrow">{{ t("pages.findUs") }}</p>
            <h2 class="mt-3 text-3xl font-black text-white">
              {{ t("pages.vikingHq") }}
            </h2>
            <p class="mt-3 leading-7 text-neutral-400">
              {{ t("pages.hqText") }}
            </p>
          </div>
          <iframe
            title="Viking Store map"
            src="https://www.google.com/maps?q=Cairo%20Egypt&output=embed"
            class="h-80 w-full border-0 grayscale invert"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <a
            v-for="social in socials"
            :key="social.name"
            :href="social.href"
            class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/60"
          >
            <Icon :name="social.icon" class="text-2xl text-[#FF4D00]" />
            <p class="mt-4 font-black text-white">{{ social.name }}</p>
          </a>
        </div>
      </div>
    </section>

    <section
      class="container-premium grid gap-8 pb-24 lg:grid-cols-[0.8fr_1.2fr]"
    >
      <div>
        <p class="eyebrow">{{ t("pages.faqPreview") }}</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
          {{ t("pages.quickAnswers") }}
        </h2>
        <NuxtLink
          to="/faq"
          class="premium-button premium-button-secondary mt-8"
          >{{ t("pages.viewFaq") }}</NuxtLink
        >
      </div>

      <div class="space-y-4">
        <article
          v-for="faq in faqs"
          :key="faq.question"
          class="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <h3 class="text-lg font-black text-white">
            {{ t(faq.questionKey) }}
          </h3>
          <p class="mt-3 leading-7 text-neutral-400">{{ t(faq.answerKey) }}</p>
        </article>
      </div>
    </section>

    <section class="container-premium pb-28">
      <div
        class="relative overflow-hidden rounded-2xl border border-[#FF4D00]/30 bg-[#120903] p-8 text-center md:p-12"
      >
        <div class="mx-auto max-w-3xl">
          <p class="eyebrow">{{ t("pages.needHelp") }}</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
            {{ t("pages.contactSupportTeam") }}
          </h2>
          <p class="mt-5 leading-8 text-neutral-300">
            {{ t("pages.supportHelpText") }}
          </p>
          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="mailto:support@vikingstore.com"
              class="premium-button premium-button-primary"
              >{{ t("pages.emailUs") }}</a
            >
            <NuxtLink
              to="/shop"
              class="premium-button premium-button-secondary"
              >{{ t("home.shopNow") }}</NuxtLink
            >
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

const submitted = ref(false);
const { t } = useI18n();
const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const contactCards = [
  {
    icon: "i-heroicons-envelope",
    titleKey: "common.email",
    text: "shamselhawary123@gmail.com",
    href: "mailto:shamselhawary123@gmail.com",
    actionKey: "pages.sendEmail",
  },
  {
    icon: "i-heroicons-phone",
    titleKey: "common.phone",
    text: "01123997154",
    href: "tel:+201123997154",
    actionKey: "pages.callNow",
  },
  {
    icon: "i-heroicons-map-pin",
    titleKey: "common.address",
    textKey: "footer.addressValue",
    href: "https://www.google.com/maps?q=Cairo%20Egypt",
    actionKey: "pages.openMap",
  },
  {
    icon: "i-heroicons-clock",
    titleKey: "footer.workingHours",
    textKey: "footer.workingHoursValue",
  },
];

const socials = [
  {
    name: "Facebook",
    icon: "i-heroicons-hand-thumb-up",
    href: "https://www.facebook.com/profile.php?id=100025354200512",
  },
  {
    name: "Instagram",
    icon: "i-heroicons-camera",
    href: "https://www.instagram.com/shams_elhawary123/",
  },
  {
    name: "TikTok",
    icon: "i-heroicons-musical-note",
    href: "https://www.tiktok.com/@the_vikings22?is_from_webapp=1&sender_device=pc",
  },
  {
    name: "YouTube",
    icon: "i-heroicons-play",
    href: "https://www.youtube.com",
  },
];

const faqs = [
  {
    questionKey: "pages.supportReplyQ",
    answerKey: "pages.supportReplyA",
  },
  {
    questionKey: "pages.sizeHelpQ",
    answerKey: "pages.sizeHelpA",
  },
  {
    questionKey: "pages.trackOrderQ",
    answerKey: "pages.trackOrderA",
  },
];

const isValidEmail = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
);
const isFormValid = computed(() =>
  Boolean(form.name && isValidEmail.value && form.subject && form.message),
);

const handleSubmit = () => {
  submitted.value = true;
};
</script>

<style scoped>
.reveal-contact {
  animation: reveal-contact 650ms ease both;
}

.floating-field {
  position: relative;
  display: block;
}

.floating-input {
  min-height: 3.75rem;
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.42);
  padding: 1.35rem 1rem 0.55rem;
  color: #ffffff;
  outline: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.floating-input:focus {
  border-color: #ff4d00;
  box-shadow: 0 0 0 4px rgba(255, 77, 0, 0.12);
}

.field-error {
  border-color: rgba(248, 113, 113, 0.72);
}

.floating-field span {
  pointer-events: none;
  position: absolute;
  left: 1rem;
  top: 1.15rem;
  color: #a3a3a3;
  font-size: 0.875rem;
  font-weight: 800;
  transition:
    color 180ms ease,
    transform 180ms ease,
    font-size 180ms ease;
}

.floating-input:focus + span,
.floating-input:not(:placeholder-shown) + span {
  color: #ff4d00;
  font-size: 0.7rem;
  transform: translateY(-0.68rem);
}

@keyframes reveal-contact {
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

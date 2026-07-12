<template>
  <main class="bg-black text-white">
    <section class="relative isolate overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=1800&auto=format&fit=crop"
        alt=""
        class="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
      />
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/85 to-black" />

      <div class="container-premium section-premium">
        <div class="mx-auto max-w-4xl text-center reveal-faq">
          <p class="eyebrow">Viking Support</p>
          <h1 class="display-heading mt-5 text-7xl text-white md:text-8xl">FAQ</h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            Fast answers for orders, shipping, payments, returns, products, and account support.
          </p>
        </div>

        <div class="mx-auto mt-12 max-w-4xl">
          <label class="relative block">
            <span class="sr-only">Search questions</span>
            <Icon name="i-heroicons-magnifying-glass" class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-neutral-500" />
            <input
              v-model="search"
              type="search"
              class="premium-input h-16 rounded-2xl pl-14 pr-12 text-base"
              placeholder="Search orders, shipping, returns..."
            />
            <button
              v-if="search"
              class="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Clear search"
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
          {{ category }}
        </button>
      </div>

      <div class="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <aside class="premium-panel h-fit rounded-2xl p-6 lg:sticky lg:top-28">
          <p class="eyebrow">Support Topics</p>
          <h2 class="mt-3 text-3xl font-black text-white">{{ activeCategory }}</h2>
          <p class="mt-4 leading-7 text-neutral-400">
            Browse focused answers or search across every Viking Store support topic instantly.
          </p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div v-for="item in supportStats" :key="item.label" class="rounded-xl border border-white/10 bg-black/25 p-4">
              <p class="text-2xl font-black text-white">{{ item.value }}</p>
              <p class="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{{ item.label }}</p>
            </div>
          </div>
        </aside>

        <div>
          <div class="mb-5 flex items-center justify-between gap-4">
            <p class="text-sm font-bold text-neutral-400">
              Showing <span class="text-white">{{ filteredFaqs.length }}</span> answers
            </p>
            <button v-if="search || activeCategory !== 'All'" class="text-sm font-black text-[#FF4D00] transition hover:text-white" @click="resetFilters">
              Reset
            </button>
          </div>

          <div v-if="filteredFaqs.length" class="space-y-4">
            <article
              v-for="faq in filteredFaqs"
              :key="faq.question"
              class="rounded-2xl border bg-white/[0.03] transition duration-300 hover:-translate-y-0.5 hover:border-[#FF4D00]/60"
              :class="openQuestion === faq.question ? 'border-[#FF4D00]/70' : 'border-white/10'"
            >
              <button class="flex min-h-20 w-full items-center justify-between gap-5 p-5 text-left md:p-6" @click="toggleQuestion(faq.question)">
                <div>
                  <span class="text-xs font-black uppercase tracking-[0.16em] text-[#FF4D00]">{{ faq.category }}</span>
                  <h3 class="mt-2 text-lg font-black text-white md:text-xl">{{ faq.question }}</h3>
                </div>
                <Icon name="i-heroicons-chevron-down" class="shrink-0 text-2xl text-[#FF4D00] transition duration-300" :class="{ 'rotate-180': openQuestion === faq.question }" />
              </button>

              <Transition name="accordion">
                <div v-show="openQuestion === faq.question" class="px-5 pb-6 leading-8 text-neutral-400 md:px-6">
                  {{ faq.answer }}
                </div>
              </Transition>
            </article>
          </div>

          <div v-else class="premium-panel rounded-2xl p-10 text-center">
            <Icon name="i-heroicons-magnifying-glass" class="mx-auto text-5xl text-[#FF4D00]" />
            <h2 class="mt-5 text-3xl font-black text-white">No Answers Found</h2>
            <p class="mx-auto mt-3 max-w-md text-neutral-400">Try another category or search term.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="relative overflow-hidden rounded-2xl border border-[#FF4D00]/30 bg-[#120903] p-8 text-center md:p-12">
        <div class="mx-auto max-w-3xl">
          <p class="eyebrow">Still Need Help?</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">TALK TO VIKING SUPPORT</h2>
          <p class="mt-5 leading-8 text-neutral-300">
            Contact support for sizing, orders, product recommendations, or delivery questions.
          </p>
          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <NuxtLink to="/contact" class="premium-button premium-button-primary">Contact Support</NuxtLink>
            <a href="mailto:support@vikingstore.com" class="premium-button premium-button-secondary">Email Us</a>
          </div>
        </div>
      </div>
    </section>

    <section class="container-premium pb-28">
      <div class="premium-panel rounded-2xl p-7 md:p-10">
        <div class="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p class="eyebrow">Newsletter</p>
            <h2 class="display-heading mt-4 text-5xl text-white md:text-7xl">GET SUPPORT UPDATES</h2>
            <p class="mt-5 max-w-2xl leading-8 text-neutral-400">
              Receive gear guides, shipping updates, and Viking Store announcements.
            </p>
          </div>

          <form class="grid gap-3 sm:grid-cols-[1fr_auto]" @submit.prevent>
            <label class="sr-only" for="faq-newsletter">Email address</label>
            <input id="faq-newsletter" type="email" class="premium-input" placeholder="Email address" autocomplete="email" />
            <button class="premium-button premium-button-primary" type="submit">Join Newsletter</button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const search = ref("");
const activeCategory = ref("All");
const openQuestion = ref("How long does shipping take?");

const faqs = [
  { category: "Orders", question: "How can I track my order?", answer: "You can track order status from your profile orders page after placing an order." },
  { category: "Orders", question: "Can I change my order after checkout?", answer: "Contact support as soon as possible. Changes depend on whether the order has already been prepared for shipping." },
  { category: "Shipping", question: "How long does shipping take?", answer: "Shipping usually takes between 2-5 business days depending on your city and courier availability." },
  { category: "Shipping", question: "Do you ship internationally?", answer: "International shipping can be arranged depending on destination, product size, and courier restrictions." },
  { category: "Payments", question: "Which payment methods are supported?", answer: "Cash on delivery is currently supported. Online payment can be added when payment provider integration is enabled." },
  { category: "Payments", question: "Is checkout secure?", answer: "The checkout experience is designed around a protected order flow and clear confirmation details." },
  { category: "Returns", question: "Can I return a product?", answer: "Yes. Returns are accepted within 14 days when the product is unused, clean, and returned with original packaging." },
  { category: "Returns", question: "What if my item arrives damaged?", answer: "Contact support with your order details and product photos so the team can review the issue quickly." },
  { category: "Products", question: "How do I choose the right size?", answer: "Use the product page size options and contact support if you need help matching gear to your training style." },
  { category: "Products", question: "Are products built for beginners?", answer: "Yes. Viking Store carries gear suitable for beginners, regular gym training, and experienced fighters." },
  { category: "Account", question: "Do I need an account to order?", answer: "You can browse freely, and account features help you view profile details and order history." },
  { category: "Account", question: "Where can I see past orders?", answer: "Past orders are available from your profile orders page after checkout." },
];

const categories = computed(() => ["All", ...new Set(faqs.map((faq) => faq.category))]);
const filteredFaqs = computed(() => {
  const query = search.value.trim().toLowerCase();

  return faqs.filter((faq) => {
    const matchesCategory = activeCategory.value === "All" || faq.category === activeCategory.value;
    const matchesSearch = !query || `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
});
const supportStats = computed(() => [
  { label: "Topics", value: categories.value.length - 1 },
  { label: "Answers", value: filteredFaqs.value.length },
]);

watch(filteredFaqs, (items) => {
  openQuestion.value = items[0]?.question || "";
});

const selectCategory = (category: string) => {
  activeCategory.value = category;
};

const toggleQuestion = (question: string) => {
  openQuestion.value = openQuestion.value === question ? "" : question;
};

const resetFilters = () => {
  search.value = "";
  activeCategory.value = "All";
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

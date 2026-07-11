<template>
  <section class="container-premium section-premium">
    <div class="mx-auto max-w-3xl text-center">
      <p class="eyebrow">Support</p>
      <h1 class="display-heading mt-5 text-7xl text-white md:text-8xl">FAQ</h1>
      <p class="mt-6 text-lg leading-8 text-neutral-400">
        Fast answers for shipping, returns, payments, and order tracking.
      </p>
    </div>

    <div class="mx-auto mt-14 max-w-4xl space-y-4">
      <article v-for="faq in faqs" :key="faq.question" class="premium-panel rounded-2xl">
        <button class="flex w-full items-center justify-between gap-5 p-6 text-left" @click="faq.open = !faq.open">
          <h2 class="text-lg font-black text-white md:text-xl">{{ faq.question }}</h2>
          <Icon name="i-heroicons-chevron-down" class="shrink-0 text-[#FF4D00] transition" :class="{ 'rotate-180': faq.open }" />
        </button>

        <Transition
          enter-active-class="transition duration-300"
          leave-active-class="transition duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-show="faq.open" class="px-6 pb-6 leading-8 text-neutral-400">
            {{ faq.answer }}
          </div>
        </Transition>
      </article>
    </div>

    <div class="mx-auto mt-12 max-w-4xl rounded-2xl border border-[#FF4D00]/30 bg-[#FF4D00]/10 p-6 text-center">
      <h2 class="text-2xl font-black">Need more help?</h2>
      <p class="mt-2 text-neutral-300">Contact support and we will help with sizing, orders, or product recommendations.</p>
      <NuxtLink to="/contact" class="premium-button premium-button-primary mt-6">Contact Support</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const faqs = reactive([
  {
    question: "How long does shipping take?",
    answer: "Shipping usually takes between 2-5 business days depending on your city and courier availability.",
    open: true,
  },
  {
    question: "Can I return a product?",
    answer: "Yes. Returns are accepted within 14 days when the product is unused, clean, and returned with original packaging.",
    open: false,
  },
  {
    question: "Which payment methods are supported?",
    answer: "Cash on delivery is currently supported. Online payment can be added when payment provider integration is enabled.",
    open: false,
  },
  {
    question: "Do you ship internationally?",
    answer: "International shipping can be arranged depending on destination, product size, and courier restrictions.",
    open: false,
  },
  {
    question: "How can I track my order?",
    answer: "You can track order status from your profile orders page after placing an order.",
    open: false,
  },
]);
</script>

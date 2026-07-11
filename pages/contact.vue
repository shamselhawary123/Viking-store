<template>
  <section class="container-premium section-premium">
    <div class="mx-auto max-w-3xl text-center">
      <p class="eyebrow">Contact</p>
      <h1 class="display-heading mt-5 text-7xl text-white md:text-8xl">GET IN TOUCH</h1>
      <p class="mt-6 text-lg leading-8 text-neutral-400">
        Questions about sizing, orders, or product recommendations? Send a message and the Viking Store team will help.
      </p>
    </div>

    <div class="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div class="space-y-4">
        <div v-for="item in contactCards" :key="item.title" class="premium-panel rounded-2xl p-6">
          <Icon :name="item.icon" class="text-3xl text-[#FF4D00]" />
          <h2 class="mt-4 text-xl font-black">{{ item.title }}</h2>
          <p class="mt-2 text-neutral-400">{{ item.text }}</p>
        </div>
      </div>

      <form class="premium-panel rounded-2xl p-6 md:p-8" @submit.prevent>
        <div class="grid gap-5">
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            Name
            <input class="premium-input" autocomplete="name" />
          </label>
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            Email
            <input type="email" class="premium-input" autocomplete="email" />
          </label>
          <label class="grid gap-2 text-sm font-bold text-neutral-300">
            Message
            <textarea rows="6" class="premium-input h-auto py-4" />
          </label>
          <button class="premium-button premium-button-primary" type="submit">Send Message</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
const contactCards = [
  { icon: "i-heroicons-chat-bubble-left-right", title: "Support", text: "Product and order help for active customers." },
  { icon: "i-heroicons-truck", title: "Shipping", text: "Delivery questions, status updates, and checkout support." },
  { icon: "i-heroicons-building-storefront", title: "Partnerships", text: "Team, gym, and athlete collaboration requests." },
];
</script>

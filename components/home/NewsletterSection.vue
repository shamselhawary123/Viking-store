<template>
  <section class="section-premium bg-[#080808]">
    <div class="container-premium">
      <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-black px-6 py-14 text-center shadow-[0_26px_90px_rgba(0,0,0,0.38)] md:px-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,77,0,0.18),transparent_28rem)]" />
        <div class="relative mx-auto max-w-5xl">
      <p class="eyebrow">Newsletter</p>

      <h2 class="display-heading mt-6 text-6xl text-white md:text-7xl">
        JOIN THE FIGHT CLUB
      </h2>

      <p class="mx-auto mt-8 max-w-2xl leading-8 text-gray-400">
        Get early access to drops, fight-week offers, and training gear releases.
      </p>

      <form class="mx-auto mt-12 flex max-w-2xl flex-col gap-4 md:flex-row" @submit.prevent>
        <label class="sr-only" for="newsletter-email">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Your Email"
          class="premium-input flex-1"
        />

        <button class="premium-button premium-button-primary" type="submit">
          Subscribe
        </button>
      </form>
        </div>
      </div>
    </div>
  </section>
</template>

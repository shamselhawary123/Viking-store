<template>
  <section class="bg-black py-24">
    <div class="container-premium">
      <div
        class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] px-6 py-20 text-center shadow-[0_30px_110px_rgba(0,0,0,0.5)] md:px-10"
      >
        <img src="/train-hard.png" alt="" class="absolute inset-y-0 left-1/2 h-full w-full -translate-x-1/2 object-contain opacity-20" loading="lazy" />
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,77,0,0.22),transparent_30rem)]" />
        <div class="absolute inset-0 bg-black/55" />
        <div class="relative">
      <p class="eyebrow">Ready to fight?</p>

      <h2 class="display-heading mx-auto mt-8 max-w-4xl text-6xl text-white md:text-8xl">
        BUILD YOUR FIGHT NIGHT KIT
      </h2>

      <p class="mx-auto mt-8 max-w-2xl leading-8 text-gray-400">
        Discover premium combat equipment trusted for daily rounds, hard sparring, and confident performance.
      </p>

      <NuxtLink
        to="/shop"
        class="premium-button premium-button-primary mt-12 min-h-14 px-8"
      >
        Shop Now
        <Icon name="i-heroicons-arrow-right" />
      </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<template>
  <section class="bg-black text-white">
    <div class="container-premium section-premium">
      <div class="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p class="eyebrow">Our Story</p>
          <h1 class="display-heading mt-5 text-7xl md:text-8xl">
            BUILT FOR
            <span class="block text-[#FF4D00]">WARRIORS</span>
          </h1>
          <p class="mt-8 max-w-2xl text-lg leading-8 text-neutral-400">
            Viking Store was created for athletes who demand quality, durability, and performance from every piece of training gear.
          </p>
        </div>

        <div class="relative overflow-hidden rounded-2xl border border-white/10">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop"
            alt="Athlete training with combat sports equipment"
            class="h-[32rem] w-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      </div>
    </div>

    <div class="container-premium pb-24">
      <div class="grid gap-6 md:grid-cols-3">
        <article v-for="item in values" :key="item.title" class="premium-panel rounded-2xl p-7">
          <Icon :name="item.icon" class="text-4xl text-[#FF4D00]" />
          <h2 class="mt-6 text-2xl font-black">{{ item.title }}</h2>
          <p class="mt-4 leading-7 text-neutral-400">{{ item.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const values = [
  {
    icon: "i-heroicons-bolt",
    title: "Performance First",
    text: "Every product should help fighters train harder, move cleaner, and trust their equipment.",
  },
  {
    icon: "i-heroicons-shield-check",
    title: "Premium Standards",
    text: "We focus on material quality, secure fit, strong construction, and a confident buying experience.",
  },
  {
    icon: "i-heroicons-fire",
    title: "Combat Culture",
    text: "Boxing, kickboxing, Muay Thai, and MMA shape the identity of everything we design and curate.",
  },
];
</script>

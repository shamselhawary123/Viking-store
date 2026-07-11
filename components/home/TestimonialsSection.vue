<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <p class="eyebrow">Testimonials</p>

        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
          WHAT FIGHTERS SAY
        </h2>
        <p class="mt-5 leading-8 text-neutral-400">
          Feedback from athletes and coaches who put their gear through real training volume.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="item in testimonials"
          :key="item.name"
          class="premium-panel group rounded-2xl p-7 transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60"
        >
          <div class="mb-6 flex items-center justify-between">
            <div class="flex text-[#FF4D00]">
            <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" />
            </div>
            <span class="font-display text-5xl leading-none text-white/10 transition group-hover:text-[#FF4D00]/25">"</span>
          </div>
          <p class="min-h-24 leading-8 text-neutral-300">"{{ item.review }}"</p>

          <div class="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4D00] font-black text-white">
              {{ item.name.slice(0, 1) }}
            </div>
            <div>
            <h3 class="font-black text-white">
              {{ item.name }}
            </h3>

            <p class="text-sm text-[#FF4D00]">
              {{ item.role }}
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const testimonials = [
  {
    name: "Ahmed Ali",
    role: "Kickboxing Athlete",
    review: "The quality surprised me. Definitely my favorite gear.",
  },
  {
    name: "Mohamed Hassan",
    role: "Boxing Coach",
    review: "Professional products and very fast shipping.",
  },
  {
    name: "Omar Khaled",
    role: "MMA Fighter",
    review: "I use Viking equipment every single week.",
  },
];
</script>

<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <p class="eyebrow">Why Viking</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">BUILT FOR WARRIORS</h2>
        <p class="mt-5 leading-8 text-neutral-400">
          Premium gear, clean checkout, and support built around athletes who care about every round.
        </p>
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <article
          v-for="item in features"
          :key="item.title"
          class="premium-panel group rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60 hover:shadow-[0_30px_90px_rgba(255,77,0,0.1)]"
        >
          <div class="mb-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF4D00]/10 text-[#FF4D00] transition duration-300 group-hover:scale-110 group-hover:bg-[#FF4D00] group-hover:text-white">
            <Icon :name="item.icon" class="text-3xl" />
          </div>
          <h3 class="text-2xl font-black text-white">{{ item.title }}</h3>
          <p class="mt-4 leading-7 text-neutral-400">{{ item.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    icon: "i-heroicons-shield-check",
    title: "Premium Materials",
    description: "Durable leather, reinforced stitching, and secure fits selected for hard training.",
  },
  {
    icon: "i-heroicons-truck",
    title: "Fast Shipping",
    description: "Reliable dispatch and clear delivery updates so your training does not wait.",
  },
  {
    icon: "i-heroicons-banknotes",
    title: "Secure Payment",
    description: "A clean checkout experience with trusted payment handling and order clarity.",
  },
  {
    icon: "i-heroicons-trophy",
    title: "Professional Fighters",
    description: "Product choices shaped around boxing, MMA, kickboxing, and Muay Thai training.",
  },
  {
    icon: "i-heroicons-sparkles",
    title: "Warranty Support",
    description: "Premium service when you need sizing guidance, product help, or after-sale support.",
  },
];
</script>

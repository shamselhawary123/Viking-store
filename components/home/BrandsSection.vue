<template>
  <section class="border-y border-white/10 bg-[#080808] py-8">
    <div class="container-premium">
      <div class="grid grid-cols-2 gap-4 text-center md:grid-cols-5">
        <div
          v-for="brand in brands"
          :key="brand"
          class="rounded-xl border border-white/5 bg-white/[0.025] px-4 py-5 font-display text-3xl text-neutral-500 transition duration-300 hover:border-[#FF4D00]/40 hover:text-[#FF4D00]"
        >
          {{ brand }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brands = ["VENUM", "RDX", "WOLON", "EVERLAST", "TOP TEN"];
</script>

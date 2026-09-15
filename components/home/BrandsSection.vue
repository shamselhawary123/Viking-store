<template>
  <section class="border-y border-white/10 bg-[#080808] py-4 lg:py-8">
    <div class="container-premium">
      <div
        class="brand-marquee relative h-14 overflow-hidden border-y border-white/5 bg-black/35 lg:hidden"
        aria-label="Viking Store brands"
        dir="ltr"
      >
        <div class="brand-marquee-track flex h-full w-max items-center">
          <div
            v-for="(trackBrands, trackIndex) in brandMarqueeTracks"
            :key="trackIndex"
            class="brand-marquee-group flex h-full shrink-0 items-center"
            :aria-hidden="trackIndex === 1"
          >
            <template v-for="brand in trackBrands" :key="`${trackIndex}-${brand}`">
              <span class="px-5 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-300 sm:px-6 sm:text-base">
                {{ brand }}
              </span>
              <span class="text-lg font-semibold text-[#CF1D1D]" aria-hidden="true">/</span>
            </template>
          </div>
        </div>
      </div>

      <div class="hidden grid-cols-5 gap-4 text-center lg:grid">
        <div
          v-for="brand in brands"
          :key="brand"
          class="rounded-xl border border-white/5 bg-white/[0.025] px-4 py-5 font-display text-3xl text-neutral-500 transition duration-300 hover:border-[#CF1D1D]/40 hover:text-[#CF1D1D]"
        >
          {{ brand }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brands = ["VENUM", "RDX", "WOLON", "EVERLAST", "TOP TEN"];
const brandMarqueeTracks = [brands, brands];
</script>

<style scoped>
.brand-marquee::before,
.brand-marquee::after {
  content: "";
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: 3rem;
}

.brand-marquee::before {
  left: 0;
  background: linear-gradient(to right, #080808, rgba(8, 8, 8, 0));
}

.brand-marquee::after {
  right: 0;
  background: linear-gradient(to left, #080808, rgba(8, 8, 8, 0));
}

.brand-marquee-track {
  animation: brand-marquee 22s linear infinite;
  transform: translate3d(-50%, 0, 0);
}

@keyframes brand-marquee {
  from {
    transform: translate3d(-50%, 0, 0);
  }

  to {
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-marquee {
    overflow-x: auto;
  }

  .brand-marquee-track {
    animation: none;
    transform: translate3d(0, 0, 0);
  }
}
</style>

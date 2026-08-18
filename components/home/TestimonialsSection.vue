<template>
  <section class="section-premium bg-black">
    <div class="container-premium">
      <div class="mx-auto mb-16 max-w-3xl text-center">
        <p class="eyebrow font-size-l">{{ t("home.testimonials.eyebrow") }}</p>

        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
          {{ t("home.testimonials.title") }}
        </h2>
        <p class="mt-5 leading-8 text-neutral-400">
          {{ t("home.testimonials.description") }}
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
              <Icon
                v-for="star in 5"
                :key="star"
                name="i-heroicons-star-solid"
              />
            </div>
            <span
              class="font-display text-5xl leading-none text-white/10 transition group-hover:text-[#FF4D00]/25"
              >"</span
            >
          </div>
          <p class="min-h-24 leading-8 text-neutral-300">
            "{{ t(item.reviewKey) }}"
          </p>

          <div
            class="mt-8 flex items-center gap-4 border-t border-white/10 pt-6"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4D00] font-black text-white"
            >
              {{ item.name.slice(0, 1) }}
            </div>
            <div>
              <h3 class="font-black text-white">
                {{ item.name }}
              </h3>

              <p class="text-sm text-[#FF4D00]">
                {{ t(item.roleKey) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n();

const testimonials = [
  {
    name: "Ahmed Ali",
    roleKey: "home.testimonials.ahmedRole",
    reviewKey: "home.testimonials.ahmedReview",
  },
  {
    name: "Mohamed Hassan",
    roleKey: "home.testimonials.mohamedRole",
    reviewKey: "home.testimonials.mohamedReview",
  },
  {
    name: "Omar Khaled",
    roleKey: "home.testimonials.omarRole",
    reviewKey: "home.testimonials.omarReview",
  },
];
</script>

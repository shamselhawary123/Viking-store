<template>
  <main class="bg-black text-white">
    <section class="relative isolate min-h-[86vh] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1800&auto=format&fit=crop"
        alt="Combat sports athlete training under arena lights"
        class="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/70 to-black" />

      <div class="container-premium flex min-h-[86vh] items-end pb-16 pt-32 md:pb-24">
        <div class="max-w-5xl reveal-brand">
          <p class="eyebrow">Viking Combat Company</p>
          <h1 class="display-heading mt-5 text-7xl text-white sm:text-8xl lg:text-[9rem]">
            BUILT FOR
            <span class="block text-[#FF4D00]">WARRIORS</span>
          </h1>
          <p class="mt-6 max-w-2xl text-base leading-8 text-neutral-300 md:text-xl">
            Premium fight gear for athletes who train with discipline, compete with purpose, and expect every detail to hold up under pressure.
          </p>
          <div class="mt-9 flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/shop" class="premium-button premium-button-primary">Explore Gear</NuxtLink>
            <a href="#story" class="premium-button premium-button-secondary">Our Story</a>
          </div>
        </div>
      </div>
    </section>

    <section id="story" class="container-premium section-premium">
      <div class="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div class="lg:sticky lg:top-28">
          <p class="eyebrow">Our Story</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">FORGED BY THE DAILY GRIND</h2>
          <p class="mt-6 text-lg leading-8 text-neutral-400">
            Viking was shaped around a simple belief: fighters deserve equipment that feels strong, direct, and reliable from warmup to final round.
          </p>
        </div>

        <div class="relative space-y-5">
          <div class="absolute left-5 top-0 hidden h-full w-px bg-white/10 sm:block" />
          <article
            v-for="item in timeline"
            :key="item.year"
            class="premium-panel relative rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/60"
          >
            <div class="flex gap-5">
              <div class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FF4D00]/40 bg-black text-sm font-black text-[#FF4D00] sm:flex">
                {{ item.step }}
              </div>
              <div>
                <p class="text-sm font-black uppercase tracking-[0.18em] text-[#FF4D00]">{{ item.year }}</p>
                <h3 class="mt-2 text-2xl font-black text-white">{{ item.title }}</h3>
                <p class="mt-3 leading-7 text-neutral-400">{{ item.text }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="grid gap-6 md:grid-cols-2">
        <article v-for="item in missionVision" :key="item.title" class="premium-panel rounded-2xl p-7 md:p-9">
          <Icon :name="item.icon" class="text-4xl text-[#FF4D00]" />
          <p class="eyebrow mt-7">{{ item.label }}</p>
          <h2 class="mt-3 text-3xl font-black text-white">{{ item.title }}</h2>
          <p class="mt-4 leading-8 text-neutral-400">{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="border-y border-white/10 bg-white/[0.02] py-20">
      <div class="container-premium">
        <div class="mb-10 max-w-3xl">
          <p class="eyebrow">Why Choose Viking</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">GEAR THAT EARNS TRUST</h2>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="premium-panel group rounded-2xl p-6 transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF4D00]/30 bg-[#FF4D00]/10 text-[#FF4D00] transition group-hover:scale-105">
              <Icon :name="feature.icon" class="text-2xl" />
            </div>
            <h3 class="mt-6 text-2xl font-black text-white">{{ feature.title }}</h3>
            <p class="mt-3 leading-7 text-neutral-400">{{ feature.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section ref="statsSection" class="container-premium py-20">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="stat in stats" :key="stat.label" class="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 text-center">
          <p class="display-heading text-6xl text-white">
            {{ stat.current }}{{ stat.suffix }}
          </p>
          <p class="mt-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-500">{{ stat.label }}</p>
        </article>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="eyebrow">Team</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">THE CORNER CREW</h2>
        </div>
        <p class="max-w-xl leading-7 text-neutral-400">
          A small team of fight fans, product obsessives, and support specialists focused on building a sharper combat store.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <article v-for="member in team" :key="member.name" class="group overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] transition duration-300 hover:-translate-y-2 hover:border-[#FF4D00]/60">
          <div class="relative aspect-[4/5] overflow-hidden bg-neutral-950">
            <img :src="member.image" :alt="member.alt" class="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
          </div>
          <div class="p-6">
            <p class="text-sm font-black uppercase tracking-[0.18em] text-[#FF4D00]">{{ member.role }}</p>
            <h3 class="mt-2 text-2xl font-black text-white">{{ member.name }}</h3>
            <p class="mt-3 leading-7 text-neutral-400">{{ member.text }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <div class="mb-8">
          <p class="eyebrow">Partners</p>
          <h2 class="mt-3 text-3xl font-black text-white">Trusted Training Ecosystem</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div v-for="partner in partners" :key="partner" class="flex min-h-24 items-center justify-center rounded-xl border border-white/10 bg-black/30 px-4 text-center text-sm font-black uppercase tracking-[0.18em] text-neutral-300 transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/60 hover:text-white">
            {{ partner }}
          </div>
        </div>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="mb-10">
        <p class="eyebrow">Testimonials</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">TESTED IN TRAINING</h2>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <article v-for="quote in testimonials" :key="quote.name" class="premium-panel rounded-2xl p-7">
          <div class="flex text-[#FF4D00]" aria-label="Rated 5 out of 5">
            <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" />
          </div>
          <p class="mt-6 leading-8 text-neutral-300">"{{ quote.text }}"</p>
          <div class="mt-7 border-t border-white/10 pt-5">
            <h3 class="font-black text-white">{{ quote.name }}</h3>
            <p class="mt-1 text-sm text-neutral-500">{{ quote.role }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="container-premium pb-24">
      <div class="relative overflow-hidden rounded-2xl border border-[#FF4D00]/30 bg-[#120903] p-8 md:p-12">
        <img
          src="https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=1600&auto=format&fit=crop"
          alt=""
          class="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="lazy"
        />
        <div class="relative max-w-3xl">
          <p class="eyebrow">Join The Clan</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-8xl">BECOME A VIKING WARRIOR</h2>
          <p class="mt-5 text-lg leading-8 text-neutral-300">
            Build your fight kit with equipment made for discipline, confidence, and every hard round ahead.
          </p>
          <NuxtLink to="/shop" class="premium-button premium-button-primary mt-8">Shop Viking Gear</NuxtLink>
        </div>
      </div>
    </section>

    <section class="container-premium grid gap-8 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p class="eyebrow">FAQ Preview</p>
        <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">QUICK ANSWERS</h2>
        <NuxtLink to="/faq" class="premium-button premium-button-secondary mt-8">View Full FAQ</NuxtLink>
      </div>

      <div class="space-y-4">
        <details v-for="item in faqs" :key="item.question" class="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-white">
            {{ item.question }}
            <Icon name="i-heroicons-chevron-down" class="shrink-0 text-[#FF4D00] transition group-open:rotate-180" />
          </summary>
          <p class="mt-4 leading-7 text-neutral-400">{{ item.answer }}</p>
        </details>
      </div>
    </section>

    <section class="container-premium pb-28">
      <div class="premium-panel rounded-2xl p-7 md:p-10">
        <div class="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p class="eyebrow">Newsletter</p>
            <h2 class="display-heading mt-4 text-5xl text-white md:text-7xl">TRAINING DROPS, GEAR ALERTS</h2>
            <p class="mt-5 max-w-2xl leading-8 text-neutral-400">
              Get product launches, fight-week essentials, and Viking-only offers delivered to your inbox.
            </p>
          </div>

          <form class="grid gap-3 sm:grid-cols-[1fr_auto]" @submit.prevent>
            <label class="sr-only" for="about-newsletter">Email address</label>
            <input id="about-newsletter" type="email" class="premium-input" placeholder="Email address" autocomplete="email" />
            <button class="premium-button premium-button-primary" type="submit">Join Newsletter</button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const statsSection = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const timeline = [
  {
    step: "01",
    year: "Origin",
    title: "Born In The Training Room",
    text: "Viking began with athletes who wanted fight gear that looked sharp, felt reliable, and could survive repeated hard sessions.",
  },
  {
    step: "02",
    year: "Philosophy",
    title: "Discipline Over Noise",
    text: "The brand follows a fighter's mindset: simple tools, strong standards, no excuses, and constant improvement.",
  },
  {
    step: "03",
    year: "Today",
    title: "A Combat Store With Standards",
    text: "Every collection is selected around durability, comfort, protection, and the confidence fighters need before stepping on the mat.",
  },
];

const missionVision = [
  {
    icon: "i-heroicons-flag",
    label: "Mission",
    title: "Equip Fighters For The Work",
    text: "Deliver premium combat gear, clear product guidance, and a buying experience athletes can trust before every training block.",
  },
  {
    icon: "i-heroicons-eye",
    label: "Vision",
    title: "Build The Most Trusted Combat Store",
    text: "Grow Viking into a fight-sports destination known for sharp curation, durable products, and a culture built around discipline.",
  },
];

const features = [
  { icon: "i-heroicons-shield-check", title: "Premium Quality", text: "Durable materials, secure fit, and detail-focused product selection." },
  { icon: "i-heroicons-truck", title: "Fast Shipping", text: "A direct store experience built to get athletes ready without delays." },
  { icon: "i-heroicons-lock-closed", title: "Secure Payment", text: "Clean checkout flows with protected payment confidence." },
  { icon: "i-heroicons-bolt", title: "Built For Fighters", text: "Gear chosen for boxing, kickboxing, Muay Thai, MMA, and hard conditioning." },
  { icon: "i-heroicons-chat-bubble-left-right", title: "Lifetime Support", text: "Sizing help, order guidance, and product support when athletes need it." },
  { icon: "i-heroicons-trophy", title: "Trusted By Athletes", text: "A brand experience shaped around fighters, coaches, and daily training." },
];

const stats = ref([
  { label: "Products", target: 120, current: "0", suffix: "+" },
  { label: "Happy Customers", target: 8400, current: "0", suffix: "+" },
  { label: "Countries", target: 18, current: "0", suffix: "+" },
  { label: "Orders", target: 12500, current: "0", suffix: "+" },
]);

const team = [
  {
    name: "Omar Steel",
    role: "Founder",
    text: "Leads the Viking product standard and keeps the brand grounded in fight culture.",
    image: "https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=900&auto=format&fit=crop",
    alt: "Founder standing in a combat gym",
  },
  {
    name: "Maya Cross",
    role: "Gear Lead",
    text: "Tests fit, protection, and product feel across gloves, wraps, shorts, and guards.",
    image: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?q=80&w=900&auto=format&fit=crop",
    alt: "Gear lead preparing training equipment",
  },
  {
    name: "Adam Knox",
    role: "Athlete Support",
    text: "Helps fighters choose the right setup for skill level, training style, and goals.",
    image: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?q=80&w=900&auto=format&fit=crop",
    alt: "Athlete support specialist in a gym",
  },
];

const partners = ["Venum", "Everlast", "Fairtex", "Hayabusa", "RDX", "Top King"];

const testimonials = [
  { name: "Karim A.", role: "Amateur Boxer", text: "The gear feels serious. The fit, padding, and store experience all feel built for people who train every week." },
  { name: "Lina M.", role: "Muay Thai Athlete", text: "Viking makes it easy to find durable equipment without digging through random products." },
  { name: "Youssef H.", role: "MMA Coach", text: "Clean product selection, fast help, and a brand style that actually fits combat sports." },
];

const faqs = [
  { question: "How do I choose the right size?", answer: "Use the sizing notes on each product page, then contact support if you need help matching gear to your training style." },
  { question: "Do you stock beginner and advanced gear?", answer: "Yes. Viking focuses on products that can support new athletes and experienced fighters." },
  { question: "Can I return unused gear?", answer: "Eligible unused items can be returned according to the store return policy shown during support." },
];

const animateStats = () => {
  const duration = 1200;
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    stats.value = stats.value.map((stat) => ({
      ...stat,
      current: Math.round(stat.target * eased).toLocaleString(),
    }));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

onMounted(() => {
  if (!statsSection.value) return;

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;

      animateStats();
      observer?.disconnect();
    },
    { threshold: 0.35 },
  );

  observer.observe(statsSection.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.reveal-brand {
  animation: reveal-brand 700ms ease both;
}

@keyframes reveal-brand {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

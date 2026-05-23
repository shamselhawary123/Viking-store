<template>
  <header
    class="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg"
  >
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <NuxtLink to="/">
          <img
            src="/image/logo.png"
            alt="Viking Store"
            class="h-12 w-12 object-contain"
          />
        </NuxtLink>
      </div>
      <!-- Navigation -->
      <nav class="hidden items-center gap-8 md:flex">
        <NuxtLink to="/" class="transition hover:text-[#FF4D00]">Home</NuxtLink>

        <NuxtLink to="/shop" class="transition hover:text-[#FF4D00]"
          >Shop</NuxtLink
        >

        <NuxtLink to="/about" class="transition hover:text-[#FF4D00]"
          >About</NuxtLink
        >

        <NuxtLink to="/contact" class="transition hover:text-[#FF4D00]"
          >Contact</NuxtLink
        >
      </nav>
      <!-- Actions -->
      <div class="flex items-center gap-4">
        <button
          class="rounded-xl border border-white/10 p-2 hover:border-[#FF4D00]"
        >
          🛒
        </button>

        <button
          class="rounded-xl border border-white/10 p-2 hover:border-[#FF4D00]"
        >
          🌙
        </button>

        <!-- Mobile Menu -->
        <button class="rounded-xl border border-white/10 p-2 md:hidden">
          ☰
        </button>
      </div>
    </div>
  </header>
</template>

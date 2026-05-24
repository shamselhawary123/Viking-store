<template>
  <header
    class="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg"
  >
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Viking Store"
          class="h-12 w-12 object-contain"
        />
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden items-center gap-8 md:flex">
        <NuxtLink to="/" class="nav-link">Home</NuxtLink>

        <NuxtLink to="/shop" class="nav-link"> Shop </NuxtLink>

        <NuxtLink to="/categories" class="nav-link"> Categories </NuxtLink>

        <NuxtLink to="/about" class="nav-link"> About </NuxtLink>

        <NuxtLink to="/contact" class="nav-link"> Contact </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Cart -->
        <button
          class="relative rounded-xl border border-white/10 p-2 transition hover:border-[#FF4D00]"
        >
          🛒

          <span
            class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D00] text-xs font-bold text-white"
          >
            {{ cartStore.totalItems }}
          </span>
        </button>

        <!-- Theme -->
        <button
          class="rounded-xl border border-white/10 p-2 transition hover:border-[#FF4D00]"
        >
          🌙
        </button>

        <!-- Mobile Menu Button -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="rounded-xl border border-white/10 p-2 transition hover:border-[#FF4D00] md:hidden"
        >
          ☰
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <div
        v-if="isMenuOpen"
        class="border-t border-white/10 bg-[#0a0a0a] md:hidden"
      >
        <nav class="flex flex-col p-6">
          <NuxtLink to="/" class="mobile-link" @click="isMenuOpen = false">
            Home
          </NuxtLink>

          <NuxtLink to="/shop" class="mobile-link" @click="isMenuOpen = false">
            Shop
          </NuxtLink>

          <NuxtLink
            to="/categories"
            class="mobile-link"
            @click="isMenuOpen = false"
          >
            Categories
          </NuxtLink>

          <NuxtLink to="/about" class="mobile-link" @click="isMenuOpen = false">
            About
          </NuxtLink>

          <NuxtLink
            to="/contact"
            class="mobile-link"
            @click="isMenuOpen = false"
          >
            Contact
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCartStore } from "../../stores/cart";

const cartStore = useCartStore();
const isMenuOpen = ref(false);
</script>
<style scoped>
.nav-link {
  transition: 0.3s;
}

.nav-link:hover {
  color: #ff4d00;
}

.router-link-exact-active {
  color: #ff4d00;
}

.mobile-link {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 0;
  font-size: 18px;
  transition: 0.3s;
}

.mobile-link:hover {
  color: #ff4d00;
}

/* Animation */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<template>
  <header
    class="sticky top-0 z-50 border-b border-white/10 bg-black/70 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
  >
    <div class="container-premium">
      <div class="flex h-[76px] items-center justify-between gap-4">
        <NuxtLink
          to="/"
          class="brand-link group"
          aria-label="Viking Store home"
        >
          <img
            src="/logo.png"
            alt="Viking Store"
            class="h-12 w-12 object-contain transition duration-300 group-hover:scale-105"
          />
          <!-- <div class="hidden leading-none sm:block">
            <span class="font-display text-[2rem] leading-none text-white">VIKING</span>
            <span class="ml-1 align-middle text-[0.68rem] font-black uppercase tracking-[0.32em] text-[#FF4D00]">Store</span>
          </div> -->
        </NuxtLink>

        <nav
          class="nav-shell hidden lg:flex items-center"
          aria-label="Main navigation"
        >
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2 sm:gap-3">
          <button
            class="action-button relative"
            aria-label="Open cart"
            @click="cartStore.openCart()"
          >
            <Icon name="i-heroicons-shopping-bag" class="text-xl" />
            <span
              v-if="cartStore.totalItems"
              class="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF4D00] px-1 text-[0.68rem] font-black leading-none text-white shadow-[0_0_18px_rgba(255,77,0,0.55)]"
            >
              {{ cartStore.totalItems }}
            </span>
          </button>

          <div class="hidden lg:flex items-center gap-2 sm:gap-3">
            <NuxtLink
              to="/wishlist"
              class="action-button"
              aria-label="Wishlist"
            >
              <Icon name="i-heroicons-heart" class="text-xl" />
            </NuxtLink>

            <template v-if="authStore.user">
              <NuxtLink to="/profile" class="profile-pill group">
                <img
                  :src="
                    authStore.profile?.avatar ||
                    'https://ui-avatars.com/api/?name=User'
                  "
                  alt="Profile"
                  class="h-9 w-9 rounded-full object-cover"
                />

                <div class="hidden lg:block">
                  <p
                    class="text-xs font-black uppercase tracking-[0.14em] text-white transition group-hover:text-[#FF4D00]"
                  >
                    {{ authStore.profile?.full_name || "Viking Member" }}
                  </p>
                  <p
                    class="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-neutral-500"
                  >
                    Account
                  </p>
                </div>
              </NuxtLink>

              <button class="logout-button" @click="handleLogout">
                <Icon
                  name="i-heroicons-arrow-left-start-on-rectangle"
                  class="text-lg"
                />
                <!-- <span class="hidden lg:inline">Logout</span> -->
              </button>
            </template>

            <template v-else>
              <NuxtLink to="/auth/login" class="auth-link"> Login </NuxtLink>
              <NuxtLink to="/auth/register" class="auth-link auth-link-primary">
                Register
              </NuxtLink>
            </template>
          </div>

          <div class="flex lg:hidden">
            <button
              class="action-button"
              :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
              :aria-expanded="isMenuOpen"
              @click="isMenuOpen = !isMenuOpen"
            >
              <Icon
                :name="isMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
                class="text-xl"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <Transition name="mobile-menu">
      <div
        v-if="isMenuOpen"
        class="border-t border-white/10 bg-black/90 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:hidden"
      >
        <div class="container-premium py-5">
          <nav class="grid gap-2" aria-label="Mobile navigation">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="mobile-link"
              @click="isMenuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <div class="mt-5 border-t border-white/10 pt-5">
            <div v-if="authStore.user" class="grid gap-3">
              <NuxtLink
                to="/profile"
                class="mobile-account"
                @click="isMenuOpen = false"
              >
                <img
                  :src="
                    authStore.profile?.avatar ||
                    'https://ui-avatars.com/api/?name=User'
                  "
                  alt="Profile"
                  class="h-12 w-12 rounded-full object-cover"
                />
                <div class="min-w-0">
                  <p class="truncate font-black text-white">
                    {{ authStore.profile?.full_name || "Viking Member" }}
                  </p>
                  <p
                    class="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500"
                  >
                    Member account
                  </p>
                </div>
              </NuxtLink>

              <button
                class="mobile-action mobile-action-danger"
                @click="handleLogout"
              >
                <Icon
                  name="i-heroicons-arrow-left-start-on-rectangle"
                  class="text-lg"
                />
                Logout
              </button>
            </div>

            <div v-else class="grid gap-3 sm:grid-cols-2">
              <NuxtLink
                to="/auth/login"
                class="mobile-action"
                @click="isMenuOpen = false"
              >
                Login
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="mobile-action mobile-action-primary"
                @click="isMenuOpen = false"
              >
                Register
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCartStore } from "../../stores/cart";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const pinia = usePinia();
const cartStore = useCartStore(pinia);
const authStore = useAuthStore(pinia);
const router = useRouter();

const isMenuOpen = ref(false);
const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Categories", to: "/categories" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Orders", to: "/profile/orders" },
  { label: "FAQ", to: "/faq" },
];

onMounted(async () => {
  try {
    await authStore.getUser();

    if (authStore.user) {
      await authStore.getProfile();
    }
  } catch (err) {
    console.log(err);
  }

  cartStore.loadCart();
});

const handleLogout = () => {
  authStore.logout();
  isMenuOpen.value = false;
  router.push("/");
};
</script>

<style scoped>
.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  min-width: max-content;
}

.nav-shell {
  gap: 0.25rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 9999px;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 0.08),
    rgb(255 255 255 / 0.025)
  );
  padding: 0.3rem;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.08);
}

.nav-link {
  position: relative;
  border-radius: 9999px;
  color: #c9c9c9;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  padding: 0.72rem 1rem;
  text-transform: uppercase;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.nav-link:hover {
  background: rgb(255 255 255 / 0.06);
  color: #ff4d00;
  transform: translateY(-1px);
}

.nav-link.router-link-exact-active {
  background: rgb(255 77 0 / 0.14);
  color: #fff;
}

.nav-link.router-link-exact-active::after {
  position: absolute;
  right: 1rem;
  bottom: 0.35rem;
  left: 1rem;
  height: 2px;
  border-radius: 9999px;
  background: #ff4d00;
  content: "";
}

.action-button,
.profile-button {
  display: inline-flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.045);
  color: #fff;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.action-button:hover,
.profile-button:hover {
  border-color: rgb(255 77 0 / 0.8);
  background: rgb(255 77 0 / 0.12);
  color: #ff4d00;
  transform: translateY(-1px);
}

.profile-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.045);
  padding: 0.28rem 0.85rem 0.28rem 0.28rem;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.profile-pill:hover {
  border-color: rgb(255 77 0 / 0.65);
  background: rgb(255 77 0 / 0.1);
  transform: translateY(-1px);
}

.logout-button,
.auth-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 9999px;
  padding: 0 1rem;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.auth-link,
.logout-button {
  color: #e5e5e5;
}

.auth-link:hover,
.logout-button:hover {
  border-color: rgb(255 77 0 / 0.75);
  background: rgb(255 77 0 / 0.1);
  color: #ff4d00;
  transform: translateY(-1px);
}

.auth-link-primary {
  border-color: rgb(255 77 0 / 0.9);
  background: #ff4d00;
  color: #fff;
  box-shadow: 0 14px 34px rgb(255 77 0 / 0.24);
}

.auth-link-primary:hover {
  background: #ff5f1a;
  color: #fff;
}

.mobile-link {
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.035);
  color: #e5e5e5;
  padding: 0.95rem 1rem;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.mobile-link:hover {
  border-color: rgb(255 77 0 / 0.65);
  background: rgb(255 77 0 / 0.1);
  color: #ff4d00;
  transform: translateX(3px);
}

.mobile-link.router-link-exact-active {
  border-color: rgb(255 77 0 / 0.8);
  background: rgb(255 77 0 / 0.14);
  color: #fff;
}

.mobile-account,
.mobile-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.045);
  padding: 0.9rem 1rem;
  font-weight: 900;
}

.mobile-account {
  justify-content: flex-start;
}

.mobile-action-primary {
  border-color: rgb(255 77 0 / 0.9);
  background: #ff4d00;
  color: #fff;
}

.mobile-action-danger {
  color: #fca5a5;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

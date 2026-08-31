<template>
  <Transition name="viking-loader-fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-6 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="viking-loader-shell">
        <span class="viking-loader-idle-halo" aria-hidden="true" />

        <svg class="viking-loader-glove viking-loader-glove-left" viewBox="0 0 80 54" aria-hidden="true">
          <path
            d="M18 17C20 8 28 5 37 8l12 4c8 3 12 9 10 17-2 9-9 15-19 15H25c-11 0-16-9-13-18 1-4 3-7 6-9Z"
            fill="url(#viking-glove-metal-left)"
          />
          <path d="M14 33h19c5 0 9 4 9 9v3H17c-5 0-9-4-9-9 0-2 2-3 6-3Z" fill="#161616" />
          <path d="M24 16c9-3 21 0 28 6M15 31c8 3 21 3 31 0" stroke="#CF1D1D" stroke-width="2.2" stroke-linecap="round" />
          <defs>
            <linearGradient id="viking-glove-metal-left" x1="11" x2="61" y1="8" y2="42">
              <stop stop-color="#303030" />
              <stop offset="0.6" stop-color="#101010" />
              <stop offset="1" stop-color="#CF1D1D" stop-opacity="0.42" />
            </linearGradient>
          </defs>
        </svg>

        <svg class="viking-loader-glove viking-loader-glove-right" viewBox="0 0 80 54" aria-hidden="true">
          <path
            d="M18 17C20 8 28 5 37 8l12 4c8 3 12 9 10 17-2 9-9 15-19 15H25c-11 0-16-9-13-18 1-4 3-7 6-9Z"
            fill="url(#viking-glove-metal-right)"
          />
          <path d="M14 33h19c5 0 9 4 9 9v3H17c-5 0-9-4-9-9 0-2 2-3 6-3Z" fill="#161616" />
          <path d="M24 16c9-3 21 0 28 6M15 31c8 3 21 3 31 0" stroke="#CF1D1D" stroke-width="2.2" stroke-linecap="round" />
          <defs>
            <linearGradient id="viking-glove-metal-right" x1="11" x2="61" y1="8" y2="42">
              <stop stop-color="#303030" />
              <stop offset="0.6" stop-color="#101010" />
              <stop offset="1" stop-color="#CF1D1D" stop-opacity="0.42" />
            </linearGradient>
          </defs>
        </svg>

        <span class="viking-loader-impact-flash" aria-hidden="true" />
        <span
          v-for="streak in 6"
          :key="streak"
          class="viking-loader-impact-streak"
          :style="{ '--streak-angle': `${streak * 60}deg` }"
          aria-hidden="true"
        />
        <img
          src="/logo.png"
          alt=""
          width="72"
          height="72"
          class="viking-loader-logo viking-loader-logo-reveal relative z-10 h-16 w-16 object-contain sm:h-[72px] sm:w-[72px]"
          loading="eager"
          decoding="async"
        />
        <p class="sr-only">{{ t("common.preparingGear") }}</p>
        <p
          class="viking-loader-text relative z-10 mt-3 text-center text-xs font-black uppercase tracking-[0.18em] text-neutral-300"
          aria-hidden="true"
        >
          {{ t("common.preparingGear") }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isVisible } = useVikingNavigationLoader();
const { t } = useI18n();
</script>

<style scoped>
.viking-loader-shell {
  position: relative;
  display: flex;
  min-height: 164px;
  min-width: 224px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.viking-loader-idle-halo {
  position: absolute;
  top: 23px;
  width: 98px;
  height: 98px;
  border: 1px solid rgba(207, 29, 29, 0.18);
  border-radius: 9999px;
  background:
    radial-gradient(circle, rgba(207, 29, 29, 0.1), transparent 58%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.045), rgba(207, 29, 29, 0.08));
  box-shadow:
    inset 0 0 24px rgba(255, 255, 255, 0.025),
    0 0 28px rgba(207, 29, 29, 0.1);
  opacity: 0;
  animation: viking-loader-halo-in 220ms ease-out 940ms forwards, viking-loader-halo-idle 1.9s ease-in-out 1160ms infinite;
}

.viking-loader-glove {
  position: absolute;
  top: 43px;
  z-index: 6;
  width: 66px;
  height: auto;
  filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.45));
  will-change: opacity, transform;
}

.viking-loader-glove-left {
  left: 21px;
  transform: translateX(-38px) rotate(7deg);
  animation: viking-loader-glove-left 980ms cubic-bezier(0.34, 0, 0.18, 1) forwards;
}

.viking-loader-glove-right {
  right: 21px;
  transform: translateX(38px) rotateY(180deg) rotate(7deg);
  animation: viking-loader-glove-right 980ms cubic-bezier(0.34, 0, 0.18, 1) forwards;
}

.viking-loader-impact-flash {
  position: absolute;
  top: 54px;
  z-index: 7;
  width: 52px;
  height: 52px;
  border-radius: 9999px;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.86), rgba(207, 29, 29, 0.58) 24%, rgba(207, 29, 29, 0.22) 42%, transparent 68%),
    radial-gradient(circle, rgba(207, 29, 29, 0.44), transparent 72%);
  opacity: 0;
  transform: scale(0.58);
  animation: viking-loader-impact-flash 150ms ease-out 700ms forwards;
}

.viking-loader-impact-flash::after {
  content: "";
  position: absolute;
  inset: -9px;
  border: 1px solid rgba(207, 29, 29, 0.56);
  border-radius: 9999px;
  transform: scale(0.76);
  animation: viking-loader-impact-ring 170ms ease-out 706ms forwards;
}

.viking-loader-impact-streak {
  position: absolute;
  top: 78px;
  left: 50%;
  z-index: 8;
  width: 28px;
  height: 2px;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.72), #cf1d1d 52%, transparent);
  box-shadow: 0 0 12px rgba(207, 29, 29, 0.34);
  opacity: 0;
  transform: rotate(var(--streak-angle)) translateX(12px) scaleX(0.35);
  transform-origin: left center;
  animation: viking-loader-impact-streak 150ms ease-out 704ms forwards;
}

.viking-loader-logo {
  opacity: 0;
  transform: scale(0.9);
  animation: viking-loader-logo-reveal 240ms cubic-bezier(0.2, 0.8, 0.28, 1) 730ms forwards, viking-loader-logo-idle 1.9s ease-in-out 1160ms infinite;
}

.viking-loader-text {
  opacity: 0;
  animation: viking-loader-text-in 160ms ease-out 920ms forwards;
}

.viking-loader-fade-enter-active,
.viking-loader-fade-leave-active {
  transition: opacity 0.16s ease;
}

.viking-loader-fade-enter-from,
.viking-loader-fade-leave-to {
  opacity: 0;
}

@keyframes viking-loader-glove-left {
  0% {
    opacity: 1;
    transform: translateX(-38px) rotate(7deg);
  }

  71% {
    opacity: 1;
    transform: translateX(22px) rotate(-3deg);
  }

  82% {
    opacity: 1;
    transform: translateX(12px) rotate(2deg);
  }

  100% {
    opacity: 0;
    transform: translateX(-18px) rotate(-8deg);
  }
}

@keyframes viking-loader-glove-right {
  0% {
    opacity: 1;
    transform: translateX(38px) rotateY(180deg) rotate(7deg);
  }

  71% {
    opacity: 1;
    transform: translateX(-22px) rotateY(180deg) rotate(-3deg);
  }

  82% {
    opacity: 1;
    transform: translateX(-12px) rotateY(180deg) rotate(2deg);
  }

  100% {
    opacity: 0;
    transform: translateX(18px) rotateY(180deg) rotate(-8deg);
  }
}

@keyframes viking-loader-impact-flash {
  0% {
    opacity: 0;
    transform: scale(0.58);
  }

  34% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.16);
  }
}

@keyframes viking-loader-impact-ring {
  0% {
    opacity: 0.7;
    transform: scale(0.76);
  }

  100% {
    opacity: 0;
    transform: scale(1.72);
  }
}

@keyframes viking-loader-impact-streak {
  0% {
    opacity: 0;
    transform: rotate(var(--streak-angle)) translateX(8px) scaleX(0.35);
  }

  36% {
    opacity: 0.9;
  }

  100% {
    opacity: 0;
    transform: rotate(var(--streak-angle)) translateX(42px) scaleX(1);
  }
}

@keyframes viking-loader-logo-reveal {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }

  62% {
    opacity: 1;
    transform: scale(1.04);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes viking-loader-logo-idle {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.015);
  }
}

@keyframes viking-loader-halo-in {
  to {
    opacity: 0.52;
  }
}

@keyframes viking-loader-halo-idle {
  0%,
  100% {
    opacity: 0.42;
    box-shadow:
      inset 0 0 22px rgba(255, 255, 255, 0.025),
      0 0 24px rgba(207, 29, 29, 0.09);
  }

  50% {
    opacity: 0.68;
    box-shadow:
      inset 0 0 26px rgba(255, 255, 255, 0.035),
      0 0 36px rgba(207, 29, 29, 0.16);
  }
}

@keyframes viking-loader-text-in {
  to {
    opacity: 0.82;
  }
}

@media (prefers-reduced-motion: reduce) {
  .viking-loader-idle-halo,
  .viking-loader-glove,
  .viking-loader-impact-flash,
  .viking-loader-impact-streak,
  .viking-loader-logo,
  .viking-loader-text {
    animation: none;
  }

  .viking-loader-glove,
  .viking-loader-impact-flash,
  .viking-loader-impact-streak {
    opacity: 0;
  }

  .viking-loader-idle-halo {
    opacity: 0.42;
  }

  .viking-loader-logo {
    opacity: 1;
    transform: none;
  }

  .viking-loader-text {
    opacity: 0.82;
  }

  .viking-loader-fade-enter-active,
  .viking-loader-fade-leave-active {
    transition: none;
  }
}
</style>

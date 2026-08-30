<template>
  <div
    v-if="isCancelled"
    class="rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-4"
  >
    <div class="flex items-center gap-3">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300"
      >
        <Icon name="i-heroicons-x-circle" class="text-xl" />
      </span>
      <div>
        <p class="text-sm font-black text-red-200">{{ t("orders.cancelled") }}</p>
        <p class="mt-1 text-xs leading-5 text-red-100/70">{{ statusMessage }}</p>
      </div>
    </div>
  </div>

  <div v-else class="order-tracker rounded-2xl border border-white/10 bg-black/35 p-4">
    <div class="relative px-2 pt-5">
      <div class="absolute inset-x-5 top-9 h-px bg-white/10" />
      <div class="tracker-progress absolute top-9 h-px bg-[#CF1D1D]" :style="progressStyle" />
      <div
        class="tracker-marker absolute top-[25px] flex h-8 w-8 items-center justify-center rounded-full border"
        :class="currentStageTheme.marker"
        :style="markerStyle"
      >
        <Icon :name="markerIcon" class="text-base" />
      </div>

      <div class="order-tracker-steps relative grid grid-cols-4 gap-2">
        <div
          v-for="(stage, index) in normalStages"
          :key="stage"
          class="flex flex-col items-center text-center"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full border text-xs transition"
            :class="getStageTheme(index).circle"
          >
            <Icon :name="stageIcons[stage]" />
          </span>
          <span
            class="mt-3 text-[10px] font-black uppercase tracking-[0.16em]"
            :class="getStageTheme(index).label"
          >
            {{ t(`orders.${stage}`) }}
          </span>
        </div>
      </div>
    </div>

    <p class="mt-5 text-sm leading-6 text-neutral-300">{{ statusMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status?: string | null;
}>();

const { t, te } = useI18n();

const status = computed(() => String(props.status || "pending").toLowerCase());
const isCancelled = computed(() => status.value === "cancelled");

const statusStepMap = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
} as const;

const normalStages = ["pending", "processing", "shipped", "delivered"] as const;

const stageIcons: Record<(typeof normalStages)[number], string> = {
  pending: "i-heroicons-clock",
  processing: "i-heroicons-cog-6-tooth",
  shipped: "i-heroicons-truck",
  delivered: "i-heroicons-check-circle",
};

const semanticStageThemes = {
  pending: { circle: "border-amber-400/50 bg-amber-400/15 text-amber-200", label: "text-amber-200", marker: "border-amber-300/50 bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.32)]" },
  processing: { circle: "border-orange-400/50 bg-orange-400/15 text-orange-200", label: "text-orange-200", marker: "border-orange-300/50 bg-orange-500 text-white shadow-[0_0_20px_rgba(251,146,60,0.32)]" },
  shipped: { circle: "border-blue-400/50 bg-blue-400/15 text-blue-200", label: "text-blue-200", marker: "border-blue-300/50 bg-blue-500 text-white shadow-[0_0_20px_rgba(96,165,250,0.32)]" },
  delivered: { circle: "border-emerald-400/50 bg-emerald-400/15 text-emerald-200", label: "text-emerald-200", marker: "border-emerald-300/50 bg-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.32)]" },
} as const;

const completedStageTheme = {
  circle: "border-[#CF1D1D] bg-[#CF1D1D] text-white",
  label: "text-white",
} as const;

const futureStageTheme = {
  circle: "border-white/10 bg-black text-neutral-500",
  label: "text-neutral-600",
} as const;

const currentStep = computed(() => {
  return statusStepMap[status.value as keyof typeof statusStepMap] ?? 0;
});

const progressPercent = computed(() => {
  return (currentStep.value / (normalStages.length - 1)) * 100;
});

const progressRatio = computed(() => progressPercent.value / 100);

const progressStyle = computed(() => ({
  width: `calc((100% - 2.5rem) * ${progressRatio.value})`,
}));

const markerStyle = computed(() => ({
  insetInlineStart: `calc(1.25rem + (100% - 2.5rem) * ${progressRatio.value})`,
}));

const markerIcon = computed(() => {
  return stageIcons[normalStages[currentStep.value]];
});

const currentStageTheme = computed(() => {
  return semanticStageThemes[normalStages[currentStep.value]];
});

const getStageTheme = (index: number) => {
  if (index < currentStep.value) {
    return completedStageTheme;
  }

  if (index === currentStep.value) {
    return currentStageTheme.value;
  }

  return futureStageTheme;
};

const statusMessage = computed(() => {
  const key = `profile.statusCopy.${status.value}`;
  return te(key) ? t(key) : t("profile.statusCopy.unknown");
});
</script>

<style scoped>
.tracker-progress {
  inset-inline-start: 1.25rem;
  transition: width 760ms cubic-bezier(0.22, 1, 0.36, 1);
}

.tracker-marker {
  transform: translateX(-50%);
  transition:
    inset-inline-start 760ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 180ms ease;
}

:global([dir="rtl"]) .tracker-marker {
  transform: translateX(50%);
}

@media (prefers-reduced-motion: reduce) {
  .tracker-progress,
  .tracker-marker,
  .order-tracker span {
    transition: none;
  }
}
</style>

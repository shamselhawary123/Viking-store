<template>
  <div
    ref="rootRef"
    class="governorate-select"
    :class="{ 'is-open': isOpen }"
  >
    <button
      type="button"
      class="governorate-trigger"
      :class="{ 'is-open': isOpen }"
      :disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      role="combobox"
      @click="toggle"
      @keydown="handleTriggerKeydown"
    >
      <span
        class="min-w-0 flex-1 truncate"
        :class="selectedGovernorate ? 'text-white' : 'text-neutral-500'"
      >
        {{
          selectedGovernorate
            ? localizedName(selectedGovernorate)
            : t("checkout.selectGovernorate")
        }}
      </span>
      <Icon
        name="i-heroicons-chevron-down"
        class="shrink-0 text-lg text-[#CF1D1D] transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="governorate-panel"
        @click.stop
        @wheel.stop
        @touchmove.stop
      >
        <div class="governorate-search-wrap">
          <input
            ref="searchRef"
            v-model="search"
            type="search"
            class="governorate-search"
            :placeholder="t('checkout.searchGovernorates')"
            @keydown="handleSearchKeydown"
          />
        </div>

        <div
          role="listbox"
          class="governorate-options"
          @wheel.stop
          @touchmove.stop
        >
          <button
            v-for="(governorate, index) in filteredGovernorates"
            :key="governorate.code"
            type="button"
            role="option"
            class="governorate-option"
            :class="{
              'is-active': governorate.code === selectedCode,
              'is-highlighted': index === highlightedIndex,
            }"
            :aria-selected="governorate.code === selectedCode"
            @click="selectGovernorate(governorate)"
            @mouseenter="highlightedIndex = index"
          >
            {{ localizedName(governorate) }}
          </button>

          <p
            v-if="!filteredGovernorates.length"
            class="px-3 py-4 text-sm text-neutral-500"
          >
            {{ t("checkout.noGovernorateFound") }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";

type Governorate = {
  code: string;
  name_ar: string;
  name_en: string;
};

const props = defineProps<{
  governorates: Governorate[];
  disabled?: boolean;
}>();

const selectedCode = defineModel<string>({ default: "" });
const { locale, t } = useI18n();
const rootRef = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const search = ref("");
const highlightedIndex = ref(0);

const localizedName = (governorate: Governorate) =>
  locale.value === "ar" ? governorate.name_ar : governorate.name_en;

const selectedGovernorate = computed(() =>
  props.governorates.find((item) => item.code === selectedCode.value),
);

const filteredGovernorates = computed(() => {
  const query = search.value.trim().toLocaleLowerCase();
  if (!query) return props.governorates.filter((item) => item.code);

  return props.governorates.filter((item) =>
    localizedName(item).toLocaleLowerCase().includes(query),
  );
});

const open = async () => {
  if (props.disabled) return;

  isOpen.value = true;
  highlightedIndex.value = Math.max(
    filteredGovernorates.value.findIndex(
      (item) => item.code === selectedCode.value,
    ),
    0,
  );
  await nextTick();
  searchRef.value?.focus();
};

const close = () => {
  isOpen.value = false;
  search.value = "";
};

const toggle = () => {
  if (isOpen.value) close();
  else open();
};

const moveHighlight = (step: number) => {
  const count = filteredGovernorates.value.length;
  if (!count) return;

  highlightedIndex.value = (highlightedIndex.value + step + count) % count;
};

const selectHighlighted = () => {
  const governorate = filteredGovernorates.value[highlightedIndex.value];
  if (governorate) selectGovernorate(governorate);
};

const selectGovernorate = (governorate: Governorate) => {
  selectedCode.value = governorate.code;
  close();
};

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    open();
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    open();
    moveHighlight(1);
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    open();
    moveHighlight(-1);
  }
};

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveHighlight(1);
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    moveHighlight(-1);
  }
  if (event.key === "Enter") {
    event.preventDefault();
    selectHighlighted();
  }
};

const handleDocumentClick = (event: MouseEvent) => {
  if (!rootRef.value?.contains(event.target as Node)) close();
};

watch(isOpen, (openState) => {
  if (openState) document.addEventListener("click", handleDocumentClick);
  else document.removeEventListener("click", handleDocumentClick);
});

watch(filteredGovernorates, () => {
  highlightedIndex.value = 0;
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
.governorate-select {
  position: relative;
}

.governorate-select.is-open {
  z-index: 90;
}

.governorate-trigger {
  display: flex;
  min-height: 3.75rem;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.42);
  padding: 0 1rem;
  text-align: start;
  font-weight: 800;
  outline: none;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.governorate-trigger:hover,
.governorate-trigger:focus,
.governorate-trigger.is-open {
  border-color: #cf1d1d;
  box-shadow: 0 0 0 4px rgba(207, 29, 29, 0.12);
}

.governorate-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.governorate-panel {
  position: absolute;
  z-index: 80;
  inset-inline: 0;
  top: calc(100% + 0.5rem);
  overflow: hidden;
  max-height: 20rem;
  border-radius: 1rem;
  border: 1px solid rgba(207, 29, 29, 0.35);
  background: #080808;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
}

.governorate-search-wrap {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #080808;
  padding: 0.5rem;
}

.governorate-search {
  min-height: 2.75rem;
  width: 100%;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  padding: 0 0.875rem;
  color: #fff;
  outline: none;
  text-align: start;
}

.governorate-search:focus {
  border-color: rgba(207, 29, 29, 0.75);
}

.governorate-options {
  max-height: 16rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 0.5rem 0.5rem;
  touch-action: pan-y;
}

.governorate-option {
  display: block;
  width: 100%;
  border-radius: 0.8rem;
  padding: 0.75rem 0.875rem;
  text-align: start;
  font-weight: 800;
  color: #d4d4d4;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.governorate-option:hover,
.governorate-option.is-highlighted {
  background: rgba(207, 29, 29, 0.12);
  color: #ffffff;
}

.governorate-option.is-active {
  background: rgba(207, 29, 29, 0.2);
  color: #ffffff;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}
</style>

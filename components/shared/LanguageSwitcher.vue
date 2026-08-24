<template>
  <div class="language-switcher" :aria-label="t('language.label')">
    <button
      v-for="option in localeOptions"
      :key="option.code"
      type="button"
      class="language-option"
      :class="{ active: locale === option.code }"
      @click="switchLocale(option.code)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, setLocale, t } = useI18n();
const localeCookie = useCookie<"en" | "ar">("viking_locale", {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
});

const localeOptions = [
  { code: "en" as const, label: "EN" },
  { code: "ar" as const, label: "عربي" },
];

const switchLocale = async (code: "en" | "ar") => {
  localeCookie.value = code;
  await setLocale(code);
};
</script>

<style scoped>
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.045);
  padding: 0.2rem;
}

.language-option {
  cursor: pointer;
  min-height: 2.35rem;
  border-radius: 9999px;
  padding: 0 0.75rem;
  color: #d4d4d4;
  font-size: 0.72rem;
  font-weight: 900;
  transition:
    background-color 180ms ease,
    color 180ms ease;
}

.language-option.active {
  background: #cf1d1d;
  color: #fff;
}
</style>

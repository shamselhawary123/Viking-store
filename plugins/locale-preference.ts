export default defineNuxtPlugin(async () => {
  const savedLocale = useCookie<"en" | "ar">("viking_locale").value;

  if (savedLocale !== "en" && savedLocale !== "ar") {
    return;
  }

  const { $i18n } = useNuxtApp();

  if ($i18n.locale.value !== savedLocale) {
    await $i18n.setLocale(savedLocale);
  }
});

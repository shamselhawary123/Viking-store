export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp();

  // Wait until plugins load
  await nuxtApp.hook("app:mounted", async () => {
    const authStore = useAuthStore();

    await authStore.getUser();
  });
});

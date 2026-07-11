export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp();

  // Wait until plugins load
  await nuxtApp.hook("app:mounted", async () => {
    const authStore = useAuthStore(usePinia());

    await authStore.getUser();
  });
});

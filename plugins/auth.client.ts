export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp();

  // Wait until plugins load
  await nuxtApp.hook("app:mounted", async () => {
    const supabase = useSupabase();
    const adminAccess = useAdminAccess();
    const authStore = useAuthStore(usePinia());

    supabase.auth.onAuthStateChange((_event, session) => {
      adminAccess.clearOnSessionChange(session?.user?.id ?? null);
    });

    await authStore.getUser();
  });
});

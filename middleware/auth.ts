export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();

  await authStore.getUser();

  if (!authStore.user) {
    return navigateTo("/auth/login");
  }
});

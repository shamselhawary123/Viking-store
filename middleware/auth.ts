export default defineNuxtRouteMiddleware(async () => {
  if (process.server) {
    return navigateTo("/auth/login");
  }

  const supabase = useSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return navigateTo("/auth/login");
  }
});

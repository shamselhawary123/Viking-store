export default defineNuxtRouteMiddleware(async () => {
  if (process.server) {
    return;
  }

  const supabase = useSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return navigateTo("/");
  }
});

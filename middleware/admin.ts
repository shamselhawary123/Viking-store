import { isAdminProfile } from "../utils/admin";

export default defineNuxtRouteMiddleware(async () => {
  if (process.server) {
    return;
  }

  const supabase = useSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return navigateTo("/admin/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !isAdminProfile(profile)) {
    await supabase.auth.signOut();
    return navigateTo("/admin/login");
  }
});

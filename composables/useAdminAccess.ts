import {
  clearAdminAccessOnSessionChange,
  clearAdminAccessState,
  createInitialAdminAccessState,
  markAdminAccessAllowed,
  verifyAdminAccessWithCache,
} from "../utils/adminClientAccess";

export const useAdminAccess = () => {
  const state = useState("admin-access", createInitialAdminAccessState);
  const supabase = useSupabase();

  const verify = () =>
    verifyAdminAccessWithCache(state.value, async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) return { status: "error", userId: null };
      if (!user) return { status: "anonymous", userId: null };

      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

      if (adminError) return { status: "error", userId: user.id };

      return isAdmin === true
        ? { status: "admin", userId: user.id }
        : { status: "non_admin", userId: user.id };
    });

  return {
    state,
    verify,
    markAllowed: (userId: string) => markAdminAccessAllowed(state.value, userId),
    clear: () => clearAdminAccessState(state.value),
    clearOnSessionChange: (userId: string | null) =>
      clearAdminAccessOnSessionChange(state.value, userId),
  };
};

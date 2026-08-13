export const ADMIN_USER_ROLES = ["customer", "admin"] as const;

export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number];
export type AdminUserAction = "list" | "suspend" | "reactivate" | "delete";

export const filterAdminUsers = <T extends Record<string, any>>(users: T[], search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return users;

  return users.filter((user) =>
    [user.full_name, user.email, user.phone]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  );
};

export const getAdminUserState = (
  user: Record<string, any>,
  now = new Date(),
) => {
  if (!user.banned_until) return "Active";

  return new Date(user.banned_until) > now ? "Suspended" : "Active";
};

export const canRunAdminUserAction = (
  currentUserId: string | null | undefined,
  targetUserId: string,
  action: AdminUserAction,
) => {
  if ((action === "suspend" || action === "delete") && currentUserId === targetUserId) {
    return false;
  }

  return true;
};

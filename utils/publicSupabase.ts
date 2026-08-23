export const createPublicSupabaseReadOptions = (storageKey: string) => ({
  auth: {
    storageKey,
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
}) as const;

export const publicSupabaseReadOptions = createPublicSupabaseReadOptions(
  "viking-store-public-readonly",
);

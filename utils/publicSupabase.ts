export const publicSupabaseReadOptions = {
  auth: {
    storageKey: "viking-store-public-readonly",
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
} as const;

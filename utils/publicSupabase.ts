import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_PUBLIC_READONLY_STORAGE_KEY = "viking-store-public-readonly";
const browserPublicSupabaseClients = new Map<string, SupabaseClient>();

export const createPublicSupabaseReadOptions = (storageKey: string) => ({
  auth: {
    storageKey,
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
}) as const;

export const publicSupabaseReadOptions = createPublicSupabaseReadOptions(
  DEFAULT_PUBLIC_READONLY_STORAGE_KEY,
);

export const getPublicSupabaseClient = (
  supabaseUrl: string,
  supabaseKey: string,
  storageKey = DEFAULT_PUBLIC_READONLY_STORAGE_KEY,
) => {
  const options = createPublicSupabaseReadOptions(storageKey);

  if (!import.meta.client) {
    return createClient(supabaseUrl, supabaseKey, options);
  }

  const cacheKey = `${supabaseUrl}:${supabaseKey}:${storageKey}`;
  const cachedClient = browserPublicSupabaseClients.get(cacheKey);

  if (cachedClient) return cachedClient;

  const client = createClient(supabaseUrl, supabaseKey, options);
  browserPublicSupabaseClients.set(cacheKey, client);

  return client;
};

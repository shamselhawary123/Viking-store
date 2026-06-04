export const useSupabase = () => {
  const nuxtApp = useNuxtApp();

  return nuxtApp.$supabase;
};

import { createBrowserClient } from "@supabase/ssr";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const supabase = createBrowserClient(
    String(config.public.supabaseUrl || ""),
    String(config.public.supabaseKey || ""),
    {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
      },
    },
  );

  return {
    provide: {
      supabase,
    },
  };
});

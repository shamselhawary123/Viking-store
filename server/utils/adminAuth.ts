import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { H3Event } from "h3";
import { getHeader, setCookie, setHeader } from "h3";
import { useRuntimeConfig } from "#imports";

type AdminAuthStatus = "anonymous" | "non_admin" | "admin" | "error";

type AdminAuthResult = {
  status: AdminAuthStatus;
  userId?: string;
};

type AdminAuthEventContext = H3Event["context"] & {
  adminRequestSupabaseClient?: SupabaseClient;
};

export const createAdminRequestSupabaseClient = (event: H3Event) => {
  const context = event.context as AdminAuthEventContext;
  if (context.adminRequestSupabaseClient) return context.adminRequestSupabaseClient;

  const config = useRuntimeConfig(event);
  const supabaseUrl = String(config.public.supabaseUrl || "");
  const supabaseKey = String(config.public.supabaseKey || "");

  context.adminRequestSupabaseClient = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => parseCookieHeader(getHeader(event, "Cookie") ?? ""),
      setAll: (cookies, headers = {}) => {
        for (const { name, value, options } of cookies) {
          setCookie(event, name, value, options);
        }

        for (const [name, value] of Object.entries(headers)) {
          setHeader(event, name, value);
        }
      },
    },
    cookieOptions: {
      path: "/",
      sameSite: "lax",
    },
  });

  return context.adminRequestSupabaseClient;
};

export const authorizeAdminRequest = async (
  event: H3Event,
): Promise<AdminAuthResult> => {
  try {
    const supabase = createAdminRequestSupabaseClient(event);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { status: "anonymous" };

    const { data: isAdmin, error } = await supabase.rpc("is_admin");

    if (error) {
      console.error("[admin-auth] is_admin RPC failed", {
        userId: user.id,
        message: error.message,
      });
      return { status: "error", userId: user.id };
    }

    return isAdmin === true
      ? { status: "admin", userId: user.id }
      : { status: "non_admin", userId: user.id };
  } catch (error) {
    console.error("[admin-auth] authorization check failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return { status: "error" };
  }
};

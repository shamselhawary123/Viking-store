import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const requiredEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const supabaseAnonKey = requiredEnv("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = req.headers.get("Authorization") || "";

    if (!authorization.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing authorization token" }, 401);
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { data: isAdmin, error: adminCheckError } = await callerClient.rpc("is_admin");
    if (adminCheckError || isAdmin !== true) {
      return jsonResponse({ error: "Admin access required" }, 403);
    }

    const { action, userId } = await req.json();
    if (!["list", "suspend", "reactivate", "delete"].includes(action)) {
      return jsonResponse({ error: "Unsupported action" }, 400);
    }

    if (action === "list") {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (error) throw error;

      return jsonResponse({
        users: data.users.map((user) => ({
          id: user.id,
          banned_until: user.banned_until || null,
        })),
      });
    }

    if (!userId || typeof userId !== "string") {
      return jsonResponse({ error: "userId is required" }, 400);
    }

    if ((action === "suspend" || action === "delete") && userId === caller.id) {
      return jsonResponse({ error: "You cannot suspend or delete your own admin account" }, 400);
    }

    if (action === "suspend") {
      const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: "876000h",
      });

      if (error) throw error;
      return jsonResponse({ user: { id: data.user.id, banned_until: data.user.banned_until || null } });
    }

    if (action === "reactivate") {
      const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });

      if (error) throw error;
      return jsonResponse({ user: { id: data.user.id, banned_until: data.user.banned_until || null } });
    }

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteUserError) throw deleteUserError;

    const { error: deleteProfileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (deleteProfileError) throw deleteProfileError;

    return jsonResponse({ deleted: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unable to manage user" },
      500,
    );
  }
});

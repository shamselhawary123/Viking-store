import { createError, getHeader, getQuery, setHeader } from "h3";
import { createClient } from "@supabase/supabase-js";

const PROOF_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabaseUrl = String(config.public.supabaseUrl || "");
  const anonKey = String(config.public.supabaseKey || "");
  const serviceKey = String(config.supabaseServiceRoleKey || "");
  const authorization = getHeader(event, "authorization") || "";
  const proofId = String(getQuery(event).proof_id || "");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    throw createError({ statusCode: 500, statusMessage: "Admin proof access is not configured." });
  }

  if (!authorization.startsWith("Bearer ") || !PROOF_ID_PATTERN.test(proofId)) {
    throw createError({ statusCode: 403, statusMessage: "Admin access required." });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: isAdmin, error: adminError } = await userClient.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    throw createError({ statusCode: 403, statusMessage: "Admin access required." });
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: proof, error: proofError } = await adminClient
    .from("payment_proofs")
    .select("storage_path")
    .eq("id", proofId)
    .single();

  if (proofError || !proof?.storage_path) {
    throw createError({ statusCode: 404, statusMessage: "Payment proof is unavailable." });
  }

  const { data, error } = await adminClient.storage
    .from("payment-proofs")
    .createSignedUrl(proof.storage_path, 300);

  if (error || !data?.signedUrl) {
    throw createError({ statusCode: 404, statusMessage: "Payment proof is unavailable." });
  }

  setHeader(event, "Cache-Control", "private, no-store");

  return { ok: true, signedUrl: data.signedUrl };
});

import { createHash, randomUUID } from "node:crypto";
import { createError, getHeader, readMultipartFormData } from "h3";
import { createClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 4194304;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ORDER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const hasValidImageSignature = (data: Buffer, type: string) => {
  if (type === "image/png") {
    return data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (type === "image/jpeg") {
    return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  }

  if (type === "image/webp") {
    return data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP";
  }

  return false;
};

const extensionForType = (type: string) => {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabaseUrl = String(config.public.supabaseUrl || "");
  const anonKey = String(config.public.supabaseKey || "");
  const serviceKey = String(config.supabaseServiceRoleKey || "");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    throw createError({ statusCode: 500, statusMessage: "Payment proof upload is not configured." });
  }

  const form = await readMultipartFormData(event);
  const fields = new Map((form || []).map((part) => [part.name || "", part]));
  const orderId = fields.get("order_id")?.data.toString("utf8").trim() || "";
  const accessToken = fields.get("access_token")?.data.toString("utf8").trim() || "";
  const transactionReference = (fields.get("transaction_reference")?.data.toString("utf8").trim() || "").slice(0, 120);
  const proof = fields.get("proof");
  const authorization = getHeader(event, "authorization") || "";
  const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!orderId || !ORDER_ID_PATTERN.test(orderId) || !proof?.data?.length) {
    throw createError({ statusCode: 400, statusMessage: "Payment proof details are required." });
  }

  const contentType = String(proof.type || "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw createError({ statusCode: 400, statusMessage: "Upload a PNG, JPG, or WEBP image." });
  }

  if (proof.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: "Payment proof image must be 4 MB or smaller." });
  }

  if (!hasValidImageSignature(proof.data, contentType)) {
    throw createError({ statusCode: 400, statusMessage: "Payment proof image is invalid." });
  }

  let authenticatedUserId: string | null = null;

  if (bearerToken) {
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await userClient.auth.getUser(bearerToken);
    authenticatedUserId = data.user?.id || null;
  }

  if (!accessToken && !authenticatedUserId) {
    throw createError({ statusCode: 403, statusMessage: "Payment proof access is invalid." });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const proofId = randomUUID();
  const path = `orders/${orderId}/${proofId}.${extensionForType(contentType)}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(path, proof.data, { contentType, upsert: false });

  if (uploadError) {
    console.error("Payment proof upload failed", { orderId, message: uploadError.message });
    throw createError({ statusCode: 400, statusMessage: "Payment proof upload failed." });
  }

  const { data, error } = await supabase.rpc("register_instapay_payment_proof", {
    p_order_id: orderId,
    p_access_token: accessToken,
    p_storage_path: path,
    p_transaction_reference: transactionReference || null,
    p_authenticated_user_id: authenticatedUserId,
  });

  if (error) {
    await supabase.storage.from("payment-proofs").remove([path]);
    console.error("Payment proof registration failed", { orderId, code: error.code });
    throw createError({ statusCode: 400, statusMessage: "Payment proof could not be submitted." });
  }

  return {
    ok: true,
    proofId: data?.proof_id || proofId,
    checksum: createHash("sha256").update(proof.data).digest("hex"),
  };
});

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

const migrationName = readdirSync("supabase/migrations").find((file) =>
  /instapay_payments\.sql$/.test(file),
);
const sql = migrationName ? readFileSync(`supabase/migrations/${migrationName}`, "utf8") : "";
const pgcryptoSearchPathMigration = "supabase/migrations/20260830213000_fix_pgcrypto_search_path.sql";
const pgcryptoSearchPathSql = existsSync(pgcryptoSearchPathMigration)
  ? readFileSync(pgcryptoSearchPathMigration, "utf8")
  : "";
const checkoutPage = readFileSync("pages/checkout.vue", "utf8");
const checkoutOrder = readFileSync("utils/checkoutOrder.ts", "utf8");
const paymentPage = readFileSync("pages/payments/instapay/[orderId].vue", "utf8");
const adminLayout = readFileSync("layouts/admin.vue", "utf8");
const adminOrders = readFileSync("pages/admin/orders.vue", "utf8");
const productPage = readFileSync("pages/shop/[slug].vue", "utf8");
const nuxtConfig = readFileSync("nuxt.config.ts", "utf8");
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

const extractFunction = (name) => {
  const match = sql.match(
    new RegExp(`create or replace function public\\.${name}[\\s\\S]*?\\r?\\nend;\\r?\\n\\$\\$;`, "i"),
  );
  return match?.[0] || "";
};
const migrationPreamble = sql.split("create or replace function public.save_admin_payment_settings")[0] || sql;

describe("InstaPay payment migration", () => {
  it("persists pgcrypto search_path fix for checkout and payment token functions", () => {
    assert.ok(existsSync(pgcryptoSearchPathMigration), "expected pgcrypto search_path migration");
    assert.match(pgcryptoSearchPathSql, /alter function public\.create_checkout_order\(uuid, jsonb, jsonb, text\)\s+set search_path = public, extensions;/i);
    assert.match(pgcryptoSearchPathSql, /alter function public\.get_instapay_payment_order\(uuid, text\)\s+set search_path = public, extensions;/i);
    assert.match(pgcryptoSearchPathSql, /alter function public\.register_instapay_payment_proof\(uuid, text, text, text, uuid\)\s+set search_path = public, extensions;/i);
  });

  it("creates payment settings with safe COD defaults and InstaPay disabled", () => {
    assert.ok(migrationName, "expected instapay payment migration");
    assert.match(sql, /create table if not exists public\.payment_settings/i);
    assert.match(sql, /cod_enabled boolean not null default true/i);
    assert.match(sql, /instapay_enabled boolean not null default false/i);
    assert.match(sql, /instapay_timeout_minutes integer not null default 30/i);
    assert.match(sql, /constraint payment_settings_at_least_one_method check/i);
    assert.match(sql, /constraint payment_settings_instapay_destination_required check/i);
  });

  it("adds private proof storage and proof history metadata", () => {
    assert.match(sql, /create table if not exists public\.payment_proofs/i);
    assert.match(sql, /order_id uuid not null references public\.orders\(id\) on delete cascade/i);
    assert.match(sql, /status text not null default 'submitted'/i);
    assert.match(sql, /transaction_reference text/i);
    assert.match(sql, /rejection_reason text/i);
    assert.match(sql, /insert into storage\.buckets[\s\S]*'payment-proofs'[\s\S]*false/i);
    assert.match(sql, /'payment-proofs'[\s\S]*4194304[\s\S]*array\['image\/png', 'image\/jpeg', 'image\/webp'\]/i);
    assert.doesNotMatch(sql, /payment-proofs'[\s\S]{0,120}true/i);
  });

  it("extends order payment state without rewriting historical orders", () => {
    assert.match(sql, /alter table public\.orders\s+add column if not exists payment_expires_at timestamptz/i);
    assert.match(sql, /alter table public\.orders\s+add column if not exists payment_access_token_hash text/i);
    assert.match(sql, /alter table public\.orders\s+add column if not exists payment_rejection_reason text/i);
    assert.match(sql, /alter table public\.orders\s+add column if not exists instapay_account_name text/i);
    assert.match(sql, /alter table public\.orders\s+add column if not exists instapay_id text/i);
    assert.match(sql, /alter table public\.orders\s+add column if not exists instapay_payment_link text/i);
    assert.match(sql, /alter table public\.orders\s+add column if not exists instapay_qr_path text/i);
    assert.doesNotMatch(migrationPreamble, /update public\.orders\s+set payment_method/i);
    assert.doesNotMatch(migrationPreamble, /update public\.orders\s+set payment_status/i);
  });

  it("keeps create_checkout_order authoritative while adding payment method handling", () => {
    const createOrder = extractFunction("create_checkout_order");
    assert.match(createOrder, /v_payment_method text := lower\(coalesce\(nullif\(btrim\(p_customer->>'payment_method'\), ''\), 'cash'\)\)/i);
    assert.match(createOrder, /from public\.payment_settings[\s\S]*where id = true/i);
    assert.doesNotMatch(createOrder, /from public\.payment_settings[\s\S]*where id = true[\s\S]{0,80}for update/i);
    assert.match(createOrder, /if v_payment_method = 'cash' and settings\.cod_enabled = false/i);
    assert.match(createOrder, /if v_payment_method = 'instapay' and settings\.instapay_enabled = false/i);
    assert.match(createOrder, /instapay_account_name[\s\S]*settings\.instapay_account_name/i);
    assert.match(createOrder, /instapay_qr_path[\s\S]*settings\.instapay_qr_path/i);
    assert.match(createOrder, /v_payment_status := case when v_payment_method = 'instapay' then 'awaiting_payment' else 'unpaid' end/i);
    assert.match(createOrder, /v_payment_access_token := encode\(gen_random_bytes\(32\), 'hex'\)/i);
    assert.match(createOrder, /payment_access_token_hash/i);
    assert.match(createOrder, /payment_expires_at/i);
    assert.match(createOrder, /'payment_access_token', v_payment_access_token/i);
    assert.match(createOrder, /'total_price', v_total/i);
    assert.doesNotMatch(createOrder, /p_customer->>'total/i);
  });

  it("implements race-safe proof submission, admin review, and expiry functions", () => {
    const registerProof = extractFunction("register_instapay_payment_proof");
    const review = extractFunction("admin_review_instapay_payment");
    const expiry = extractFunction("expire_pending_instapay_orders");

    assert.match(registerProof, /p_authenticated_user_id uuid default null/i);
    assert.match(registerProof, /for update/i);
    assert.match(registerProof, /user_id = p_authenticated_user_id/i);
    assert.match(registerProof, /p_storage_path <> 'orders\/' \|\| p_order_id::text \|\| '\/'/i);
    assert.match(registerProof, /left\(nullif\(btrim\(p_transaction_reference\), ''\), 120\)/i);
    assert.match(registerProof, /payment_method <> 'instapay'/i);
    assert.match(registerProof, /v_order\.status = 'cancelled'/i);
    assert.match(registerProof, /payment_status not in \('awaiting_payment', 'rejected'\)/i);
    assert.match(registerProof, /payment_expires_at <= now\(\)/i);
    assert.match(registerProof, /payment_status = 'proof_submitted'/i);

    assert.match(review, /public\.is_admin\(\) is not true/i);
    assert.match(review, /v_order\.status = 'cancelled'/i);
    assert.match(review, /p_action = 'confirm' and v_order\.payment_status = 'expired'/i);
    assert.match(review, /p_action = 'confirm'/i);
    assert.match(review, /payment_status = 'paid'/i);
    assert.match(review, /p_action = 'reject'/i);
    assert.match(review, /payment_status = 'rejected'/i);

    assert.match(expiry, /payment_status in \('awaiting_payment', 'rejected'\)/i);
    assert.match(expiry, /coalesce\(status, ''\) <> 'cancelled'/i);
    assert.match(expiry, /payment_expires_at <= now\(\)/i);
    assert.match(expiry, /for update skip locked/i);
    assert.match(expiry, /payment_status = 'expired'/i);
    assert.match(expiry, /public\.restock_order_variants_for_cancellation\(v_order\.id\)/i);
    assert.match(expiry, /delete from public\.coupon_redemptions[\s\S]*where order_id = v_order\.id/i);
    assert.doesNotMatch(expiry, /'order_cancelled'/i);
  });

  it("uses one cancellation restock helper for admin cancel and InstaPay expiry", () => {
    const helper = extractFunction("restock_order_variants_for_cancellation");
    const adminCancel = extractFunction("admin_update_order_status");
    const expiry = extractFunction("expire_pending_instapay_orders");

    assert.match(helper, /reason[\s\S]*values[\s\S]*'cancelled'/i);
    assert.match(helper, /on conflict \(order_item_id, reason\) do nothing/i);
    assert.match(adminCancel, /public\.restock_order_variants_for_cancellation\(p_order_id\)/i);
    assert.match(expiry, /public\.restock_order_variants_for_cancellation\(v_order\.id\)/i);
    assert.doesNotMatch(helper, /proof_submitted|paid|rejected|awaiting_payment/i);
    assert.doesNotMatch(adminCancel, /payment_status = 'paid'|payment_status = 'proof_submitted'/i);
  });

  it("returns only safe payment order fields and snapshots the original destination", () => {
    const paymentOrder = extractFunction("get_instapay_payment_order");
    const returnedPayload = paymentOrder.split("return jsonb_build_object(")[1] || "";

    assert.doesNotMatch(paymentOrder, /to_jsonb\(v_order\)/i);
    assert.match(paymentOrder, /'order', jsonb_build_object\(/i);
    assert.match(paymentOrder, /'order_number', v_order\.order_number/i);
    assert.match(paymentOrder, /'total_price', v_order\.total_price/i);
    assert.match(paymentOrder, /'payment_rejection_reason', v_order\.payment_rejection_reason/i);
    assert.match(paymentOrder, /'items', v_items/i);
    assert.match(paymentOrder, /jsonb_build_object\([\s\S]*'product_name', item\.product_name[\s\S]*'quantity', item\.quantity/i);
    assert.match(paymentOrder, /'instapay_account_name', v_order\.instapay_account_name/i);
    assert.match(paymentOrder, /'instapay_id', v_order\.instapay_id/i);
    assert.match(paymentOrder, /'instapay_payment_link', v_order\.instapay_payment_link/i);
    assert.match(paymentOrder, /'instapay_qr_path', v_order\.instapay_qr_path/i);
    assert.doesNotMatch(paymentOrder, /coalesce\(v_order\.instapay_account_name, settings\.instapay_account_name\)/i);
    assert.doesNotMatch(paymentOrder, /coalesce\(v_order\.instapay_id, settings\.instapay_id\)/i);
    assert.doesNotMatch(paymentOrder, /coalesce\(v_order\.instapay_payment_link, settings\.instapay_payment_link\)/i);
    assert.doesNotMatch(paymentOrder, /coalesce\(v_order\.instapay_qr_path, settings\.instapay_qr_path\)/i);
    assert.doesNotMatch(returnedPayload, /'phone'|guest_phone|address|guest_address|user_id|payment_access_token_hash/i);
  });

  it("uses explicit grants and keeps internal helpers protected", () => {
    assert.match(sql, /revoke all on function public\.save_admin_payment_settings\(jsonb\) from public/i);
    assert.match(sql, /grant execute on function public\.save_admin_payment_settings\(jsonb\) to authenticated/i);
    assert.match(sql, /revoke execute on function public\.expire_pending_instapay_orders\(integer\) from anon, authenticated/i);
    assert.match(sql, /revoke execute on function public\.register_instapay_payment_proof\(uuid, text, text, text, uuid\) from anon, authenticated/i);
    assert.doesNotMatch(sql, /^grant execute on function public\.register_instapay_payment_proof.*to anon, authenticated;$/im);
    assert.match(sql, /grant execute on function public\.register_instapay_payment_proof\(uuid, text, text, text, uuid\) to service_role/i);
    assert.match(sql, /grant execute on function public\.get_instapay_payment_order\(uuid, text\) to anon, authenticated/i);
    assert.match(sql, /grant execute on function public\.create_checkout_order\(uuid, jsonb, jsonb, text\) to anon, authenticated/i);
  });
});

describe("InstaPay checkout and UI wiring", () => {
  it("passes selected payment method through the existing checkout RPC payload", () => {
    assert.match(checkoutOrder, /paymentMethod\?: "cash" \| "instapay"/);
    assert.match(checkoutOrder, /payment_method: customerData\.paymentMethod \|\| "cash"/);
    assert.match(checkoutPage, /paymentSettings/);
    assert.match(checkoutPage, /selectedPaymentMethod/);
    assert.match(checkoutPage, /checkout\.paymentMethod/);
    assert.match(checkoutPage, /selectedPaymentMethod === "instapay"/);
    assert.match(checkoutPage, /paymentMethod: selectedPaymentMethod\.value/);
    assert.match(checkoutPage, /payments\/instapay/);
  });

  it("adds secure server proof upload without exposing service role publicly", () => {
    assert.ok(existsSync("server/api/payments/instapay/proof.post.ts"));
    const api = readFileSync("server/api/payments/instapay/proof.post.ts", "utf8");
    assert.match(nuxtConfig, /supabaseServiceRoleKey:\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
    assert.doesNotMatch(nuxtConfig, /public:[\s\S]*SUPABASE_SERVICE_ROLE_KEY/);
    assert.match(api, /readMultipartFormData/);
    assert.match(api, /4194304/);
    assert.match(api, /ORDER_ID_PATTERN\.test\(orderId\)/);
    assert.match(api, /\.slice\(0, 120\)/);
    assert.match(api, /getHeader\(event, "authorization"\)/);
    assert.match(api, /auth\.getUser\(bearerToken\)/);
    assert.match(api, /image\/png|image\/jpeg|image\/webp/);
    assert.match(api, /register_instapay_payment_proof/);
    assert.match(api, /p_authenticated_user_id: authenticatedUserId/);
    assert.match(api, /\.storage[\s\S]*\.from\("payment-proofs"\)[\s\S]*\.upload/);
    assert.match(api, /\.storage\.from\("payment-proofs"\)\.remove/);
    assert.doesNotMatch(api, /statusMessage:\s*uploadError\.message|statusMessage:\s*error\.message/);
    assert.match(paymentPage, /file\.size > 4 \* 1024 \* 1024/);
    assert.match(paymentPage, /supabase\.auth\.getSession\(\)/);
    assert.match(paymentPage, /Authorization: `Bearer \$\{sessionData\.session\.access_token\}`/);
  });

  it("signs admin proof URLs from a DB-owned proof id instead of a client path", () => {
    assert.ok(existsSync("server/api/admin/payments/proof-url.get.ts"));
    const api = readFileSync("server/api/admin/payments/proof-url.get.ts", "utf8");

    assert.match(api, /getHeader\(event, "authorization"\)/);
    assert.match(api, /rpc\("is_admin"\)/);
    assert.match(api, /PROOF_ID_PATTERN\.test\(proofId\)/);
    assert.match(api, /\.from\("payment_proofs"\)[\s\S]*\.select\("storage_path"\)[\s\S]*\.eq\("id", proofId\)[\s\S]*\.single\(\)/);
    assert.match(api, /createSignedUrl\(proof\.storage_path, 300\)/);
    assert.match(api, /setHeader\(event, "Cache-Control", "private, no-store"\)/);
    assert.doesNotMatch(api, /getQuery\(event\)\.path|String\(getQuery\(event\)\.path/);
    assert.doesNotMatch(api, /statusMessage:\s*error\.message|statusMessage:\s*adminError\.message/);
    assert.match(adminOrders, /query: \{ proof_id: proof\.id \}/);
    assert.doesNotMatch(adminOrders, /query: \{ path: proof\.storage_path \}/);
  });

  it("adds payment pages, admin settings, admin review actions, and WhatsApp utility", () => {
    assert.ok(existsSync("pages/payments/instapay/[orderId].vue"));
    assert.ok(existsSync("pages/admin/payment-settings.vue"));
    assert.ok(existsSync("utils/whatsapp.ts"));
    assert.match(adminLayout, /admin\.paymentSettings/);
    assert.match(adminLayout, /\/admin\/payment-settings/);
    assert.match(adminOrders, /payment_proofs/);
    assert.match(adminOrders, /admin_review_instapay_payment/);
    assert.match(adminOrders, /proofViewer/);
    assert.match(productPage, /buildProductWhatsAppLink/);
    assert.match(productPage, /shop\.askWhatsapp/);
  });

  it("defines required localized payment strings", () => {
    assert.equal(en.checkout.payWithInstapay, "Pay with InstaPay");
    assert.equal(ar.checkout.payWithInstapay, "الدفع عبر InstaPay");
    assert.equal(en.payments.requiredAmount, "Required amount");
    assert.equal(ar.payments.requiredAmount, "المبلغ المطلوب");
    assert.match(en.payments.proofRules, /4 MB/);
    assert.match(ar.payments.proofRules, /4 MB/);
    assert.equal(en.admin.paymentSettings, "Payment Settings");
    assert.equal(ar.admin.paymentSettings, "إعدادات الدفع");
  });
});

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";

const migrationName = readdirSync("supabase/migrations").find((file) =>
  /shipping_rules\.sql$/.test(file),
);
const sql = migrationName
  ? readFileSync(`supabase/migrations/${migrationName}`, "utf8")
  : "";
const checkoutPage = readFileSync("pages/checkout.vue", "utf8");
const checkoutOrder = readFileSync("utils/checkoutOrder.ts", "utf8");
const adminLayout = readFileSync("layouts/admin.vue", "utf8");
const adminOrders = readFileSync("pages/admin/orders.vue", "utf8");
const en = JSON.parse(readFileSync("locales/en.json", "utf8"));
const ar = JSON.parse(readFileSync("locales/ar.json", "utf8"));

const extractFunction = (name) => {
  const match = sql.match(
    new RegExp(
      `create or replace function public\\.${name}[\\s\\S]*?\\nend;\\n\\$\\$;`,
      "i",
    ),
  );

  return match?.[0] || "";
};

const shippingFunction = extractFunction("calculate_checkout_shipping");
const checkoutFunction = extractFunction("create_checkout_order");

const governorateCodes = [
  "cairo",
  "giza",
  "alexandria",
  "qalyubia",
  "sharqia",
  "dakahlia",
  "gharbia",
  "monufia",
  "beheira",
  "kafr-el-sheikh",
  "damietta",
  "port-said",
  "ismailia",
  "suez",
  "fayoum",
  "beni-suef",
  "minya",
  "assiut",
  "sohag",
  "qena",
  "luxor",
  "aswan",
  "red-sea",
  "new-valley",
  "matrouh",
  "north-sinai",
  "south-sinai",
];

describe("shipping rules migration", () => {
  it("creates additive shipping tables and seeds 27 Egyptian governorates", () => {
    assert.ok(migrationName, "expected shipping rules migration");
    assert.match(sql, /create table if not exists public\.shipping_settings/i);
    assert.match(sql, /create table if not exists public\.shipping_governorates/i);
    assert.match(sql, /alter table public\.orders\s+add column if not exists governorate_code text/i);
    assert.match(sql, /free_shipping_all_orders boolean not null default true/i);
    assert.match(sql, /free_shipping_threshold_enabled boolean not null default false/i);
    assert.match(sql, /shipping_enabled boolean not null default true/i);

    for (const code of governorateCodes) {
      assert.match(sql, new RegExp(`'${code}'`, "i"), `missing ${code}`);
    }
    assert.equal(new Set(governorateCodes).size, 27);
  });

  it("implements authoritative shipping priority and rejects unavailable rates", () => {
    assert.match(sql, /create or replace function public\.calculate_checkout_shipping/i);
    assert.match(sql, /shipping_enabled = false/i);
    assert.match(sql, /free_shipping_all_orders = true/i);
    assert.match(sql, /free_shipping_threshold_enabled = true[\s\S]*v_merchandise_total >= settings\.free_shipping_threshold/i);
    assert.match(sql, /coalesce\(governorate\.shipping_fee, settings\.default_shipping_fee\)/i);
    assert.match(sql, /shipping rate unavailable/i);
    assert.match(sql, /governorate\.is_enabled = false/i);
    assert.match(sql, /greatest\(coalesce\(p_subtotal, 0\) - coalesce\(p_discount, 0\), 0\)/i);
  });

  it("validates supplied governorates before any free-shipping branch", () => {
    const missingAllowed = shippingFunction.indexOf("settings.free_shipping_all_orders = true and v_code is null");
    const governorateLookup = shippingFunction.indexOf("from public.shipping_governorates");
    const invalidRejected = shippingFunction.indexOf("governorate.is_enabled = false");
    const freeAllApplied = shippingFunction.indexOf("settings.free_shipping_all_orders = true then");
    const thresholdApplied = shippingFunction.indexOf("settings.free_shipping_threshold_enabled = true");

    assert.ok(missingAllowed > -1, "free-all missing governorate rollout branch is missing");
    assert.ok(governorateLookup > missingAllowed, "supplied governorate lookup must happen after missing rollout branch");
    assert.ok(invalidRejected > governorateLookup, "invalid/disabled governorates must be rejected");
    assert.ok(freeAllApplied > invalidRejected, "free-all must apply only after supplied governorate validation");
    assert.ok(thresholdApplied > invalidRejected, "threshold must apply only after mandatory governorate validation");
    assert.match(shippingFunction, /if v_code is null then[\s\S]*Select a governorate/i);
  });

  it("documents free shipping governorate validation edge cases", () => {
    assert.match(shippingFunction, /settings\.free_shipping_all_orders = true and v_code is null[\s\S]*shipping_cost', 0/i);
    assert.match(shippingFunction, /where code = v_code[\s\S]*if not found or governorate\.is_enabled = false/i);
    assert.match(shippingFunction, /settings\.free_shipping_threshold_enabled = true[\s\S]*v_merchandise_total >= settings\.free_shipping_threshold/i);
    assert.ok(
      shippingFunction.indexOf("if v_code is null then") <
        shippingFunction.indexOf("settings.free_shipping_threshold_enabled = true"),
      "threshold cannot bypass missing governorate validation when free-all is disabled",
    );
  });

  it("adds secure preview and admin save RPCs with explicit grants", () => {
    assert.match(sql, /create or replace function public\.preview_checkout_totals/i);
    assert.match(sql, /create or replace function public\.save_admin_shipping_settings/i);
    assert.match(sql, /public\.is_admin\(\) is not true/i);
    assert.match(sql, /grant execute on function public\.preview_checkout_totals\(jsonb, text, text\) to anon, authenticated/i);
    assert.match(sql, /grant execute on function public\.save_admin_shipping_settings\(jsonb, jsonb\) to authenticated/i);
    assert.match(sql, /revoke execute on function public\.calculate_checkout_shipping\(numeric, numeric, text\) from anon, authenticated/i);
    assert.doesNotMatch(sql, /grant .*shipping_settings .* to anon/i);
    assert.doesNotMatch(sql, /grant .*shipping_governorates .* to anon/i);
  });

  it("keeps checkout RPC authoritative and includes shipping in final total", () => {
    assert.match(sql, /drop function if exists public\.create_checkout_order\(uuid, jsonb, jsonb, text\);/i);
    assert.match(sql, /create or replace function public\.create_checkout_order/i);
    assert.match(sql, /v_governorate_code text/i);
    assert.match(sql, /public\.calculate_checkout_shipping\(v_subtotal, v_discount, v_governorate_code\)/i);
    assert.match(sql, /v_total := round\(greatest\(v_subtotal - v_discount, 0\) \+ v_shipping_cost, 2\)/i);
    assert.match(sql, /governorate_code/i);
    assert.match(sql, /case when v_is_guest then null else v_user_id end/i);
    assert.doesNotMatch(sql, /p_customer->>'shipping_cost'/i);
  });

  it("persists only the validated governorate code returned by shipping calculation", () => {
    assert.match(checkoutFunction, /v_validated_governorate_code text/i);
    assert.match(checkoutFunction, /v_validated_governorate_code := nullif\(v_shipping_result->>'governorate_code', ''\)/i);
    assert.match(checkoutFunction, /v_shipping_cost,[\s\S]*v_validated_governorate_code,[\s\S]*v_discount/i);
    assert.doesNotMatch(checkoutFunction, /v_shipping_cost,\s*\n\s*v_governorate_code,\s*\n\s*v_discount/i);
  });

  it("validates admin shipping rates before paid shipping can be enabled", () => {
    assert.match(sql, /shipping fee cannot be negative/i);
    assert.match(sql, /free shipping threshold must be greater than zero/i);
    assert.match(sql, /default shipping fee cannot be negative/i);
    assert.match(sql, /enabled governorates need a shipping fee or default fee/i);
  });
});

describe("shipping checkout and admin wiring", () => {
  it("passes governorate code through checkout and previews authoritative totals", () => {
    assert.match(checkoutOrder, /governorateCode/);
    assert.match(checkoutOrder, /governorate_code: customerData\.governorateCode/);
    assert.match(checkoutPage, /shippingGovernorates/);
    assert.match(checkoutPage, /preview_checkout_totals/);
    assert.match(checkoutPage, /selectedGovernorateCode/);
    assert.match(checkoutPage, /checkout\.selectGovernorate/);
    assert.match(checkoutPage, /shippingPreview/);
    assert.match(checkoutPage, /shippingRequired/);
    assert.match(checkoutPage, /if \(!selectedGovernorateCode\.value\)[\s\S]*checkout\.governorateRequired/);
  });

  it("adds admin shipping settings and order governorate display", () => {
    assert.match(adminLayout, /admin\.shippingSettings/);
    assert.match(adminLayout, /\/admin\/shipping/);
    assert.match(adminOrders, /governorate_code/);
    assert.match(adminOrders, /admin\.governorate/);
    assert.match(adminOrders, /shipping_governorates/);
    assert.match(adminOrders, /selectedGovernorateName/);

    const adminShippingPage = readFileSync("pages/admin/shipping.vue", "utf8");
    assert.match(adminShippingPage, /save_admin_shipping_settings/);
    assert.match(adminShippingPage, /shipping_settings/);
    assert.match(adminShippingPage, /shipping_governorates/);
    assert.match(adminShippingPage, /saving/);
  });

  it("defines required English and Arabic shipping strings", () => {
    assert.equal(en.checkout.governorate, "Governorate");
    assert.equal(ar.checkout.governorate, "المحافظة");
    assert.equal(en.checkout.selectGovernorate, "Select governorate");
    assert.equal(ar.checkout.selectGovernorate, "اختر المحافظة");
    assert.equal(en.admin.shippingSettings, "Shipping Settings");
    assert.equal(ar.admin.shippingSettings, "إعدادات الشحن");
    assert.equal(en.admin.defaultShippingFee, "Default shipping fee");
    assert.equal(ar.admin.defaultShippingFee, "سعر الشحن الافتراضي");
  });
});

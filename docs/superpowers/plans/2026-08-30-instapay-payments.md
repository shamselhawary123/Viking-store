# Viking Store InstaPay Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-safe Cash on Delivery and InstaPay payments while preserving existing checkout, shipping, coupon, and variant inventory behavior.

**Architecture:** Keep `create_checkout_order(uuid,jsonb,jsonb,text)` as the authoritative checkout RPC and add payment method to `p_customer`. Add one later migration for payment settings, private proof metadata, payment state transitions, expiry, and admin review RPCs. Use a Nuxt server API for private proof upload so service-role credentials stay server-only.

**Tech Stack:** Nuxt 3, Vue 3, Supabase Postgres/RPC/Storage, Pinia, existing i18n.

**Spec:** User-approved pasted task: `C:/Users/le/.codex/attachments/935a586d-f738-4ed2-96b1-118c4e15707a/pasted-text.txt`

## Global Constraints

- Preserve COD default behavior; InstaPay remains disabled after migration until configured.
- Do not expose service-role credentials in browser code or `runtimeConfig.public`.
- Do not run `nuxt build`.
- Do not apply SQL live or deploy.
- Browser prices, discounts, shipping, and payment amount are not authoritative.
- Support guest and authenticated checkout without changing auth/session behavior.

---

### Task 1: Payment SQL Foundation

**Files:**
- Create: `supabase/migrations/20260830120000_instapay_payments.sql`
- Test: `tests/instapay-payments.test.mjs`

**Interfaces:**
- Produces: `payment_settings`, `payment_proofs`, `save_admin_payment_settings(jsonb)`, `admin_review_instapay_payment(uuid, uuid, text, text)`, `expire_pending_instapay_orders(integer)`.
- Updates: `create_checkout_order(uuid,jsonb,jsonb,text)` JSON return with payment fields.

- [ ] Write failing migration tests for settings defaults, grants, proof table, checkout state, admin review, expiry, and storage bucket configuration.
- [ ] Run `node --test tests/instapay-payments.test.mjs` and verify expected failures.
- [ ] Add migration with additive columns, constraints, RLS, RPCs, revokes/grants, and private bucket insert.
- [ ] Re-run focused payment tests.

### Task 2: Checkout Payment Selection

**Files:**
- Modify: `pages/checkout.vue`
- Modify: `utils/checkoutOrder.ts`
- Modify: `locales/en.json`
- Modify: `locales/ar.json`
- Test: `tests/instapay-payments.test.mjs`

**Interfaces:**
- Consumes: `payment_settings` public select.
- Sends: `p_customer.payment_method = "cash" | "instapay"`.
- Uses return: `payment_status`, `payment_expires_at`, `payment_access_token`.

- [ ] Write failing tests for payment cards, auto-selection, and RPC payload payment method.
- [ ] Run the focused test and verify expected failures.
- [ ] Add payment settings load, selectable cards, localized messages, dynamic submit label, and Instapay redirect.
- [ ] Preserve COD redirect to `/order-success`.
- [ ] Re-run focused tests.

### Task 3: Instapay Payment Page and Proof Upload API

**Files:**
- Create: `pages/payments/instapay/[orderId].vue`
- Create: `server/api/payments/instapay/proof.post.ts`
- Create: `utils/whatsapp.ts`
- Modify: `nuxt.config.ts`
- Modify: `locales/en.json`
- Modify: `locales/ar.json`
- Test: `tests/instapay-payments.test.mjs`

**Interfaces:**
- Server API accepts multipart `order_id`, `access_token`, optional `transaction_reference`, and image `proof`.
- Uses private runtime config: `supabaseServiceRoleKey`.
- Customer page reads safe order/payment data using `payment_access_token_hash` checks through public RLS/RPC-compatible fields.

- [ ] Write failing tests for route, private proof upload validation, server-only service key, and WhatsApp utility.
- [ ] Run focused tests and verify expected failures.
- [ ] Implement payment page states, countdown display, copy buttons, proof upload, and WhatsApp support link.
- [ ] Implement server upload validation, private bucket upload, DB proof registration, and orphan cleanup.
- [ ] Re-run focused tests.

### Task 4: Admin Payment Settings and Payment Review

**Files:**
- Create: `pages/admin/payment-settings.vue`
- Modify: `layouts/admin.vue`
- Modify: `pages/admin/orders.vue`
- Modify: `utils/admin.ts`
- Modify: `locales/en.json`
- Modify: `locales/ar.json`
- Test: `tests/instapay-payments.test.mjs`

**Interfaces:**
- Admin settings calls `save_admin_payment_settings(jsonb)`.
- Admin orders calls `admin_review_instapay_payment(order_id, proof_id, action, reason)`.

- [ ] Write failing tests for admin nav, settings page, localized statuses, and review actions.
- [ ] Run focused tests and verify expected failures.
- [ ] Add payment settings page with QR upload to safe public path, validation, and RPC save.
- [ ] Extend admin order details with payment deadline/proof fields and confirm/reject actions.
- [ ] Re-run focused tests.

### Task 5: Product/Order WhatsApp and Reorder Hooks

**Files:**
- Modify: `pages/shop/[slug].vue`
- Modify: `pages/order-success.vue`
- Create or extend: `utils/whatsapp.ts`
- Test: `tests/instapay-payments.test.mjs`

**Interfaces:**
- WhatsApp utility builds encoded `wa.me` URLs and never includes access tokens, proof URLs, addresses, or secrets.

- [ ] Write failing tests for product/order WhatsApp messages and expired-order reorder hooks.
- [ ] Run focused tests and verify expected failures.
- [ ] Add secondary product CTA and safe order support CTAs.
- [ ] Add minimal expired order reorder CTA that routes to checkout with current cart rebuild handled by existing cart/product flows where available.
- [ ] Re-run focused tests.

### Task 6: Verification

**Files:**
- Existing focused tests only.

- [ ] Run `node --test tests/instapay-payments.test.mjs`.
- [ ] Run relevant checkout/shipping/coupon/variant/admin regression tests.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `git diff --check`.
- [ ] Self-review stock restock, proof/expiry race, guest authorization, private proof leakage, service-role exposure, COD regression, and grants.

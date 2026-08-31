# Egyptian Product Search SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Viking Store category and product SEO for Egyptian Arabic gear-search intent without rebuilding existing SEO.

**Architecture:** Keep the existing `utils/seo.ts` helper as the single source for category intent, product SEO metadata, and Product JSON-LD. Add only category-aware Egyptian intent terms and optional Product `alternateName` output; existing pages keep consuming the same helper APIs.

**Tech Stack:** Nuxt/Vue, Vue I18n, Supabase storefront data, Node test runner.

**Spec:** User-provided request in Codex attachment `22bf2c5a-87d0-4932-94c4-70cc28995af9`.

## Global Constraints

- Preserve existing Organization, WebSite, Product, BreadcrumbList, BlogPosting, canonical, robots, sitemap, Open Graph, Twitter, and SSR SEO behavior.
- Arabic/Egyptian gear search intent is primary for this pass.
- Do not use `جوانتي بوكس`.
- Do not touch checkout, payments, orders, inventory, shipping, auth, admin logic, Supabase migrations, DB schema, pricing, stock, or variants.
- Do not run `nuxt build`.

---

### Task 1: Focused SEO Regression Tests

**Files:**
- Modify: `tests/seo.test.mjs`

**Interfaces:**
- Consumes: `getCategorySeoIntent`, `buildCategorySeo`, `buildProductSeoMeta`, `buildProductStructuredData`.
- Produces: Regression coverage for Egyptian category intent and product alternate names.

- [ ] Add tests for `gloves`, `shin-guards`, `hand-wraps`, `head-guards`, and `mouth-guards`.
- [ ] Assert `جلافز ملاكمة`, `قلبظ ملاكمة`, `بنداج`, `شنكار`, `هيد جارد`, and `ماوث جارد` appear only where category-appropriate.
- [ ] Assert `جوانتي بوكس` is absent.
- [ ] Assert existing EGP, real price, availability, canonical, sitemap, and JSON-LD behavior remains covered.

### Task 2: Category Intent Mapping

**Files:**
- Modify: `utils/seo.ts`

**Interfaces:**
- Consumes: existing category slugs/names from products/categories.
- Produces: richer `CategorySeoIntent` for relevant product category slugs.

- [ ] Extend existing `categorySeoIntents` with real product category slugs.
- [ ] Keep copy concise and customer-facing.
- [ ] Map aliases conservatively so existing broad slugs still work.
- [ ] Avoid hidden keyword blocks or duplicated landing pages.

### Task 3: Product Alternate Names

**Files:**
- Modify: `utils/seo.ts`

**Interfaces:**
- Consumes: product category context.
- Produces: category-aware Product JSON-LD `alternateName` and product meta context.

- [ ] Add concise alternate terms to category intent data.
- [ ] Include Product JSON-LD `alternateName` only for semantically matching product categories.
- [ ] Preserve real product name, price, currency, availability, and real AggregateRating behavior.

### Task 4: Verification

**Files:**
- Test: `tests/seo.test.mjs`

- [ ] Run `node --test tests/seo.test.mjs`.
- [ ] Run `npx tsc --noEmit` if available, otherwise the local TypeScript compiler equivalent.
- [ ] Run `git diff --check`.
- [ ] Confirm no backend/business files were changed.

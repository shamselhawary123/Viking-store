import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const readJson = (path) => JSON.parse(read(path));

describe("password reset auth flow", () => {
  it("renders forgot-password copy through the shared auth locale keys", () => {
    const page = read("../pages/auth/forgot-password.vue");
    const en = readJson("../locales/en.json");
    const ar = readJson("../locales/ar.json");

    assert.equal(en.auth.accountSecurity, "Account security");
    assert.equal(ar.auth.accountSecurity, "أمان الحساب");
    assert.equal(en.auth.forgotTitle, "Forgot Password");
    assert.equal(ar.auth.forgotTitle, "نسيت كلمة المرور");
    assert.equal(en.auth.forgotLead, "Enter your email to receive a reset link.");
    assert.equal(ar.auth.forgotLead, "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.");
    assert.equal(en.auth.sendResetLink, "Send Reset Link");
    assert.equal(ar.auth.sendResetLink, "إرسال رابط إعادة التعيين");

    assert.match(page, /useI18n\(\)/);
    assert.match(page, /t\("auth\.accountSecurity"\)/);
    assert.match(page, /t\("auth\.forgotTitle"\)/);
    assert.match(page, /t\("auth\.forgotLead"\)/);
    assert.match(page, /t\('auth\.emailAddress'\)/);
    assert.match(page, /t\("auth\.sendResetLink"\)/);
    assert.doesNotMatch(page, />\s*Account security\s*</);
    assert.doesNotMatch(page, />\s*Forgot Password\s*</);
    assert.doesNotMatch(page, />\s*Enter your email to receive a reset link\.\s*</);
    assert.doesNotMatch(page, />\s*Email Address\s*</);
    assert.doesNotMatch(page, />\s*Send Reset Link\s*</);
  });

  it("builds password reset redirects from the configured production site URL", async () => {
    assert.equal(existsSync(new URL("../utils/authRedirect.ts", import.meta.url)), true);

    const { buildPasswordResetRedirectUrl } = await import("../utils/authRedirect.ts");

    assert.equal(
      buildPasswordResetRedirectUrl("https://vikingclubstore.com"),
      "https://vikingclubstore.com/auth/reset-password",
    );
    assert.equal(
      buildPasswordResetRedirectUrl("https://vikingclubstore.com/"),
      "https://vikingclubstore.com/auth/reset-password",
    );
    assert.equal(
      buildPasswordResetRedirectUrl(""),
      "https://vikingclubstore.com/auth/reset-password",
    );
  });

  it("sends Supabase recovery emails to the existing reset-password route, not browser origin", () => {
    const store = read("../stores/auth.ts");
    const forgotPasswordBlock = store.match(/async forgotPassword\(email: string\) \{[\s\S]*?\n    \},/)?.[0] || "";

    assert.match(forgotPasswordBlock, /resetPasswordForEmail\(email,\s*\{/);
    assert.match(forgotPasswordBlock, /redirectTo:\s*buildPasswordResetRedirectUrl\(config\.public\.siteUrl\)/);
    assert.match(store, /const config = useRuntimeConfig\(\)/);
    assert.match(store, /import \{ buildPasswordResetRedirectUrl \} from "\.\.\/utils\/authRedirect"/);
    assert.doesNotMatch(forgotPasswordBlock, /window\.location\.origin/);
    assert.doesNotMatch(forgotPasswordBlock, /localhost:3000/);
    assert.doesNotMatch(forgotPasswordBlock, /vercel/i);
    assert.match(forgotPasswordBlock, /\/auth\/reset-password|buildPasswordResetRedirectUrl/);
  });

  it("keeps the existing reset-password completion page wired to updateUser", () => {
    const page = read("../pages/auth/reset-password.vue");
    const store = read("../stores/auth.ts");

    assert.match(page, /authStore\.updatePassword\(password\.value\)/);
    assert.match(store, /async updatePassword\(password: string\)/);
    assert.match(store, /supabase\.auth\.updateUser\(\{\s*password,/);
    assert.doesNotMatch(page, /console\.log\([^)]*(?:password|token|access_token|refresh_token)/i);
    assert.doesNotMatch(store, /console\.log\([^)]*(?:password|token|access_token|refresh_token)/i);
  });
});

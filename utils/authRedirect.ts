import { buildCanonicalUrl } from "./seo.ts";

export const PASSWORD_RESET_PATH = "/auth/reset-password";

export const buildPasswordResetRedirectUrl = (siteUrl?: string | null) =>
  buildCanonicalUrl(String(siteUrl || ""), PASSWORD_RESET_PATH);

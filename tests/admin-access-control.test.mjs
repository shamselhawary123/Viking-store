import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const exists = (path) => existsSync(new URL(path, import.meta.url));

describe("admin access control", () => {
  it("defines precise admin route matching without protecting the public login route", async () => {
    const { isProtectedAdminPath, isAdminLoginPath } = await import("../utils/adminAccess.ts");

    assert.equal(isProtectedAdminPath("/admin"), true);
    assert.equal(isProtectedAdminPath("/admin/"), true);
    assert.equal(isProtectedAdminPath("/admin/products"), true);
    assert.equal(isProtectedAdminPath("/admin/blog/new"), true);
    assert.equal(isProtectedAdminPath("/admin/login"), false);
    assert.equal(isProtectedAdminPath("/admin/login/"), false);
    assert.equal(isProtectedAdminPath("/administrator-info"), false);
    assert.equal(isAdminLoginPath("/admin/login"), true);
  });

  it("adds a server middleware gate before admin SSR can render", () => {
    assert.equal(exists("../server/middleware/admin-auth.ts"), true);

    const source = read("../server/middleware/admin-auth.ts");

    assert.match(source, /isProtectedAdminPath/);
    assert.match(source, /authorizeAdminRequest/);
    assert.match(source, /sendRedirect\(event,\s*"\/admin\/login"/);
    assert.match(source, /createError\(\{\s*statusCode:\s*404/);
    assert.match(source, /Cache-Control",\s*"private, no-store"/);
    assert.match(source, /X-Robots-Tag",\s*"noindex, nofollow"/);
    assert.doesNotMatch(source, /serviceRole/i);
  });

  it("uses request-scoped Supabase cookies and public.is_admin for the server decision", () => {
    assert.equal(exists("../server/utils/adminAuth.ts"), true);

    const source = read("../server/utils/adminAuth.ts");

    assert.match(source, /createServerClient/);
    assert.match(source, /parseCookieHeader/);
    assert.match(source, /auth\.getUser\(\)/);
    assert.match(source, /\.rpc\("is_admin"\)/);
    assert.match(source, /isAdmin\s*===\s*true/);
    assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
    assert.doesNotMatch(source, /supabaseServiceRoleKey/);
    assert.doesNotMatch(source, /profiles/);
  });

  it("keeps client admin middleware as a second layer using the same authoritative RPC", () => {
    const source = read("../middleware/admin.ts");
    const composable = read("../composables/useAdminAccess.ts");

    assert.match(source, /useAdminAccess/);
    assert.match(source, /verify\(\)/);
    assert.match(composable, /\.rpc\("is_admin"\)/);
    assert.match(source, /abortNavigation/);
    assert.doesNotMatch(source, /isAdminProfile/);
    assert.doesNotMatch(source, /\.from\("profiles"\)/);
  });

  it("uses the same authoritative admin check after admin login", () => {
    const source = read("../pages/admin/login.vue");

    assert.match(source, /\.rpc\("is_admin"\)/);
    assert.doesNotMatch(source, /isAdminProfile/);
    assert.doesNotMatch(source, /\.from\("profiles"\)/);
  });

  it("persists auth in SSR cookies for direct admin refreshes", () => {
    const source = read("../plugins/supabase.client.ts");

    assert.match(source, /createBrowserClient/);
    assert.match(source, /cookieOptions/);
    assert.doesNotMatch(source, /createClient\(/);
  });

  it("centralizes admin noindex in the admin layout", () => {
    const source = read("../layouts/admin.vue");

    assert.match(source, /useHead/);
    assert.match(source, /noindex,\s*nofollow/);
  });
});

describe("admin SPA authorization cache", () => {
  it("caches a successful admin verification for the TTL and then revalidates", async () => {
    const {
      ADMIN_ACCESS_TTL_MS,
      createInitialAdminAccessState,
      verifyAdminAccessWithCache,
    } = await import("../utils/adminClientAccess.ts");

    const state = createInitialAdminAccessState();
    let calls = 0;
    const verifier = async () => {
      calls += 1;
      return { status: "admin", userId: "admin-1" };
    };

    assert.deepEqual(await verifyAdminAccessWithCache(state, verifier, 1000), {
      status: "admin",
      userId: "admin-1",
      fromCache: false,
    });
    assert.equal(calls, 1);

    assert.deepEqual(await verifyAdminAccessWithCache(state, verifier, 2000), {
      status: "admin",
      userId: "admin-1",
      fromCache: true,
    });
    assert.equal(calls, 1);

    assert.deepEqual(
      await verifyAdminAccessWithCache(state, verifier, 1000 + ADMIN_ACCESS_TTL_MS + 1),
      {
        status: "admin",
        userId: "admin-1",
        fromCache: false,
      },
    );
    assert.equal(calls, 2);
  });

  it("fails closed for anonymous, non-admin, and RPC error results", async () => {
    const { createInitialAdminAccessState, verifyAdminAccessWithCache } = await import("../utils/adminClientAccess.ts");

    for (const denied of [
      { status: "anonymous" },
      { status: "non_admin", userId: "user-1" },
      { status: "error", userId: "admin-1" },
    ]) {
      const state = createInitialAdminAccessState();
      const result = await verifyAdminAccessWithCache(state, async () => denied, 1000);

      assert.equal(result.status, denied.status);
      assert.equal(result.fromCache, false);
      assert.equal(state.status, "denied");
      assert.equal(state.userId, denied.userId ?? null);
    }
  });

  it("deduplicates concurrent admin verification requests", async () => {
    const { createInitialAdminAccessState, verifyAdminAccessWithCache } = await import("../utils/adminClientAccess.ts");

    const state = createInitialAdminAccessState();
    let calls = 0;
    const verifier = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { status: "admin", userId: "admin-1" };
    };

    const [first, second] = await Promise.all([
      verifyAdminAccessWithCache(state, verifier, 1000),
      verifyAdminAccessWithCache(state, verifier, 1000),
    ]);

    assert.equal(calls, 1);
    assert.equal(first.status, "admin");
    assert.equal(second.status, "admin");
  });

  it("clears cached admin access on sign-out or user changes", async () => {
    const {
      createInitialAdminAccessState,
      markAdminAccessAllowed,
      clearAdminAccessOnSessionChange,
    } = await import("../utils/adminClientAccess.ts");

    const state = createInitialAdminAccessState();
    markAdminAccessAllowed(state, "admin-1", 1000);

    clearAdminAccessOnSessionChange(state, "admin-1");
    assert.equal(state.status, "allowed");

    clearAdminAccessOnSessionChange(state, "admin-2");
    assert.equal(state.status, "unknown");
    assert.equal(state.userId, null);

    markAdminAccessAllowed(state, "admin-2", 2000);
    clearAdminAccessOnSessionChange(state, null);
    assert.equal(state.status, "unknown");
    assert.equal(state.userId, null);
  });

  it("wires middleware, login, logout, and auth lifecycle to the shared cache", () => {
    const middleware = read("../middleware/admin.ts");
    const login = read("../pages/admin/login.vue");
    const layout = read("../layouts/admin.vue");
    const plugin = read("../plugins/auth.client.ts");

    assert.match(middleware, /useAdminAccess/);
    assert.match(middleware, /verify\(\)/);
    assert.match(login, /markAllowed\(/);
    assert.match(login, /clear\(\)/);
    assert.match(layout, /adminAccess\.clear\(\)/);
    assert.match(plugin, /clearOnSessionChange/);
  });

  it("does not read the injected Supabase client before app plugins are mounted", () => {
    const plugin = read("../plugins/auth.client.ts");
    const hookIndex = plugin.indexOf('hook("app:mounted"');
    const supabaseIndex = plugin.indexOf("useSupabase()");

    assert.ok(hookIndex > -1, "auth plugin should use the mounted lifecycle hook");
    assert.ok(supabaseIndex > hookIndex, "useSupabase must run after app:mounted");
  });
});

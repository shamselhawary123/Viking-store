export const ADMIN_ACCESS_TTL_MS = 5 * 60 * 1000;

export type AdminAccessStatus = "unknown" | "allowed" | "denied";

export type AdminAccessVerificationStatus =
  | "admin"
  | "anonymous"
  | "non_admin"
  | "error";

export type AdminAccessVerificationResult = {
  status: AdminAccessVerificationStatus;
  userId?: string | null;
};

export type AdminAccessCheckResult = AdminAccessVerificationResult & {
  fromCache: boolean;
};

export type AdminAccessState = {
  status: AdminAccessStatus;
  userId: string | null;
  verifiedAt: number;
  pending: Promise<AdminAccessCheckResult> | null;
};

export const createInitialAdminAccessState = (): AdminAccessState => ({
  status: "unknown",
  userId: null,
  verifiedAt: 0,
  pending: null,
});

export const clearAdminAccessState = (state: AdminAccessState) => {
  state.status = "unknown";
  state.userId = null;
  state.verifiedAt = 0;
  state.pending = null;
};

export const markAdminAccessAllowed = (
  state: AdminAccessState,
  userId: string,
  now = Date.now(),
) => {
  state.status = "allowed";
  state.userId = userId;
  state.verifiedAt = now;
  state.pending = null;
};

export const markAdminAccessDenied = (
  state: AdminAccessState,
  userId: string | null = null,
  now = Date.now(),
) => {
  state.status = "denied";
  state.userId = userId;
  state.verifiedAt = now;
  state.pending = null;
};

export const isAdminAccessCacheValid = (
  state: AdminAccessState,
  now = Date.now(),
  ttlMs = ADMIN_ACCESS_TTL_MS,
) =>
  state.status === "allowed" &&
  Boolean(state.userId) &&
  now - state.verifiedAt <= ttlMs;

export const clearAdminAccessOnSessionChange = (
  state: AdminAccessState,
  nextUserId: string | null,
) => {
  if (nextUserId && state.status === "allowed" && state.userId === nextUserId) {
    return;
  }

  clearAdminAccessState(state);
};

export const verifyAdminAccessWithCache = async (
  state: AdminAccessState,
  verifier: () => Promise<AdminAccessVerificationResult>,
  now = Date.now(),
  ttlMs = ADMIN_ACCESS_TTL_MS,
): Promise<AdminAccessCheckResult> => {
  if (isAdminAccessCacheValid(state, now, ttlMs)) {
    return {
      status: "admin",
      userId: state.userId,
      fromCache: true,
    };
  }

  if (state.pending) return state.pending;

  state.pending = (async () => {
    const result = await verifier();

    if (result.status === "admin" && result.userId) {
      markAdminAccessAllowed(state, result.userId, now);
    } else {
      markAdminAccessDenied(state, result.userId ?? null, now);
    }

    return {
      ...result,
      fromCache: false,
    };
  })();

  try {
    return await state.pending;
  } finally {
    state.pending = null;
  }
};

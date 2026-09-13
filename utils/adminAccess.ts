export const ADMIN_LOGIN_PATH = "/admin/login";

const normalizePath = (path: string) => {
  const pathname = (path.split(/[?#]/)[0] || "/").replace(/\/+$/, "");
  return pathname || "/";
};

export const isAdminLoginPath = (path: string) =>
  normalizePath(path) === ADMIN_LOGIN_PATH;

export const isProtectedAdminPath = (path: string) => {
  const normalized = normalizePath(path);

  if (isAdminLoginPath(normalized)) return false;
  return normalized === "/admin" || normalized.startsWith("/admin/");
};

import { createError, defineEventHandler, getRequestURL, sendRedirect, setHeader } from "h3";
import { isProtectedAdminPath } from "../../utils/adminAccess";
import { authorizeAdminRequest } from "../utils/adminAuth";

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  if (!isProtectedAdminPath(pathname)) return;

  setHeader(event, "Cache-Control", "private, no-store");
  setHeader(event, "X-Robots-Tag", "noindex, nofollow");

  const auth = await authorizeAdminRequest(event);

  if (auth.status === "admin") return;

  if (auth.status === "anonymous") {
    return sendRedirect(event, "/admin/login", 302);
  }

  if (auth.status === "non_admin") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  throw createError({ statusCode: 500, statusMessage: "Admin authorization failed" });
});

export default defineNuxtRouteMiddleware(async () => {
  if (process.server) {
    return;
  }

  const adminAccess = useAdminAccess();
  const access = await adminAccess.verify();

  if (access.status === "anonymous") {
    return navigateTo("/admin/login");
  }

  if (access.status === "error") {
    return abortNavigation(
      createError({ statusCode: 500, statusMessage: "Admin authorization failed" }),
    );
  }

  if (access.status !== "admin") {
    return abortNavigation(createError({ statusCode: 404, statusMessage: "Not Found" }));
  }
});

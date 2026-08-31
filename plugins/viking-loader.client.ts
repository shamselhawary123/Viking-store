export default defineNuxtPlugin((nuxtApp) => {
  const globalState = globalThis as typeof globalThis & {
    __vikingNavigationLoaderInstalled?: boolean;
  };

  if (globalState.__vikingNavigationLoaderInstalled) return;

  globalState.__vikingNavigationLoaderInstalled = true;

  const start = () => startVikingNavigationLoading();
  const finish = () => finishVikingNavigationLoading();

  const removeStartHook = nuxtApp.hook("page:start", start);
  const removeFinishHook = nuxtApp.hook("page:finish", finish);
  const removeErrorHook = nuxtApp.hook("app:error", finish);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      removeStartHook();
      removeFinishHook();
      removeErrorHook();
      finishVikingNavigationLoading();
      globalState.__vikingNavigationLoaderInstalled = false;
    });
  }
});

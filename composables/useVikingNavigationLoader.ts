export const VIKING_LOADER_DELAY_MS = 250;

const VIKING_LOADER_STATE_KEY = "viking-navigation-loader-visible";

let showTimer: ReturnType<typeof setTimeout> | null = null;
let activeNavigationId = 0;
let isNavigationPending = false;

const clearVikingLoaderTimer = () => {
  if (!showTimer) return;
  clearTimeout(showTimer);
  showTimer = null;
};

export const useVikingNavigationLoader = () => {
  const isVisible = useState<boolean>(VIKING_LOADER_STATE_KEY, () => false);

  return {
    isVisible,
  };
};

export const startVikingNavigationLoading = () => {
  const { isVisible } = useVikingNavigationLoader();
  const navigationId = activeNavigationId + 1;

  activeNavigationId = navigationId;
  isNavigationPending = true;
  clearVikingLoaderTimer();

  showTimer = setTimeout(() => {
    if (isNavigationPending && activeNavigationId === navigationId) {
      isVisible.value = true;
    }
    showTimer = null;
  }, VIKING_LOADER_DELAY_MS);
};

export const finishVikingNavigationLoading = () => {
  const { isVisible } = useVikingNavigationLoader();

  activeNavigationId += 1;
  isNavigationPending = false;
  clearVikingLoaderTimer();
  isVisible.value = false;
};

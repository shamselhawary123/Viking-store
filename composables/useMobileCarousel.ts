import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from "vue";

type CarouselDirection = "next" | "previous";

type MobileCarouselOptions = {
  intervalMs?: number;
  resumeDelayMs?: number;
  isRtl?: Ref<boolean>;
  gapPx?: number;
  slideWidthRatio?: number;
};

export const useMobileCarousel = (
  itemCount: Ref<number>,
  options: MobileCarouselOptions = {},
) => {
  const activeIndex = ref(0);
  const trackIndex = ref(0);
  const slideDirection = ref<CarouselDirection>("next");
  const touchStartX = ref<number | null>(null);
  const dragOffset = ref(0);
  const isDragging = ref(false);
  const isSnapping = ref(false);
  const isMobile = ref(false);
  const viewportWidth = ref(0);
  const intervalMs = options.intervalMs ?? 3800;
  const resumeDelayMs = options.resumeDelayMs ?? 1200;
  const gapPx = options.gapPx ?? 0;
  const slideWidthRatio = options.slideWidthRatio ?? 1;
  let autoplayTimer: ReturnType<typeof window.setInterval> | null = null;
  let resumeTimer: ReturnType<typeof window.setTimeout> | null = null;
  let snapTimer: ReturnType<typeof window.setTimeout> | null = null;
  let mediaQuery: MediaQueryList | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let viewportElement: HTMLElement | null = null;

  const isRtl = computed(() => Boolean(options.isRtl?.value));
  const transitionName = computed(() => {
    const visualDirection =
      isRtl.value && slideDirection.value === "next"
        ? "previous"
        : isRtl.value && slideDirection.value === "previous"
          ? "next"
          : slideDirection.value;

    return `mobile-carousel-${visualDirection}`;
  });
  const loopedIndexes = computed(() => {
    const count = itemCount.value;

    if (count <= 0) return [];
    if (count === 1) return [0];

    return [
      count - 1,
      ...Array.from({ length: count }, (_, index) => index),
      0,
    ];
  });
  const slideWidthPx = computed(() => viewportWidth.value * slideWidthRatio);
  const slideStepPx = computed(() => slideWidthPx.value + gapPx);
  const centerOffsetPx = computed(() =>
    Math.max((viewportWidth.value - slideWidthPx.value) / 2, 0),
  );
  const trackOffsetPx = computed(() => {
    const directionMultiplier = isRtl.value ? 1 : -1;

    return (
      directionMultiplier * trackIndex.value * slideStepPx.value +
      directionMultiplier * -centerOffsetPx.value +
      dragOffset.value
    );
  });
  const trackStyle = computed(() => ({
    "--mobile-carousel-gap": `${gapPx}px`,
    "--mobile-carousel-slide-width": `${slideWidthRatio * 100}%`,
    "--mobile-carousel-center-offset": `${centerOffsetPx.value}px`,
    transform: `translate3d(${trackOffsetPx.value}px, 0, 0)`,
  }));

  const updateViewportWidth = () => {
    viewportWidth.value = viewportElement?.clientWidth ?? 0;
  };

  const observeViewport = () => {
    resizeObserver?.disconnect();
    resizeObserver = null;

    if (!viewportElement) return;

    updateViewportWidth();
    if (typeof ResizeObserver === "undefined") return;

    resizeObserver = new ResizeObserver(updateViewportWidth);
    resizeObserver.observe(viewportElement);
  };

  const setViewportRef = (element: Element | null) => {
    viewportElement = element instanceof HTMLElement ? element : null;
    observeViewport();
  };

  const clearAutoplay = () => {
    if (!autoplayTimer) return;
    window.clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const clearResume = () => {
    if (!resumeTimer) return;
    window.clearTimeout(resumeTimer);
    resumeTimer = null;
  };

  const clearSnap = () => {
    if (!snapTimer) return;
    window.clearTimeout(snapTimer);
    snapTimer = null;
  };

  const isPageVisible = () =>
    typeof document === "undefined" || document.visibilityState === "visible";

  const clampIndex = () => {
    if (itemCount.value <= 0) {
      activeIndex.value = 0;
      trackIndex.value = 0;
      return;
    }

    if (activeIndex.value >= itemCount.value) {
      activeIndex.value = 0;
    }

    trackIndex.value = itemCount.value > 1 ? activeIndex.value + 1 : 0;
  };

  const snapToLoopedRealSlide = () => {
    if (itemCount.value < 2) return;

    clearSnap();
    snapTimer = window.setTimeout(() => {
      isSnapping.value = true;
      trackIndex.value = activeIndex.value + 1;
      window.requestAnimationFrame(() => {
        isSnapping.value = false;
      });
    }, 560);
  };

  const move = (direction: CarouselDirection, resetTimer = false) => {
    if (itemCount.value < 2) return;

    clearSnap();
    isSnapping.value = false;
    slideDirection.value = direction;
    const offset = direction === "next" ? 1 : -1;
    trackIndex.value += offset;
    activeIndex.value = (activeIndex.value + offset + itemCount.value) % itemCount.value;
    snapToLoopedRealSlide();

    if (resetTimer) {
      scheduleAutoplay();
    }
  };

  const movePrevious = () => move("previous", true);

  const moveNext = () => move("next", true);

  const startAutoplay = () => {
    if (typeof window === "undefined") return;

    clearAutoplay();
    if (!isMobile.value || itemCount.value < 2 || !isPageVisible()) return;

    autoplayTimer = window.setInterval(() => move("next"), intervalMs);
  };

  const pauseAutoplay = () => {
    clearAutoplay();
    clearResume();
  };

  const scheduleAutoplay = () => {
    if (typeof window === "undefined") return;

    pauseAutoplay();
    resumeTimer = window.setTimeout(startAutoplay, resumeDelayMs);
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (itemCount.value < 2) return;

    pauseAutoplay();
    clearSnap();
    isSnapping.value = false;
    touchStartX.value = event.changedTouches[0]?.clientX ?? 0;
    dragOffset.value = 0;
    isDragging.value = true;
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (touchStartX.value === null) return;

    const currentX = event.touches[0]?.clientX ?? touchStartX.value;
    dragOffset.value = currentX - touchStartX.value;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.value === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.value;
    const deltaX = touchStartX.value - endX;
    touchStartX.value = null;
    dragOffset.value = 0;
    isDragging.value = false;

    if (Math.abs(deltaX) >= 45) {
      if (isRtl.value) {
        move(deltaX > 0 ? "previous" : "next", true);
      } else {
        move(deltaX > 0 ? "next" : "previous", true);
      }
      return;
    }

    scheduleAutoplay();
  };

  const handleTouchCancel = () => {
    touchStartX.value = null;
    dragOffset.value = 0;
    isDragging.value = false;
    scheduleAutoplay();
  };

  const updateMobileState = () => {
    isMobile.value = mediaQuery?.matches ?? false;
    clampIndex();
    startAutoplay();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      pauseAutoplay();
      return;
    }

    startAutoplay();
  };

  onMounted(() => {
    mediaQuery = window.matchMedia("(max-width: 767px)");
    observeViewport();
    updateMobileState();
    window.addEventListener("resize", updateViewportWidth);
    mediaQuery.addEventListener("change", updateMobileState);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onBeforeUnmount(() => {
    pauseAutoplay();
    clearSnap();
    resizeObserver?.disconnect();
    window.removeEventListener("resize", updateViewportWidth);
    mediaQuery?.removeEventListener("change", updateMobileState);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  watch(itemCount, () => {
    clampIndex();
    dragOffset.value = 0;
    startAutoplay();
  });

  return reactive({
    activeIndex,
    dragOffset,
    handleTouchEnd,
    handleTouchCancel,
    handleTouchMove,
    handleTouchStart,
    isDragging,
    isSnapping,
    isMobile,
    loopedIndexes,
    moveNext,
    movePrevious,
    pauseAutoplay,
    snapToLoopedRealSlide,
    setViewportRef,
    startAutoplay,
    trackStyle,
    trackIndex,
    transitionName,
  });
};

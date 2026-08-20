import type { DirectiveBinding } from "vue";

type RevealOptions = {
  delay?: number;
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
};

const getOptions = (value: unknown): RevealOptions =>
  value && typeof value === "object" ? (value as RevealOptions) : {};

const getDelay = (element: HTMLElement, options: RevealOptions) => {
  const delay = Number(options.delay ?? element.dataset.revealDelay ?? 0);

  return Number.isFinite(delay) ? Math.max(delay, 0) : 0;
};

export default defineNuxtPlugin((nuxtApp) => {
  const observers = new WeakMap<Element, IntersectionObserver>();

  const revealElement = (element: HTMLElement, options: RevealOptions) => {
    element.classList.add("is-revealed");

    if (options.once === false) return;

    element.addEventListener(
      "transitionend",
      () => {
        element.classList.remove("reveal", "is-revealed");
      },
      { once: true },
    );
  };

  nuxtApp.vueApp.directive("reveal", {
    mounted(element: HTMLElement, binding: DirectiveBinding<RevealOptions>) {
      const options = getOptions(binding.value);
      const delay = getDelay(element, options);

      element.classList.add("reveal");
      element.style.setProperty("--reveal-delay", `${delay}ms`);

      if (!("IntersectionObserver" in window)) {
        revealElement(element, options);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              revealElement(element, options);

              if (options.once !== false) {
                observer.unobserve(element);
                observer.disconnect();
                observers.delete(element);
              }

              continue;
            }

            if (options.once === false) {
              element.classList.remove("is-revealed");
            }
          }
        },
        {
          rootMargin: options.rootMargin ?? "0px 0px -8% 0px",
          threshold: options.threshold ?? 0.16,
        },
      );

      observers.set(element, observer);
      observer.observe(element);
    },

    unmounted(element: HTMLElement) {
      const observer = observers.get(element);

      observer?.unobserve(element);
      observer?.disconnect();
      observers.delete(element);
    },
  });
});

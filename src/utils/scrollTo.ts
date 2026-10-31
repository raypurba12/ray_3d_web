import type Lenis from "lenis";

export const NAV_OFFSET = 88;

let lenisInstance: Lenis | null = null;

export const registerLenis = (instance: Lenis | null) => {
  lenisInstance = instance;
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const scrollToTop = () => {
  if (lenisInstance) {
    lenisInstance.scrollTo(0);
    return;
  }
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
};

export const scrollToId = (id: string) => {
  if (id === "top") {
    scrollToTop();
    return;
  }

  const element = document.getElementById(id);
  if (!element) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(element, { offset: -NAV_OFFSET });
    return;
  }

  const top =
    element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
};

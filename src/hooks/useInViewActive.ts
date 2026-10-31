import { useEffect, useRef, useState } from "react";

export function useInViewActive<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "200px"
) {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let inView = false;
    const update = () =>
      setActive(inView && document.visibilityState === "visible");

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { rootMargin }
    );
    observer.observe(element);

    const handleVisibility = () => update();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [rootMargin]);

  return { ref, active };
}

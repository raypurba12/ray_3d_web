import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

export const useFinePointer = () => useMediaQuery("(pointer: fine)");
export const useIsMobile = () => useMediaQuery("(max-width: 768px)");
export const useIsWideViewport = () => useMediaQuery("(min-width: 1280px)");

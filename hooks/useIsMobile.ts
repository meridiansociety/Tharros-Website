"use client";

import { useState, useEffect } from "react";

/**
 * A highly performant hook to detect mobile viewports.
 * Uses matchMedia for zero-JS-overhead tracking of the breakpoint.
 */
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
    
    // Initial check
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

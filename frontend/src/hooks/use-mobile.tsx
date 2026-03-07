import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const getMatches = React.useCallback(
    () => (typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false),
    [],
  );
  const [isMobile, setIsMobile] = React.useState(getMatches);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(getMatches());
    };
    mql.addEventListener("change", onChange);
    setIsMobile(getMatches());
    return () => mql.removeEventListener("change", onChange);
  }, [getMatches]);

  return isMobile;
}

const isLoopbackHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

export const isHostedFallbackEnabled = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return !isLoopbackHost(window.location.hostname);
};

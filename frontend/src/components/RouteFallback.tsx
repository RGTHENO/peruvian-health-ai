const RouteFallback = () => (
  <div
    className="flex min-h-screen items-center justify-center bg-background px-6"
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <p className="text-sm text-muted-foreground">Cargando vista…</p>
    </div>
  </div>
);

export default RouteFallback;

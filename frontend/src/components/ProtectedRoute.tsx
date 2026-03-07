import { Navigate, useLocation } from "react-router-dom";
import RouteFallback from "@/components/RouteFallback";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

const ProtectedRoute = ({
  children,
  role,
}: {
  children: ReactNode;
  role?: "patient" | "doctor";
}) => {
  const location = useLocation();
  const { initialized, user } = useAuth();

  if (!initialized) {
    return <RouteFallback />;
  }

  if (!user) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/iniciar-sesion?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "doctor" ? "/doctor/portal" : "/historial"} replace />;
  }

  return children;
};

export default ProtectedRoute;

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  registerPatient as registerPatientRequest,
  type AuthUser,
} from "@/lib/api";
import {
  getStoredSession,
  setStoredSession,
  subscribeToStoredSession,
  updateStoredUser,
  type AuthSession,
} from "@/lib/auth-session";

interface AuthContextValue {
  initialized: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  login: (payload: {
    email: string;
    password: string;
    role: "patient" | "doctor";
  }) => Promise<AuthSession>;
  registerPatient: (payload: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    age: number;
    gender: "M" | "F";
    insurance: string;
    telegramHandle?: string;
  }) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<AuthUser | null>;
  updateCurrentUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => subscribeToStoredSession(() => setSession(getStoredSession())), []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const currentSession = getStoredSession();
      if (!currentSession) {
        if (active) setInitialized(true);
        return;
      }

      try {
        const user = await fetchCurrentUser();
        if (active) {
          updateStoredUser(user);
        }
      } catch {
        if (active) {
          setStoredSession(null);
          queryClient.clear();
        }
      } finally {
        if (active) setInitialized(true);
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [queryClient]);

  const handleLogin = useCallback<AuthContextValue["login"]>(
    async (payload) => {
      const nextSession = await loginRequest(payload);
      setStoredSession(nextSession);
      queryClient.clear();
      return nextSession;
    },
    [queryClient],
  );

  const handleRegisterPatient = useCallback<AuthContextValue["registerPatient"]>(
    async (payload) => {
      const nextSession = await registerPatientRequest(payload);
      setStoredSession(nextSession);
      queryClient.clear();
      return nextSession;
    },
    [queryClient],
  );

  const handleLogout = useCallback(async () => {
    const currentSession = getStoredSession();

    try {
      if (currentSession) {
        await logoutRequest(currentSession.refreshToken);
      }
    } catch {
      // Best-effort logout. Local session is cleared regardless.
    } finally {
      setStoredSession(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const refreshCurrentUser = useCallback<AuthContextValue["refreshCurrentUser"]>(async () => {
    if (!getStoredSession()) return null;

    try {
      const user = await fetchCurrentUser();
      updateStoredUser(user);
      return user;
    } catch {
      setStoredSession(null);
      queryClient.clear();
      return null;
    }
  }, [queryClient]);

  const updateCurrentUser = useCallback((user: AuthUser) => {
    updateStoredUser(user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      session,
      user: session?.user ?? null,
      login: handleLogin,
      registerPatient: handleRegisterPatient,
      logout: handleLogout,
      refreshCurrentUser,
      updateCurrentUser,
    }),
    [
      handleLogin,
      handleLogout,
      handleRegisterPatient,
      initialized,
      refreshCurrentUser,
      session,
      updateCurrentUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

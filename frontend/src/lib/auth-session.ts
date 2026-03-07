import type { AuthUser } from "@/lib/api";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

const AUTH_SESSION_STORAGE_KEY = "saludpe.auth-session.v1";

type SessionListener = () => void;

const listeners = new Set<SessionListener>();

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const parseSession = (raw: string | null): AuthSession | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.accessToken === "string" &&
      typeof parsed.refreshToken === "string" &&
      parsed.user
    ) {
      return parsed as AuthSession;
    }
  } catch {
    return null;
  }

  return null;
};

let currentSession = canUseStorage()
  ? parseSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY))
  : null;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const getStoredSession = () => currentSession;

export const setStoredSession = (session: AuthSession | null) => {
  currentSession = session;

  if (canUseStorage()) {
    if (session) {
      window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  notifyListeners();
};

export const updateStoredUser = (user: AuthUser) => {
  if (!currentSession) return;
  setStoredSession({ ...currentSession, user });
};

export const subscribeToStoredSession = (listener: SessionListener) => {
  listeners.add(listener);

  if (!canUseStorage()) {
    return () => listeners.delete(listener);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== AUTH_SESSION_STORAGE_KEY) return;
    currentSession = parseSession(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY));
    notifyListeners();
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
};

import {
  getStoredSession,
  setStoredSession,
  type AuthSession,
} from "@/lib/auth-session";

const LOCAL_API_BASE_URL = "http://127.0.0.1:8000/api/v1";

const resolveApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
  const isHostedBrowser =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  if (envUrl) {
    if (!isHostedBrowser) return envUrl;

    try {
      const parsed = new URL(envUrl, window.location.origin);
      const isLoopback =
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1";

      if (!isLoopback) return envUrl;
    } catch {
      if (!envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
        return envUrl;
      }
    }
  }

  // Hosted builds should use same-origin `/api/v1` so Vercel can proxy requests
  // to the current backend tunnel without baking a local-only URL into the bundle.
  if (isHostedBrowser) {
    return "/api/v1";
  }

  return LOCAL_API_BASE_URL;
};

const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: BodyInit | Record<string, unknown> | undefined;
  retryOnAuth?: boolean;
};

let refreshPromise: Promise<AuthSession | null> | null = null;

const buildHeaders = (headers?: HeadersInit, body?: RequestOptions["body"]) => {
  const nextHeaders = new Headers(headers);

  if (body && !(body instanceof FormData) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return nextHeaders;
};

const normalizeBody = (body: RequestOptions["body"]) => {
  if (!body || body instanceof FormData || typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
};

const extractMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
  }

  return fallback;
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const performRequest = async <T>(
  path: string,
  {
    auth = true,
    headers,
    body,
    ...init
  }: RequestOptions,
  accessToken?: string,
): Promise<T> => {
  const nextHeaders = buildHeaders(headers, body);

  if (auth && accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: nextHeaders,
    body: normalizeBody(body),
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      extractMessage(payload, `HTTP ${response.status}`),
      response.status,
      payload,
    );
  }

  return payload as T;
};

const refreshSession = async () => {
  const session = getStoredSession();
  if (!session) return null;

  if (!refreshPromise) {
    refreshPromise = performRequest<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: AuthSession["user"];
    }>(
      "/auth/refresh",
      {
        method: "POST",
        auth: false,
        body: { refresh_token: session.refreshToken },
      },
      undefined,
    )
      .then((payload) => {
        const nextSession: AuthSession = {
          accessToken: payload.access_token,
          refreshToken: payload.refresh_token,
          expiresIn: payload.expires_in,
          user: payload.user,
        };
        setStoredSession(nextSession);
        return nextSession;
      })
      .catch(() => {
        setStoredSession(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const session = getStoredSession();
  const shouldRetry = options.auth !== false && options.retryOnAuth !== false;

  try {
    return await performRequest<T>(path, options, session?.accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !shouldRetry) {
      throw error;
    }

    const refreshedSession = await refreshSession();
    if (!refreshedSession) throw error;

    return performRequest<T>(
      path,
      { ...options, retryOnAuth: false },
      refreshedSession.accessToken,
    );
  }
};

export const getApiBaseUrl = () => API_BASE_URL;

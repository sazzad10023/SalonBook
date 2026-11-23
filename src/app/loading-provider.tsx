
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";

type LoadingType =
  | "services"
  | "dashboard"
  | "appointment"
  | "payment";

const loadingMessages: Record<LoadingType, string> = {
  services: "Fetching services...",
  dashboard: "Loading dashboard data...",
  appointment: "Creating your appointment...",
  payment: "Processing your payment...",
};

type LoadingStore = {
  active: LoadingType[];
  listeners: Set<() => void>;
};

// Keep the store on globalThis so a hot reload doesn't orphan an in-flight
// loader from the fetch wrapper installed below.
const STORE_KEY = "__salonbookLoadingStore";
const PATCHED_KEY = "__salonbookFetchPatched";
const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const store = (globalScope[STORE_KEY] ??= {
  active: [],
  listeners: new Set(),
}) as LoadingStore;

function notify() {
  store.listeners.forEach((listener) => listener());
}

function startLoading(type: LoadingType) {
  store.active.push(type);
  notify();
}

function stopLoading(type: LoadingType) {
  const index = store.active.lastIndexOf(type);

  if (index === -1) return;

  store.active.splice(index, 1);
  notify();
}

function clearAllLoading() {
  if (store.active.length === 0) return;

  store.active.length = 0;
  notify();
}

function getSnapshot() {
  return store.active.join("|");
}

function getServerSnapshot() {
  return "";
}

function subscribe(listener: () => void) {
  store.listeners.add(listener);

  return () => {
    store.listeners.delete(listener);
  };
}

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

function getRequestPath(input: FetchInput): string {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  try {
    return new URL(raw, window.location.href).pathname;
  } catch {
    return raw.split("?")[0];
  }
}

function classifyRequest(input: FetchInput, init?: FetchInit): LoadingType | null {
  const headers = init?.headers ?? (input instanceof Request ? input.headers : undefined);

  // Next.js navigation and prefetch requests are not user-facing data loads.
  if (headers) {
    const requestHeaders = new Headers(headers);

    if (
      requestHeaders.has("RSC") ||
      requestHeaders.has("Next-Router-Prefetch")
    ) {
      return null;
    }
  }

  const method = (
    init?.method ?? (input instanceof Request ? input.method : "GET")
  ).toUpperCase();
  const path = getRequestPath(input);
  const inDashboard = window.location.pathname.startsWith("/dashboard");

  if (path === "/api/checkout_sessions" || path === "/api/payments/sync") {
    return "payment";
  }

  if (path === "/appointments" && method === "POST") {
    return "appointment";
  }

  if (
    path === "/api/admin/dashboard/stats" ||
    path === "/customer-stats" ||
    path === "/users" ||
    path === "/transactions" ||
    (path === "/appointments" && method === "GET")
  ) {
    return "dashboard";
  }

  if (
    path === "/services" ||
    path === "/featured-services" ||
    path === "/api/services"
  ) {
    return inDashboard ? "dashboard" : "services";
  }

  return null;
}

// Installed at module load rather than in an effect: child effects run before
// parent effects, so an effect here would miss the first round of requests.
if (typeof window !== "undefined" && !globalScope[PATCHED_KEY]) {
  globalScope[PATCHED_KEY] = true;

  const originalFetch = window.fetch;

  window.fetch = async (input: FetchInput, init?: FetchInit) => {
    const type = classifyRequest(input, init);

    if (type) startLoading(type);

    try {
      return await originalFetch(input, init);
    } finally {
      if (type) stopLoading(type);
    }
  };
}

type LoadingContextType = {
  isLoading: boolean;
  showLoading: (type: LoadingType) => void;
  hideLoading: (type?: LoadingType) => void;
  runWithLoading: <T>(
    type: LoadingType,
    callback: () => Promise<T>,
  ) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const loadingKey = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const activeTypes = loadingKey ? loadingKey.split("|") : [];
  const currentType = activeTypes[activeTypes.length - 1] as
    | LoadingType
    | undefined;

  const showLoading = useCallback((type: LoadingType) => {
    startLoading(type);
  }, []);

  const hideLoading = useCallback((type?: LoadingType) => {
    if (type) stopLoading(type);
    else clearAllLoading();
  }, []);

  const runWithLoading = useCallback(
    async <T,>(
      type: LoadingType,
      callback: () => Promise<T>,
    ): Promise<T> => {
      startLoading(type);

      try {
        return await callback();
      } finally {
        stopLoading(type);
      }
    },
    [],
  );

  return (
    <LoadingContext.Provider
      value={{
        isLoading: activeTypes.length > 0,
        showLoading,
        hideLoading,
        runWithLoading,
      }}
    >
      {children}

      {currentType && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-[2px]"
        >
          <div className="flex min-w-52 flex-col items-center gap-4 rounded-sm border bg-background px-8 py-7 shadow-lg">
            <Loader2 className="size-8 animate-spin text-primary" />

            <p className="text-sm font-medium text-foreground">
              {loadingMessages[currentType]}
            </p>

            <div className="h-1 w-36 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }

  return context;
}

// Persistent anonymous visitor ID for analytics (Pendo, etc.).
// Stored in localStorage so the same browser keeps the same id across sessions.

const STORAGE_KEY = "relay.anonVisitorId";

export function getAnonVisitorId(): string {
  if (typeof window === "undefined") return "anon-ssr";

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const fresh = "anon-" + crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // localStorage blocked (private mode, storage full, etc.) — fall back to
    // a per-pageload id rather than crashing analytics init.
    return "anon-" + crypto.randomUUID();
  }
}

export function clearAnonVisitorId() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

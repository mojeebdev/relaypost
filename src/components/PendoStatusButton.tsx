import { useState } from "react";

type Status = {
  ok: boolean;
  scriptLoaded: boolean;
  windowPendo: boolean;
  initialized: boolean;
  visitorId: string | null;
  accountId: string | null;
  message: string;
};

export function PendoStatusButton() {
  const [status, setStatus] = useState<Status | null>(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      const scriptLoaded = !!document.querySelector(
        'script[src*="cdn.pendo.io/agent/static/"]',
      );
      // @ts-expect-error pendo is injected globally
      const pendo = typeof window !== "undefined" ? window.pendo : undefined;
      const windowPendo = !!pendo;
      const initialized =
        windowPendo && typeof pendo.isReady === "function"
          ? !!pendo.isReady()
          : false;
      let visitorId: string | null = null;
      let accountId: string | null = null;
      try {
        visitorId = initialized ? pendo.getVisitorId?.() ?? null : null;
        accountId = initialized ? pendo.getAccountId?.() ?? null : null;
      } catch {}

      // Ping Pendo's data endpoint to confirm network connectivity
      let networkOk = false;
      try {
        const res = await fetch("https://data.pendo.io/ping", {
          method: "GET",
          mode: "no-cors",
        });
        networkOk = res.type === "opaque" || res.ok;
      } catch {
        networkOk = false;
      }

      const ok = scriptLoaded && windowPendo && initialized && networkOk;
      setStatus({
        ok,
        scriptLoaded,
        windowPendo,
        initialized,
        visitorId,
        accountId,
        message: ok
          ? "Pendo is firing correctly."
          : !scriptLoaded
            ? "Pendo script tag not found in DOM."
            : !windowPendo
              ? "window.pendo is not defined."
              : !initialized
                ? "window.pendo exists but is not initialized yet."
                : "Network ping to data.pendo.io failed.",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="panel p-4 my-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={check}
          disabled={checking}
          className="btn-accent disabled:opacity-50"
        >
          {checking ? "Checking…" : "Check Pendo status"}
        </button>
        {status && (
          <span
            className="label-mono-sm"
            style={{ color: status.ok ? "#16a34a" : "#dc2626" }}
          >
            {status.ok ? "● OK" : "● Issue"}
          </span>
        )}
      </div>
      {status && (
        <ul className="mt-3 text-sm space-y-1 font-mono">
          <li>script loaded: {String(status.scriptLoaded)}</li>
          <li>window.pendo: {String(status.windowPendo)}</li>
          <li>initialized: {String(status.initialized)}</li>
          <li>visitor: {status.visitorId ?? "—"}</li>
          <li>account: {status.accountId ?? "—"}</li>
          <li className="pt-1">{status.message}</li>
        </ul>
      )}
    </div>
  );
}

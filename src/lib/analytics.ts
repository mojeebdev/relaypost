// Thin wrapper around Novus.ai analytics. No-ops gracefully if the SDK
// hasn't loaded (e.g. SSR, ad-blockers, dev).

type NovusAPI = {
  track: (event: string, properties?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    novus?: NovusAPI;
  }
}

export type RelayEvent =
  | { name: "post_generated" }
  | { name: "platform_approved"; platform: string }
  | { name: "platform_skipped"; platform: string }
  | { name: "post_published"; count: number }
  | { name: "pdf_downloaded"; platform: string; postId?: string }
  | { name: "markdown_copied"; platform: string; postId?: string }
  | { name: "post_copied"; platform: string; postId?: string };

export function track(event: RelayEvent) {
  if (typeof window === "undefined") return;
  const { name, ...properties } = event as { name: string } & Record<string, unknown>;
  try {
    window.novus?.track(name, properties);
    // eslint-disable-next-line no-console
    console.log("[analytics]", name, properties);
  } catch (err) {
    // Never let analytics break the app.
    console.warn("[analytics] track failed", err);
  }
}

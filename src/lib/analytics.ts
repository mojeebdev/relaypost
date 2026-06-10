// Thin wrapper around Novus.ai + Pendo analytics. No-ops gracefully if
// either SDK hasn't loaded (e.g. SSR, ad-blockers, dev).

type NovusAPI = {
  track: (event: string, properties?: Record<string, unknown>) => void;
};

type PendoAPI = {
  initialize: (options: Record<string, unknown>) => void;
  identify: (options: Record<string, unknown>) => void;
  track: (event: string, properties?: Record<string, unknown>) => void;
  clearSession: () => void;
};

declare global {
  interface Window {
    novus?: NovusAPI;
    pendo?: PendoAPI;
  }
}

export type RelayEvent =
  | { name: "post_generated"; original_post_length?: number; linkedin_version_length?: number; medium_version_length?: number; facebook_version_length?: number; post_id?: string }
  | { name: "platform_approved"; platform: string; post_id?: string; original_post_length?: number }
  | { name: "platform_skipped"; platform: string; post_id?: string }
  | { name: "post_published"; count: number; post_id?: string; platforms_published?: string; platforms_skipped?: string }
  | { name: "pdf_downloaded"; platform: string; postId?: string; slide_count?: number }
  | { name: "markdown_copied"; platform: string; postId?: string; content_length?: number }
  | { name: "post_copied"; platform: string; postId?: string; content_length?: number }
  | { name: "user_signed_up"; auth_method: string; email_domain?: string }
  | { name: "user_signed_in"; auth_method: string }
  | { name: "content_generation_failed"; error_message?: string; original_post_length?: number }
  | { name: "post_history_viewed"; post_id: string; post_age_days?: number; linkedin_status?: string; medium_status?: string; facebook_status?: string }
  | { name: "user_signed_out" };

export function track(event: RelayEvent) {
  if (typeof window === "undefined") return;
  const { name, ...properties } = event as { name: string } & Record<string, unknown>;
  try {
    window.novus?.track(name, properties);
    window.pendo?.track(name, properties);
    // eslint-disable-next-line no-console
    console.log("[analytics]", name, properties);
  } catch (err) {
    // Never let analytics break the app.
    console.warn("[analytics] track failed", err);
  }
}

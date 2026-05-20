import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Platform = "linkedin" | "medium" | "facebook";
export type Status = "pending" | "approved" | "published" | "skipped";

export type GeneratedPost = {
  id: string;
  original_x_post: string;
  linkedin_version: string;
  medium_version: string;
  facebook_version: string;
  linkedin_status: Status;
  medium_status: Status;
  facebook_status: Status;
};

const PLATFORMS: { key: Platform; label: string; format: string }[] = [
  { key: "linkedin", label: "LinkedIn", format: "Document post" },
  { key: "medium", label: "Medium", format: "Markdown article" },
  { key: "facebook", label: "Facebook", format: "Plain text post" },
];

function statusClass(s: Status) {
  if (s === "approved") return "status-chip approved";
  if (s === "published") return "status-chip published";
  if (s === "skipped") return "status-chip skipped";
  return "status-chip";
}

export function ReviewPanel({ post, onDone }: { post: GeneratedPost; onDone: () => void }) {
  const [statuses, setStatuses] = useState<Record<Platform, Status>>({
    linkedin: post.linkedin_status,
    medium: post.medium_status,
    facebook: post.facebook_status,
  });
  const [drafts, setDrafts] = useState<Record<Platform, string>>({
    linkedin: post.linkedin_version,
    medium: post.medium_version,
    facebook: post.facebook_version,
  });
  const [busy, setBusy] = useState<Platform | null>(null);

  const update = async (p: Platform, status: Status) => {
    setBusy(p);
    try {
      const patch = {
        [`${p}_status`]: status,
        [`${p}_version`]: drafts[p],
        ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
      };
      const { error } = await supabase.from("posts").update(patch as never).eq("id", post.id);
      if (error) throw error;
      setStatuses((s) => ({ ...s, [p]: status }));
      if (status === "approved") toast.success(`${p} approved.`);
      if (status === "published") toast.success(`${p} marked as published.`);
      if (status === "skipped") toast(`${p} skipped.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const copyDraft = async (p: Platform) => {
    await navigator.clipboard.writeText(drafts[p]);
    toast.success(`${p} copy ready on clipboard.`);
  };

  const allHandled = Object.values(statuses).every((s) => s !== "pending");

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="label-mono mb-3">// approval queue</p>
          <h1 className="text-3xl">Three versions. Your call.</h1>
        </div>
        <button onClick={onDone} className="btn-ghost">+ NEW POST</button>
      </div>

      <details className="panel p-4 mb-8">
        <summary className="cursor-pointer label-mono">original x post</summary>
        <pre className="mt-3 text-sm whitespace-pre-wrap" style={{ fontFamily: "var(--font-accent)", color: "var(--ink-secondary)" }}>
          {post.original_x_post}
        </pre>
      </details>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {PLATFORMS.map(({ key, label, format }) => {
          const status = statuses[key];
          const isLocked = status === "approved" || status === "published";
          return (
            <article key={key} className="panel flex flex-col">
              <header className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--void-05)" }}>
                <div>
                  <h2 className="text-lg leading-none">{label}</h2>
                  <p className="label-mono mt-2">{format}</p>
                </div>
                <span className={statusClass(status)}>{status}</span>
              </header>

              <div className="p-4 flex-1">
                <textarea
                  value={drafts[key]}
                  onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                  disabled={isLocked}
                  rows={16}
                  className="textarea-mono"
                  style={{ fontSize: 12, minHeight: 360 }}
                />
              </div>

              <footer className="px-4 pb-4 flex flex-wrap gap-2">
                <button onClick={() => copyDraft(key)} className="btn-ghost flex-1 min-w-[100px]">COPY</button>
                {status === "pending" && (
                  <>
                    <button onClick={() => update(key, "skipped")} disabled={busy === key} className="btn-danger-ghost">SKIP</button>
                    <button onClick={() => update(key, "approved")} disabled={busy === key} className="btn-accent flex-1 min-w-[100px]">
                      APPROVE
                    </button>
                  </>
                )}
                {status === "approved" && (
                  <button onClick={() => update(key, "published")} disabled={busy === key} className="btn-accent flex-1 min-w-[100px]">
                    MARK PUBLISHED
                  </button>
                )}
                {(status === "published" || status === "skipped") && (
                  <button onClick={() => update(key, "pending")} disabled={busy === key} className="btn-ghost flex-1 min-w-[100px]">
                    REOPEN
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </div>

      {allHandled && (
        <div className="mt-10 panel p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="label-mono mb-2" style={{ color: "var(--accent)" }}>// queue cleared</p>
            <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
              All three channels handled. Ready for the next transmission?
            </p>
          </div>
          <button onClick={onDone} className="btn-accent">NEW POST →</button>
        </div>
      )}
    </section>
  );
}

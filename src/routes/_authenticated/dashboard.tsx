import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateVersions, listPosts, getPost } from "@/lib/relay.functions";
import { supabase } from "@/integrations/supabase/client";
import { generateLinkedInPdf } from "@/lib/linkedin-pdf";
import { track } from "@/lib/analytics";

const LOADING_STAGES = ["ANALYZING POST...", "REFORMATTING...", "READY TO APPROVE"] as const;

/** Strip [SLIDE N] labels to make a LinkedIn caption suitable to paste alongside the PDF. */
function linkedinCaption(text: string): string {
  return text
    .replace(/\[SLIDE\s*\d+\][^\n]*\n?/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function copyToClipboard(text: string, successMsg: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMsg);
  } catch {
    toast.error("Could not access clipboard");
  }
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type Status = "pending" | "approved" | "published" | "skipped";
type Platform = "linkedin" | "medium" | "facebook";

type Post = {
  id: string;
  original_x_post: string;
  linkedin_version: string | null;
  medium_version: string | null;
  facebook_version: string | null;
  linkedin_status: Status;
  medium_status: Status;
  facebook_status: Status;
  created_at: string;
  published_at: string | null;
};

const PLATFORMS: { key: Platform; name: string; emoji: string; note: string | null }[] = [
  { key: "linkedin", name: "LinkedIn", emoji: "💼", note: "Will publish as PDF document" },
  { key: "medium", name: "Medium", emoji: "✍️", note: "Markdown format" },
  { key: "facebook", name: "Facebook", emoji: "👥", note: null },
];

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-accent)",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--ink-tertiary)",
};

function StatusBadge({ status }: { status: Status }) {
  const colors: Record<Status, { bg: string; fg: string; border: string }> = {
    pending: { bg: "transparent", fg: "var(--ink-tertiary)", border: "var(--void-05)" },
    approved: { bg: "var(--accent-dim)", fg: "var(--accent)", border: "var(--accent-border)" },
    published: { bg: "var(--accent-dim)", fg: "var(--accent)", border: "var(--accent-border)" },
    skipped: { bg: "transparent", fg: "var(--ink-tertiary)", border: "var(--void-05)" },
  };
  const c = colors[status];
  return (
    <span style={{
      fontFamily: "var(--font-accent)",
      fontSize: 10,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding: "4px 8px",
      borderRadius: 4,
      border: `1px solid ${c.border}`,
      background: c.bg,
      color: c.fg,
      whiteSpace: "nowrap",
    }}>{status}</span>
  );
}

function PulseSpinner() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "#000",
        opacity: 0.6,
        animation: "relay-pulse 1.2s ease-in-out infinite",
        marginRight: 10,
        verticalAlign: "middle",
      }}
    />
  );
}

function DashboardPage() {
  const queryClient = useQueryClient();
  const generate = useServerFn(generateVersions);
  const listFn = useServerFn(listPosts);
  const getFn = useServerFn(getPost);

  const [xPost, setXPost] = useState("");
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [stageIdx, setStageIdx] = useState(0);

  const historyQuery = useQuery({
    queryKey: ["posts"],
    queryFn: () => listFn(),
  });

  const generateMutation = useMutation({
    mutationFn: async (originalXPost: string) => generate({ data: { originalXPost } }),
    onSuccess: (res) => {
      setActivePost(res.post as Post);
      setXPost("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Three versions ready. Approve what ships.");
      track({ name: "post_generated" });
      requestAnimationFrame(() => {
        document.getElementById("approval-queue")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Generation failed"),
  });

  // Sequence loading labels: ANALYZING → REFORMATTING → READY (every 800ms)
  useEffect(() => {
    if (!generateMutation.isPending) {
      setStageIdx(0);
      return;
    }
    setStageIdx(0);
    const t1 = setTimeout(() => setStageIdx(1), 800);
    const t2 = setTimeout(() => setStageIdx(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [generateMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xPost.trim()) return;
    generateMutation.mutate(xPost.trim());
  };

  const updateStatus = async (platform: Platform, status: Status) => {
    if (!activePost) return;
    const patch = { [`${platform}_status`]: status };
    const { error } = await supabase.from("posts").update(patch as never).eq("id", activePost.id);
    if (error) { toast.error(error.message); return; }
    setActivePost({ ...activePost, [`${platform}_status`]: status } as Post);
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    if (status === "approved") track({ name: "platform_approved", platform });
    if (status === "skipped") track({ name: "platform_skipped", platform });
  };

  const publishAllApproved = async () => {
    if (!activePost) return;
    const patch: Record<string, unknown> = { published_at: new Date().toISOString() };
    let count = 0;
    for (const p of PLATFORMS) {
      if (activePost[`${p.key}_status`] === "approved") { patch[`${p.key}_status`] = "published"; count++; }
    }
    const { error } = await supabase.from("posts").update(patch as never).eq("id", activePost.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Approved versions marked as published.");
    setActivePost({ ...activePost, ...patch } as Post);
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    track({ name: "post_published", count });
  };

  const viewPost = async (id: string) => {
    try {
      const res = await getFn({ data: { id } });
      setActivePost(res.post as Post);
      requestAnimationFrame(() => {
        document.getElementById("approval-queue")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load post");
    }
  };

  const approvedCount = activePost
    ? PLATFORMS.filter(p => activePost[`${p.key}_status`] === "approved").length
    : 0;

  const charCount = xPost.length;
  const isGenerating = generateMutation.isPending;

  return (
    <div style={{ paddingBottom: approvedCount > 0 ? 96 : 24 }}>
      <style>{`
        @keyframes relay-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <section className="max-w-5xl mx-auto px-6 pt-12">
        <div className="mb-8">
          <p style={labelStyle}>// NEW TRANSMISSION</p>
          <h1 className="text-4xl mt-3" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
            One post on X. Three platforms primed.
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--void-02)",
            border: "1px solid var(--void-05)",
            borderRadius: 12,
            padding: 32,
          }}
        >
          <label htmlFor="xpost" style={{ ...labelStyle, display: "block", marginBottom: 12 }}>
            PASTE YOUR X POST
          </label>
          <div style={{ position: "relative" }}>
            <textarea
              id="xpost"
              value={xPost}
              onChange={(e) => setXPost(e.target.value)}
              maxLength={4000}
              required
              disabled={isGenerating}
              placeholder="Drop your tweet here. RELAY reformats it for LinkedIn, Medium, and Facebook."
              style={{
                width: "100%",
                background: "var(--void-03)",
                border: "1px solid var(--void-05)",
                color: "var(--ink-primary)",
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: 15,
                lineHeight: 1.7,
                padding: 16,
                paddingBottom: 36,
                borderRadius: 8,
                minHeight: 160,
                resize: "vertical",
                outline: "none",
                transition: "border-color 120ms",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--void-05)"; }}
            />
            <span style={{
              position: "absolute",
              bottom: 10,
              right: 14,
              fontFamily: "var(--font-accent)",
              fontSize: 11,
              color: "var(--ink-tertiary)",
              pointerEvents: "none",
            }}>
              {charCount} / 4000
            </span>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !xPost.trim()}
            style={{
              marginTop: 20,
              width: "100%",
              background: "var(--accent)",
              color: "#000",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              padding: "14px 20px",
              borderRadius: 8,
              fontSize: 13,
              border: "none",
              cursor: isGenerating || !xPost.trim() ? "not-allowed" : "pointer",
              opacity: isGenerating || !xPost.trim() ? 0.5 : 1,
              transition: "opacity 120ms",
            }}
          >
            {isGenerating ? (<><PulseSpinner />{LOADING_STAGES[stageIdx]}</>) : "GENERATE VERSIONS →"}
          </button>
        </form>

        {generateMutation.isError && (
          <div
            role="alert"
            style={{
              marginTop: 20,
              background: "rgba(255,80,80,0.06)",
              border: "1px solid rgba(255,80,80,0.3)",
              borderRadius: 8,
              padding: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ ...labelStyle, color: "#ff8080", marginBottom: 6 }}>// TRANSMISSION FAILED</p>
              <p style={{
                fontFamily: "var(--font-accent)",
                fontSize: 13,
                color: "var(--ink-secondary)",
                margin: 0,
              }}>
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : "Something went wrong."}
              </p>
            </div>
            <button
              onClick={() => generateMutation.reset()}
              style={{
                background: "transparent",
                color: "#ff8080",
                border: "1px solid rgba(255,80,80,0.4)",
                fontFamily: "var(--font-accent)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "10px 16px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              RETRY
            </button>
          </div>
        )}

        {!activePost && !historyQuery.isLoading && (historyQuery.data?.posts?.length ?? 0) === 0 && (
          <EmptyState />
        )}

        {activePost && (
          <div id="approval-queue" className="mt-12">
            <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
              <div>
                <p style={labelStyle}>// APPROVAL QUEUE</p>
                <h2 className="text-2xl mt-2" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  Review &amp; ship.
                </h2>
              </div>
              <button onClick={() => setActivePost(null)} className="btn-ghost" style={{ borderRadius: 6 }}>
                CLEAR
              </button>
            </div>

            <details style={{
              background: "var(--void-02)",
              border: "1px solid var(--void-05)",
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
            }}>
              <summary style={{ ...labelStyle, cursor: "pointer" }}>ORIGINAL X POST</summary>
              <pre style={{
                marginTop: 12,
                fontFamily: "var(--font-accent)",
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--ink-secondary)",
                whiteSpace: "pre-wrap",
              }}>{activePost.original_x_post}</pre>
            </details>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PLATFORMS.map((p) => {
                const status = activePost[`${p.key}_status`] as Status;
                const content = activePost[`${p.key}_version`] as string | null;
                const isApproved = status === "approved" || status === "published";
                return (
                  <article
                    key={p.key}
                    style={{
                      background: "var(--void-02)",
                      border: "1px solid var(--void-05)",
                      borderLeft: isApproved ? "3px solid var(--accent)" : "1px solid var(--void-05)",
                      borderRadius: 12,
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <header className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 20 }}>{p.emoji}</span>
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, margin: 0 }}>
                          {p.name}
                        </h3>
                      </div>
                      <StatusBadge status={status} />
                    </header>

                    {p.note && (
                      <span style={{
                        fontFamily: "var(--font-accent)",
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        background: "var(--accent-dim)",
                        border: "1px solid var(--accent-border)",
                        padding: "4px 8px",
                        borderRadius: 4,
                        alignSelf: "flex-start",
                      }}>
                        {p.note}
                      </span>
                    )}

                    <div style={{
                      background: "var(--void-03)",
                      borderRadius: 6,
                      padding: 16,
                      maxHeight: 240,
                      overflowY: "auto",
                      fontFamily: "var(--font-accent)",
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--ink-secondary)",
                      whiteSpace: "pre-wrap",
                    }}>
                      {content ?? "—"}
                    </div>

                    <footer className="flex gap-2">
                      <button
                        onClick={() => updateStatus(p.key, "skipped")}
                        disabled={status === "published"}
                        style={{
                          flex: 1,
                          background: "transparent",
                          color: "var(--ink-secondary)",
                          border: "1px solid var(--void-05)",
                          fontFamily: "var(--font-accent)",
                          fontSize: 11,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "10px",
                          borderRadius: 6,
                          cursor: status === "published" ? "not-allowed" : "pointer",
                          opacity: status === "published" ? 0.4 : 1,
                        }}
                      >
                        SKIP
                      </button>
                      <button
                        onClick={() => updateStatus(p.key, "approved")}
                        disabled={status === "approved" || status === "published"}
                        style={{
                          flex: 1,
                          background: "var(--accent)",
                          color: "#000",
                          border: "none",
                          fontFamily: "var(--font-display)",
                          fontWeight: 500,
                          fontSize: 12,
                          letterSpacing: "0.1em",
                          padding: "10px",
                          borderRadius: 6,
                          cursor: isApproved ? "not-allowed" : "pointer",
                          opacity: isApproved ? 0.5 : 1,
                        }}
                      >
                        {status === "published" ? "PUBLISHED" : status === "approved" ? "APPROVED" : "APPROVE"}
                      </button>
                    </footer>

                    {content && <ExportActions platform={p.key} content={content} />}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <HistorySection
          posts={historyQuery.data?.posts as Post[] | undefined ?? []}
          loading={historyQuery.isLoading}
          onView={viewPost}
        />
      </section>

      {activePost && approvedCount > 0 && (
        <div
          style={{
            position: "fixed",
            left: 0, right: 0, bottom: 0,
            height: 72,
            background: "var(--void-02)",
            borderTop: "1px solid var(--void-05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            zIndex: 40,
          }}
        >
          <span style={{
            fontFamily: "var(--font-accent)",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-primary)",
          }}>
            <span style={{ color: "var(--accent)" }}>{approvedCount}</span>
            <span style={{ color: "var(--ink-tertiary)" }}> of 3 platforms approved</span>
          </span>
          <button
            onClick={publishAllApproved}
            style={{
              background: "var(--accent)",
              color: "#000",
              border: "none",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              fontSize: 13,
              padding: "12px 22px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            PUBLISH ALL APPROVED →
          </button>
        </div>
      )}
    </div>
  );
}

function HistorySection({ posts, loading, onView }: { posts: Post[]; loading: boolean; onView: (id: string) => void }) {
  return (
    <section className="mt-16">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p style={labelStyle}>// POST HISTORY</p>
          <h2 className="text-2xl mt-2" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
            The wire log.
          </h2>
        </div>
        <span style={{ ...labelStyle }}>{posts.length} TRANSMISSIONS</span>
      </div>

      <div style={{
        background: "var(--void-02)",
        border: "1px solid var(--void-05)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        {loading ? (
          <HistorySkeleton />
        ) : posts.length === 0 ? (
          <div className="p-10 text-center">
            <p style={{ ...labelStyle, marginBottom: 8 }}>// LOG EMPTY</p>
            <p style={{ color: "var(--ink-secondary)", fontSize: 14 }}>
              Generate your first transmission to populate the wire.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--void-05)" }}>
                  {["Date", "Preview", "LinkedIn", "Medium", "Facebook", ""].map((h) => (
                    <th key={h} style={{
                      ...labelStyle,
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 400,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--void-04)" }}>
                    <td style={{
                      padding: "14px 16px",
                      fontFamily: "var(--font-accent)",
                      fontSize: 12,
                      color: "var(--ink-secondary)",
                      whiteSpace: "nowrap",
                    }}>
                      {new Date(p.created_at).toLocaleDateString(undefined, {
                        year: "2-digit", month: "short", day: "2-digit",
                      })}
                    </td>
                    <td style={{
                      padding: "14px 16px",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--ink-primary)",
                      maxWidth: 320,
                    }}>
                      {p.original_x_post.slice(0, 60)}{p.original_x_post.length > 60 ? "…" : ""}
                    </td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={p.linkedin_status} /></td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={p.medium_status} /></td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={p.facebook_status} /></td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => onView(p.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--void-05)",
                          color: "var(--ink-primary)",
                          fontFamily: "var(--font-accent)",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "6px 12px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function ExportActions({ platform, content, postId }: { platform: Platform; content: string; postId?: string }) {
  const btnPrimary: CSSProperties = {
    flex: 1,
    background: "var(--accent)",
    color: "#000",
    border: "none",
    fontFamily: "var(--font-display)",
    fontWeight: 500,
    fontSize: 11,
    letterSpacing: "0.1em",
    padding: "10px",
    borderRadius: 6,
    cursor: "pointer",
  };
  const btnGhost: CSSProperties = {
    flex: 1,
    background: "transparent",
    color: "var(--ink-secondary)",
    border: "1px solid var(--void-05)",
    fontFamily: "var(--font-accent)",
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "10px",
    borderRadius: 6,
    cursor: "pointer",
  };

  if (platform === "linkedin") {
    const caption = linkedinCaption(content);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          style={btnPrimary}
          onClick={() => {
            generateLinkedInPdf(content);
            track({ name: "pdf_downloaded", platform: "linkedin", postId });
            toast.success("PDF downloaded. Upload to LinkedIn as a document post.");
          }}
        >
          ↓ DOWNLOAD PDF
        </button>
        <button
          style={btnGhost}
          onClick={() => {
            copyToClipboard(caption, "Caption copied — paste alongside your PDF upload.");
            track({ name: "post_copied", platform: "linkedin", postId });
          }}
        >
          COPY POST CAPTION
        </button>
      </div>
    );
  }

  if (platform === "medium") {
    return (
      <button
        style={btnPrimary}
        title="Paste this into Medium's editor — formatting is preserved"
        onClick={() => {
          copyToClipboard(content, "Markdown copied — paste directly into Medium editor.");
          track({ name: "markdown_copied", platform: "medium", postId });
        }}
      >
        COPY MARKDOWN
      </button>
    );
  }

  // Facebook
  return (
    <button
      style={btnPrimary}
      title="Paste this into Facebook — the formatting is optimized for FB's algorithm"
      onClick={() => {
        copyToClipboard(content, "Post copied — paste into Facebook.");
        track({ name: "post_copied", platform: "facebook", postId });
      }}
    >
      COPY POST
    </button>
  );
}

function EmptyState() {
  return (
    <div
      className="mt-16 mb-8 px-6 text-center"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}
    >
      <style>{`
        @keyframes relay-line-pulse {
          0%, 100% { opacity: 0.15; transform: scaleX(0.6); }
          50%      { opacity: 0.9;  transform: scaleX(1); }
        }
      `}</style>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(28px, 5vw, 44px)",
          lineHeight: 1.1,
          color: "var(--ink-primary)",
          maxWidth: 640,
          margin: 0,
        }}
      >
        Your X posts deserve a wider audience.
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          fontSize: 16,
          color: "var(--ink-secondary)",
          maxWidth: 480,
          margin: 0,
        }}
      >
        Paste a post above — RELAY handles the rest.
      </p>
      <div
        aria-hidden
        style={{
          width: 120,
          height: 2,
          background: "var(--accent)",
          borderRadius: 2,
          marginTop: 10,
          transformOrigin: "center",
          animation: "relay-line-pulse 2.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function HistorySkeleton() {
  const cellBase: CSSProperties = {
    background: "var(--void-03)",
    borderRadius: 4,
    height: 12,
    animation: "relay-pulse 1.4s ease-in-out infinite",
  };
  return (
    <div style={{ padding: "8px 0" }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 90px 90px 90px 60px",
            gap: 16,
            padding: "16px 16px",
            borderBottom: i === 3 ? "none" : "1px solid var(--void-04)",
            alignItems: "center",
          }}
        >
          <div style={{ ...cellBase, width: 70 }} />
          <div style={{ ...cellBase, width: "85%" }} />
          <div style={{ ...cellBase, width: 64, height: 18, borderRadius: 4 }} />
          <div style={{ ...cellBase, width: 64, height: 18, borderRadius: 4 }} />
          <div style={{ ...cellBase, width: 64, height: 18, borderRadius: 4 }} />
          <div style={{ ...cellBase, width: 40, height: 18, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}





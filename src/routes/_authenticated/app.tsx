import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateVersions } from "@/lib/relay.functions";
import { ReviewPanel, type GeneratedPost } from "@/components/ReviewPanel";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppPage,
});

function AppPage() {
  const [xPost, setXPost] = useState("");
  const [generated, setGenerated] = useState<GeneratedPost | null>(null);
  const generate = useServerFn(generateVersions);

  const mutation = useMutation({
    mutationFn: async (originalXPost: string) => generate({ data: { originalXPost } }),
    onSuccess: (res) => {
      setGenerated(res.post as GeneratedPost);
      toast.success("Three versions reformatted. Review and approve.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Generation failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!xPost.trim()) return;
    mutation.mutate(xPost.trim());
  };

  const handleReset = () => {
    setGenerated(null);
    setXPost("");
  };

  if (generated) {
    return <ReviewPanel post={generated} onDone={handleReset} />;
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="label-mono mb-3">// new transmission</p>
        <h1 className="text-4xl mb-3">Paste an X post.</h1>
        <p className="text-sm" style={{ color: "var(--ink-secondary)" }}>
          RELAY reformats it for LinkedIn (document post), Medium (Markdown article),
          and Facebook (plain text). Review each before it ships.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-mono block mb-2">x post — raw text</label>
          <textarea
            value={xPost}
            onChange={(e) => setXPost(e.target.value)}
            rows={8}
            placeholder="Paste your tweet here. RELAY handles the rest."
            className="textarea-mono"
            maxLength={4000}
            required
          />
          <div className="flex justify-between mt-2">
            <span className="label-mono">{xPost.length} / 4000</span>
            <span className="label-mono" style={{ color: "var(--ink-tertiary)" }}>
              signature: @mojeebeth
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending || !xPost.trim()} className="btn-accent">
            {mutation.isPending ? "RELAYING…" : "RELAY →"}
          </button>
          {mutation.isPending && (
            <span className="label-mono" style={{ color: "var(--ink-secondary)" }}>
              <span className="blink-dot inline-block mr-2 align-middle" />
              three channels open · please wait
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

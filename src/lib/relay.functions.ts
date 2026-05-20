import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SIGNATURE = "— First published on X. Follow @mojeebeth for daily builds and breakdowns.";

const SYSTEM = `You are RELAY, a content reformatter. First, identify the CORE IDEA in the X post. Then reformat it natively for the target platform while preserving the author's voice, ideas, and specifics. Never invent facts. Never add hashtags unless they were already there. Output ONLY the reformatted post text — no preamble, no quotes, no commentary, no markdown code fences.`;

const PROMPTS = {
  linkedin: (post: string) => `Reformat the following X post as a LinkedIn CAROUSEL / DOCUMENT POST SCRIPT.

Structure — output as labeled slides:
[SLIDE 1] — Hook: the most compelling single line from the post. Short. Punchy.
[SLIDE 2] — First key point, expanded with one sentence of context.
[SLIDE 3] — Second key point, expanded with one sentence of context.
[SLIDE 4] — Third key point, expanded with one sentence of context.
[SLIDE 5] — Fourth key point or insight, expanded.
[SLIDE 6] — CTA: ask the reader to follow + a specific engagement prompt (e.g. "What's your take? Drop it below.").

Tone: professional but human, first-person. Keep each slide tight — a few short lines max.

Source X post:
"""${post}"""`,
  medium: (post: string) => `Reformat the following X post as a full MEDIUM ARTICLE in clean Markdown.

Requirements:
- Start with an H1 title (#) — a compelling, specific title you craft from the post's core idea.
- 2-4 H2 subheads (##), each followed by an expanded paragraph (3-5 sentences).
- Thoughtful, essay-like tone — expand each point with reasoning, not filler.
- End with a horizontal rule (---) on its own line BEFORE the closing attribution line.

Length: ~350-550 words.

Source X post:
"""${post}"""`,
  facebook: (post: string) => `Reformat the following X post as a FACEBOOK POST.

Requirements:
- Conversational, warm, community-feeling tone — like talking to friends.
- Remove all technical jargon; use plain language.
- Weave exactly 3 relevant emojis naturally INSIDE the text (not stacked at the end).
- Short line breaks between thoughts.
- Strictly under 300 words.

Source X post:
"""${post}"""`,
};

async function callLovableAI(prompt: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("AI returned empty content");
  return content;
}

function withSignature(body: string, platform: "linkedin" | "medium" | "facebook"): string {
  const trimmed = body.trim();
  if (platform === "medium") {
    // Ensure horizontal rule before attribution
    if (/\n---\s*$/.test(trimmed)) return `${trimmed}\n\n${SIGNATURE}`;
    return `${trimmed}\n\n---\n\n${SIGNATURE}`;
  }
  return `${trimmed}\n\n${SIGNATURE}`;
}

export const generateVersions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ originalXPost: z.string().min(1).max(4000) }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [linkedin, medium, facebook] = await Promise.all([
      callLovableAI(PROMPTS.linkedin(data.originalXPost)),
      callLovableAI(PROMPTS.medium(data.originalXPost)),
      callLovableAI(PROMPTS.facebook(data.originalXPost)),
    ]);

    const { data: row, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        original_x_post: data.originalXPost,
        linkedin_version: withSignature(linkedin, "linkedin"),
        medium_version: withSignature(medium, "medium"),
        facebook_version: withSignature(facebook, "facebook"),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { post: row };
  });

export const listPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("posts")
      .select("id, original_x_post, linkedin_status, medium_status, facebook_status, created_at, published_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { posts: data ?? [] };
  });

export const getPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { post: row };
  });

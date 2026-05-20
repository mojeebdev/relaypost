import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SIGNATURE = "This post was first published on X — follow @mojeebeth for more.";

const SYSTEM = `You are RELAY, a content reformatter. You take a short X (Twitter) post and adapt it for another platform while preserving the author's voice, ideas, and specifics. Never invent facts. Never add hashtags unless they were already there. Output ONLY the reformatted post text — no preamble, no quotes, no commentary, no markdown code fences.`;

const PROMPTS = {
  linkedin: (post: string) => `Reformat the following X post as a LinkedIn document post (the kind that becomes a PDF carousel-style long-form post). Use a strong opening line on its own line, then short paragraphs separated by blank lines. No emojis unless in the source. Keep it professional but warm. Length: ~150-280 words.\n\nSource X post:\n"""${post}"""`,
  medium: (post: string) => `Reformat the following X post as a clean Medium article in Markdown. Add a short, specific H1 title, then 2-4 short sections with H2 subheads, then a closing paragraph. Use lists or blockquotes only if they genuinely help. Length: ~250-450 words.\n\nSource X post:\n"""${post}"""`,
  facebook: (post: string) => `Reformat the following X post as a plain text Facebook post. Conversational, line breaks between thoughts, slightly longer than the original but not bloated. No markdown, no hashtags unless in the source. Length: ~80-180 words.\n\nSource X post:\n"""${post}"""`,
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

function withSignature(body: string): string {
  return `${body.trim()}\n\n${SIGNATURE}`;
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
        linkedin_version: withSignature(linkedin),
        medium_version: withSignature(medium),
        facebook_version: withSignature(facebook),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { post: row };
  });

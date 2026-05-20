import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "RELAY — Write once. Distribute everywhere." },
      {
        name: "description",
        content:
          "RELAY reformats your X posts for LinkedIn (as a PDF), Medium (as Markdown), and Facebook — so X stays the source of truth.",
      },
      { property: "og:title", content: "RELAY — Write once. Distribute everywhere." },
      {
        property: "og:description",
        content: "X-first content distribution. Reformat once, ship to LinkedIn, Medium, and Facebook.",
      },
    ],
  }),
  component: LandingPage,
});

const eyebrow: CSSProperties = {
  fontFamily: "var(--font-accent)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "var(--accent)",
};

const label: CSSProperties = {
  fontFamily: "var(--font-accent)",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--ink-tertiary)",
};

const FEATURES = [
  {
    icon: "▤",
    title: "LinkedIn PDF",
    body: "Auto-generated carousel document, ready to upload.",
  },
  {
    icon: "≡",
    title: "Medium Markdown",
    body: "Title, sections, attribution — paste straight into the editor.",
  },
  {
    icon: "◐",
    title: "Facebook Post",
    body: "Warm, conversational, emoji-tuned for the feed.",
  },
];

function LandingPage() {
  return (
    <div className="relay-shell min-h-screen flex flex-col">
      {/* Top-right sign-in */}
      <header className="flex justify-end px-6 sm:px-10 pt-6">
        <Link
          to="/login"
          style={{
            fontFamily: "var(--font-accent)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--ink-secondary)",
            textDecoration: "none",
          }}
        >
          Sign in →
        </Link>
      </header>

      {/* Hero */}
      <section
        className="flex-1 flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: "82vh" }}
      >
        <p style={eyebrow}>X-FIRST CONTENT DISTRIBUTION</p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(72px, 12vw, 140px)",
            lineHeight: 0.95,
            color: "var(--ink-primary)",
            margin: "24px 0 28px",
            letterSpacing: "-0.02em",
          }}
        >
          RELAY
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            color: "var(--ink-secondary)",
            maxWidth: 480,
            fontSize: 18,
            lineHeight: 1.55,
            margin: "0 auto",
          }}
        >
          Write once. Distribute everywhere. X stays the source of truth.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            style={{
              background: "var(--accent)",
              color: "#000",
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              letterSpacing: "0.08em",
              fontSize: 13,
              padding: "14px 22px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            START DISTRIBUTING →
          </Link>
          <a
            href="#how"
            style={{
              background: "transparent",
              color: "var(--ink-primary)",
              border: "1px solid var(--void-05)",
              fontFamily: "var(--font-accent)",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "13px 20px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            See how it works ↓
          </a>
        </div>
      </section>

      {/* Feature row */}
      <section
        id="how"
        className="px-6 sm:px-10 pb-24"
        style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}
      >
        <p style={{ ...label, textAlign: "center", marginBottom: 28 }}>
          // THREE PLATFORMS, ONE TRANSMISSION
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: "var(--void-02)",
                border: "1px solid var(--void-05)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                aria-hidden
                style={{
                  fontSize: 22,
                  color: "var(--accent)",
                  marginBottom: 16,
                  fontFamily: "var(--font-accent)",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 18,
                  margin: "0 0 8px",
                  color: "var(--ink-primary)",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  color: "var(--ink-secondary)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 sm:px-10 py-6 text-center"
        style={{
          borderTop: "1px solid var(--void-05)",
          ...label,
        }}
      >
        RELAY by mojeebeth · Built during World Product Day Hackathon 2026
      </footer>
    </div>
  );
}

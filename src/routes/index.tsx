import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
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

const GRID_BG: CSSProperties = {
  backgroundColor: "#050508",
  backgroundImage:
    "linear-gradient(#1E1E28 1px, transparent 1px), linear-gradient(90deg, #1E1E28 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

const PILL_ACCENT_SOFT: CSSProperties = {
  background: "rgba(0,255,157,0.08)",
  border: "0.5px solid rgba(0,255,157,0.3)",
  color: "#00FF9D",
  fontFamily: "IBM Plex Mono, monospace",
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  padding: "7px 16px",
  borderRadius: 999,
  display: "inline-block",
};

const PILL_NEUTRAL: CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "0.5px solid rgba(255,255,255,0.1)",
  color: "#8A8A9A",
  fontFamily: "IBM Plex Mono, monospace",
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  padding: "7px 16px",
  borderRadius: 999,
  display: "inline-block",
};

const STEPS = [
  {
    n: "01",
    title: "Paste your X post",
    body: "Drop any post from X into the input. Any length, any format.",
  },
  {
    n: "02",
    title: "RELAY formats it",
    body: "The AI Content Reflow engine fires three parallel calls — LinkedIn carousel, Medium essay, Facebook post. Every version adds your X attribution.",
  },
  {
    n: "03",
    title: "You approve. It distributes.",
    body: "Review each version side by side. Approve what you want. Nothing publishes without your sign-off.",
  },
];

const PLATFORMS = [
  { icon: "in", label: "LinkedIn PDF" },
  { icon: "M", label: "Medium MD" },
  { icon: "f", label: "Facebook" },
];

const FAQS = [
  {
    q: "Do I need to connect my X account?",
    a: "No. You paste the post text — RELAY reformats it for the other platforms. X stays the source of truth, no API access required.",
  },
  {
    q: "What does RELAY actually publish?",
    a: "A LinkedIn-ready PDF carousel, a Medium-ready Markdown essay, and a Facebook-tuned post. You approve each one before anything leaves your hands.",
  },
  {
    q: "Does it auto-publish to LinkedIn, Medium, or Facebook?",
    a: "Not yet. RELAY generates the assets and copy; you upload or paste them. This keeps the loop honest and keeps you in control.",
  },
  {
    q: "Which AI model powers the reformatting?",
    a: "RELAY runs on Lovable AI Gateway with frontier models tuned for tone-shifting between platforms.",
  },
  {
    q: "Is my content stored?",
    a: "Your posts are saved to your private dashboard so you can revisit drafts. Only you can read them.",
  },
  {
    q: "Who built this?",
    a: "A solo founder in Lagos shipping under BlindspotLab. Built during Mind the Product World Product Day Hackathon 2026.",
  },
];

function LandingPage() {
  return (
    <div style={{ ...GRID_BG, minHeight: "100vh", position: "relative" }}>
      <Hero />
      <HowItWorks />
      <Why />
      <Faq />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section
      style={{
        ...GRID_BG,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 24px 80px",
        gap: 24,
      }}
    >
      <span style={PILL_ACCENT_SOFT}>X-FIRST CONTENT DISTRIBUTION</span>

      <h1
        style={{
          fontFamily: "Array, sans-serif",
          fontSize: "clamp(80px, 12vw, 140px)",
          fontWeight: 500,
          color: "#F0F0F8",
          letterSpacing: "0.05em",
          lineHeight: 0.88,
          margin: 0,
        }}
      >
        RELAY
      </h1>

      <p
        style={{
          fontFamily: "IBM Plex Sans, sans-serif",
          fontWeight: 300,
          fontSize: 16,
          color: "rgba(240,240,248,0.65)",
          lineHeight: 1.7,
          maxWidth: 400,
          margin: 0,
        }}
      >
        Write once on X. Distribute everywhere.
        <br />X stays the source of truth.
      </p>

      <span
        style={{
          background: "rgba(0,255,157,0.06)",
          border: "1px solid rgba(0,255,157,0.2)",
          color: "rgba(0,255,157,0.7)",
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          padding: "8px 20px",
          borderRadius: 999,
          display: "inline-block",
        }}
      >
        THREE PLATFORMS. ONE TRANSMISSION.
      </span>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {PLATFORMS.map((p) => (
          <span
            key={p.label}
            style={{
              background: "rgba(0,255,157,0.06)",
              border: "0.5px solid rgba(0,255,157,0.2)",
              color: "#00FF9D",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 11,
              padding: "6px 14px",
              borderRadius: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 12 }}>{p.icon}</span>
            {p.label}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          to="/login"
          style={{
            background: "#00FF9D",
            color: "#000000",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "13px 28px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          START DISTRIBUTING →
        </Link>
        <a
          href="#how"
          style={{
            background: "transparent",
            border: "0.5px solid rgba(240,240,248,0.12)",
            color: "rgba(240,240,248,0.45)",
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "13px 28px",
            borderRadius: 6,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          SEE HOW IT WORKS ↓
        </a>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how"
      style={{
        ...GRID_BG,
        padding: "100px clamp(24px, 6vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={PILL_NEUTRAL}>HOW IT WORKS</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                background: "#0C0C12",
                border: "0.5px solid #2C2C3A",
                borderRadius: 12,
                padding: "32px 28px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background:
                    "linear-gradient(to right, transparent, rgba(0,255,157,0.35), transparent)",
                }}
              />
              <span
                style={{
                  background: "rgba(0,255,157,0.08)",
                  border: "0.5px solid rgba(0,255,157,0.2)",
                  color: "#00FF9D",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  padding: "4px 10px",
                  borderRadius: 999,
                  display: "inline-block",
                  marginBottom: 16,
                }}
              >
                {s.n}
              </span>
              <h3
                style={{
                  fontFamily: "Array, sans-serif",
                  fontWeight: 500,
                  fontSize: 20,
                  color: "#F0F0F8",
                  margin: "0 0 12px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "IBM Plex Sans, sans-serif",
                  fontWeight: 300,
                  fontSize: 14,
                  color: "#8A8A9A",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section
      style={{
        ...GRID_BG,
        borderTop: "1px solid #2C2C3A",
        padding: "100px clamp(24px, 6vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <span style={{ ...PILL_ACCENT_SOFT, marginBottom: 32, borderColor: "rgba(0,255,157,0.25)" }}>
          WHY RELAY EXISTS
        </span>
        <h2
          style={{
            fontFamily: "Array, sans-serif",
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 500,
            color: "#F0F0F8",
            lineHeight: 1.05,
            margin: "32px 0 40px",
          }}
        >
          Your X posts deserve a wider audience.
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 680,
            fontFamily: "IBM Plex Sans, sans-serif",
            fontWeight: 300,
            fontSize: 16,
            color: "#8A8A9A",
            lineHeight: 1.85,
          }}
        >
          <p style={{ margin: 0 }}>
            Every builder, creator, and thinker who posts on X faces the same silent tax: the
            content dies there. LinkedIn has a different audience. Medium wants an essay. Facebook
            needs a different tone.
          </p>
          <p style={{ margin: 0 }}>
            Reformatting manually for three platforms after already writing the post is friction
            nobody wants to pay — so most people don't. The content stays on X. The reach stays
            small.
          </p>
          <p style={{ margin: 0 }}>
            RELAY fixes the last mile. One post. Three platforms. X stays the source of truth.
            Built by a solo founder in Lagos who was tired of paying the tax.
          </p>
        </div>
        <p
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 11,
            color: "#4A4A5A",
            letterSpacing: "0.1em",
            marginTop: 40,
          }}
        >
          Built during Mind the Product World Product Day Hackathon 2026.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section
      style={{
        ...GRID_BG,
        borderTop: "1px solid #2C2C3A",
        padding: "100px clamp(24px, 6vw, 80px)",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={PILL_NEUTRAL}>FREQUENTLY ASKED</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                style={{
                  background: "#0C0C12",
                  border: "0.5px solid #2C2C3A",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "IBM Plex Sans, sans-serif",
                    fontSize: 15,
                    color: "#F0F0F8",
                  }}
                >
                  <span>{f.q}</span>
                  <span
                    style={{
                      color: "#00FF9D",
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: 14,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 24px 20px",
                      fontFamily: "IBM Plex Sans, sans-serif",
                      fontWeight: 300,
                      fontSize: 14,
                      color: "#8A8A9A",
                      lineHeight: 1.75,
                    }}
                  >
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const linkStyle: CSSProperties = {
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: 11,
    color: "#4A4A5A",
    textDecoration: "none",
  };
  return (
    <footer
      style={{
        borderTop: "1px solid #2C2C3A",
        background: "#0C0C12",
        padding: "40px clamp(24px, 6vw, 80px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
      className="relay-footer"
    >
      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "Array, sans-serif",
            fontWeight: 500,
            fontSize: 16,
            color: "#F0F0F8",
            letterSpacing: "0.08em",
          }}
        >
          RELAY
        </span>
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 11,
            color: "#4A4A5A",
            marginLeft: 20,
          }}
        >
          Built by @mojeebeth
        </span>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <a href="https://github.com/mojeebdev/relaypost" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          GitHub
        </a>
        <a href="https://x.com/mojeebeth" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          X / Twitter
        </a>
        <a href="https://blindspotlab.xyz" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          BlindspotLab
        </a>
      </div>

      <div
        style={{
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 10,
          color: "#4A4A5A",
          letterSpacing: "0.06em",
        }}
      >
        © 2026 RELAY · World Product Day Hackathon
      </div>

      <style>{`
        @media (max-width: 640px) {
          .relay-footer {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </footer>
  );
}

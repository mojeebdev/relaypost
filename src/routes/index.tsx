import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";
import diagramAsset from "@/assets/relay-howitworks-2.png.asset.json";
import videoAsset from "@/assets/relay-hero.mp4.asset.json";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "RELAY — Write once on X. Distribute everywhere." },
      {
        name: "description",
        content:
          "X-first content distribution. RELAY reformats your X posts for LinkedIn (PDF), Medium (Markdown), and Facebook — so X stays the source of truth.",
      },
      { property: "og:title", content: "RELAY — Write once on X. Distribute everywhere." },
      {
        property: "og:description",
        content: "X-first content distribution. Reformat once, ship to LinkedIn, Medium, and Facebook.",
      },
      { property: "og:url", content: "https://relaypost.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://relaypost.lovable.app/" }],
  }),
  component: LandingPage,
});

const mono: CSSProperties = { fontFamily: "var(--font-accent)" };
const display: CSSProperties = { fontFamily: "var(--font-display)" };
const body: CSSProperties = { fontFamily: "var(--font-body)" };

const eyebrowAccent: CSSProperties = {
  ...mono,
  fontSize: 11,
  color: "var(--accent)",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  margin: 0,
};
const eyebrowDim: CSSProperties = {
  ...mono,
  fontSize: 11,
  color: "var(--ink-tertiary)",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  margin: 0,
};

const FAQS = [
  {
    q: "Does RELAY actually publish to LinkedIn, Medium and Facebook automatically?",
    a: "Not yet — RELAY is intentionally approval-first. You review and approve each platform version before anything goes live. For LinkedIn, it generates a downloadable PDF document post. For Medium, it copies clean Markdown to your clipboard. For Facebook, it copies the formatted post. One approval click, then you paste or upload. Direct API publishing is on the roadmap.",
  },
  {
    q: "What makes the LinkedIn version different from just copying my tweet?",
    a: "RELAY formats it as a LinkedIn carousel script — structured with slide-by-slide content, a hook on slide one, key points expanded across slides, and a CTA closing slide. It then generates that as a PDF document post, which gets significantly higher organic reach on LinkedIn than plain text posts.",
  },
  {
    q: "What is the attribution line it adds?",
    a: "Every version automatically appends: 'First published on X — follow @[your handle] for more.' This stamps X as the source of truth for your content and drives cross-platform audience back to where you think out loud.",
  },
  {
    q: "Is my content stored anywhere?",
    a: "Yes — your posts and generated versions are saved to your account in the post history dashboard so you can revisit, re-export, or track what you've distributed. You can delete any post from your history at any time.",
  },
  {
    q: "How does the AI Content Reflow work?",
    a: "When you hit Generate, RELAY fires three parallel calls through Lovable AI Gateway simultaneously — one prompt engineered specifically for LinkedIn slides, one for a Medium essay, one for a Facebook post. Each call understands the platform's native format, tone, and audience. The results arrive together, side by side, ready for your approval.",
  },
  {
    q: "Is RELAY free to use?",
    a: "RELAY is currently free during the hackathon period. Sign up, connect your account, and start distributing. Pricing will be introduced post-launch with a generous free tier for solo builders.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Paste your X post",
    desc: "Drop any post you published on X into the input. Any length, any format.",
  },
  {
    n: "02",
    title: "RELAY formats it",
    desc: "The AI Content Reflow engine fires three parallel calls — one per platform. LinkedIn gets a carousel script, Medium gets an essay, Facebook gets a conversational rewrite. Every version adds your X attribution.",
  },
  {
    n: "03",
    title: "You approve. It distributes.",
    desc: "Review each version side by side. Approve what you want. Skip what you don't. Nothing publishes without your sign-off.",
  },
];

function LandingPage() {
  return (
    <div style={{ ...body, color: "var(--ink-primary)" }}>
      <style>{`
        @keyframes relay-pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
        .relay-nav {
          position: fixed; top: 0; left: 0; right: 0; height: 64px; z-index: 50;
          background: var(--void-02); border-bottom: 1px solid var(--void-05);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(24px, 6vw, 80px);
        }
        .relay-dot { width: 6px; height: 6px; border-radius: 9999px; background: var(--accent); box-shadow: 0 0 10px var(--accent); animation: relay-pulse 1.8s ease-in-out infinite; }
        .relay-signin { font-family: var(--font-accent); font-size: 11px; color: var(--ink-tertiary); letter-spacing: 0.08em; text-decoration: none; transition: color .15s; }
        .relay-signin:hover { color: var(--ink-primary); }

        .hero-grid { display: grid; grid-template-columns: 1fr 52%; align-items: center; max-width: 1280px; margin: 0 auto; padding: 0 clamp(24px, 6vw, 80px); min-height: 100vh; padding-top: 64px; gap: 48px; position: relative; z-index: 1; }
        .hero-left { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 20px; }
        .hero-video-wrap { width: 100%; height: 100%; min-height: 520px; border-radius: 12px; border: 0.5px solid var(--void-05); overflow: hidden; position: relative; z-index: 1; }
        .hero-video-wrap video { width: 100%; height: 100%; object-fit: cover; object-position: right center; display: block; background: var(--void-01); }

        .btn-primary-cta { background: #00FF9D; color: #000000; font-family: var(--font-display); font-weight: 500; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; padding: 13px 26px; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; display: inline-block; transition: opacity .15s, transform .15s; }
        .btn-primary-cta:hover { opacity: .88; transform: translateY(-1px); }
        .btn-ghost-cta { background: transparent; border: 0.5px solid var(--void-05); color: #8A8A9A; font-family: var(--font-accent); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 13px 26px; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; transition: border-color .15s, color .15s; }
        .btn-ghost-cta:hover { border-color: var(--accent-border); color: var(--ink-primary); }

        .platform-badge { background: rgba(0,255,157,0.08); border: 0.5px solid rgba(0,255,157,0.25); color: #00FF9D; font-family: var(--font-accent); font-size: 11px; letter-spacing: 0.08em; padding: 6px 12px; border-radius: 4px; }

        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }

        .faq-item { border-bottom: 1px solid var(--void-05); padding: 24px 0; }
        .faq-q { display: flex; justify-content: space-between; align-items: center; cursor: pointer; gap: 16px; background: none; border: none; padding: 0; width: 100%; text-align: left; color: inherit; }
        .faq-q-text { font-family: var(--font-display); font-weight: 500; font-size: 17px; color: var(--ink-primary); transition: color .15s; }
        .faq-q[aria-expanded="true"] .faq-q-text { color: var(--accent); }
        .faq-toggle { font-family: var(--font-accent); font-size: 20px; color: var(--accent); line-height: 1; }
        .faq-a-wrap { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .25s ease; }
        .faq-a-wrap[data-open="true"] { grid-template-rows: 1fr; }
        .faq-a-inner { overflow: hidden; }
        .faq-a { font-family: var(--font-body); font-weight: 300; font-size: 15px; color: var(--ink-secondary); line-height: 1.75; padding-top: 16px; max-width: 680px; margin: 0; }

        .footer-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .footer-link { font-family: var(--font-accent); font-size: 11px; color: var(--ink-tertiary); letter-spacing: 0.06em; text-decoration: none; transition: color .15s; }
        .footer-link:hover { color: var(--accent); }

        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; padding: 100px 24px 60px; min-height: auto; }
          .hero-video-wrap { order: -1; height: 320px; min-height: 320px; border-radius: 12px; margin-bottom: 40px; }
          .steps-grid { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 640px) {
          .hero-headline { font-size: clamp(56px, 14vw, 80px) !important; }
          .footer-row { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="relay-nav">
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="relay-dot" />
          <span style={{ ...display, fontWeight: 500, fontSize: 18, color: "var(--ink-primary)", letterSpacing: "0.08em", marginLeft: 10 }}>
            RELAY
          </span>
        </div>
        <Link to="/login" className="relay-signin">Sign in →</Link>
      </nav>

      {/* HERO */}
      <section className="hero-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={eyebrowAccent}>X-FIRST CONTENT DISTRIBUTION</p>
          <h1
            className="hero-headline"
            style={{ ...display, fontWeight: 500, fontSize: "clamp(72px, 11vw, 140px)", color: "var(--ink-primary)", letterSpacing: "0.05em", lineHeight: 0.88, margin: 0 }}
          >
            RELAY
          </h1>
          <p style={{ ...body, fontWeight: 300, fontSize: 16, color: "var(--ink-secondary)", lineHeight: 1.7, maxWidth: 360, margin: 0 }}>
            Write once on X. Distribute everywhere. X stays the source of truth.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="platform-badge">LinkedIn PDF</span>
            <span className="platform-badge">Medium MD</span>
            <span className="platform-badge">Facebook</span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/login" className="btn-primary-cta">START DISTRIBUTING →</Link>
            <a href="#how" className="btn-ghost-cta">SEE HOW IT WORKS ↓</a>
          </div>
          <p style={{ ...mono, fontSize: 10, color: "var(--ink-tertiary)", letterSpacing: "0.14em", margin: 0 }}>
            // THREE PLATFORMS. ONE TRANSMISSION.
          </p>
        </div>
        <div className="hero-video-wrap">
          <video autoPlay loop muted playsInline>
            <source src={videoAsset.url} type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ ...eyebrowDim, textAlign: "center", marginBottom: 56 }}>// HOW IT WORKS</p>
        <img
          src={diagramAsset.url}
          alt="RELAY how it works diagram"
          style={{ width: "100%", maxWidth: 900, display: "block", margin: "0 auto 64px", borderRadius: 12, border: "0.5px solid var(--void-05)" }}
        />
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div style={{ ...mono, fontSize: 11, color: "var(--accent)", letterSpacing: "0.14em", marginBottom: 12 }}>{s.n}</div>
              <div style={{ width: 2, height: 24, background: "var(--accent)", marginBottom: 12 }} />
              <h3 style={{ ...display, fontSize: 20, fontWeight: 500, color: "var(--ink-primary)", marginBottom: 8, marginTop: 0 }}>{s.title}</h3>
              <p style={{ ...body, fontWeight: 300, fontSize: 14, color: "var(--ink-secondary)", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ORIGIN STORY */}
      <section style={{ background: "var(--void-02)", borderTop: "1px solid var(--void-05)", borderBottom: "1px solid var(--void-05)", padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ ...eyebrowAccent, marginBottom: 32 }}>// WHY RELAY EXISTS</p>
          <h2 style={{ ...display, fontWeight: 500, fontSize: "clamp(36px, 5vw, 56px)", color: "var(--ink-primary)", lineHeight: 1.1, marginBottom: 40, marginTop: 0 }}>
            Your X posts deserve<br />a wider audience.
          </h2>
          <div style={{ maxWidth: 680 }}>
            <p style={{ ...body, fontWeight: 300, fontSize: 16, color: "var(--ink-secondary)", lineHeight: 1.85, margin: 0 }}>
              Every builder, creator, and thinker who posts on X faces the same silent tax: the content dies there. LinkedIn has a different audience. Medium wants an essay. Facebook needs a different tone.
            </p>
            <p style={{ ...body, fontWeight: 300, fontSize: 16, color: "var(--ink-secondary)", lineHeight: 1.85, marginTop: 20, marginBottom: 0 }}>
              Reformatting manually for three platforms after already writing the post is friction nobody wants to pay — so most people don't. The content stays on X. The reach stays small.
            </p>
            <p style={{ ...body, fontWeight: 300, fontSize: 16, color: "var(--ink-secondary)", lineHeight: 1.85, marginTop: 20, marginBottom: 0 }}>
              RELAY fixes the last mile. One post. Three platforms. X stays the source of truth. Built by a solo founder in Lagos who was tired of paying the tax.
            </p>
          </div>
          <p style={{ ...mono, fontSize: 11, color: "var(--ink-tertiary)", letterSpacing: "0.1em", marginTop: 40, marginBottom: 0 }}>
            Built during Mind the Product World Product Day Hackathon 2026.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)", maxWidth: 800, margin: "0 auto" }}>
        <p style={{ ...eyebrowDim, textAlign: "center", marginBottom: 56 }}>// FREQUENTLY ASKED</p>
        <FAQList />
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--void-05)", padding: "40px clamp(24px, 6vw, 80px)" }}>
        <div className="footer-row">
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <span style={{ ...display, fontWeight: 500, fontSize: 16, color: "var(--ink-primary)", letterSpacing: "0.08em" }}>RELAY</span>
            <span style={{ ...mono, fontSize: 11, color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}>Built by @mojeebeth</span>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <a className="footer-link" href="https://github.com/mojeebdev/relaypost" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="footer-link" href="https://x.com/mojeebeth" target="_blank" rel="noopener noreferrer">X / Twitter</a>
            <a className="footer-link" href="https://blindspotlab.xyz" target="_blank" rel="noopener noreferrer">BlindspotLab</a>
          </div>
          <span style={{ ...mono, fontSize: 10, color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}>
            © 2026 RELAY · World Product Day Hackathon
          </span>
        </div>
      </footer>
    </div>
  );
}

function FAQList() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className="faq-item" key={i}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="faq-q-text">{item.q}</span>
              <span className="faq-toggle">{isOpen ? "−" : "+"}</span>
            </button>
            <div className="faq-a-wrap" data-open={isOpen}>
              <div className="faq-a-inner">
                <p className="faq-a">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

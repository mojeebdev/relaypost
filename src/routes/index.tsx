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

const FAQS = [
  {
    q: "Does RELAY publish automatically?",
    a: "Not yet — RELAY is approval-first. LinkedIn gets a downloadable PDF carousel. Medium gets clean Markdown copied to clipboard. Facebook gets a formatted post. You paste or upload after approving. Direct API publishing is on the roadmap.",
  },
  {
    q: "What makes LinkedIn different from copying my tweet?",
    a: "RELAY formats it as a carousel script — hook on slide one, key points expanded across slides, CTA on the closing slide — then exports it as a PDF document post, which gets significantly higher organic reach than plain text on LinkedIn.",
  },
  {
    q: "What is the attribution line?",
    a: "Every version automatically appends: 'First published on X — follow @[your handle] for more.' X stays the source of truth across all platforms.",
  },
  {
    q: "Is my content stored?",
    a: "Yes — posts and generated versions are saved in your history dashboard. You can revisit, re-export, or delete any post at any time.",
  },
  {
    q: "How does the AI Content Reflow work?",
    a: "When you hit Generate, RELAY fires three parallel calls through Lovable AI Gateway — each prompt engineered specifically for its platform's native format, tone, and audience. Results arrive together, ready for approval.",
  },
  {
    q: "Is RELAY free?",
    a: "Free during the hackathon period. Pricing comes post-launch with a generous free tier for solo builders.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Paste your X post",
    desc: "Drop any post from X into the input. Any length, any format.",
  },
  {
    n: "02",
    title: "RELAY formats it",
    desc: "The AI Content Reflow engine fires three parallel calls — LinkedIn carousel, Medium essay, Facebook post. Every version adds your X attribution.",
  },
  {
    n: "03",
    title: "You approve. It distributes.",
    desc: "Review each version side by side. Approve what you want. Nothing publishes without your sign-off.",
  },
];

function LandingPage() {
  const mono: CSSProperties = { fontFamily: "var(--font-accent)" };

  return (
    <div className="landing-page" style={{ ...body, color: "var(--ink-primary)" }}>
      <style>{`
        @keyframes relay-bounce {
          0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.6; }
          50% { transform: rotate(45deg) translateY(6px); opacity: 1; }
        }
        @keyframes relay-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .landing-page {
          background: #050508;
          overflow-x: hidden;
        }

        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          z-index: 50;
          background: rgba(5, 5, 8, 0.85);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--void-05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(24px, 6vw, 80px);
        }
        .landing-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent);
          animation: relay-pulse 1.8s ease-in-out infinite;
        }
        .landing-signin {
          font-family: var(--font-accent);
          font-size: 11px;
          color: var(--ink-tertiary);
          letter-spacing: 0.08em;
          text-decoration: none;
          transition: color 0.15s;
        }
        .landing-signin:hover { color: var(--ink-primary); }

        .card-stack {
          position: relative;
          height: 400vh;
        }
        .sticky-card {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
        }
        .sticky-card-1 {
          z-index: 1;
          overflow: hidden;
        }
        .sticky-card-2 {
          z-index: 2;
          overflow-x: hidden;
          overflow-y: auto;
        }
        .sticky-card-3 {
          z-index: 3;
          overflow: hidden;
        }
        .sticky-card-4 {
          z-index: 4;
          overflow-x: hidden;
          overflow-y: auto;
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 100vh;
          background: #050508;
          padding-top: 140px;
          padding-bottom: 80px;
          box-sizing: border-box;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          padding-left: clamp(40px, 8vw, 120px);
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .hero-headline {
          font-family: var(--font-display);
          font-size: clamp(80px, 13vw, 160px);
          font-weight: 500;
          color: #F0F0F8;
          letter-spacing: 0.05em;
          line-height: 0.85;
          margin: 0;
        }
        .hero-sub {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 17px;
          color: rgba(240, 240, 248, 0.7);
          max-width: 380px;
          line-height: 1.7;
          margin: 0;
        }
        .platform-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .platform-badge {
          background: rgba(0, 255, 157, 0.08);
          border: 0.5px solid rgba(0, 255, 157, 0.3);
          color: #00FF9D;
          font-family: var(--font-accent);
          font-size: 11px;
          padding: 6px 12px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .platform-badge svg {
          display: inline-flex;
          vertical-align: middle;
        }

        .cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
        }
        .btn-primary {
          background: #00FF9D;
          color: #000;
          font-family: var(--font-accent);
          font-weight: 500;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 13px 26px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: opacity 0.15s;
        }
        .btn-primary:hover { opacity: 0.88; }
        .btn-ghost {
          background: transparent;
          border: 0.5px solid rgba(240, 240, 248, 0.15);
          color: rgba(240, 240, 248, 0.5);
          font-family: var(--font-accent);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 13px 26px;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: border-color 0.15s, color 0.15s;
        }
        .btn-ghost:hover {
          border-color: rgba(240, 240, 248, 0.3);
          color: rgba(240, 240, 248, 0.8);
        }
        .scroll-hint {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          pointer-events: none;
        }
        .scroll-hint-text {
          font-family: var(--font-accent);
          font-size: 10px;
          color: #4A4A5A;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin: 0;
        }
        .scroll-hint-arrow {
          width: 10px;
          height: 10px;
          border-right: 1.5px solid #4A4A5A;
          border-bottom: 1.5px solid #4A4A5A;
          animation: relay-bounce 2s ease-in-out infinite;
        }

        .how-section {
          background-color: #050508;
          background-image:
            linear-gradient(#1E1E28 1px, transparent 1px),
            linear-gradient(90deg, #1E1E28 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .how-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px clamp(24px, 6vw, 80px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .how-diagram {
          width: 100%;
          max-width: 820px;
          border-radius: 12px;
          border: 0.5px solid #2C2C3A;
          display: block;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 900px;
          width: 100%;
        }

        .origin-section {
          background: #0C0C12;
          border-top: 1px solid #2C2C3A;
        }
        .origin-inner {
          max-width: 800px;
          margin: 0 auto;
          padding: clamp(80px, 10vh, 120px) clamp(24px, 6vw, 80px);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-sizing: border-box;
        }
        .origin-headline {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(40px, 6vw, 72px);
          color: #F0F0F8;
          line-height: 1.05;
          margin: 0 0 40px;
        }
        .origin-paragraphs {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 680px;
        }
        .origin-p {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 16px;
          color: #8A8A9A;
          line-height: 1.85;
          margin: 0;
        }

        .faq-section {
          background: #050508;
          border-top: 1px solid #2C2C3A;
        }
        .faq-inner {
          max-width: 800px;
          margin: 0 auto;
          padding: 80px clamp(24px, 6vw, 80px);
          min-height: 100vh;
          box-sizing: border-box;
        }
        .faq-item {
          border-bottom: 1px solid #2C2C3A;
          padding: 22px 0;
        }
        .faq-q {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          gap: 16px;
          background: none;
          border: none;
          padding: 0;
          width: 100%;
          text-align: left;
        }
        .faq-toggle {
          font-family: var(--font-accent);
          font-size: 20px;
          color: #00FF9D;
          line-height: 1;
          flex-shrink: 0;
        }
        .faq-a {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 15px;
          color: #8A8A9A;
          line-height: 1.75;
          padding-top: 14px;
          max-width: 680px;
          margin: 0;
        }

        .landing-footer {
          position: relative;
          z-index: 5;
          border-top: 1px solid #2C2C3A;
          background: #0C0C12;
          padding: 40px clamp(24px, 6vw, 80px);
        }
        .footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .footer-link {
          font-family: var(--font-accent);
          font-size: 11px;
          color: #4A4A5A;
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-link:hover { color: #00FF9D; }

        @media (max-width: 767px) {
          .card-stack { height: auto; }
          .sticky-card {
            position: relative;
            height: auto;
            overflow: visible;
          }
          .sticky-card-1 { min-height: 100vh; }
          .hero-content {
            padding: 120px 24px 80px;
            max-width: none;
          }
          .hero-headline {
            font-size: clamp(64px, 16vw, 96px);
          }
          .how-inner {
            padding: 80px 24px;
            min-height: auto;
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
          .origin-inner {
            padding: 80px 24px;
            min-height: auto;
          }
          .faq-inner {
            padding: 80px 24px;
            max-width: none;
            width: 100%;
            min-height: auto;
          }
          .footer-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
        }
      `}</style>

      <nav className="landing-nav">
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="landing-dot" />
          <span
            style={{
              ...display,
              fontWeight: 500,
              fontSize: 18,
              color: "var(--ink-primary)",
              letterSpacing: "0.08em",
              marginLeft: 10,
            }}
          >
            RELAY
          </span>
        </div>
        <Link to="/login" className="landing-signin">
          Sign in →
        </Link>
      </nav>

      <div className="card-stack">
        <section className="sticky-card sticky-card-1 hero-section">

          <div className="hero-content">
            <p
              style={{
                ...mono,
                fontSize: 11,
                color: "#00FF9D",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              X-FIRST CONTENT DISTRIBUTION
            </p>
            <h1 className="hero-headline">RELAY</h1>
            <p className="hero-sub">
              Write once on X. Distribute everywhere.
              <br />
              X stays the source of truth.
            </p>
            <div className="platform-badges">
              <span className="platform-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn PDF
              </span>
              <span className="platform-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
                Medium MD
              </span>
              <span className="platform-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </span>
            </div>

            <div className="cta-row">
              <Link to="/login" className="btn-primary">
                START DISTRIBUTING →
              </Link>
              <a href="#how" className="btn-ghost">
                SEE HOW IT WORKS ↓
              </a>
            </div>
          </div>
          <div className="scroll-hint">
            <p className="scroll-hint-text">SCROLL</p>
            <span className="scroll-hint-arrow" aria-hidden="true" />
          </div>
        </section>

        <section id="how" className="sticky-card sticky-card-2 how-section">
          <div className="how-inner">
            <p
              style={{
                ...mono,
                fontSize: 11,
                color: "#4A4A5A",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              // HOW IT WORKS
            </p>

            <div className="steps-grid">
              {STEPS.map((s) => (
                <div key={s.n}>
                  <div
                    style={{
                      ...mono,
                      fontSize: 11,
                      color: "#00FF9D",
                      letterSpacing: "0.14em",
                      marginBottom: 10,
                    }}
                  >
                    {s.n}
                  </div>
                  <div
                    style={{
                      width: 2,
                      height: 24,
                      background: "#00FF9D",
                      marginBottom: 10,
                    }}
                  />
                  <h3
                    style={{
                      ...display,
                      fontSize: 20,
                      fontWeight: 500,
                      color: "#F0F0F8",
                      marginBottom: 8,
                      marginTop: 0,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      ...body,
                      fontWeight: 300,
                      fontSize: 14,
                      color: "#8A8A9A",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sticky-card sticky-card-3 origin-section">
          <div className="origin-inner">
            <p
              style={{
                ...mono,
                fontSize: 11,
                color: "#00FF9D",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 32,
              }}
            >
              // WHY RELAY EXISTS
            </p>
            <h2 className="origin-headline">
              Your X posts deserve
              <br />
              a wider audience.
            </h2>
            <div className="origin-paragraphs">
              <p className="origin-p">
                Every builder, creator, and thinker who posts on X faces the same silent tax: the
                content dies there. LinkedIn has a different audience. Medium wants an essay.
                Facebook needs a different tone.
              </p>
              <p className="origin-p">
                Reformatting manually for three platforms after already writing the post is friction
                nobody wants to pay — so most people don't. The content stays on X. The reach stays
                small.
              </p>
              <p className="origin-p">
                RELAY fixes the last mile. One post. Three platforms. X stays the source of truth.
                Built by a solo founder in Lagos who was tired of paying the tax.
              </p>
            </div>
            <p
              style={{
                ...mono,
                fontSize: 11,
                color: "#4A4A5A",
                letterSpacing: "0.1em",
                marginTop: 40,
                marginBottom: 0,
              }}
            >
              Built during Mind the Product World Product Day Hackathon 2026.
            </p>
          </div>
        </section>

        <section className="sticky-card sticky-card-4 faq-section">
          <div className="faq-inner">
            <p
              style={{
                ...mono,
                fontSize: 11,
                color: "#4A4A5A",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              // FREQUENTLY ASKED
            </p>
            <FAQList />
          </div>
        </section>
      </div>

      <footer className="landing-footer">
        <div className="footer-row">
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                ...display,
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
                ...mono,
                fontSize: 11,
                color: "#4A4A5A",
                marginLeft: 24,
              }}
            >
              Built by @mojeebeth
            </span>
          </div>
          <div className="footer-links">
            <a
              className="footer-link"
              href="https://github.com/mojeebdev/relaypost"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              className="footer-link"
              href="https://x.com/mojeebeth"
              target="_blank"
              rel="noopener noreferrer"
            >
              X / Twitter
            </a>
            <a
              className="footer-link"
              href="https://blindspotlab.xyz"
              target="_blank"
              rel="noopener noreferrer"
            >
              BlindspotLab
            </a>
          </div>
          <span
            style={{
              ...mono,
              fontSize: 10,
              color: "#4A4A5A",
              letterSpacing: "0.06em",
            }}
          >
            © 2026 RELAY · World Product Day Hackathon
          </span>
        </div>
      </footer>
    </div>
  );
}

function FAQList() {
  const [open, setOpen] = useState<number | null>(null);

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
              <span
                style={{
                  ...display,
                  fontWeight: 500,
                  fontSize: 17,
                  color: isOpen ? "#00FF9D" : "#F0F0F8",
                  transition: "color 0.2s",
                }}
              >
                {item.q}
              </span>
              <span className="faq-toggle">{isOpen ? "−" : "+"}</span>
            </button>
            <div
              style={{
                maxHeight: isOpen ? "300px" : "0",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <p className="faq-a">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
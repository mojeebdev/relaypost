# RELAY

**X-first content distribution.**

Paste an X (Twitter) post. RELAY reformats it for LinkedIn, Medium, and Facebook — so X stays the source of truth.

---

## Overview

RELAY is an X-first content distribution tool built during World Product Day Hackathon 2026. It takes a single X post and uses AI to reformat it into three native versions:

| Platform | Output | Notes |
|----------|--------|-------|
| **LinkedIn** | PDF carousel document | 1080×1080 slides with hook, key points, CTA |
| **Medium** | Full Markdown article | H1 title, H2 sections, ~350–550 words |
| **Facebook** | Plain text post | Conversational, 3 inline emojis, under 300 words |

Every version ends with: `— First published on X. Follow @mojeebeth for daily builds and breakdowns.`

---

## Architecture

- **Framework**: TanStack Start v1 (React 19, Vite 7, SSR/SSG)
- **Styling**: Tailwind CSS v4 with custom dark-theme design tokens
- **Auth**: Lovable Cloud (Supabase Auth)
- **Database**: Postgres via Lovable Cloud (RLS-protected `posts` table)
- **AI**: Lovable AI Gateway (`google/gemini-2.5-flash`)
- **PDF Generation**: jsPDF (1080×1080 LinkedIn carousel slides)
- **Analytics**: Novus.ai event tracking

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.tsx         # Top nav with blinking status dot
├── hooks/
│   └── use-mobile.tsx     # Mobile breakpoint hook
├── integrations/
│   └── supabase/          # Supabase clients & auth middleware
│       ├── client.ts
│       ├── client.server.ts
│       ├── auth-middleware.ts
│       ├── auth-attacher.ts
│       └── types.ts
├── lib/
│   ├── relay.functions.ts # Server functions (AI generation, CRUD)
│   ├── linkedin-pdf.ts    # PDF generation for LinkedIn
│   ├── analytics.ts       # Novus.ai event wrapper
│   ├── utils.ts           # Utility helpers
│   ├── error-capture.ts
│   └── error-page.ts
├── routes/
│   ├── __root.tsx         # Root layout (analytics script injection)
│   ├── index.tsx          # Landing page (unauthenticated)
│   ├── login.tsx          # Auth page (sign in / sign up)
│   ├── _authenticated.tsx # Protected layout route
│   └── _authenticated/
│       └── dashboard.tsx  # Main app dashboard
├── router.tsx             # TanStack Router setup
├── server.ts
├── start.ts               # Server config with auth middleware
└── styles.css             # Design tokens, custom components
```

---

## Database Schema

```sql
-- posts table (RLS-protected, user-scoped)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_x_post TEXT NOT NULL,
  linkedin_version TEXT,
  medium_version TEXT,
  facebook_version TEXT,
  linkedin_status ENUM('pending','approved','published','skipped') DEFAULT 'pending',
  medium_status     ENUM('pending','approved','published','skipped') DEFAULT 'pending',
  facebook_status  ENUM('pending','approved','published','skipped') DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
```

---

## Key Features

### 1. AI Content Reflow
- Three parallel AI calls to Lovable AI Gateway
- Platform-specific prompting (LinkedIn slides, Medium essay, Facebook post)
- Signature line appended to every version

### 2. Approval Workflow
- Side-by-side preview of all 3 versions
- Per-platform status: **pending → approved | skipped → published**
- Visual accent border on approved cards

### 3. Platform Export Actions
- **LinkedIn**: Download PDF carousel + copy caption (strips `[SLIDE N]` labels)
- **Medium**: Copy full Markdown to clipboard
- **Facebook**: Copy formatted post to clipboard

### 4. Wire Log (Post History)
- Table of all past transmissions
- Status badges per platform
- Click "View" to reload any post into the approval queue

### 5. Auth
- Email/password authentication via Lovable Cloud
- Protected routes via `_authenticated` layout
- Automatic redirect to `/dashboard` when logged in

---

## Environment Variables

| Variable | Context | Purpose |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Admin DB access (server functions) |
| `LOVABLE_API_KEY` | Server | Lovable AI Gateway access |

---

## Local Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# The app runs on http://localhost:300-typical-default
```

---

## Design System

**Fonts**
- Display: `Array` (wordmarks, headings)
- Body: `IBM Plex Sans` 400/300
- Accent/Mono: `IBM Plex Mono` (labels, badges, status)

**Colors**
- Background: `#050508` (`--void-01`)
- Surface: `#0C0C12` (`--void-02`)
- Accent: `#00FF9D` (electric green)
- Primary text: `#F0F0F8`
- Secondary text: `#8A8A9A`

**Patterns**
- 48px CSS grid background on body
- Top-left radial gradient vignette
- All panels: `border: 1px solid var(--void-05)`, `border-radius: 12px`
- No drop shadows, no blur — flat, editorial dark aesthetic

---

## Analytics Events

Tracked via Novus.ai:

| Event | Trigger |
|-------|---------|
| `post_generated` | AI versions created |
| `platform_approved` | User approves a platform |
| `platform_skipped` | User skips a platform |
| `post_published` | Bulk publish action |
| `pdf_downloaded` | LinkedIn PDF downloaded |
| `markdown_copied` | Medium Markdown copied |

---

## Author

Built by **mojeebeth** during World Product Day Hackathon 2026.

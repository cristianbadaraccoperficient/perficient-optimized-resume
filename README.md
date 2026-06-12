# Perficient CareerFit

AI-powered resume optimizer for Perficient consulting. Upload your resume, optionally add strategic context and a job description, and get an adapted resume in Perficient's corporate format plus interview insights — all exported as a ready-to-submit DOCX.

---

## Prerequisites

- Node.js 18.18 or higher
- A Portkey account with a virtual key pointing to Anthropic (Claude Sonnet 4.6)
- The Perficient DOCX resume template (already included in `templates/`)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/cristianbadaraccoperficient/perficient-optimized-resume.git
cd perficient-optimized-resume
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the values:

```env
# Portkey gateway API key (get it from your Portkey account)
PORTKEY_API_KEY=your_portkey_api_key_here

# Portkey gateway base URL (Perficient's internal gateway)
PORTKEY_BASE_URL=https://portkeygateway.perficient.com/v1

# Directory for persisted user data (auto-created on first run)
DATA_DIR=./data
```

> **Note:** `PORTKEY_API_KEY` and `PORTKEY_BASE_URL` are required. The app will throw on startup if either is missing.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Verify the AI connection

Before using the app, confirm the gateway is reachable:

```
GET http://localhost:3000/api/adapt/health
```

A healthy response looks like:

```json
{
  "status": "healthy",
  "checks": {
    "environment": { "ok": true, "detail": "OK" },
    "gateway": { "ok": true, "detail": "Response received.", "latency_ms": 1200 }
  }
}
```

---

## Usage

The app has three modes depending on what you provide:

| Inputs | Result |
|--------|--------|
| Resume only | Resume reformatted to Perficient corporate style |
| Resume + strategic context | Resume optimized using extra context, Perficient style |
| Resume + job description (+ optional context) | Resume fully tailored to the target role + interview insights |

### Steps

1. **Upload your resume** — PDF or DOCX. The "Tailor Resume" button enables as soon as the upload completes.
2. **Add strategic context** *(optional)* — Any additional information you want the AI to consider (e.g. career goals, highlights not in the resume).
3. **Paste a job description** *(optional)* — At least 50 characters to be included in the adaptation.
4. **Click "Tailor Resume"** — Two parallel AI calls run:
   - Interview insights (strengths, gaps, transferable skills) appear first (~20s)
   - Optimized resume generates in the background (~50s)
5. **Download** — Once the resume is ready the Export tab and Download button enable. Click to get the filled Perficient DOCX template.

---

## How it works

All user data (uploaded resume, strategic context, last adaptation) is stored as JSON files under `./data/` on the server — this directory is gitignored and auto-created on first use. There is no database.

AI calls are routed through [Portkey](https://portkey.ai/) to Claude Sonnet 4.6. Portkey provides observability, caching, and fallback routing.

---

## Development

```bash
npm run dev      # Dev server with hot reload
npm run build    # Production build
npm run lint     # ESLint
```

The `specs/` directory contains feature specs that serve as the source of truth for behavior. See `specs/WORKFLOW.md` for the spec-driven development process used in this project.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Main UI — owns all state
│   └── api/
│       ├── resume/               # Upload and retrieve resume
│       ├── explanation/          # Save and retrieve strategic context
│       ├── adapt/
│       │   ├── route.ts          # POST — generates insights only
│       │   ├── resume/route.ts   # POST — generates adapted resume, writes last-adaptation.json
│       │   └── health/route.ts   # GET  — checks env + gateway connectivity
│       └── export/route.ts       # GET  — renders DOCX from last-adaptation.json
├── components/                   # ResumeUpload, ExplanationInput, JobDescriptionInput, ResultsPanel
├── contracts/                    # Zod schemas and TypeScript types for all API I/O
└── lib/
    ├── portkey.ts                # Lazy singleton Portkey client
    └── storage.ts                # readJSON / writeJSON / readMarkdown helpers
templates/
└── perficient-resume.docx        # Perficient DOCX template with placeholder tags
data/                             # Auto-created, gitignored — stores runtime user data
specs/                            # Feature specs (SDD)
docs/                             # Architecture and tech stack docs
```

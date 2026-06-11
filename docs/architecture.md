# Architecture Overview

## System Purpose

Web application to adapt a consultant's resume to match specific job descriptions, outputting:
1. An adapted resume in the company's standard PDF format
2. Interview preparation insights (strengths, gaps, transferable skills)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                  │
├─────────────────────────────────────────────────────┤
│  Upload/Edit Resume & Explanation                    │
│  Paste Job Description                              │
│  View Results (PDF + Insights Panel)                │
└─────────────┬───────────────────────────────────────┘
              │ API Routes
┌─────────────▼───────────────────────────────────────┐
│              Backend (Next.js API Routes)            │
├─────────────────────────────────────────────────────┤
│  /api/resume      → CRUD resume & explanation       │
│  /api/adapt       → Trigger adaptation pipeline     │
│  /api/generate-pdf→ Generate PDF from adapted data  │
└──────┬──────────────────────────┬───────────────────┘
       │                          │
┌──────▼──────┐          ┌───────▼────────┐
│  Local File  │          │    Portkey     │
│  Storage     │          │  (AI Gateway)  │
│  (JSON/MD)   │          └───────┬────────┘
└─────────────┘                   │
                          ┌───────▼────────┐
                          │   Claude API   │
                          │  (Anthropic)   │
                          └────────────────┘
```

## Tech Stack

| Layer          | Technology            | Rationale                                      |
|----------------|-----------------------|------------------------------------------------|
| Frontend       | Next.js 14 (App Router) | Full-stack in one, React-based, fast dev      |
| Styling        | Tailwind CSS          | Rapid prototyping, consistent design           |
| AI Gateway     | Portkey               | Observability, fallbacks, caching, model-agnostic |
| LLM            | Claude (via Portkey)  | Strong reasoning for resume analysis           |
| PDF Generation | Puppeteer / react-pdf | Pixel-perfect PDF from HTML template           |
| Persistence    | Local JSON files      | Simple, no DB needed for single-user           |
| Deployment     | Local / Vercel        | Flexible deployment options                    |

## Data Flow

### 1. Initial Setup (One-time)
```
User uploads resume (PDF/DOCX/text) + explanation document
  → Backend parses and stores as structured JSON
  → Persisted in /data/resume.json and /data/explanation.md
```

### 2. Adaptation Flow
```
User pastes Job Description
  → Backend sends to Portkey → Claude with prompt:
    - System: Company format template + adaptation instructions
    - Context: Stored resume + explanation
    - Input: Job description
  → Claude returns structured JSON:
    {
      adapted_resume: { ... structured sections ... },
      strengths: [...],
      gaps: [...],
      transferable_skills: [...]
    }
  → Backend generates PDF from adapted_resume
  → Frontend displays PDF download + insights panel
```

## Key Design Decisions

1. **Portkey as middleware** — Not calling Claude directly. Portkey provides:
   - Request/response logging for debugging prompts
   - Fallback to other models if Claude is unavailable
   - Caching for repeated similar JDs
   - Cost tracking and rate limiting

2. **Local file persistence** — For a single-user tool, JSON files are simpler than a database. Resume and explanation are loaded on every adaptation request as context.

3. **Structured AI output** — Claude returns JSON with clearly separated sections, making it easy to render the PDF and the insights panel independently.

4. **Template-driven PDF** — The company format is defined as an HTML/CSS template. The adapted content fills into this template, then Puppeteer renders it to PDF.

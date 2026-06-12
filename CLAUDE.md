# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test suite exists — verification is done manually via the running app.

## Environment

Copy `.env.local.example` to `.env.local` and fill in:

```
PORTKEY_API_KEY=      # Portkey gateway API key
PORTKEY_BASE_URL=     # https://portkeygateway.perficient.com/v1
DATA_DIR=./data       # Where resume/explanation JSON files are stored (auto-created)
```

The app will throw on startup if `PORTKEY_API_KEY` or `PORTKEY_BASE_URL` are missing.

## Architecture

Single-page Next.js 15 App Router app. No database — all user data is stored as JSON/Markdown files under `./data/` (gitignored) via `src/lib/storage.ts`.

### Data flow

1. User uploads resume → `POST /api/resume` → parses PDF/DOCX with `mammoth`/`pdf-parse` → writes `data/resume.json`
2. User saves strategic context → `POST /api/explanation` → writes `data/explanation.json`
3. User clicks "Tailor Resume" → **two parallel fetches** from `page.tsx`:
   - `POST /api/adapt` → insights only (`strengths`, `gaps`, `transferable_skills`), ~15-25s, `max_tokens: 4096`
   - `POST /api/adapt/resume` → adapted resume only (`adapted_resume`), ~40-55s, `max_tokens: 6144`, writes `data/last-adaptation.json`
4. Results appear progressively: insights tabs unlock first; Export tab unlocks when resume is ready
5. User clicks Download → `GET /api/export` → reads `data/last-adaptation.json` → renders `templates/perficient-resume.docx` via `docxtemplater` → returns DOCX binary

### AI integration

All AI calls go through Portkey (proxy to Claude Sonnet 4.6). Client is a lazy singleton in `src/lib/portkey.ts`. Model string is `@dsvertex/anthropic.claude-sonnet-4-6`. Both adapt routes share the same error-handling pattern — see `src/app/api/adapt/route.ts` for the canonical shape (`extractPortkeyError`, `finish_reason: 'length'` guard, Zod validation of AI response).

### Contracts

`src/contracts/adapt.contract.ts` is the source of truth for all AI I/O types:
- `InsightsResultSchema` — validated output of `POST /api/adapt`
- `ResumeResultSchema` — validated output of `POST /api/adapt/resume`, also used by export
- `AdaptationResultSchema` — legacy combined shape (kept for compatibility)

`src/contracts/export.contract.ts` re-exports `ResumeResultSchema` as `ExportAdaptationResultSchema`.

### Frontend state

`src/app/page.tsx` owns all state. Two independent loading states (`isLoadingInsights`, `isLoadingResume`) drive `ResultsPanel` props. `isAdapting` is a derived value (`isLoadingInsights || isLoadingResume`).

`ResultsPanel` renders four tabs: Strengths / Gaps / Transferable (all from `insightsResult`) and Export (from `resumeResult`). The Export tab and Download button stay disabled until `resumeResult` is non-null.

## Spec-Driven Development

This project follows SDD. Specs live in `specs/` and are the source of truth — `specs/WORKFLOW.md` describes the full process. Key spec files:
- `specs/contracts/adapt.spec.md` — `/api/adapt` and `/api/adapt/resume` behavior
- `specs/flows/adapt-resume.spec.md` — end-to-end user flow with all three modes (resume-only, +context, +JD)
- `specs/components/` — component-level acceptance criteria

When changing behavior, update the relevant spec before or alongside the code change.

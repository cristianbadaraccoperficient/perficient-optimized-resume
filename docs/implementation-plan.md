# Implementation Plan

## Phase 1: Project Setup & Infrastructure

### Step 1.1: Initialize Next.js Project
- Create Next.js 15 app with TypeScript and App Router
- Configure Tailwind CSS
- Set up project structure (directories, configs)
- Create `.gitignore` with data/ and .env.local

### Step 1.2: Environment & Configuration
- Create `.env.local.example` with required variables
- Set up Portkey client configuration
- Create storage utility (read/write JSON and markdown files)

**Deliverable:** Running Next.js app with Portkey connected

---

## Phase 2: Resume & Explanation Management

### Step 2.1: File Upload API
- `POST /api/resume` — Accept PDF/DOCX/text, parse, store
- `GET /api/resume` — Return stored resume data
- `POST /api/explanation` — Store explanation text
- `GET /api/explanation` — Return stored explanation

### Step 2.2: Upload UI
- File upload component with drag-and-drop
- Status indicators (uploaded / not uploaded)
- Preview of stored content
- Re-upload functionality

**Deliverable:** Can upload and persist resume + explanation

---

## Phase 3: AI Adaptation Pipeline

### Step 3.1: Portkey Integration
- Configure Portkey client with virtual key for Claude
- Build prompt assembly function (system + user messages)
- Handle structured JSON response parsing
- Error handling and retries

### Step 3.2: Adaptation API
- `POST /api/adapt` — Optionally receives JD, always returns adapted resume
  - Resume only → Perficient-style reformat
  - Resume + strategic context → optimized with extra context
  - Resume + JD (+ optional context) → fully tailored to the role
- Validate resume exists before processing
- Stream response for better UX (optional)
- Store last adaptation result

### Step 3.3: Adaptation UI
- Job description text area (optional — does not gate the button)
- "Tailor Resume" button enabled as soon as resume is uploaded
- Results panel with tabs:
  - Strengths
  - Gaps
  - Transferable Skills

**Deliverable:** End-to-end adaptation working, insights displayed

---

## Phase 4: DOCX Generation

### Step 4.1: Template Preparation
- Prepare Perficient .docx template with docxtemplater placeholder tags
- Map adapted resume JSON fields to template placeholders
- Verify template produces valid DOCX when filled

### Step 4.2: DOCX Rendering
- Set up docxtemplater + pizzip for server-side DOCX generation
- `GET /api/export` — Generate and return DOCX from last adaptation
- Handle multi-entry loops (experience bullets, skills lists)

### Step 4.3: Download
- Download button triggers DOCX file download
- Filename: `{firstname}-{lastname}-resume.docx`

**Deliverable:** Full pipeline from JD input → adapted DOCX download

---

## Phase 5: Polish & UX

### Step 5.1: Loading States & Error Handling
- Skeleton loaders during AI processing
- Clear error messages for failures
- Retry mechanisms

### Step 5.2: Responsive Design
- Mobile-friendly layout
- Accessible components (keyboard nav, screen readers)

### Step 5.3: Final Testing
- Test with various JD formats
- Validate DOCX output matches company format
- Performance optimization

**Deliverable:** Production-ready application

---

## Estimated Timeline

| Phase | Effort    | Description                    |
|-------|-----------|--------------------------------|
| 1     | ~1 hour   | Setup, configs, structure      |
| 2     | ~2 hours  | Upload, parsing, persistence   |
| 3     | ~3 hours  | AI integration, prompts, UI    |
| 4     | ~2 hours  | DOCX template and generation   |
| 5     | ~1 hour   | Polish and testing             |
| **Total** | **~9 hours** | Full V1 implementation    |

---

## Dependencies & Blockers

| Item                     | Status    | Notes                                |
|--------------------------|-----------|--------------------------------------|
| Portkey API key          | Needed    | User must provide                    |
| Anthropic API key        | Needed    | Configure as Portkey virtual key     |
| Company resume template  | Pending   | User will provide example            |
| Node.js 18.18+          | Required  | For Next.js 15                       |

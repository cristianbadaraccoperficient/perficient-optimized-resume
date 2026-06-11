# Features Specification

## Core Features

### F1: Resume & Explanation Upload

**Description:** User uploads their base resume and an optional explanation document that provides context about their experience. Both are auto-formatted into structured Markdown via Claude Haiku for optimal AI consumption.

**Behavior:**
- Accept resume in PDF, DOCX, or plain text format
- Accept explanation as text (paste in textarea)
- Parse uploaded files to extract text content
- Auto-format both inputs into structured Markdown via Claude Haiku
- Store persistently so they're available on every session
- Show current stored resume/explanation on the main page
- Allow re-upload/re-edit to replace existing documents
- Preview toggle shows the structured Markdown version of the explanation

**Persistence:**
- Resume stored as `/data/resume.json` (raw_text + formatted_md) and `/data/resume-raw.md`
- Explanation stored as `/data/explanation.json` (raw_text + formatted_md), `/data/explanation-raw.md`, and `/data/explanation-formatted.md`

---

### F2: Job Description Input

**Description:** User provides a job description to adapt their resume against.

**Behavior:**
- Text area to paste full job description
- Optional: URL input to fetch JD from a job posting (future enhancement)
- Validate that a resume is already uploaded before allowing adaptation
- Show loading state during AI processing

---

### F3: Resume Adaptation (AI-Powered)

**Description:** Using Claude via Portkey, analyze the JD against the stored resume and produce an optimized version.

**AI Prompt Strategy:**
- System prompt defines the company's resume format and adaptation rules
- User context includes: full resume, explanation, and target JD
- Output is structured JSON for reliable parsing

**Adaptation Logic:**
- Reorder experience bullets to prioritize JD-relevant achievements
- Adjust summary/objective to align with the role
- Highlight matching technologies and methodologies
- Maintain truthfulness — never fabricate experience
- Use terminology from the JD where the candidate has equivalent experience

---

### F4: DOCX Export

**Description:** Generate a DOCX of the adapted resume using the Perficient corporate template.

**Behavior:**
- Use Perficient .docx template as base (preserves logo, styles, headers, footers)
- Fill adapted content into template placeholder tags via docxtemplater
- Generate native DOCX file (editable in Word)
- Provide download button
- Filename: `{firstname}-{lastname}-resume.docx`

---

### F5: Interview Insights Panel

**Description:** Alongside the adapted resume, display actionable interview preparation data.

**Sections:**

#### 5a. Strengths to Highlight
- Key experiences that directly match JD requirements
- Quantifiable achievements relevant to the role
- Suggested talking points with STAR framework hints

#### 5b. Gaps Identified
- Skills or experiences the JD requires but the candidate lacks
- Severity rating (critical / nice-to-have)
- Suggested mitigation strategies (courses, framing, honest acknowledgment)

#### 5c. Transferable Skills
- Experience from different domains that applies by analogy
- How to frame each transferable skill in interview context
- Bridge statements connecting past experience to target role requirements

---

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: "Resume Adapter"                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─── Left Panel (40%) ──────────────────────────────┐  │
│  │ [Resume Status: ✓ Uploaded]    [Re-upload]        │  │
│  │ [Explanation Status: ✓ Uploaded] [Re-upload]      │  │
│  │                                                   │  │
│  │ ─── Job Description ───                           │  │
│  │ ┌───────────────────────────────────────────────┐ │  │
│  │ │ [Paste JD here...]                           │ │  │
│  │ │                                              │ │  │
│  │ │                                              │ │  │
│  │ └───────────────────────────────────────────────┘ │  │
│  │                                                   │  │
│  │ [Adapt Resume] button                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─── Right Panel (60%) ─────────────────────────────┐  │
│  │ [Download DOCX]                                   │  │
│  │ Tabs: [Strengths] [Gaps] [Transferable]           │  │
│  │                                                   │  │
│  │ (Content based on selected tab)                   │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Future Enhancements (Out of Scope for V1)

- History of adaptations (store past JD + results)
- Multiple resume profiles
- JD URL scraping
- Side-by-side diff (original vs adapted)
- Export to DOCX
- Multi-user support with authentication

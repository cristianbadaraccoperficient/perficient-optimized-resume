# Features Specification

## Core Features

### F1: Resume & Explanation Upload

**Description:** User uploads their base resume and an optional explanation document that provides context about their experience.

**Behavior:**
- Accept resume in PDF, DOCX, or plain text format
- Accept explanation as text (paste or file upload)
- Parse uploaded files to extract text content
- Store persistently so they're available on every session
- Show current stored resume/explanation on the main page
- Allow re-upload to replace existing documents

**Persistence:**
- Resume stored as `/data/resume.json` (structured) and `/data/resume-raw.md` (original text)
- Explanation stored as `/data/explanation.md`

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

### F4: PDF Generation

**Description:** Generate a PDF of the adapted resume in the company's standard format.

**Behavior:**
- Use company template (HTML/CSS based)
- Fill adapted content into template sections
- Render to PDF via Puppeteer
- Provide download button
- Show PDF preview in-browser

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
│  │ Tabs: [PDF Preview] [Strengths] [Gaps] [Transfer] │  │
│  │                                                   │  │
│  │ (Content based on selected tab)                   │  │
│  │                                                   │  │
│  │ [Download PDF]                                    │  │
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

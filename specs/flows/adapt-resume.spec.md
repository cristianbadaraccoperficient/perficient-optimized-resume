# Flow: Adapt Resume

## Purpose

User triggers AI optimization of their resume. Job description and strategic context are both optional — the minimum requirement is an uploaded resume.

## Modes

| Inputs | Behavior |
|--------|----------|
| Resume only | Reformats and optimizes resume to Perficient style and standards |
| Resume + strategic context | Optimizes resume using the extra context, Perficient style |
| Resume + job description (+ optional context) | Fully tailors resume to the target role with interview insights |

## Preconditions

- Resume is uploaded, parsed, and formatted as structured Markdown
- Explanation/strategic context is optional but enhances output
  - The adapt endpoint prefers `formatted_md` from `explanation.json`, falls back to `raw_text`, then to legacy `explanation.md`
- Job description is optional; if provided it must be ≥50 chars

## Steps

| # | User Action | System Response | Component | API Call |
|---|-------------|-----------------|-----------|----------|
| 1 | Uploads resume | "Tailor Resume" button becomes enabled | ResumeUpload | POST /api/resume |
| 2 | (optional) Adds strategic context | Context stored, will be included in prompt | ExplanationInput | POST /api/explanation |
| 3 | (optional) Pastes JD >=50 chars | Included in adaptation prompt | JobDescriptionInput | - |
| 4 | Clicks "Tailor Resume" | Disables button, shows loading | Page | POST /api/adapt |
| 5 | Waits | Shows skeleton loaders in results panel | ResultsPanel | - |
| 6a | (API success) | Renders results in tabs | ResultsPanel | - |
| 6b | (API error) | Shows error message with retry | Page | - |
| 7 | Clicks between tabs | Switches tab content | ResultsPanel | - |
| 8 | Clicks "Download DOCX" | Triggers DOCX download | ResultsPanel | GET /api/export |

## Happy Paths

**Resume only:**
1. User has resume uploaded
2. Button is enabled, user clicks "Tailor Resume"
3. After ~10-15s, Perficient-formatted resume appears

**With JD:**
1. User has resume uploaded, pastes a 500-char JD
2. Button is enabled, user clicks "Tailor Resume"
3. After ~10-15s, results appear in Strengths tab (default)
4. User browses Strengths, Gaps, Transferable tabs
5. User clicks "Download DOCX", gets Perficient-formatted resume file

## Error Paths

| Step | Error Condition | System Behavior |
|------|-----------------|-----------------|
| 1 | No resume uploaded | Button stays disabled, "Upload your resume to continue." shown |
| 3 | JD provided but < 50 chars | JD omitted from request (treated as not provided) |
| 6 | AI timeout (>30s) | "Processing took too long. Try again." + retry button |
| 6 | Rate limited (429) | "Too many requests. Wait a moment." + countdown |
| 6 | AI response invalid | "Something went wrong. Try again." + retry |
| 8 | DOCX generation fails | "Document generation failed." + retry |

## Acceptance Criteria

- [ ] Button enabled as soon as resume is uploaded (no JD required)
- [ ] Full flow from resume-only upload to results display works
- [ ] Full flow with JD produces job-targeted output with interview insights
- [ ] Loading state is visible for 10-15s (typical AI response time)
- [ ] All 4 tabs render correct data from response
- [ ] DOCX download works after adaptation
- [ ] Can re-adapt with or without a JD (replaces previous results)
- [ ] Rate limit error shows meaningful countdown

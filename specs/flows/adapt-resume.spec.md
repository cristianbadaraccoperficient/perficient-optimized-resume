# Flow: Adapt Resume

## Purpose

User provides a job description and receives an AI-adapted resume with interview insights.

## Preconditions

- Resume is uploaded, parsed, and formatted as structured Markdown
- Explanation is stored and formatted as structured Markdown (optional but recommended)
  - The adapt endpoint prefers `formatted_md` from `explanation.json`, falls back to `raw_text`, then to legacy `explanation.md`

## Steps

| # | User Action | System Response | Component | API Call |
|---|-------------|-----------------|-----------|----------|
| 1 | Pastes JD into textarea | Enables "Adapt" button (if >=50 chars) | JobDescriptionInput | - |
| 2 | Clicks "Adapt Resume" | Disables inputs, shows loading | JobDescriptionInput | POST /api/adapt |
| 3 | Waits | Shows skeleton loaders in results panel | ResultsPanel | - |
| 4a | (API success) | Renders results in tabs | ResultsPanel | - |
| 4b | (API error) | Shows error message with retry | Page | - |
| 5 | Clicks between tabs | Switches tab content | ResultsPanel | - |
| 6 | Clicks "Download DOCX" | Triggers DOCX download | ResultsPanel | GET /api/export |

## Happy Path

1. User has resume uploaded, pastes a 500-char JD
2. Button enables, user clicks "Adapt Resume"
3. Input disables, results panel shows skeleton
4. After ~10-15s, results appear in Strengths tab (default)
5. User browses Strengths, Gaps, Transferable tabs
6. User clicks "Download DOCX", gets Perficient-formatted resume file

## Error Paths

| Step | Error Condition | System Behavior |
|------|-----------------|-----------------|
| 2 | JD < 50 chars | Button stays disabled, helper text shown |
| 4 | AI timeout (>30s) | "Processing took too long. Try again." + retry button |
| 4 | Rate limited (429) | "Too many requests. Wait a moment." + countdown |
| 4 | AI response invalid | "Something went wrong. Try again." + retry |
| 6 | DOCX generation fails | "Document generation failed." + retry |

## Acceptance Criteria

- [ ] Full flow from JD paste to results display works
- [ ] Loading state is visible for 10-15s (typical AI response time)
- [ ] All 4 tabs render correct data from response
- [ ] DOCX download works after adaptation
- [ ] Can re-adapt with a different JD (replaces previous results)
- [ ] Rate limit error shows meaningful countdown

# Flow: Download Resume

## Purpose

User downloads the adapted resume as an editable DOCX in Perficient corporate format.

## Preconditions

- An adaptation has been completed (POST /api/adapt returned success)

## Steps

| # | User Action | System Response | Component | API Call |
|---|-------------|-----------------|-----------|----------|
| 1 | Clicks "Download DOCX" | Shows download in progress | ResultsPanel | GET /api/export |
| 2 | Waits (~1-2s) | Generates DOCX from template | - | - |
| 3 | Browser download | File saved as "{name}-resume.docx" | - | - |

## Happy Path

1. User is on results panel after successful adaptation
2. Clicks "Download DOCX" button
3. Brief loading indicator on button
4. Browser prompts save / auto-downloads "{firstname}-{lastname}-resume.docx"
5. User opens in Word, sees Perficient-formatted resume with adapted content

## Error Paths

| Step | Error Condition | System Behavior |
|------|-----------------|-----------------|
| 1 | No adaptation exists | Button disabled with tooltip "Run an adaptation first" |
| 2 | Template generation fails | "Failed to generate document. Try adapting again." + retry |
| 3 | Download interrupted | "Download failed. Try again." + retry button |

## Acceptance Criteria

- [ ] Download button disabled when no adaptation exists
- [ ] Download triggers with correct filename
- [ ] Downloaded DOCX opens in Word without errors
- [ ] DOCX content matches the adaptation result
- [ ] DOCX formatting matches Perficient template (logo, styles, footer)
- [ ] Button shows brief loading state during generation
- [ ] Graceful error when generation fails

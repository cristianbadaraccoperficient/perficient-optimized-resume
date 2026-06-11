# Flow: Download PDF

## Purpose

User downloads the adapted resume as a PDF in company format.

## Preconditions

- An adaptation has been completed (POST /api/adapt returned success)

## Steps

| # | User Action | System Response | Component | API Call |
|---|-------------|-----------------|-----------|----------|
| 1 | Clicks "PDF Preview" tab | Loads PDF in embedded viewer | ResultsPanel | GET /api/pdf?action=preview |
| 2 | Reviews PDF in viewer | Shows embedded PDF (iframe) | PdfPreview | - |
| 3 | Clicks "Download PDF" | Triggers browser download | PdfPreview | GET /api/pdf?action=download |
| 4 | Browser download | File saved as "adapted-resume.pdf" | - | - |

## Happy Path

1. User is on results panel after adaptation
2. Clicks "PDF Preview" tab
3. PDF renders in embedded viewer within 2-3s
4. User reviews content and formatting
5. Clicks "Download PDF" button
6. Browser prompts save/downloads "adapted-resume.pdf"

## Error Paths

| Step | Error Condition | System Behavior |
|------|-----------------|-----------------|
| 1 | No adaptation exists | Tab shows "Run an adaptation first" message |
| 1 | PDF generation fails | "Failed to generate PDF. Try adapting again." |
| 3 | Download fails | "Download failed. Try again." + retry button |

## Acceptance Criteria

- [ ] PDF preview loads in embedded viewer
- [ ] PDF content matches the adaptation result
- [ ] PDF follows company template format
- [ ] Download triggers with correct filename
- [ ] Preview and download use same generated PDF
- [ ] Graceful error when no adaptation exists

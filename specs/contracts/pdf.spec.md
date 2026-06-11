# Contract: GET /api/pdf

## Purpose

Generate and serve the adapted resume as a PDF in the company's standard format.

## Request

- Method: GET
- Content-Type: N/A
- Query Parameters:
  - `action`: "download" | "preview" (default: "download")

## Validation

- action: optional, must be "download" or "preview" if provided

## Preconditions

- An adaptation result must exist (from a prior POST /api/adapt call)

## Response (200)

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="adapted-resume.pdf" (download)
Content-Disposition: inline (preview)

(PDF binary)
```

## Pipeline

```
data/last-adaptation.json (adapted resume data)
  -> Handlebars template (templates/resume-template.hbs)
  -> Rendered HTML string
  -> Puppeteer renders to PDF buffer
  -> Response stream
```

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| No adaptation result | 404 | ADAPTATION_NOT_FOUND |
| Template rendering failure | 500 | TEMPLATE_ERROR |
| PDF generation failure | 500 | PDF_GENERATION_ERROR |
| Invalid action param | 400 | INVALID_ACTION |

## Acceptance Criteria

- [ ] Returns PDF with correct Content-Type header
- [ ] Sets Content-Disposition based on action parameter
- [ ] PDF matches company template format exactly
- [ ] Handles page breaks correctly for long resumes
- [ ] Returns 404 if no adaptation exists
- [ ] PDF is generated fresh on each request (uses latest adaptation)

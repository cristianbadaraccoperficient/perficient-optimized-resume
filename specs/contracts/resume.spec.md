# Contract: POST /api/resume

## Purpose

Upload and parse a resume file, storing it for future adaptations.

## Request

- Method: POST
- Content-Type: multipart/form-data
- Body: `file` field (PDF, DOCX, or TXT, max 5MB)

## Validation

- file: required, must be .pdf/.docx/.txt, max 5MB

## Preconditions

- None

## Response (200)

```json
{
  "success": true,
  "message": "Resume uploaded and parsed successfully",
  "data": {
    "filename": "resume.pdf",
    "parsed_length": 2450,
    "sections_detected": ["summary", "experience", "skills", "education"]
  }
}
```

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| No file provided | 400 | MISSING_FILE |
| Unsupported format | 400 | UNSUPPORTED_FORMAT |
| File too large (>5MB) | 400 | FILE_TOO_LARGE |
| Parsing failure | 500 | PARSE_ERROR |

## Side Effects

- Stores structured resume at `data/resume.json`
- Stores raw text at `data/resume-raw.md`

## Acceptance Criteria

- [ ] Accepts PDF, DOCX, and TXT files
- [ ] Rejects files over 5MB with clear error
- [ ] Extracts text content correctly from each format
- [ ] Persists both raw and structured versions to disk
- [ ] Overwrites previous resume on re-upload

---

# Contract: GET /api/resume

## Purpose

Retrieve the currently stored resume.

## Request

- Method: GET
- Content-Type: N/A

## Validation

- None

## Preconditions

- None (returns exists: false if no resume stored)

## Response (200, resume exists)

```json
{
  "exists": true,
  "raw_text": "Full text content...",
  "structured": {
    "summary": "...",
    "experience": [],
    "skills": [],
    "education": []
  },
  "uploaded_at": "2024-01-15T10:30:00Z",
  "original_filename": "resume.pdf"
}
```

## Response (200, no resume)

```json
{
  "exists": false
}
```

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| Disk read failure | 500 | STORAGE_ERROR |

## Acceptance Criteria

- [ ] Returns exists: false when no resume stored
- [ ] Returns full structured data when resume exists
- [ ] Includes original filename and upload timestamp

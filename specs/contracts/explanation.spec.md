# Contract: POST /api/explanation

## Purpose

Store the user's explanation that provides additional background about their experience, and convert it to structured Markdown via Claude Haiku for better downstream AI consumption.

## Request

- Method: POST
- Content-Type: application/json
- Body:

```json
{
  "content": "Full text of the explanation..."
}
```

## Validation

- content: required, string, min 1 char, max 50000 chars

## Preconditions

- None

## Processing

1. Save raw text immediately to `explanation.json` and `explanation-raw.md`
2. Call Claude Haiku to convert raw text into structured Markdown (headers per company, bullet points, bold keywords)
3. If formatting succeeds, update `explanation.json` with `formatted_md` and write `explanation-formatted.md`
4. If formatting fails, return partial success (raw text saved, formatted_md remains null)

## Response (200)

```json
{
  "success": true,
  "message": "Explanation saved and formatted successfully",
  "data": {
    "length": 1200,
    "formatted": true
  }
}
```

## Response (200, formatting unavailable)

```json
{
  "success": true,
  "message": "Explanation saved (formatting unavailable)",
  "data": {
    "length": 1200,
    "formatted": false,
    "format_error": "AI formatting service is not configured"
  }
}
```

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| No content provided | 400 | MISSING_CONTENT |
| Content too long | 400 | CONTENT_TOO_LONG |
| Disk write failure | 500 | STORAGE_ERROR |

## Side Effects

- Persists raw text and structured Markdown to storage
- Calls Claude Haiku via Portkey for formatting

## Storage Format

```json
// explanation.json
{
  "raw_text": "Original text as user typed it",
  "formatted_md": "## Company A\n- Achievement...",
  "updated_at": "2024-01-15T10:35:00Z",
  "length": 1200
}
```

## Acceptance Criteria

- [x] Accepts plain text content
- [x] Validates content length limits
- [x] Persists raw content immediately (before formatting)
- [x] Calls Claude Haiku to convert to structured Markdown
- [x] Stores both raw and formatted versions
- [x] Returns partial success if Haiku fails (raw still saved)
- [x] Overwrites previous explanation on re-submit

---

# Contract: GET /api/explanation

## Purpose

Retrieve the currently stored explanation (both raw and formatted versions).

## Request

- Method: GET
- Content-Type: N/A

## Validation

- None

## Preconditions

- None (returns exists: false if no explanation stored)

## Response (200, exists)

```json
{
  "exists": true,
  "content": "Full raw text of the explanation...",
  "formatted_md": "## Intelitrex\n\n- **React**, **TypeScript**...",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

## Response (200, exists but not formatted)

```json
{
  "exists": true,
  "content": "Full raw text of the explanation...",
  "formatted_md": null,
  "updated_at": "2024-01-15T10:35:00Z"
}
```

## Response (200, not exists)

```json
{
  "exists": false
}
```

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| Disk read failure | 500 | STORAGE_ERROR |

## Backward Compatibility

- If `explanation.json` does not exist, falls back to reading `explanation.md` + `explanation-meta.json` (old format)
- Returns `formatted_md: null` for old-format data

## Acceptance Criteria

- [x] Returns exists: false when no explanation stored
- [x] Returns raw content, formatted markdown, and timestamp when exists
- [x] Falls back to old storage format gracefully

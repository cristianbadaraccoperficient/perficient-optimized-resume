# Contract: POST /api/explanation

## Purpose

Store the user's explanation that provides additional background about their experience.

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

## Response (200)

```json
{
  "success": true,
  "message": "Explanation saved successfully",
  "data": {
    "length": 1200
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

- Persists explanation content to storage

## Acceptance Criteria

- [ ] Accepts plain text content
- [ ] Validates content length limits
- [ ] Persists content to storage
- [ ] Overwrites previous explanation on re-submit

---

# Contract: GET /api/explanation

## Purpose

Retrieve the currently stored explanation.

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
  "content": "Full text of the explanation...",
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

## Acceptance Criteria

- [ ] Returns exists: false when no explanation stored
- [ ] Returns full content and timestamp when exists

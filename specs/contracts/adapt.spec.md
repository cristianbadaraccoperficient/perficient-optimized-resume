# Contract: POST /api/adapt

## Purpose

Trigger AI-powered resume adaptation against a job description. Returns adapted resume plus interview insights.

## Request

- Method: POST
- Content-Type: application/json
- Body:

```json
{
  "job_description": "Full text of the job description...",
  "model": "claude-sonnet-4-6-20250514"
}
```

## Validation

- job_description: required, string, min 50 chars, max 20000 chars
- model: optional, defaults to "claude-sonnet-4-6-20250514"

## Preconditions

- Resume must exist in storage (checked via `data/resume.json`)

## Response (200)

```json
{
  "success": true,
  "data": {
    "adapted_resume": {
      "summary": "Tailored professional summary...",
      "technical_skills": ["Skill 1", "Skill 2"],
      "experience": [
        {
          "company": "Company Name",
          "role": "Role Title",
          "period": "Jan 2022 - Present",
          "bullets": ["Achievement reframed for target role..."]
        }
      ],
      "education": [
        {
          "institution": "University",
          "degree": "BS Computer Science",
          "year": "2018"
        }
      ],
      "certifications": ["AWS Solutions Architect"]
    },
    "strengths": [
      {
        "area": "Cloud Architecture",
        "evidence": "5 years AWS experience, led migration of 3 enterprise apps",
        "talking_point": "STAR-formatted talking point..."
      }
    ],
    "gaps": [
      {
        "skill": "Kubernetes",
        "severity": "nice-to-have",
        "mitigation": "Docker experience is directly transferable; CKA certification in progress"
      }
    ],
    "transferable_skills": [
      {
        "skill": "Team Leadership",
        "source_experience": "Led 4-person team in current role",
        "relevance_to_role": "JD requires managing cross-functional teams",
        "bridge_statement": "Bridge statement connecting past to target role..."
      }
    ]
  },
  "metadata": {
    "model_used": "claude-sonnet-4-6-20250514",
    "tokens_used": 8500,
    "processing_time_ms": 12000,
    "portkey_request_id": "req_abc123"
  }
}
```

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| No JD provided | 400 | MISSING_JD |
| JD too short (<50 chars) | 400 | JD_TOO_SHORT |
| No resume stored | 404 | RESUME_NOT_FOUND |
| AI timeout (>30s) | 500 | AI_PROCESSING_ERROR |
| AI response invalid JSON | 500 | AI_RESPONSE_INVALID |
| Rate limited | 429 | RATE_LIMITED |

## Side Effects

- Stores last adaptation result at `data/last-adaptation.json`

## Business Rules

- Never fabricate experience not present in the original resume
- Reorder and reframe existing experience, do not invent new items
- Terminology may be adjusted to match JD language where equivalent experience exists
- Severity levels for gaps: "critical" | "nice-to-have"

## Acceptance Criteria

- [ ] Validates JD minimum length
- [ ] Returns 404 if no resume exists
- [ ] AI response is validated against Zod schema before returning
- [ ] Handles AI timeout with clear error message
- [ ] Respects rate limit of 10 requests/minute
- [ ] Stores adaptation result for PDF generation
- [ ] Never includes fabricated experience

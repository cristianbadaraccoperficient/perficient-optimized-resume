# API Specification

## Base URL

```
http://localhost:3000/api
```

---

## Endpoints

### POST /api/resume

Upload and store the base resume.

**Request:**
```
Content-Type: multipart/form-data

Fields:
  file: File (PDF, DOCX, or TXT)
```

**Response (200):**
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

**Errors:**
- 400: No file provided or unsupported format
- 500: Parsing error

---

### GET /api/resume

Retrieve the stored resume.

**Response (200):**
```json
{
  "exists": true,
  "raw_text": "Full text content of resume...",
  "structured": {
    "summary": "...",
    "experience": [...],
    "skills": [...],
    "education": [...]
  },
  "uploaded_at": "2024-01-15T10:30:00Z",
  "original_filename": "resume.pdf"
}
```

**Response (200, no resume):**
```json
{
  "exists": false
}
```

---

### POST /api/explanation

Store and auto-format the explanation/strategic context document. The raw text is saved immediately, then Claude Haiku converts it to structured Markdown.

**Request:**
```json
{
  "content": "Full text of the explanation..."
}
```

**Response (200):**
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

**Response (200, formatting unavailable):**
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

**Errors:**
- 400: No content or content too long (>50000 chars)
- 500: Storage error

---

### GET /api/explanation

Retrieve the stored explanation (raw text + structured Markdown).

**Response (200):**
```json
{
  "exists": true,
  "content": "Full raw text of the explanation...",
  "formatted_md": "## Intelitrex\n\n- **React**, **TypeScript**...",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

**Response (200, not formatted):**
```json
{
  "exists": true,
  "content": "Full raw text...",
  "formatted_md": null,
  "updated_at": "2024-01-15T10:35:00Z"
}
```

---

### POST /api/adapt

Trigger resume adaptation against a job description.

**Request:**
```json
{
  "job_description": "Full text of the job description...",
  "model": "claude-sonnet-4-6-20250514"  // optional, defaults to sonnet
}
```

**Response (200):**
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
          "bullets": [
            "Achievement reframed for target role..."
          ]
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
        "talking_point": "In my current role, I led a team of 4 engineers to migrate our monolith to microservices on AWS, reducing deployment time by 80%"
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
        "bridge_statement": "While my team was smaller, I coordinated across 3 departments which mirrors the cross-functional aspect of this role"
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

**Errors:**
- 400: No job description provided
- 404: Resume not found (must upload first)
- 500: AI processing error
- 429: Rate limited

---

### GET /api/export

Generate and download the adapted resume as DOCX using the Perficient corporate template.

**Response (200):**
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="{firstname}-{lastname}-resume.docx"

(DOCX binary)
```

**Errors:**
- 404: No adaptation result available (must run /adapt first)
- 500: DOCX generation error

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "RESUME_NOT_FOUND",
    "message": "Please upload a resume before attempting adaptation"
  }
}
```

## Rate Limiting

- `/api/adapt`: Max 10 requests per minute (AI cost control)
- Other endpoints: No limit

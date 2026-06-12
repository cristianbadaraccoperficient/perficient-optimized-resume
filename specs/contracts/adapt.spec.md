# Contract: POST /api/adapt

## Purpose

Trigger AI-powered resume optimization. With no job description, formats the resume to Perficient style. With a job description, fully tailors the resume to that role and returns interview insights.

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

- job_description: **optional**, string, min 50 chars, max 20000 chars
- model: optional, defaults to "claude-sonnet-4-6-20250514"

## Preconditions

- Resume must exist in storage

## Response (200)

```json
{
  "success": true,
  "data": {
    "adapted_resume": {
      "name": {
        "first": "Jane",
        "last": "Smith"
      },
      "title": "Sr. Software Engineer",
      "summary": "For over 10 years, Ms. Smith has led teams doing analysis, design, development, implementations and testing of enterprise applications in cloud architecture and distributed systems.",
      "roles": ["Software Engineer", "Technical Lead", "Solutions Architect"],
      "solutions": ["Cloud Architecture", "Enterprise Integration", "Custom Web Applications"],
      "industries": ["Finance", "Healthcare", "Technology"],
      "technologies": ["AWS (EC2, Lambda, S3)", "Java/Spring Boot", "React/Next.js", "PostgreSQL"],
      "key_engagements": [
        {
          "company": "Large Financial Services Company",
          "role": "Technical Lead",
          "description": "Led architecture and development of a real-time payment processing platform."
        }
      ],
      "education": [
        {
          "institution": "University of Texas",
          "degree": "MS Computer Science",
          "year": "2014"
        }
      ],
      "certifications": ["AWS Solutions Architect Professional", "Certified Scrum Master"],
      "experience": [
        {
          "client": "Large Financial Services Company",
          "role": "Technical Lead",
          "period": "Jan 2022 - Present",
          "project_description": "Led a 6-person team doing design, development and implementation of a real-time payment processing platform utilizing AWS, Java/Spring Boot and Kafka.",
          "responsibilities": [
            "Architected event-driven microservices handling 10k transactions/second",
            "Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes"
          ],
          "business_value": [
            "After implementation, processing latency reduced by 85%",
            "Annual cost savings of $2.1M through infrastructure optimization"
          ]
        }
      ]
    },
    "strengths": [
      {
        "area": "Cloud Architecture",
        "evidence": "5 years AWS experience, led migration of 3 enterprise apps",
        "talking_point": "In my current role, I led a team of 6 engineers to architect an event-driven payment platform on AWS, reducing processing latency by 85%."
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
        "source_experience": "Led 6-person team in current role",
        "relevance_to_role": "Job description requires managing cross-functional teams of 10+",
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

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| JD provided but invalid (e.g. wrong type) | 400 | VALIDATION_ERROR |
| No resume stored | 404 | RESUME_NOT_FOUND |
| AI timeout (>30s) | 500 | AI_PROCESSING_ERROR |
| AI response invalid JSON | 500 | AI_RESPONSE_INVALID |
| Rate limited | 429 | RATE_LIMITED |

## Side Effects

- Stores last adaptation result for later DOCX export

## Business Rules

- Never fabricate experience not present in the original resume
- Reorder and reframe existing experience, do not invent new items
- Terminology may be adjusted to match JD language where equivalent experience exists
- Severity levels for gaps: "critical" | "nice-to-have"

## Acceptance Criteria

- [ ] Returns 200 when only resume exists and no job_description is provided (Perficient-style format)
- [ ] Returns 200 with job-tailored output when job_description is provided (>=50 chars)
- [ ] Returns 404 with error code RESUME_NOT_FOUND if no resume exists
- [ ] Returns adapted_resume with name, title, summary, roles, solutions, industries, technologies, key_engagements, education, certifications, and experience fields
- [ ] Each experience entry includes client, role, period, project_description, responsibilities, and business_value
- [ ] AI response is validated against schema before returning
- [ ] Returns 500 with error code AI_PROCESSING_ERROR on AI timeout
- [ ] Returns 500 with error code AI_RESPONSE_INVALID on malformed AI response
- [ ] Returns 429 with error code RATE_LIMITED when rate limit is exceeded
- [ ] Stores adaptation result for later DOCX generation
- [ ] Never includes fabricated experience not present in original resume
- [ ] Adjusts terminology to match job description language where equivalent experience exists

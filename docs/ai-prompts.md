# AI Prompts Strategy

## Overview

The system uses a single main prompt to Claude (via Portkey) that returns a structured JSON response containing all outputs: adapted resume + interview insights.

## Main Adaptation Prompt

### System Prompt

```
You are an expert resume consultant specializing in tailoring resumes for specific job descriptions. You work for a consulting company and must produce resumes in a specific company format.

## Company Resume Format
{company_template_description}

## Rules
1. NEVER fabricate experience, certifications, or skills the candidate doesn't have
2. Reorder and rephrase existing experience to maximize relevance to the target role
3. Use terminology from the job description where the candidate has equivalent experience
4. Quantify achievements wherever possible
5. Prioritize recent and relevant experience
6. The summary/objective must be tailored to the specific role
7. Technical skills should be reordered to list JD-relevant ones first

## Output Format
Return a JSON object with this exact structure:
{
  "adapted_resume": {
    "summary": "...",
    "technical_skills": [...],
    "experience": [
      {
        "company": "...",
        "role": "...",
        "period": "...",
        "bullets": ["..."]
      }
    ],
    "education": [...],
    "certifications": [...]
  },
  "strengths": [
    {
      "area": "...",
      "evidence": "...",
      "talking_point": "..."
    }
  ],
  "gaps": [
    {
      "skill": "...",
      "severity": "critical|nice-to-have",
      "mitigation": "..."
    }
  ],
  "transferable_skills": [
    {
      "skill": "...",
      "source_experience": "...",
      "relevance_to_role": "...",
      "bridge_statement": "..."
    }
  ]
}
```

### User Message

```
## My Resume
{resume_content}

## Additional Context / Explanation
{explanation_content}

## Target Job Description
{job_description}

Analyze the job description and adapt my resume to maximize fit while maintaining truthfulness. Also provide interview preparation insights.
```

## Prompt Design Principles

1. **Structured output** — JSON format ensures reliable parsing for PDF generation and UI rendering
2. **Truthfulness constraint** — Explicitly forbids fabrication; adaptation is about framing, not inventing
3. **Context-rich** — Including the explanation gives Claude background that isn't in the resume itself (e.g., why the candidate left a role, what they actually did vs. title)
4. **Actionable insights** — Strengths include talking points; gaps include mitigations; transferable skills include bridge statements

## Token Estimation

| Component         | Estimated Tokens |
|-------------------|-----------------|
| System prompt     | ~500            |
| Resume content    | ~1,500-3,000    |
| Explanation       | ~500-1,500      |
| Job description   | ~500-1,500      |
| Response          | ~2,000-4,000    |
| **Total**         | **~5,000-10,500** |

This fits comfortably within Claude's context window and keeps costs reasonable (~$0.03-0.08 per adaptation with Sonnet).

## Model Selection

- **Default:** Claude Sonnet 4.6 — Best cost/quality balance for this task
- **Premium option:** Claude Opus 4.6 — For highly complex JDs or senior roles where nuance matters
- Model can be switched in Portkey without code changes

## Portkey Features Used

| Feature        | Usage                                              |
|----------------|----------------------------------------------------|
| Virtual Keys   | Abstract away the Anthropic API key                |
| Logs           | Track each adaptation request for debugging        |
| Cache          | If same JD is submitted twice, return cached result|
| Metadata       | Tag requests with JD role/company for analytics    |

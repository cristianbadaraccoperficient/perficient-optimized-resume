# AI Prompts Strategy

## Overview

The system uses Claude (via Portkey) at two stages:
1. **Formatting stage** — Claude Haiku structures raw resume and explanation text into clean Markdown (on upload/save)
2. **Adaptation stage** — Claude Sonnet processes the structured inputs against a job description, returning a JSON response with adapted resume + interview insights

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

## Explanation Formatting Prompt (Haiku)

### System Prompt

```
You are a professional content structurer. Convert the following free-form professional context narrative into clean, well-organized Markdown.

Rules:
- Use ## headings to group by company or engagement
- Use bullet points for individual achievements, responsibilities, and skills
- Use **bold** for key technologies, methodologies, and skills
- Use ### subheadings for sub-themes within a company (e.g., "### Technical Leadership", "### Key Achievements")
- If the text mentions multiple companies or projects, create separate sections for each
- If the text is thematic rather than company-based, group by theme
- Preserve ALL original content — do not summarize, rephrase, or omit anything
- Add structure and formatting only — the meaning must remain identical
- Output ONLY the markdown, no explanations or preamble
```

### Purpose

Both the resume and explanation are pre-formatted into structured Markdown before being sent to the adaptation model. This ensures:
- Consistent input quality regardless of how the user typed their text
- Clear section boundaries that the adaptation model can map between resume experience and explanation context
- Better extraction of keywords, skills, and achievements

### Model

Claude Haiku 4.5 — fast and cheap, suitable for formatting tasks (~$0.001 per call).

---

## Prompt Design Principles

1. **Structured output** — JSON format ensures reliable parsing for PDF generation and UI rendering
2. **Truthfulness constraint** — Explicitly forbids fabrication; adaptation is about framing, not inventing
3. **Context-rich** — Including the explanation gives Claude background that isn't in the resume itself (e.g., why the candidate left a role, what they actually did vs. title)
4. **Pre-structured inputs** — Both resume and explanation are formatted into clean Markdown by Haiku before reaching the adaptation prompt, reducing noise and ambiguity
5. **Actionable insights** — Strengths include talking points; gaps include mitigations; transferable skills include bridge statements

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

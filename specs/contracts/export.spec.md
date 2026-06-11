# Contract: GET /api/export

## Purpose

Generate and serve the adapted resume as a DOCX file using the Perficient corporate template.

## Request

- Method: GET
- Content-Type: N/A
- Query Parameters: none

## Validation

- None (endpoint is simple GET)

## Preconditions

- An adaptation result must exist (from a prior POST /api/adapt call)
- Template file must exist at `templates/perficient-resume.docx`

## Response (200)

```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="{firstname}-{lastname}-resume.docx"

(DOCX binary)
```

## Pipeline

```
data/last-adaptation.json (adapted resume data)
  → Load templates/perficient-resume.docx via pizzip
  → docxtemplater fills placeholder tags with adaptation data
  → Generated DOCX buffer
  → Response as file download
```

## Template Mapping

| Placeholder | Source Field |
|-------------|-------------|
| `{firstName}` | adapted_resume.name.first |
| `{lastName}` | adapted_resume.name.last |
| `{title}` | adapted_resume.title |
| `{professionalOverview}` | adapted_resume.summary |
| `{#roles}{.}{/roles}` | adapted_resume.roles[] |
| `{#solutions}{.}{/solutions}` | adapted_resume.technical_skills[] |
| `{#industries}{.}{/industries}` | adapted_resume.industries[] |
| `{#technologies}{.}{/technologies}` | adapted_resume.technologies[] |
| `{#keyEngagements}` | adapted_resume.key_engagements[] |
| `{company}`, `{role}`, `{description}` | per engagement |
| `{#education}{institution}`, `{degree}`, `{year}{/education}` | adapted_resume.education[] |
| `{#certifications}{.}{/certifications}` | adapted_resume.certifications[] |
| `{#experience}` | adapted_resume.experience[] (detailed) |
| `{company}`, `{role}`, `{period}` | per experience entry |
| `{projectDescription}` | experience[].description |
| `{#bullets}{.}{/bullets}` | experience[].bullets[] |
| `{#businessValue}{.}{/businessValue}` | experience[].business_value[] |

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| No adaptation result | 404 | ADAPTATION_NOT_FOUND |
| Template file missing | 500 | TEMPLATE_NOT_FOUND |
| Template rendering failure | 500 | TEMPLATE_ERROR |

## Acceptance Criteria

- [ ] Returns DOCX with correct Content-Type header
- [ ] Sets Content-Disposition with dynamic filename from candidate name
- [ ] Generated DOCX preserves Perficient logo in header
- [ ] Generated DOCX preserves "Proprietary and Confidential" footer
- [ ] Generated DOCX uses correct paragraph styles (Heading1, 05Header3, 09BodyCopy, etc.)
- [ ] Bullet lists render correctly with ListParagraph style
- [ ] Multiple experience entries render as repeating sections
- [ ] Returns 404 if no adaptation exists
- [ ] DOCX is valid and opens without errors in Microsoft Word
- [ ] DOCX is editable by the user after download

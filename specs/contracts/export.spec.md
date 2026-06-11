# Contract: GET /api/export

## Purpose

Generate and serve the adapted resume as a DOCX file using the Perficient corporate template.

## Request

- Method: GET
- Content-Type: N/A
- Body/Params: none

## Validation

- None (parameterless GET)

## Preconditions

- An adaptation result must exist (from a prior successful POST /api/adapt call)
- The Perficient DOCX template must be available on the server

## Response (200)

```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="jane-smith-resume.docx"

(DOCX binary stream)
```

The generated DOCX contains the adapted resume content rendered into the Perficient corporate template, preserving:
- Company logo in header
- "Proprietary and Confidential" footer
- Corporate paragraph styles (headings, body text, list items)
- Section structure: Name/Title, Professional Overview, Roles, Solutions, Industries, Technologies, Key Engagements, Education, Certifications, Experience (with responsibilities and business value)

## Error Cases

| Condition | Code | Error Code |
|-----------|------|------------|
| No adaptation result exists | 404 | ADAPTATION_NOT_FOUND |
| Template unavailable | 500 | TEMPLATE_NOT_FOUND |
| DOCX rendering failure | 500 | TEMPLATE_ERROR |

## Acceptance Criteria

- [ ] Returns Content-Type `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- [ ] Sets Content-Disposition with filename derived from candidate first and last name in lowercase kebab format
- [ ] Generated DOCX preserves Perficient logo in header
- [ ] Generated DOCX preserves "Proprietary and Confidential" footer
- [ ] Professional Overview section renders the adapted summary
- [ ] Roles list renders as individual items from `adapted_resume.roles`
- [ ] Solutions list renders from `adapted_resume.solutions`
- [ ] Industries list renders from `adapted_resume.industries`
- [ ] Technologies list renders from `adapted_resume.technologies`
- [ ] Key Engagements render with company, role, and description per entry
- [ ] Education renders with institution, degree, and year per entry
- [ ] Certifications render as individual items
- [ ] Each experience entry renders client, role, period, project description, responsibilities, and business value
- [ ] Multiple experience entries render as repeating sections
- [ ] Returns 404 with error code ADAPTATION_NOT_FOUND if no adaptation exists
- [ ] Returns 500 with error code TEMPLATE_NOT_FOUND if template is missing
- [ ] Returns 500 with error code TEMPLATE_ERROR if rendering fails
- [ ] Generated DOCX is valid and opens without errors in Microsoft Word
- [ ] Generated DOCX is editable by the user after download

# SDD Workflow

## Overview

This project follows Spec-Driven Development. Specs are the source of truth — code is implemented from specs, validated against specs, and reviewed against specs.

## Phases

```
YOU (pick next task)
  |
  v
SPEC PHASE ──────> spec-author drafts ──> you approve ──> specs/[type]/[name].spec.md
  |
  v
IMPLEMENT PHASE ──> implementer codes ──> src/[files]
  |
  v
REVIEW PHASE ────> reviewer audits ──> APPROVED or REJECTED (with feedback)
  |
  v (if rejected, back to IMPLEMENT with review feedback)
DONE ────────────> mark task complete
```

## Task Tracking

Tasks are tracked inline. Each spec's acceptance criteria serve as the task checklist.

### Task States

| State | Meaning |
|-------|---------|
| `spec-pending` | Feature identified, spec not yet written |
| `spec-ready` | Spec written and approved by user |
| `in-progress` | Implementation underway |
| `in-review` | Implementation complete, under review |
| `rejected` | Review failed, needs rework |
| `done` | Review passed, feature complete |

## Task Board

### Phase 1: Setup & Infrastructure

| Task | Spec | State |
|------|------|-------|
| Project init (Next.js, TS, Tailwind) | N/A (boilerplate) | done |
| Storage utility | contracts/resume.spec.md (side effects) | done |
| Portkey client config | contracts/adapt.spec.md (dependency) | done |

### Phase 2: Resume & Explanation Management

| Task | Spec | State |
|------|------|-------|
| POST /api/resume | contracts/resume.spec.md | spec-ready |
| GET /api/resume | contracts/resume.spec.md | spec-ready |
| POST /api/explanation | contracts/explanation.spec.md | spec-ready |
| GET /api/explanation | contracts/explanation.spec.md | spec-ready |
| ResumeUpload component | components/resume-upload.spec.md | spec-ready |
| ExplanationInput component | components/explanation-input.spec.md | spec-ready |
| Upload Resume flow | flows/upload-resume.spec.md | spec-ready |

### Phase 3: AI Adaptation

| Task | Spec | State |
|------|------|-------|
| POST /api/adapt | contracts/adapt.spec.md | spec-ready |
| JobDescriptionInput component | components/job-description-input.spec.md | spec-ready |
| ResultsPanel component | components/results-panel.spec.md | spec-ready |
| Adapt Resume flow | flows/adapt-resume.spec.md | spec-ready |

### Phase 4: DOCX Generation

| Task | Spec | State |
|------|------|-------|
| GET /api/export | contracts/export.spec.md | spec-ready |
| Perficient DOCX template with placeholders | contracts/export.spec.md (template mapping) | spec-ready |
| Download Resume flow | flows/download-resume.spec.md | spec-ready |

## Agent Roles

| Agent | Model | Reads | Writes | Decides |
|-------|-------|-------|--------|---------|
| spec-author | opus | docs/, existing specs | specs/[type]/[name].spec.md | What behavior to specify |
| implementer | sonnet | specs/, src/ | src/ code + tests | How to implement the spec |
| reviewer | sonnet | specs/ + src/ | review verdict | Whether code meets spec |

## Conventions

- Specs live in `specs/` and are never auto-modified by implementation
- A spec change requires user approval (you re-run spec phase)
- Reviewer can only APPROVE or REJECT — cannot modify code
- If rejected, implementer gets reviewer's feedback as input
- Max 2 rejection cycles before escalating to user

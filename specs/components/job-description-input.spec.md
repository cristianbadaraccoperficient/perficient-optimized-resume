# Component: JobDescriptionInput

## Purpose

Text area where user pastes a job description to trigger resume adaptation.

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| onAdapt | (jd: string) => void | yes | - |
| isLoading | boolean | yes | - |
| resumeExists | boolean | yes | - |
| error | string \| null | no | null |

## States

| State | Trigger | Renders |
|-------|---------|---------|
| disabled | resumeExists=false | Textarea (disabled) + message "Upload resume first" |
| idle | resumeExists=true | Textarea (optional input, does not gate the Tailor button) |
| processing | isLoading=true | Textarea (disabled) |
| error | adaptation failed | Textarea (enabled) + error message |

## Interactions

- Paste/type text in textarea → stored as job description, sent to API if ≥50 chars
- Clear textarea → job description omitted from next request

## Validation (client-side)

- No minimum length required to submit; the "Tailor Resume" button is gated only on resume upload
- Show helper text: "Optional — paste a job description to tailor the resume to a specific role (minimum 50 characters to be included)"
- Show current char count when typing

## Accessibility

- Textarea: aria-label="Job description", aria-describedby pointing to helper text
- Button: aria-disabled with reason when disabled
- Loading state: aria-busy="true" on button, aria-live="polite" status

## Acceptance Criteria

- [ ] Textarea disabled when no resume exists with explanation message
- [ ] Textarea enabled as soon as resume exists (JD is optional)
- [ ] Shows character count
- [ ] Textarea disabled during processing (prevents edit)
- [ ] Shows error message when error prop is set

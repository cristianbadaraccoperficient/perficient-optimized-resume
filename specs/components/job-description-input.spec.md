# Component: JobDescriptionInput

## Purpose

Text area where user pastes a job description to trigger resume adaptation.

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| onAdapt | (jd: string) => void | yes | - |
| isLoading | boolean | yes | - |
| resumeExists | boolean | yes | - |

## States

| State | Trigger | Renders |
|-------|---------|---------|
| disabled | resumeExists=false | Textarea (disabled) + message "Upload resume first" |
| empty | resumeExists=true, no text | Textarea + "Adapt Resume" button (disabled) |
| ready | text entered (>=50 chars) | Textarea + "Adapt Resume" button (enabled) |
| processing | isLoading=true | Textarea (disabled) + button with spinner |

## Interactions

- Paste/type text -> enable button when >=50 chars
- Click "Adapt Resume" -> calls onAdapt with textarea content
- Clear textarea -> disable button

## Validation (client-side)

- Min 50 characters to enable submission
- Show helper text: "Paste the full job description (minimum 50 characters)"
- Show current char count when typing

## Accessibility

- Textarea: aria-label="Job description", aria-describedby pointing to helper text
- Button: aria-disabled with reason when disabled
- Loading state: aria-busy="true" on button, aria-live="polite" status

## Acceptance Criteria

- [ ] Textarea disabled when no resume exists with explanation message
- [ ] Button disabled when text < 50 chars
- [ ] Button enabled when text >= 50 chars
- [ ] Shows character count
- [ ] Button shows loading spinner during processing
- [ ] Textarea disabled during processing (prevents edit)
- [ ] Calls onAdapt with full text content on submit

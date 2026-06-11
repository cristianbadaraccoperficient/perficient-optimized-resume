# Component: ExplanationInput

## Purpose

Allows user to provide or edit their explanation that gives additional background about their experience.

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| onSaveSuccess | () => void | yes | - |
| onSaveError | (error: string) => void | yes | - |
| currentStatus | 'idle' \| 'saved' | yes | - |
| initialContent | string \| null | no | null |

## States

| State | Trigger | Renders |
|-------|---------|---------|
| idle | no explanation saved | Empty textarea + "Save" button (disabled) |
| editing | user types content | Textarea with content + "Save" button (enabled) |
| saving | save triggered | Textarea (disabled) + loading indicator |
| saved | API success | Textarea (readonly) + "Edit" button + saved indicator |
| error | API failure | Textarea + error message + "Retry" button |

## Interactions

- Type in textarea -> enable Save button
- Click "Save" -> submit content to API
- Click "Edit" (saved state) -> enable textarea for editing
- Click "Retry" (error state) -> re-attempt save

## Validation (client-side)

- Content: min 1 char, max 50000 chars
- Character count shown near textarea

## Accessibility

- Textarea: aria-label="Explanation"
- Character counter: aria-live="polite"
- Save button: aria-disabled when conditions not met
- Error message: role="alert"

## Acceptance Criteria

- [ ] Loads existing content from initialContent prop
- [ ] Save button disabled when textarea is empty
- [ ] Shows character count (current/max)
- [ ] Disables textarea during save
- [ ] Transitions to saved state on success
- [ ] Shows error message on failure without losing content
- [ ] "Edit" button re-enables editing in saved state

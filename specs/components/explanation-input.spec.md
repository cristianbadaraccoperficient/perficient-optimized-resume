# Component: ExplanationInput

## Purpose

Allows user to provide or edit their strategic context explanation. On save, the content is sent to the API where it is stored and auto-formatted into structured Markdown via Claude Haiku.

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| onSaveSuccess | () => void | yes | - |
| onSaveError | (error: string) => void | yes | - |
| currentStatus | 'idle' \| 'saved' | yes | - |
| initialContent | string \| null | no | null |
| initialFormattedMd | string \| null | no | null |

## States

| State | Trigger | Renders |
|-------|---------|---------|
| idle | no explanation saved | Empty textarea + "Save" button (disabled) |
| editing | user types content | Textarea with content + "Save" button (enabled) |
| saving | save triggered | Textarea (disabled) + "Processing..." button |
| saved | API success | Textarea (readonly) + "Edit" + "Preview" buttons + saved indicator |
| error | API failure | Textarea + error message + "Retry" button |

## Interactions

- Type in textarea -> enable Save button
- Click "Save" -> submit content to API (shows "Processing..." during save + formatting)
- Click "Edit" (saved state) -> enable textarea for editing
- Click "Preview" (saved state, when formatted_md available) -> toggle between raw text and formatted markdown preview
- Click "Raw" (preview mode) -> return to raw text view
- Click "Retry" (error state) -> re-attempt save

## Preview Feature

When formatted markdown is available (after successful Haiku formatting):
- A "Preview" toggle appears in the footer alongside "Edit"
- Clicking "Preview" replaces the textarea with a read-only view of the structured markdown
- Clicking "Raw" returns to the raw text textarea view
- Editing resets the preview (formatted_md is cleared until next save)

## Warning States

- If save succeeds but formatting fails, shows an amber warning: "Saved, but auto-formatting unavailable"
- The explanation is still usable without formatting (adapt endpoint falls back to raw text)

## Validation (client-side)

- Content: min 1 char, max 50000 chars
- Character count shown near textarea

## Accessibility

- Textarea: aria-label="Strategic context"
- Character counter: aria-live="polite"
- Save button: aria-disabled when conditions not met
- Error message: role="alert"

## Acceptance Criteria

- [x] Loads existing content from initialContent prop
- [x] Loads existing formatted markdown from initialFormattedMd prop
- [x] Save button disabled when textarea is empty
- [x] Shows character count (current/max)
- [x] Disables textarea during save
- [x] Shows "Processing..." during save (includes Haiku formatting time)
- [x] Transitions to saved state on success
- [x] Shows formatted markdown preview when available
- [x] Shows warning if formatting failed but save succeeded
- [x] Shows error message on failure without losing content
- [x] "Edit" button re-enables editing in saved state
- [x] Editing clears previous formatted preview

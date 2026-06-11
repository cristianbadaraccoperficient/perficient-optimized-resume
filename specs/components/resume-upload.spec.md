# Component: ResumeUpload

## Purpose

Allows user to upload their base resume file (PDF/DOCX/TXT) via drag-and-drop or file picker.

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| onUploadSuccess | (data: ResumeData) => void | yes | - |
| onUploadError | (error: string) => void | yes | - |
| currentStatus | 'idle' \| 'uploaded' | yes | - |
| currentFilename | string \| null | no | null |

## States

| State | Trigger | Renders |
|-------|---------|---------|
| idle | initial / no resume | Drop zone with upload icon + "Upload Resume" text |
| dragging | file dragged over zone | Highlighted border + "Drop file here" |
| uploading | file selected/dropped | Progress indicator + filename |
| uploaded | API success | Filename + upload date + "Re-upload" button |
| error | API error / validation | Error message + "Try again" button |

## Interactions

- Drag file over zone -> highlight zone, show drop prompt
- Drop file on zone -> validate type/size, trigger upload
- Click zone (idle state) -> open file picker
- Click "Re-upload" (uploaded state) -> reset to idle
- Click "Try again" (error state) -> reset to idle

## Validation (client-side)

- Accepted types: .pdf, .docx, .txt
- Max file size: 5MB
- Show inline error for rejected files (no API call)

## Accessibility

- Drop zone: role="button", tabIndex=0, aria-label="Upload resume file"
- Keyboard: Enter/Space opens file picker
- Status changes announced via aria-live="polite" region
- Error messages linked via aria-describedby
- Drag-and-drop is enhancement only; click/keyboard always works

## Acceptance Criteria

- [ ] Renders drop zone in idle state
- [ ] Highlights on drag-over, reverts on drag-leave
- [ ] Opens file picker on click or Enter/Space
- [ ] Validates file type before upload (rejects with message)
- [ ] Validates file size before upload (rejects with message)
- [ ] Shows uploading state with filename during API call
- [ ] Transitions to uploaded state on success
- [ ] Transitions to error state on failure with message
- [ ] "Re-upload" resets to idle state
- [ ] Prevents double-submission during upload

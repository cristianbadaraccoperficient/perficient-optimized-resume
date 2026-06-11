# Flow: Upload Resume

## Purpose

User uploads their base resume so it can be used for future adaptations.

## Preconditions

- App is running
- No specific prior state required

## Steps

| # | User Action | System Response | Component | API Call |
|---|-------------|-----------------|-----------|----------|
| 1 | Opens app | Checks for existing resume | Page | GET /api/resume |
| 2a | (resume exists) | Shows uploaded state with filename | ResumeUpload | - |
| 2b | (no resume) | Shows idle drop zone | ResumeUpload | - |
| 3 | Drags file onto zone | Highlights drop zone | ResumeUpload | - |
| 4 | Drops file | Validates type+size client-side | ResumeUpload | - |
| 5a | (valid file) | Shows uploading state, sends file | ResumeUpload | POST /api/resume |
| 5b | (invalid file) | Shows inline error, no API call | ResumeUpload | - |
| 6 | Waits | Shows progress indicator | ResumeUpload | - |
| 7a | (API success) | Shows uploaded state + filename | ResumeUpload | - |
| 7b | (API error) | Shows error state + message | ResumeUpload | - |

## Happy Path

1. User opens app, sees empty drop zone
2. User drags resume.pdf onto zone
3. Zone highlights, user drops file
4. Client validates: PDF, under 5MB -> passes
5. Upload indicator shows with "resume.pdf"
6. API extracts raw text from file
7. API converts raw text to structured Markdown via LLM (Haiku)
8. API returns success with parsed sections
9. Component shows "resume.pdf" with checkmark and "Re-upload" option
10. Job description input becomes enabled

## Error Paths

| Step | Error Condition | System Behavior |
|------|-----------------|-----------------|
| 4 | Wrong file type (.jpg) | "Only PDF, DOCX, and TXT files are accepted" |
| 4 | File too large (>5MB) | "File must be under 5MB" |
| 6 | File corrupted/scanned | "Failed to extract text from PDF. The file may be corrupted, password-protected, or contain only scanned images." |
| 6 | File has no readable text | "The file contains no readable text. If this is a scanned PDF, please use an OCR tool first." |
| 7 | Portkey not configured | "AI formatting service is not configured." |
| 7 | AI service unavailable | "Failed to format resume as markdown. The AI service may be temporarily unavailable." |
| 8 | Network error | "Connection failed. Check your network." + retry |

## Acceptance Criteria

- [ ] Full flow works from drag-drop to uploaded state
- [ ] Full flow works from file picker to uploaded state
- [ ] Re-upload overwrites previous resume
- [ ] Job description input enables after successful upload
- [ ] All error paths show actionable messages

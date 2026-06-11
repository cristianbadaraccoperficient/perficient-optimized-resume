# Component: ResultsPanel

## Purpose

Displays adaptation results with tabbed navigation: Strengths, Gaps, Transferable Skills, and a Download action.

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| adaptationResult | AdaptationResult \| null | yes | - |
| isLoading | boolean | yes | - |
| error | string \| null | no | null |
| onRetry | () => void | no | - |

## States

| State | Trigger | Renders |
|-------|---------|---------|
| empty | adaptationResult=null, isLoading=false, no error | Placeholder message "Adapt a resume to see results" |
| loading | isLoading=true | Skeleton loaders in tab content area |
| results | adaptationResult provided | Tab bar + active tab content |
| error | error prop is set | Error message + "Try again" button |

## Sub-components

### TabBar
- Tabs: "Strengths" | "Gaps" | "Transferable"
- Active tab visually highlighted
- Keyboard navigable (arrow keys between tabs)
- "Download DOCX" button positioned outside tabs (always visible)

### StrengthsTab
- List of strength cards
- Each card shows: area, evidence, talking point
- Talking points formatted for easy copy

### GapsTab
- List of gap cards
- Each card shows: skill, severity badge (critical/nice-to-have), mitigation
- Critical gaps visually distinct (warning color)

### TransferableTab
- List of transferable skill cards
- Each card shows: skill, source experience, relevance, bridge statement

## Interactions

- Click tab -> switch content
- Arrow Left/Right on tab -> navigate tabs
- Click "Download DOCX" -> trigger file download (GET /api/export)

## Accessibility

- Tab bar: role="tablist"
- Each tab: role="tab", aria-selected, aria-controls
- Tab panels: role="tabpanel", aria-labelledby
- Keyboard: Arrow keys navigate tabs, Enter/Space activates
- Severity badges: not color-only (include text label)

## Acceptance Criteria

- [ ] Shows placeholder when no results
- [ ] Shows skeleton loaders during loading
- [ ] Shows error message with "Try again" button when error is set
- [ ] Renders all 3 tabs with correct content
- [ ] Tab switching works via click and keyboard
- [ ] "Download DOCX" button triggers file download
- [ ] "Download DOCX" button disabled when no adaptation exists
- [ ] Gap severity is conveyed via text + color (not color alone)
- [ ] Responsive: tabs stack or scroll on mobile

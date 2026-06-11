# Component: ResultsPanel

## Purpose

Displays adaptation results with tabbed navigation: PDF Preview, Strengths, Gaps, and Transferable Skills.

## Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| adaptationResult | AdaptationResult \| null | yes | - |
| isLoading | boolean | yes | - |

## States

| State | Trigger | Renders |
|-------|---------|---------|
| empty | adaptationResult=null, isLoading=false | Placeholder message "Adapt a resume to see results" |
| loading | isLoading=true | Skeleton loaders in tab content area |
| results | adaptationResult provided | Tab bar + active tab content |

## Sub-components

### TabBar
- Tabs: "PDF Preview" | "Strengths" | "Gaps" | "Transferable"
- Active tab visually highlighted
- Keyboard navigable (arrow keys between tabs)

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

### PdfPreview
- Embedded PDF viewer (iframe)
- "Download PDF" button

## Interactions

- Click tab -> switch content
- Arrow Left/Right on tab -> navigate tabs
- Click "Download PDF" -> trigger file download

## Accessibility

- Tab bar: role="tablist"
- Each tab: role="tab", aria-selected, aria-controls
- Tab panels: role="tabpanel", aria-labelledby
- Keyboard: Arrow keys navigate tabs, Enter/Space activates
- Severity badges: not color-only (include text label)

## Acceptance Criteria

- [ ] Shows placeholder when no results
- [ ] Shows skeleton loaders during loading
- [ ] Renders all 4 tabs with correct content
- [ ] Tab switching works via click and keyboard
- [ ] PDF preview loads embedded PDF
- [ ] Download button triggers file download
- [ ] Gap severity is conveyed via text + color (not color alone)
- [ ] Responsive: tabs stack or scroll on mobile

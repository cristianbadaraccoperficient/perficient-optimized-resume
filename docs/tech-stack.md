# Tech Stack & Dependencies

## Core Framework

| Package        | Version | Purpose                          |
|----------------|---------|----------------------------------|
| next           | 15.x    | Full-stack React framework       |
| react          | 19.x    | UI library                       |
| typescript     | 5.x     | Type safety                      |

## Styling

| Package        | Version | Purpose                          |
|----------------|---------|----------------------------------|
| tailwindcss    | 3.x     | Utility-first CSS                |
| @headlessui/react | 1.x  | Accessible UI components         |
| lucide-react   | latest  | Icons                            |

## AI Integration

| Package        | Version | Purpose                          |
|----------------|---------|----------------------------------|
| portkey-ai     | latest  | AI gateway SDK                   |

### Portkey Configuration

```typescript
import Portkey from 'portkey-ai';

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY,
  virtualKey: process.env.PORTKEY_VIRTUAL_KEY, // Points to Claude/Anthropic
});

// Usage
const response = await portkey.chat.completions.create({
  model: "claude-sonnet-4-6-20250514",
  messages: [...],
  response_format: { type: "json_object" }
});
```

### Why Portkey over direct Anthropic SDK?

1. **Observability** — Every request logged with latency, tokens, cost
2. **Fallbacks** — Can route to OpenAI/other if Claude is down
3. **Caching** — Semantic caching for similar JDs saves cost
4. **Guardrails** — Can add content filters, budget limits
5. **A/B Testing** — Easy to compare Claude Opus vs Sonnet results

## DOCX Generation

| Package        | Version | Purpose                          |
|----------------|---------|----------------------------------|
| docxtemplater  | latest  | Template-based DOCX generation   |
| pizzip         | latest  | ZIP manipulation for DOCX files  |

### DOCX Pipeline

```
Adapted resume data (JSON)
  → Load Perficient .docx template (templates/perficient-resume.docx)
  → docxtemplater fills placeholder tags with data
  → Generated DOCX binary
  → Sent as download response
```

### Why DOCX over PDF?

1. **100% fidelity** — Uses the real Perficient template with all corporate styles
2. **Editable** — User can tweak the result in Word before submitting
3. **Logo, headers, footers** — Preserved automatically from template
4. **No rendering issues** — No CSS→PDF conversion quirks

## File Parsing (Resume Upload)

| Package        | Version | Purpose                          |
|----------------|---------|----------------------------------|
| pdf-parse      | latest  | Extract text from PDF uploads    |
| mammoth        | latest  | Extract text from DOCX uploads   |
| multer         | latest  | File upload handling             |

## Development

| Package        | Version | Purpose                          |
|----------------|---------|----------------------------------|
| eslint         | latest  | Linting                          |
| prettier       | latest  | Code formatting                  |

## Environment Variables

```env
# Portkey
PORTKEY_API_KEY=           # Portkey account API key
PORTKEY_VIRTUAL_KEY=       # Virtual key pointing to Anthropic

# App
DATA_DIR=./data            # Where resume/explanation files are stored
```

## Project Structure

```
perficient-optimized-resume/
├── docs/                      # Project documentation
├── data/                      # Persisted user data (gitignored)
│   ├── resume.json            # Parsed structured resume
│   ├── resume-raw.md          # Raw text of uploaded resume
│   └── explanation.md         # User's explanation document
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Main UI
│   │   ├── layout.tsx         # Root layout
│   │   └── api/
│   │       ├── resume/
│   │       │   └── route.ts   # Upload/get resume
│   │       ├── explanation/
│   │       │   └── route.ts   # Upload/get explanation
│   │       ├── adapt/
│   │       │   └── route.ts   # Trigger adaptation
│   │       └── export/
│   │           └── route.ts   # Generate & serve DOCX
│   ├── components/            # React components
│   │   ├── ResumeUpload.tsx
│   │   ├── JobDescriptionInput.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── StrengthsTab.tsx
│   │   ├── GapsTab.tsx
│   │   └── TransferableTab.tsx
│   ├── lib/
│   │   ├── portkey.ts         # Portkey client setup
│   │   ├── prompts.ts         # AI prompt templates
│   │   ├── docx-generator.ts  # DOCX generation logic
│   │   ├── file-parser.ts     # PDF/DOCX text extraction
│   │   └── storage.ts         # Read/write data files
├── templates/
│   └── perficient-resume.docx # Company DOCX template with placeholder tags
├── public/                    # Static assets
├── .env.local                 # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

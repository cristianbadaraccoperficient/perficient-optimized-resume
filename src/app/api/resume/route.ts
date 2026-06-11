import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, readMarkdown, writeMarkdown } from '@/lib/storage';
import { ResumeStructured } from '@/contracts/resume.contract';
import { portkey } from '@/lib/portkey';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['.pdf', '.docx', '.txt'];

interface StoredResume {
  raw_text: string;
  formatted_md: string;
  structured: ResumeStructured;
  uploaded_at: string;
  original_filename: string;
}

function detectSections(text: string): string[] {
  const sections: string[] = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes('summary') || lowerText.includes('profile') || lowerText.includes('objective')) {
    sections.push('summary');
  }
  if (lowerText.includes('experience') || lowerText.includes('employment') || lowerText.includes('work history')) {
    sections.push('experience');
  }
  if (lowerText.includes('skills') || lowerText.includes('technical skills') || lowerText.includes('competencies')) {
    sections.push('skills');
  }
  if (lowerText.includes('education') || lowerText.includes('academic') || lowerText.includes('degree')) {
    sections.push('education');
  }

  return sections;
}

function parseStructured(text: string): ResumeStructured {
  return {
    summary: '',
    experience: [],
    skills: [],
    education: [],
  };
}

const FORMAT_SYSTEM_PROMPT = `You are a document formatter. Convert the following raw text extracted from a PDF resume into clean, well-structured Markdown.

Rules:
- Use proper heading levels (# for name, ## for sections like Experience, Education, Skills)
- Use bullet points for responsibilities and achievements
- Remove PDF artifacts (page numbers, "Page X", "-- X of Y --", headers/footers)
- Rejoin lines that were split by PDF column width
- Preserve ALL original content — do not summarize, rephrase, or omit anything
- Use **bold** for company names and job titles
- Use proper date formatting
- Output ONLY the markdown, no explanations`;

async function convertToMarkdown(rawText: string): Promise<string> {
  if (!process.env.PORTKEY_API_KEY || !process.env.PORTKEY_BASE_URL) {
    throw new ConversionError(
      'PORTKEY_NOT_CONFIGURED',
      'AI formatting service is not configured. Set PORTKEY_API_KEY and PORTKEY_BASE_URL environment variables.'
    );
  }

  const response = await portkey.chat.completions.create({
    model: '@dsvertex/anthropic.claude-haiku-4-5@20251001',
    messages: [
      { role: 'system', content: FORMAT_SYSTEM_PROMPT },
      { role: 'user', content: rawText },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new ConversionError(
      'FORMAT_EMPTY_RESPONSE',
      'AI service returned an empty response while formatting the resume'
    );
  }
  return content;
}

class ConversionError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'No file provided',
          },
        },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_TYPES.some(ext => filename.endsWith(ext));

    if (!hasValidExtension) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSUPPORTED_FORMAT',
            message: 'File must be PDF, DOCX, or TXT',
          },
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 5MB limit',
          },
        },
        { status: 400 }
      );
    }

    let rawText: string;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (filename.endsWith('.pdf')) {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        try {
          const result = await parser.getText();
          rawText = result.text;
        } finally {
          await parser.destroy();
        }
      } else if (filename.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value;
      } else {
        rawText = buffer.toString('utf-8');
      }
    } catch (error) {
      const ext = filename.split('.').pop();
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: `Failed to extract text from ${ext?.toUpperCase()} file. The file may be corrupted, password-protected, or contain only scanned images.`,
          },
        },
        { status: 500 }
      );
    }

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPTY_CONTENT',
            message: 'The file contains no readable text or too little content to be a valid resume. If this is a scanned PDF, please use an OCR tool first.',
          },
        },
        { status: 400 }
      );
    }

    const structured = parseStructured(rawText);
    const sectionsDetected = detectSections(rawText);

    let formattedMd: string;
    try {
      formattedMd = await convertToMarkdown(rawText);
    } catch (error) {
      if (error instanceof ConversionError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORMAT_ERROR',
            message: 'Failed to format resume as markdown. The AI service may be temporarily unavailable.',
          },
        },
        { status: 502 }
      );
    }

    const resumeData: StoredResume = {
      raw_text: rawText,
      formatted_md: formattedMd,
      structured,
      uploaded_at: new Date().toISOString(),
      original_filename: file.name,
    };

    await writeJSON('resume.json', resumeData);
    await writeMarkdown('resume-raw.md', formattedMd);

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        filename: file.name,
        parsed_length: rawText.length,
        sections_detected: sectionsDetected,
      },
    });
  } catch (error) {
    console.error('[resume POST]', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while processing the resume. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const resumeData = await readJSON<StoredResume>('resume.json');

    if (!resumeData) {
      return NextResponse.json({
        exists: false,
      });
    }

    const rawText = await readMarkdown('resume-raw.md');

    return NextResponse.json({
      exists: true,
      raw_text: rawText || resumeData.raw_text,
      formatted_md: resumeData.formatted_md,
      structured: resumeData.structured,
      uploaded_at: resumeData.uploaded_at,
      original_filename: resumeData.original_filename,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to read resume data',
        },
      },
      { status: 500 }
    );
  }
}

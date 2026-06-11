import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, readMarkdown, writeMarkdown } from '@/lib/storage';
import { ResumeStructured } from '@/contracts/resume.contract';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['.pdf', '.docx', '.txt'];

interface StoredResume {
  raw_text: string;
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
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        rawText = result.text;
      } else if (filename.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value;
      } else {
        rawText = buffer.toString('utf-8');
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse file content',
          },
        },
        { status: 500 }
      );
    }

    const structured = parseStructured(rawText);
    const sectionsDetected = detectSections(rawText);

    const resumeData: StoredResume = {
      raw_text: rawText,
      structured,
      uploaded_at: new Date().toISOString(),
      original_filename: file.name,
    };

    await writeJSON('resume.json', resumeData);
    await writeMarkdown('resume-raw.md', rawText);

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
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Failed to process resume',
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

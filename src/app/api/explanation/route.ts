import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, readMarkdown, writeMarkdown } from '@/lib/storage';
import { ExplanationPostRequestSchema } from '@/contracts/explanation.contract';
import { portkey } from '@/lib/portkey';

interface StoredExplanation {
  raw_text: string;
  formatted_md: string | null;
  updated_at: string;
  length: number;
}

const FORMAT_SYSTEM_PROMPT = `You are a professional content structurer. Convert the following free-form professional context narrative into clean, well-organized Markdown.

Rules:
- Use ## headings to group by company or engagement
- Use bullet points for individual achievements, responsibilities, and skills
- Use **bold** for key technologies, methodologies, and skills
- Use ### subheadings for sub-themes within a company (e.g., "### Technical Leadership", "### Key Achievements")
- If the text mentions multiple companies or projects, create separate sections for each
- If the text is thematic rather than company-based, group by theme
- Preserve ALL original content — do not summarize, rephrase, or omit anything
- Add structure and formatting only — the meaning must remain identical
- Output ONLY the markdown, no explanations or preamble`;

async function formatExplanation(rawText: string): Promise<string> {
  if (!process.env.PORTKEY_API_KEY || !process.env.PORTKEY_BASE_URL) {
    throw new Error('AI formatting service is not configured');
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
    throw new Error('AI service returned an empty response');
  }
  return content;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = ExplanationPostRequestSchema.safeParse(body);

    if (!parsed.success) {
      if (!body.content || body.content.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_CONTENT',
              message: 'Content is required',
            },
          },
          { status: 400 }
        );
      }

      if (body.content.length > 50000) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CONTENT_TOO_LONG',
              message: 'Content exceeds 50000 character limit',
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CONTENT',
            message: 'Validation failed',
          },
        },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    try {
      const explanationData: StoredExplanation = {
        raw_text: content,
        formatted_md: null,
        updated_at: new Date().toISOString(),
        length: content.length,
      };

      await writeJSON('explanation.json', explanationData);
      await writeMarkdown('explanation-raw.md', content);

      let formatted = false;
      let formatError: string | undefined;

      try {
        const formattedMd = await formatExplanation(content);
        explanationData.formatted_md = formattedMd;
        await writeJSON('explanation.json', explanationData);
        await writeMarkdown('explanation-formatted.md', formattedMd);
        formatted = true;
      } catch (error) {
        formatError = error instanceof Error ? error.message : 'Formatting failed';
      }

      return NextResponse.json({
        success: true,
        message: formatted
          ? 'Explanation saved and formatted successfully'
          : 'Explanation saved (formatting unavailable)',
        data: {
          length: content.length,
          formatted,
          ...(formatError && { format_error: formatError }),
        },
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STORAGE_ERROR',
            message: 'Failed to save explanation',
          },
        },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSING_CONTENT',
          message: 'Invalid request body',
        },
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const explanationData = await readJSON<StoredExplanation>('explanation.json');

    if (explanationData) {
      return NextResponse.json({
        exists: true,
        content: explanationData.raw_text,
        formatted_md: explanationData.formatted_md,
        updated_at: explanationData.updated_at,
      });
    }

    // Backward compatibility with old format
    const content = await readMarkdown('explanation.md');
    if (content) {
      const meta = await readJSON<{ updated_at: string }>('explanation-meta.json');
      return NextResponse.json({
        exists: true,
        content,
        formatted_md: null,
        updated_at: meta?.updated_at || new Date().toISOString(),
      });
    }

    return NextResponse.json({
      exists: false,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to read explanation data',
        },
      },
      { status: 500 }
    );
  }
}

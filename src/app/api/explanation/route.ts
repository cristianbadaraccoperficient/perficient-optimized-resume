import { NextRequest, NextResponse } from 'next/server';
import { readJSON, writeJSON, readMarkdown, writeMarkdown } from '@/lib/storage';
import { ExplanationPostRequestSchema } from '@/contracts/explanation.contract';

interface ExplanationMeta {
  updated_at: string;
  length: number;
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
      await writeMarkdown('explanation.md', content);

      const meta: ExplanationMeta = {
        updated_at: new Date().toISOString(),
        length: content.length,
      };

      await writeJSON('explanation-meta.json', meta);

      return NextResponse.json({
        success: true,
        message: 'Explanation saved successfully',
        data: {
          length: content.length,
        },
      });
    } catch (error) {
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
  } catch (error) {
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
    const content = await readMarkdown('explanation.md');
    const meta = await readJSON<ExplanationMeta>('explanation-meta.json');

    if (!content || !meta) {
      return NextResponse.json({
        exists: false,
      });
    }

    return NextResponse.json({
      exists: true,
      content,
      updated_at: meta.updated_at,
    });
  } catch (error) {
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

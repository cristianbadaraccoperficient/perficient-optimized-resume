import { NextRequest, NextResponse } from 'next/server';
import { AdaptRequestSchema, StrengthsArraySchema, GapsArraySchema, TransferableSkillsArraySchema } from '@/contracts/adapt.contract';
import { readJSON, readMarkdown } from '@/lib/storage';
import { portkey } from '@/lib/portkey';
import { SseJsonParser, SectionKey } from '@/lib/sse-json-parser';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
};

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function validateSection(key: SectionKey, raw: string): { valid: boolean; data?: unknown; error?: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { valid: false, error: `Invalid JSON for section "${key}"` };
  }

  const schemaMap = {
    strengths: StrengthsArraySchema,
    gaps: GapsArraySchema,
    transferable_skills: TransferableSkillsArraySchema,
  };

  const result = schemaMap[key].safeParse(parsed);
  if (!result.success) {
    return { valid: false, error: `Validation failed for "${key}": ${result.error.message}` };
  }
  return { valid: true, data: result.data };
}

interface PortkeyErrorInfo {
  type: string;
  status: number | undefined;
  message: string;
  cause?: string;
}

function extractPortkeyError(error: unknown): PortkeyErrorInfo {
  if (error instanceof Error) {
    const name = error.constructor.name;
    const status = 'status' in error ? (error as any).status : undefined;
    const innerError = 'error' in error ? (error as any).error : undefined;

    if (name === 'APIConnectionTimeoutError') {
      return { type: name, status: undefined, message: error.message, cause: 'Request exceeded timeout' };
    }

    if (name === 'APIConnectionError') {
      const rootCause = (error as any).cause;
      return {
        type: name,
        status: undefined,
        message: error.message,
        cause: rootCause instanceof Error ? rootCause.message : 'Gateway unreachable (network/DNS)',
      };
    }

    if (status !== undefined) {
      return {
        type: name,
        status: typeof status === 'number' ? status : undefined,
        message: error.message,
        cause: innerError ? JSON.stringify(innerError) : undefined,
      };
    }

    return { type: name, status: undefined, message: error.message, cause: error.stack?.split('\n')[1]?.trim() };
  }

  return { type: 'Unknown', status: undefined, message: String(error) };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const parseResult = AdaptRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' } },
      { status: 400 }
    );
  }

  const { job_description, model } = parseResult.data;

  const [resume, explanationData] = await Promise.all([
    readJSON('resume.json'),
    readJSON<{ raw_text: string; formatted_md: string | null }>('explanation.json'),
  ]);

  if (!resume) {
    return NextResponse.json(
      { success: false, error: { code: 'RESUME_NOT_FOUND', message: 'No resume found. Please upload a resume first.' } },
      { status: 404 }
    );
  }

  let explanation: string | null = null;
  if (explanationData) {
    explanation = explanationData.formatted_md || explanationData.raw_text;
  } else {
    explanation = await readMarkdown('explanation.md');
  }

  const modelToUse = model || '@dsvertex/anthropic.claude-sonnet-4-6';

  const systemPrompt = `You are a career coaching expert specializing in Perficient consulting roles. Analyze the candidate's resume against the provided context and job description (if any) and return interview preparation insights.

NEVER fabricate experience not present in the resume. Base all analysis strictly on the provided resume content.

Return a JSON object with this exact structure:
{
  "strengths": [
    {
      "area": "Specific competency area",
      "evidence": "Concrete evidence from the resume",
      "talking_point": "STAR-formatted talking point for interviews"
    }
  ],
  "gaps": [
    {
      "skill": "Missing or weak skill",
      "severity": "critical or nice-to-have",
      "mitigation": "How existing skills bridge this gap or what to study"
    }
  ],
  "transferable_skills": [
    {
      "skill": "Skill name",
      "source_experience": "Where this skill was demonstrated in the resume",
      "relevance_to_role": "Why it matters for the target role",
      "bridge_statement": "How to frame this in an interview"
    }
  ]
}

Keep responses concise: talking_points max 2 sentences, mitigation max 1 sentence, bridge_statement max 2 sentences.
Return 3-5 strengths, all meaningful gaps (0 is valid), and 2-4 transferable skills.`;

  const resumeContent = (resume as { formatted_md?: string; raw_text?: string }).formatted_md
    || (resume as { raw_text?: string }).raw_text
    || JSON.stringify(resume, null, 2);

  const userMessage = `Resume Data:
${resumeContent}
${explanation ? `\nAdditional Context:\n${explanation}\n` : ''}${job_description ? `\nJob Description:\n${job_description}\n\nPlease adapt the resume to this job description and provide interview insights.` : '\nPlease reformat and optimize this resume to the Perficient style and standards.'}`;

  let aiStream: AsyncIterable<any>;
  try {
    aiStream = await portkey.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
      stream: true,
      timeout: 90000,
    });
  } catch (error: unknown) {
    const errorInfo = extractPortkeyError(error);

    console.error('[adapt/insights POST] Portkey stream init failed:', JSON.stringify({
      type: errorInfo.type,
      status: errorInfo.status,
      message: errorInfo.message,
      cause: errorInfo.cause,
      model: modelToUse,
      timestamp: new Date().toISOString(),
    }, null, 2));

    if (errorInfo.status === 429) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Please try again later.' } },
        { status: 429 }
      );
    }

    const httpStatus = (errorInfo.status && errorInfo.status >= 400 && errorInfo.status < 600)
      ? errorInfo.status
      : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AI_PROCESSING_ERROR',
          message: 'Failed to process request with AI service',
          ...(process.env.NODE_ENV === 'development' && { details: errorInfo }),
        },
      },
      { status: httpStatus }
    );
  }

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const parser = new SseJsonParser();

      try {
        for await (const chunk of aiStream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (!delta) continue;

          const sections = parser.append(delta);
          for (const section of sections) {
            const validation = validateSection(section.key, section.raw);
            if (validation.valid) {
              controller.enqueue(encoder.encode(sseEvent('section', { type: section.key, data: validation.data })));
            } else {
              console.warn(`[adapt/insights SSE] Section "${section.key}" validation failed:`, validation.error);
              controller.enqueue(encoder.encode(sseEvent('section', { type: section.key, data: JSON.parse(section.raw) })));
            }
          }

          const finishReason = chunk.choices?.[0]?.finish_reason;
          if (finishReason === 'length') {
            controller.enqueue(encoder.encode(sseEvent('error', {
              code: 'AI_RESPONSE_TRUNCATED',
              message: 'AI response was truncated. The resume may be too long to process.',
            })));
            controller.close();
            return;
          }
        }

        const processingTime = Date.now() - startTime;
        controller.enqueue(encoder.encode(sseEvent('done', {
          metadata: {
            model_used: modelToUse,
            processing_time_ms: processingTime,
          },
        })));
        controller.close();
      } catch (error: unknown) {
        const errorInfo = extractPortkeyError(error);
        console.error('[adapt/insights SSE] Stream error:', errorInfo);
        try {
          controller.enqueue(encoder.encode(sseEvent('error', {
            code: 'AI_STREAM_ERROR',
            message: errorInfo.message || 'Stream interrupted',
          })));
          controller.close();
        } catch {
          // Controller may already be closed
        }
      }
    },
  });

  return new Response(readableStream, { headers: SSE_HEADERS });
}

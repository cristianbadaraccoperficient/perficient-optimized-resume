import { NextRequest, NextResponse } from 'next/server';
import { AdaptRequestSchema, ResumeResultSchema } from '@/contracts/adapt.contract';
import { readJSON, writeJSON, readMarkdown } from '@/lib/storage';
import { portkey } from '@/lib/portkey';

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

  try {
    const body = await request.json();

    const parseResult = AdaptRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
          },
        },
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
        {
          success: false,
          error: {
            code: 'RESUME_NOT_FOUND',
            message: 'No resume found. Please upload a resume first.',
          },
        },
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

    const systemPrompt = `You are a resume adaptation expert specializing in Perficient consulting resumes. Your task is to reformat and optimize a candidate's resume to the Perficient corporate style, and when a job description is provided, tailor it to that specific role. Follow these strict business rules:

1. NEVER fabricate experience, skills, or achievements that are not present in the original resume
2. Only reorder and reframe existing content to better align with the target role (if provided)
3. You may adjust terminology to match the job description language where equivalent experience exists
4. Focus on highlighting relevant aspects of existing experience
5. Structure the output to match the Perficient corporate resume template format

Return your response as a JSON object with this exact structure:
{
  "adapted_resume": {
    "name": { "first": "Jane", "last": "Smith" },
    "title": "Sr. Software Engineer",
    "summary": "Concise professional overview (2-3 sentences) tailored to the target role",
    "roles": ["Software Engineer", "Technical Lead", "Cloud Architect"],
    "solutions": ["Cloud Architecture", "Enterprise Integration", "Microservices"],
    "industries": ["Finance", "Healthcare", "Technology"],
    "technologies": ["AWS (EC2, Lambda, S3)", "Java/Spring Boot", "React/TypeScript"],
    "key_engagements": [
      {
        "company": "Major Financial Corp",
        "role": "Lead Engineer",
        "description": "Led cloud migration of core banking platform serving 2M users"
      }
    ],
    "education": [
      {
        "institution": "University Name",
        "degree": "B.S. Computer Science",
        "year": "2018"
      }
    ],
    "certifications": ["AWS Solutions Architect Professional", "Certified Scrum Master"],
    "experience": [
      {
        "client": "Major Financial Corp",
        "role": "Lead Software Engineer",
        "period": "Jan 2022 - Present",
        "project_description": "Cloud migration of legacy banking platform to AWS microservices architecture",
        "responsibilities": [
          "Led team of 8 engineers in designing and implementing microservices architecture",
          "Established CI/CD pipelines reducing deployment time by 70%"
        ],
        "business_value": [
          "Reduced infrastructure costs by 40% through cloud optimization",
          "Improved system uptime from 99.5% to 99.99%"
        ]
      }
    ]
  }
}

FIELD GUIDELINES:
- "name": Extract first and last name from the resume
- "title": Most relevant professional title for the target role
- "summary": 2-3 sentences, tailored to the target role
- "roles": 3-5 professional roles ordered by relevance
- "solutions": 3-6 solution areas relevant to the target role
- "industries": 2-5 industries the candidate has worked in
- "technologies": 5-10 key technologies, grouped logically
- "key_engagements": 2-4 most impressive/relevant client engagements
- "experience": Full work history with action-oriented responsibilities and measurable business value`;

    const resumeContent = (resume as { formatted_md?: string; raw_text?: string }).formatted_md
      || (resume as { raw_text?: string }).raw_text
      || JSON.stringify(resume, null, 2);

    const userMessage = `Resume Data:
${resumeContent}
${explanation ? `\nAdditional Context:\n${explanation}\n` : ''}${job_description ? `\nJob Description:\n${job_description}\n\nPlease adapt the resume to this job description following the Perficient format.` : '\nPlease reformat and optimize this resume to the Perficient style and standards.'}`;

    let aiResponse;
    try {
      aiResponse = await portkey.chat.completions.create({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 6144,
        timeout: 90000,
      });
    } catch (error: unknown) {
      const errorInfo = extractPortkeyError(error);

      console.error('[adapt/resume POST] Portkey call failed:', JSON.stringify({
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

    const finishReason = aiResponse.choices[0]?.finish_reason;
    if (finishReason === 'length') {
      console.error('[adapt/resume POST] AI response truncated by max_tokens limit');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AI_RESPONSE_TRUNCATED',
            message: 'AI response was truncated. The resume may be too long to process in one request.',
          },
        },
        { status: 500 }
      );
    }

    const rawContent = aiResponse.choices[0]?.message?.content;
    if (!rawContent || typeof rawContent !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AI_RESPONSE_INVALID',
            message: 'AI service returned an empty response',
          },
        },
        { status: 500 }
      );
    }

    const responseContent = rawContent.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch {
      console.error('[adapt/resume POST] Invalid JSON from AI. First 500 chars:', responseContent.slice(0, 500));
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AI_RESPONSE_INVALID',
            message: 'AI service returned invalid JSON',
            ...(process.env.NODE_ENV === 'development' && { raw_preview: responseContent.slice(0, 500) }),
          },
        },
        { status: 500 }
      );
    }

    const validationResult = ResumeResultSchema.safeParse(parsedResponse);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AI_RESPONSE_INVALID',
            message: 'AI service returned data that does not match expected schema',
          },
        },
        { status: 500 }
      );
    }

    await writeJSON('last-adaptation.json', validationResult.data);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: validationResult.data,
      metadata: {
        model_used: modelToUse,
        tokens_used: aiResponse.usage?.total_tokens || 0,
        processing_time_ms: processingTime,
        portkey_request_id: aiResponse.id || 'unknown',
      },
    });

  } catch (error) {
    console.error('[adapt/resume POST] Unexpected error:', error instanceof Error ? error.stack : error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          ...(process.env.NODE_ENV === 'development' && {
            details: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
          }),
        },
      },
      { status: 500 }
    );
  }
}

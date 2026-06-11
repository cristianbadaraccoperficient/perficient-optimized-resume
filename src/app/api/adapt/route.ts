import { NextRequest, NextResponse } from 'next/server';
import { AdaptRequestSchema, AdaptationResultSchema } from '@/contracts/adapt.contract';
import { readJSON, writeJSON, readMarkdown } from '@/lib/storage';
import { portkey } from '@/lib/portkey';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    const parseResult = AdaptRequestSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.issues;
      const jdError = errors.find((e: z.ZodIssue) => e.path.includes('job_description'));

      if (!body.job_description) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_JD',
              message: 'Job description is required',
            },
          },
          { status: 400 }
        );
      }

      if (jdError && jdError.message.includes('50')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'JD_TOO_SHORT',
              message: 'Job description must be at least 50 characters',
            },
          },
          { status: 400 }
        );
      }

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

    const resume = await readJSON('resume.json');
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

    const explanation = await readMarkdown('explanation.md');

    const modelToUse = model || 'claude-sonnet-4-6-20250514';

    const systemPrompt = `You are a resume adaptation expert. Your task is to adapt a candidate's resume to match a specific job description while following these strict business rules:

1. NEVER fabricate experience, skills, or achievements that are not present in the original resume
2. Only reorder and reframe existing content to better align with the job description
3. You may adjust terminology to match the job description language where equivalent experience exists
4. Focus on highlighting relevant aspects of existing experience

Return your response as a JSON object matching this structure:
{
  "adapted_resume": {
    "summary": "Tailored professional summary highlighting relevant experience",
    "technical_skills": ["skill1", "skill2"],
    "experience": [
      {
        "company": "Company Name",
        "role": "Role Title",
        "period": "Jan 2022 - Present",
        "bullets": ["Reframed achievement focusing on relevance to target role"]
      }
    ],
    "education": [
      {
        "institution": "University Name",
        "degree": "Degree Name",
        "year": "2018"
      }
    ],
    "certifications": ["Certification Name"]
  },
  "strengths": [
    {
      "area": "Specific competency area",
      "evidence": "Concrete evidence from resume",
      "talking_point": "STAR-formatted talking point for interviews"
    }
  ],
  "gaps": [
    {
      "skill": "Missing skill from job description",
      "severity": "critical or nice-to-have",
      "mitigation": "How existing skills can bridge this gap or what to learn"
    }
  ],
  "transferable_skills": [
    {
      "skill": "Skill name",
      "source_experience": "Where this skill was demonstrated",
      "relevance_to_role": "Why it matters for the target role",
      "bridge_statement": "How to connect past experience to target role in interview"
    }
  ]
}`;

    const userMessage = `Resume Data:
${JSON.stringify(resume, null, 2)}

${explanation ? `Additional Context:\n${explanation}\n\n` : ''}Job Description:
${job_description}

Please adapt the resume to this job description and provide interview insights.`;

    let aiResponse;
    try {
      aiResponse = await portkey.chat.completions.create({
        model: modelToUse,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        timeout: 30000,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: 'Rate limit exceeded. Please try again later.',
            },
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AI_PROCESSING_ERROR',
            message: 'Failed to process request with AI service',
          },
        },
        { status: 500 }
      );
    }

    const responseContent = aiResponse.choices[0]?.message?.content;
    if (!responseContent || typeof responseContent !== 'string') {
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

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AI_RESPONSE_INVALID',
            message: 'AI service returned invalid JSON',
          },
        },
        { status: 500 }
      );
    }

    const validationResult = AdaptationResultSchema.safeParse(parsedResponse);
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

    const adaptationResult = validationResult.data;

    await writeJSON('last-adaptation.json', adaptationResult);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: adaptationResult,
      metadata: {
        model_used: modelToUse,
        tokens_used: aiResponse.usage?.total_tokens || 0,
        processing_time_ms: processingTime,
        portkey_request_id: aiResponse.id || 'unknown',
      },
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

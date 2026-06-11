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

    let explanation: string | null = null;
    const explanationData = await readJSON<{ raw_text: string; formatted_md: string | null }>('explanation.json');
    if (explanationData) {
      explanation = explanationData.formatted_md || explanationData.raw_text;
    } else {
      explanation = await readMarkdown('explanation.md');
    }

    const modelToUse = model || '@dsvertex/anthropic.claude-sonnet-4-6@20250514';

    const systemPrompt = `You are a resume adaptation expert specializing in Perficient consulting resumes. Your task is to adapt a candidate's resume to match a specific job description while following these strict business rules:

1. NEVER fabricate experience, skills, or achievements that are not present in the original resume
2. Only reorder and reframe existing content to better align with the job description
3. You may adjust terminology to match the job description language where equivalent experience exists
4. Focus on highlighting relevant aspects of existing experience
5. Structure the output to match the Perficient corporate resume template format

Return your response as a JSON object matching this structure:
{
  "adapted_resume": {
    "name": { "first": "Jane", "last": "Smith" },
    "title": "Sr. Software Engineer",
    "summary": "Tailored professional overview highlighting relevant experience for the target role",
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
}

IMPORTANT FIELD GUIDELINES:
- "name": Extract the candidate's first and last name from the resume
- "title": The most relevant professional title for the target job
- "summary": A concise professional overview (2-3 sentences) tailored to the target role
- "roles": 3-5 professional roles the candidate has held or can claim, ordered by relevance to the target job
- "solutions": 3-6 solution areas the candidate has expertise in, relevant to the target role
- "industries": 2-5 industries the candidate has worked in
- "technologies": 5-10 key technologies, grouped logically (e.g. "AWS (EC2, Lambda, S3)")
- "key_engagements": 2-4 most impressive/relevant client engagements, brief description
- "experience": Detailed work history entries with client name, responsibilities (action-oriented bullets), and business value (measurable outcomes)`;

    const resumeContent = (resume as { formatted_md?: string; raw_text?: string }).formatted_md
      || (resume as { raw_text?: string }).raw_text
      || JSON.stringify(resume, null, 2);

    const userMessage = `Resume Data:
${resumeContent}

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

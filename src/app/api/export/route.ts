import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { readJSON } from '@/lib/storage';
import { ExportAdaptationResultSchema } from '@/contracts/export.contract';
import type { ExportErrorResponse } from '@/contracts/export.contract';
import type { AdaptationResult } from '@/contracts/adapt.contract';

const TEMPLATE_PATH = path.resolve(process.cwd(), 'templates/perficient-resume.docx');

function buildErrorResponse(code: ExportErrorResponse['error']['code'], message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    } satisfies ExportErrorResponse,
    { status }
  );
}

export async function GET() {
  // 1. Read the last adaptation result
  const adaptationData = await readJSON<AdaptationResult>('last-adaptation.json');

  if (!adaptationData) {
    return buildErrorResponse(
      'ADAPTATION_NOT_FOUND',
      'No adaptation result found. Please run an adaptation first.',
      404
    );
  }

  // Validate the stored data against schema
  const validation = ExportAdaptationResultSchema.safeParse(adaptationData);
  if (!validation.success) {
    return buildErrorResponse(
      'ADAPTATION_NOT_FOUND',
      'Stored adaptation result is invalid or corrupted.',
      404
    );
  }

  const { adapted_resume } = validation.data;

  // 2. Load the DOCX template
  let templateContent: Buffer;
  try {
    templateContent = await fs.readFile(TEMPLATE_PATH) as Buffer;
  } catch {
    return buildErrorResponse(
      'TEMPLATE_NOT_FOUND',
      'DOCX template file not found on server.',
      500
    );
  }

  // 3. Render the template with adaptation data
  try {
    const zip = new PizZip(templateContent);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Map adapted resume fields to template placeholder names
    doc.render({
      firstName: adapted_resume.name.first,
      lastName: adapted_resume.name.last,
      title: adapted_resume.title,
      professionalOverview: adapted_resume.summary,
      roles: adapted_resume.roles,
      solutions: adapted_resume.solutions,
      industries: adapted_resume.industries,
      technologies: adapted_resume.technologies,
      keyEngagements: adapted_resume.key_engagements.map((ke) => ({
        company: ke.company,
        role: ke.role,
        description: ke.description,
      })),
      education: adapted_resume.education.map((edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        year: edu.year,
      })),
      certifications: adapted_resume.certifications,
      experience: adapted_resume.experience.map((exp) => ({
        client: exp.client,
        role: exp.role,
        period: exp.period,
        projectDescription: exp.project_description,
        responsibilities: exp.responsibilities,
        businessValue: exp.business_value,
      })),
    });

    const outputBuffer = doc.getZip().generate({ type: 'nodebuffer' });

    // 4. Build filename from name fields (lowercase, hyphenated)
    const firstName = adapted_resume.name.first.toLowerCase().replace(/\s+/g, '-');
    const lastName = adapted_resume.name.last.toLowerCase().replace(/\s+/g, '-');
    const filename = `${firstName}-${lastName}-resume.docx`;

    // 5. Return binary response (convert Buffer to Uint8Array for NextResponse compatibility)
    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown template rendering error';
    return buildErrorResponse(
      'TEMPLATE_ERROR',
      `Failed to render DOCX template: ${message}`,
      500
    );
  }
}

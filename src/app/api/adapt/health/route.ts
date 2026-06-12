import { NextResponse } from 'next/server';
import { portkey } from '@/lib/portkey';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string; latency_ms?: number }> = {};

  const hasKey = !!process.env.PORTKEY_API_KEY;
  const hasUrl = !!process.env.PORTKEY_BASE_URL;
  checks.environment = {
    ok: hasKey && hasUrl,
    detail: !hasKey ? 'PORTKEY_API_KEY is missing' : !hasUrl ? 'PORTKEY_BASE_URL is missing' : 'OK',
  };

  if (checks.environment.ok) {
    const start = Date.now();
    try {
      const res = await portkey.chat.completions.create({
        model: '@dsvertex/anthropic.claude-sonnet-4-6',
        messages: [{ role: 'user', content: 'Reply with the single word OK' }],
        max_tokens: 5,
        timeout: 10000,
      });
      checks.gateway = {
        ok: true,
        detail: `Response received. ID: ${res.id || 'n/a'}`,
        latency_ms: Date.now() - start,
      };
    } catch (error: unknown) {
      checks.gateway = {
        ok: false,
        detail: error instanceof Error
          ? `${error.constructor.name}: ${error.message}`
          : String(error),
        latency_ms: Date.now() - start,
      };
    }
  } else {
    checks.gateway = { ok: false, detail: 'Skipped: environment check failed' };
  }

  const healthy = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    { status: healthy ? 'healthy' : 'unhealthy', checks },
    { status: healthy ? 200 : 503 }
  );
}

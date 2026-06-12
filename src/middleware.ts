import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMITS: Record<string, number> = {
  '/api/adapt': 5,
  '/api/resume': 10,
  '/api/export': 20,
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(pathname: string): number {
  for (const [prefix, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return 30;
}

function checkRateLimit(ip: string, pathname: string): { allowed: boolean; retryAfter: number } {
  const limit = getRateLimit(pathname);
  const key = `${ip}:${pathname.split('/').slice(0, 4).join('/')}`;
  const now = Date.now();
  const window = 60_000;

  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + window });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!host) return false;

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return originHost === host;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return refererHost === host;
    } catch {
      return false;
    }
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/adapt/health') {
    return addSecurityHeaders(NextResponse.next());
  }

  if (!pathname.startsWith('/api/')) {
    return addSecurityHeaders(NextResponse.next());
  }

  const appApiKey = process.env.APP_API_KEY;
  if (appApiKey) {
    const requestKey = request.headers.get('x-api-key');
    const sameOrigin = isSameOrigin(request);

    if (!sameOrigin && requestKey !== appApiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' } },
        { status: 401 }
      );
    }
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const { allowed, retryAfter } = checkRateLimit(ip, pathname);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait.' } },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};

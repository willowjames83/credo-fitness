import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'credo_session';

// API routes that are always public
const PUBLIC_API_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/share', // GET /api/share/:code is public; write ops re-check auth in handlers
  '/api/health', // public liveness/readiness probe (no auth)
];

function looksLikeJwt(token: string): boolean {
  return token.split('.').length === 3;
}

function requestToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7) || null;
  return request.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // All other /api routes require a structurally valid token (cookie or Bearer).
    // Full JWT verification happens in route handlers via getUserIdFromRequest.
    const token = requestToken(request);
    if (!token || !looksLikeJwt(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // App pages require a session cookie; redirect to login otherwise.
  if (pathname.startsWith('/app') || pathname.startsWith('/onboarding')) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !looksLikeJwt(token)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/app/:path*', '/onboarding/:path*'],
};

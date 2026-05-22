import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEMO_TIER_COOKIE, SERVICE_TIERS } from '@/lib/auth';

const PROTECTED_PREFIXES = ['/dashboard', '/settings'];

/**
 * Route integrity for the protected plane.
 *
 * - Anonymous users hitting a protected route are sent to /login with a
 *   redirect hint so they return to where they intended after authenticating.
 * - Authenticated users hitting /login are forwarded into the workspace.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tier = request.cookies.get(DEMO_TIER_COOKIE)?.value;
  const isAuthenticated = !!tier && (SERVICE_TIERS as string[]).includes(tier);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/login'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwt(token: string): any | null {
  try {
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    if (!base64) return null;
    // atob is available in Edge runtime
    const json = atob(base64 + '==='.slice((base64.length + 3) % 4));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Liste des routes publiques
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // Liste des routes protégées
  const protectedPrefixes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));

  // Rediriger vers login si on tente d'accéder à une route protégée sans token
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Rediriger vers dashboard si on tente d'accéder à une route d'auth avec un token valide
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protection Admin: autoriser seulement ADMIN plateforme ou MANAGER d'une org
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const payload = parseJwt(token.value);
    const role = payload?.role as string | undefined;
    const orgMemberships = Array.isArray(payload?.orgMemberships) ? payload.orgMemberships as Array<{ organizationId: string; role: string }> : [];
    const isAdmin = role === 'ADMIN';
    const isManager = orgMemberships.some(m => m.role === 'MANAGER');
    if (!isAdmin && !isManager) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Exclusions:
     * - /_next (assets Next.js, images, etc.)
     * - /_vercel (instrumentation de Vercel)
     * - /api (routes API)
     * - /static (fichiers statiques)
     * - favicon.ico, robots.txt, sitemap.xml
     */
    '/((?!_next|_vercel|api|static|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Liste des routes publiques
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

  // Liste des routes protégées 
  const protectedPrefixes = ['/dashboard', '/admin', '/application', '/settings'];
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
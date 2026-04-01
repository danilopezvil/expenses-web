import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const AUTH_ROUTES = ['/login', '/register', '/recovery'];
const PROTECTED_ROUTES = ['/dashboard', '/expenses', '/import', '/accounts', '/members', '/payments', '/reports'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the bare path (e.g. /es/dashboard → /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/';

  const isAuthRoute = AUTH_ROUTES.some((r) => pathnameWithoutLocale.startsWith(r));
  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathnameWithoutLocale.startsWith(r));

  const hasSession = request.cookies.has('x-auth-user');

  // NOTE:
  // The access token is intentionally kept in-memory and the refresh token is
  // persisted in localStorage (client-only). On full page refreshes, middleware
  // runs before the client can rehydrate Zustand and refresh the session.
  // Redirecting protected routes from middleware when `x-auth-user` is missing
  // causes false logouts on reload. The client dashboard layout now owns that
  // guard and restores the session with `/auth/refresh`.
  if (isProtectedRoute && !hasSession) {
    return intlMiddleware(request);
  }

  if (isAuthRoute && hasSession) {
    const dashboardUrl = new URL(`/${routing.defaultLocale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

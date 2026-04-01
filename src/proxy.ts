import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const AUTH_ROUTES = ['/login', '/register', '/recovery'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the bare path (e.g. /es/dashboard → /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, '') || '/';

  const isAuthRoute = AUTH_ROUTES.some((r) => pathnameWithoutLocale.startsWith(r));
  // Auth routing is handled client-side based on backend-issued HttpOnly cookie.
  // Middleware cannot safely infer session state from JS-managed cookies.
  if (isAuthRoute) return intlMiddleware(request);

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

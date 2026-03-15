import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@mighty/core/auth';
import { cookies } from 'next/headers';
import { updateSession } from '@mighty/core/supabase/proxy';

type AuthenticatedNextRequest = NextRequest & { auth?: unknown };

export default auth(async function proxy(rawReq) {
  const req = rawReq as AuthenticatedNextRequest;
  // Early return for static assets (safety check in case matcher doesn't catch them)
  const url = new URL(req.url);
  const token = req.auth;

  const backendApiEndpoints = ['/trpc', '/webapi', '/oidc'];
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme');
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isRootPath = req.nextUrl.pathname === '/';
  const isProtectedPath = req.nextUrl.pathname.startsWith('/dashboard');

  if (isProtectedPath) {
    // Avoid auth loop when NextAuth session exists but Supabase claims are stale/missing.
    if (token) {
      return NextResponse.next();
    }
    return await updateSession(req);
  }
  //  console.log('cookieStore theme', theme);

  if (backendApiEndpoints.some((path) => url.pathname.startsWith(path))) {
    console.log('Skipping API request: %s', url.pathname);

    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$/i)
  ) {
    return null;
  }

  // In Auth.js v5, the session is available via req.auth
  // const token = await getToken({ req })

  //nsole.log('proxy req.token', token);
  const isMaintenance = req.nextUrl.pathname === '/maintenance';
  //  console.log("isMaintenance", isMaintenance)
  const isAuth = !!token;

  if (isRootPath) {
    return NextResponse.next();
    // if (isAuth) {
    //   // If authenticated, redirect to dashboard
    //   return NextResponse.redirect(new URL('/dashboard', req.url));
    // } else {
    //   // If not authenticated, redirect to login
    //   //console.log('middleware token', !!token)
    //   return NextResponse.redirect(new URL('/auth', req.url));
    // }
  }

  if (isMaintenance) {
    console.log('redirecting to maintenance');
    //return NextResponse.redirect(new URL("/maintenance", req.url))
    return NextResponse.rewrite(req.nextUrl);
  }
  //onsole.log('isAuthPage', isAuthPage);
  //console.log('isAuth', isAuth);
  if (isAuthPage) {
    if (isAuth) {
      // Check if there's a 'from' parameter in the URL
      const fromParam = req.nextUrl.searchParams.get('from');
      // console.log("fromParam", fromParam)
      if (fromParam) {
        // Redirect to the 'from' path
        return NextResponse.redirect(new URL(fromParam, req.url));
      }
      // Default redirect to dashboard if no 'from' parameter
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return null;
  }
  if (!token && !isAuthPage) {
    console.log('!proxy x1 no sessionCookie redirecting to login');

    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(new URL(`/auth?from=${encodeURIComponent(from)}`, req.url));
  }

  if (!isAuth) {
    console.log('!middleware token redirecting to login', !!token);

    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(new URL(`/auth?from=${encodeURIComponent(from)}`, req.url));
  }

  return null;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)',
    '/api/inngest',
  ],
};

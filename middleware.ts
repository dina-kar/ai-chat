import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Middleware called for:', request.url);
  
  const path = request.nextUrl.pathname;
  
  // Check for session cookie
  const sessionCookie = request.cookies.get('appwrite-session');
  const isAuthenticated = !!sessionCookie;
  
  console.log('Path:', path, 'Authenticated:', isAuthenticated);
  
  // Auth routes that should redirect to home if authenticated
  if ((path === '/login' || path === '/register') && isAuthenticated) {
    console.log('Authenticated user accessing auth page, redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Protected routes that require authentication
  const protectedRoutes = ['/chat'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  
  // Root path should also require authentication
  if ((path === '/' || isProtectedRoute) && !isAuthenticated) {
    console.log('Unauthenticated user accessing protected route, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log('Allowing request to proceed');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

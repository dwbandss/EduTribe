import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/signup', '/'];
  
  // Check if path is public
  const { pathname } = request.nextUrl;
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Verify token for protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = verifyToken(token);
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add user info to request headers for downstream usage
  const response = NextResponse.next();
  if (typeof user === 'object' && user !== null) {
    response.headers.set('x-user-id', user.uid);
    response.headers.set('x-user-role', user.role);
  }
  
  return response;
}

export const config = {
  matcher: [
    '/student/:path*',
    '/volunteer/:path*',
    '/school/:path*',
    '/ngo/:path*',
    '/admin/:path*',
    '/api/profile',
    '/api/student/:path*',
    '/api/volunteer/:path*',
    '/api/schools/:path*',
    '/api/ngos/:path*',
    '/api/donors/:path*',
    '/api/admin/:path*',
  ],
};

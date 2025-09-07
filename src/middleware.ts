import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for admin login page
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};

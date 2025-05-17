import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const publicRoutes = ['/', '/user/Login', '/user/Register'];
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (isPublic) {
    // If it's a public route and there's a token, redirect authenticated users
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { rol: string };
        const destination = decoded.rol === 'admin' ? '/Admin' : '/Dashboard';
        return NextResponse.redirect(new URL(destination, request.url));
      } catch {
        // Invalid token, allow access to public page
        return NextResponse.next();
      }
    }
    return NextResponse.next(); // Allow access to public page without a token
  }

  // Protected routes
  if (!token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL('/user/Login', request.url));
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { rol: string };

    // Role-based access control
    if (pathname.startsWith('/Admin') && decoded.rol !== 'admin') {
      return NextResponse.redirect(new URL('/Dashboard', request.url));
    }

    if (pathname.startsWith('/Dashboard') && decoded.rol !== 'cliente') {
      return NextResponse.redirect(new URL('/Admin', request.url));
    }

    // If the user is authenticated and has the correct role, proceed
    return NextResponse.next();
  } catch {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/user/Login', request.url));
  }
}

export const config = {
  matcher: [
    '/Admin/:path*',
    '/Dashboard/:path*',
    '/Ordenes/:path*',
    '/user/:path*',
  ],
};
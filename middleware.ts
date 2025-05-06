import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const publicRoutes = ['/', '/user/Login', '/user/Register'];
  const isPublic = publicRoutes.includes(pathname);

  // Si es pública, y no hay token, permitir
  if (isPublic && !token) return NextResponse.next();

  try {
    const decoded = verify(token!, process.env.JWT_SECRET!) as any;

    // Si es login/register y ya está logueado, redirigir
    if (isPublic) {
      const destino = decoded.rol === 'admin' ? '/Admin' : '/Dashboard';
      return NextResponse.redirect(new URL(destino, request.url));
    }

    // Si entra a ruta /Admin pero no es admin, redirigir
    if (pathname.startsWith('/Admin') && decoded.rol !== 'admin') {
      return NextResponse.redirect(new URL('/Dashboard', request.url));
    }

    // Si entra a /Dashboard y no es cliente, redirigir
    if (pathname.startsWith('/Dashboard') && decoded.rol !== 'cliente') {
      return NextResponse.redirect(new URL('/Admin', request.url));
    }

    return NextResponse.next(); // Todo ok
  } catch (err) {
    // Si token inválido o expirado
    return NextResponse.redirect(new URL('/user/Login', request.url));
  }
}

// 👇 ESTO es lo que antes tenías mal en `next.config.mjs`
export const config = {
  matcher: [
    '/Admin/:path*',
    '/Dashboard/:path*',
    '/Ordenes/:path*',
    '/user/:path*',
  ],
};

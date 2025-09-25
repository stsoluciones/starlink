import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Función para verificar el token usando `jose`
async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  return await jwtVerify(token, secret);
}

/** Rutas que NO deben indexarse */
const NOINDEX_PATTERNS = [
  /^\/S(?:\/|$)/i,
  /^\/productos\/Producto_de_prueba(?:\/|$)/i,
  // Ejemplo para bloquear cualquier producto que contenga "prueba":
  // /^\/productos\/.*prueba.*(?:\/|$)/i,
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1) BLOQUE NOINDEX (se ejecuta antes de cualquier auth)
  if (NOINDEX_PATTERNS.some(rx => rx.test(pathname))) {
    return new NextResponse('Gone', {
      status: 410, // (podés usar 404 si preferís)
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'no-store',
      },
    });
  }

  // 2) Tu lógica actual de auth/roles
  const token = request.cookies.get('token')?.value;

  if (token && (pathname.startsWith('/user/Login') || pathname.startsWith('/user/Register'))) {
    try {
      const { payload } = await verifyToken(token);
      const rol = payload.rol as string;
      const redirectPath = rol === 'admin' ? '/Admin' : '/Dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch {
      return NextResponse.next();
    }
  }

  const publicPaths = ['/', '/user/Login', '/user/Register'];
  const isPublic = publicPaths.some(route => pathname === route || pathname.startsWith(route + '/'));
  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL('/user/Login', request.url));
  }

  try {
    const { payload } = await verifyToken(token);
    const rol = payload.rol as string;

    if (pathname.startsWith('/Admin') && rol !== 'admin') {
      return NextResponse.redirect(new URL('/Dashboard', request.url));
    }

    if (pathname.startsWith('/Dashboard') && rol !== 'cliente') {
      return NextResponse.redirect(new URL('/Admin', request.url));
    }

    if (pathname.startsWith('/perfil') && rol !== 'cliente') {
      return NextResponse.redirect(new URL(rol === 'cliente' ? '/perfil' : '/Dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Token inválido o expirado:', error);
    const response = NextResponse.redirect(new URL('/user/Login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    // Rutas protegidas
    '/Admin/:path*',
    '/perfil/:path*',
    '/Dashboard/:path*',
    '/Ordenes/:path*',
    '/user/:path*',

    // Rutas a NO indexar (para que este middleware también corra allí)
    '/S',
    '/S/:path*',
    '/productos/Producto_de_prueba',
    '/productos/Producto_de_prueba/:path*',
  ],
  runtime: 'experimental-edge',
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Función para verificar el token usando `jose`
async function verifyToken(token: string) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    return await jwtVerify(token, secret);
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    console.log(`[Middleware] Path: ${pathname}`);
    console.log(`[Middleware] Token: ${token ? 'Presente' : 'Ausente'}`);

    const publicPaths = ['/', '/user/Login', '/user/Register'];
    const isPublic = publicPaths.some(route => pathname === route || pathname.startsWith(route + '/'));

    if (isPublic) {
        console.log('[Middleware] Ruta pública, acceso libre.');
        return NextResponse.next();
    }

    if (!token) {
        console.log('[Middleware] Ruta protegida sin token, redirigiendo a /user/Login');
        return NextResponse.redirect(new URL('/user/Login', request.url));
    }

    try {
        console.log('token en middleware:', token);
        const { payload } = await verifyToken(token);
        console.log('[Middleware] Token decodificado:', payload);
        console.log('[Middleware] Token válido. Acceso permitido.');
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
        '/Admin/:path*',
        '/Dashboard/:path*',
        '/Ordenes/:path*',
        '/user/:path*',
    ],
    runtime: 'edge', // <-- Esto es importante para que funcione correctamente con jose
};

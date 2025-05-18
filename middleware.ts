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

    //console.log(`[Middleware] Path: ${pathname}`);
    //console.log(`[Middleware] Token: ${token ? 'Presente' : 'Ausente'}`);
    if (token && (pathname.startsWith('/user/Login') || pathname.startsWith('/user/Register'))) {
        try {
            const { payload } = await verifyToken(token);
            const rol = payload.rol as string;
            const redirectPath = rol === 'admin' ? '/Admin' : '/Dashboard';
            return NextResponse.redirect(new URL(redirectPath, request.url));
        } catch {
            // token inválido, seguir como público
            return NextResponse.next();
        }
    }

    const publicPaths = ['/', '/user/Login', '/user/Register'];
    const isPublic = publicPaths.some(route => pathname === route || pathname.startsWith(route + '/'));

    if (isPublic) {
        //console.log('[Middleware] Ruta pública, acceso libre.');
        return NextResponse.next();
    }

    if (!token) {
        //console.log('[Middleware] Ruta protegida sin token, redirigiendo a /user/Login');
        return NextResponse.redirect(new URL('/user/Login', request.url));
    }
        try {
            //console.log('token en middleware:', token);
            const { payload } = await verifyToken(token);
            //console.log('payload en middleware:', payload);
            const rol = payload.rol as string;

            if (pathname.startsWith('/Admin') && rol !== 'admin') {
                return NextResponse.redirect(new URL('/Dashboard', request.url));
            }

            if (pathname.startsWith('/Dashboard') && rol !== 'cliente') {
                return NextResponse.redirect(new URL('/Admin', request.url));
            }
            //console.log('[Middleware] Token decodificado:', payload);
            //console.log('[Middleware] Token válido. Acceso permitido.');
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
    runtime: 'experimental-edge', // <-- Esto es importante para que funcione correctamente con jose
};

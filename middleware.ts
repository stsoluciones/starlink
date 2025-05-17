import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Imprime para debuggear
    console.log('Middleware - Path:', pathname, 'Token:', token ? 'Presente' : 'Ausente');

    const publicRoutes = ['/', '/user/Login', '/user/Register'];
    const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    if (isPublic) {
        if (token) {
            try {
                const decoded = verify(token, process.env.JWT_SECRET!) as { rol: string };
                const destination = decoded.rol === 'admin' ? '/Admin' : '/Dashboard';
                console.log('Middleware - Redirigiendo desde pública a:', destination);
                return NextResponse.redirect(new URL(destination, request.url));
            } catch (error) {
                console.error("Middleware - Token inválido en ruta pública:", error);
                // Si el token es inválido, elimina la cookie
                const response = NextResponse.next();
                response.cookies.delete('token');
                return response;
            }
        }
        return NextResponse.next();
    }

    // Protected routes
    if (!token) {
        console.log('Middleware - No hay token, redirigiendo a /user/Login');
        return NextResponse.redirect(new URL('/user/Login', request.url));
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as { rol: string };
        console.log('Middleware - Token decodificado. Rol:', decoded.rol);

        // Role-based access control
        if (pathname.startsWith('/Admin') && decoded.rol !== 'admin') {
            console.log('Middleware - Rol incorrecto, redirigiendo a /Dashboard');
            return NextResponse.redirect(new URL('/Dashboard', request.url));
        }

        if (pathname.startsWith('/Dashboard') && decoded.rol !== 'cliente') {
             console.log('Middleware - Rol incorrecto, redirigiendo a /Admin');
            return NextResponse.redirect(new URL('/Admin', request.url));
        }
        console.log('Middleware - Acceso permitido a:', pathname);
        return NextResponse.next();
    } catch (error) {
        console.error('Middleware - Token inválido en ruta protegida:', error);
        // Si el token es inválido, elimina la cookie y redirige a login
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
    runtime: 'nodejs' // Add this line
};
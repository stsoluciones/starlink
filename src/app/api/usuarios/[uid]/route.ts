// src/app/api/usuarios/[uid]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { connectDB } from '../../../../lib/mongodb';
import Usuario from '../../../../models/User';

// Función para validar el token y el acceso
async function verificarAutenticacion(uid: string) {
    const token = cookies().get('token')?.value;
    //console.log('Token en verificarAutenticacion:', token);
    
    if (!token) {
        return { autorizado: false, error: 'No autorizado - Token no proporcionado', status: 401 };
    }

    try {
        const decoded = verify(token, process.env.JWT_SECRET!) as any;
        //console.log('Token decodificado:', decoded);
        
        // Verificación modificada para permitir acceso al propio usuario o a admin
        if (decoded.uid !== uid && decoded.rol !== 'admin') {
            return { 
                autorizado: false, 
                error: 'Acceso denegado - Solo puedes acceder a tu propia información', 
                status: 403 
            };
        }

        return { autorizado: true, decoded };
    } catch (err) {
        console.error('Error al verificar token:', err);
        return { 
            autorizado: false, 
            error: 'Token inválido o expirado', 
            status: 403 
        };
    }
}

export async function GET(req: Request, context: { params: { uid: string } }) {
    const { uid } = context.params;
    //console.log(`Solicitud GET para usuario ${uid}`);

    const auth = await verificarAutenticacion(uid);
    if (!auth.autorizado) {
        console.error('Error de autorización:', auth.error);
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await connectDB();
        const usuario = await Usuario.findOne({ uid }).select('-__v'); // Excluir campos innecesarios

        if (!usuario) {
            console.error(`Usuario con UID ${uid} no encontrado`);
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // No enviar información sensible incluso si es el propio usuario
        const usuarioSafe = usuario.toObject();
        delete usuarioSafe._id; // Opcional: eliminar el _id de MongoDB si no es necesario

        //console.log(`Datos devueltos para usuario ${uid}`);
        return NextResponse.json(usuarioSafe);
    } catch (error) {
        console.error('Error en GET /api/usuarios/[uid]:', error);
        return NextResponse.json(
            { error: 'Error al obtener usuario' }, 
            { status: 500 }
        );
    }
}

// Los métodos PUT y DELETE pueden permanecer iguales, pero con los mismos ajustes en verificarAutenticacion
export async function PUT(req: Request, context: { params: { uid: string } }) {
    const { uid } = context.params;

    const auth = await verificarAutenticacion(uid);
    if (!auth.autorizado) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await connectDB();
        const body = await req.json();

        const usuarioActualizado = await Usuario.findOneAndUpdate(
            { uid },
            body,
            { new: true }
        );

        if (!usuarioActualizado) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json(usuarioActualizado);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: { params: { uid: string } }) {
    const { uid } = context.params;

    const auth = await verificarAutenticacion(uid);
    if (!auth.autorizado) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        await connectDB();
        const eliminado = await Usuario.findOneAndDelete({ uid });

        if (!eliminado) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
    }
}
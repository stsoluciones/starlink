//app/api/usuarios/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Usuario from '../../../models/User';
import jwt from 'jsonwebtoken';
import { auth } from '../../../../pages/api/firebaseAdminConfig';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { uid, nombreCompleto, correo, dniOCuit, telefono, direccion } = await req.json();
        const authorizationHeader = req.headers.get('Authorization');
        //console.log('Request Body back:', { uid, nombreCompleto, correo, dniOCuit, telefono, direccion });
        //console.log('Authorization Header back:', authorizationHeader);
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            //console.error('Error: Missing or invalid Authorization header');
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, { status: 401 });
        }

        const idToken = authorizationHeader.split(' ')[1];
        //console.log('Firebase ID Token:', idToken);
        try {
            await auth.verifyIdToken(idToken);
            //console.log('Firebase ID Token Verified:', decodedToken);
        } catch (error) {
            //console.error("Error verifying Firebase ID token:", error);
            return NextResponse.json({ error: 'Unauthorized: Invalid Firebase ID token' }, { status: 401 });
        }
        
        const cleanDniOCuit = dniOCuit?.trim() || undefined;
        //  Validación de dniOCuit
        if (cleanDniOCuit) {
            const usuarioConMismoDni = await Usuario.findOne({ dniOCuit: cleanDniOCuit });
            if (usuarioConMismoDni) {
                return NextResponse.json(
                    { error: 'DNI/CUIT ya está en uso' },
                    { status: 400 }
                );
            }
        }

        let usuario = await Usuario.findOne({ uid });
        let isNew = false;

        if (!usuario) {
            usuario = new Usuario({
                uid,
                nombreCompleto,
                correo,
                dniOCuit: cleanDniOCuit,
                telefono,
                direccion,
                rol: 'cliente',
            });
            await usuario.save();
            isNew = true;
            //console.log('usuario creado:', usuario);
        } else {
            usuario.nombreCompleto = nombreCompleto || usuario.nombreCompleto;
            usuario.correo = correo || usuario.correo;
            usuario.dniOCuit = dniOCuit || usuario.dniOCuit;
            usuario.telefono = telefono || usuario.telefono;
            usuario.direccion = direccion || usuario.direccion;
            await usuario.save();
        }
        const token = jwt.sign(
            {
                id: usuario._id,
                uid: usuario.uid,
                rol: usuario.rol,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        const response = NextResponse.json({ usuario, token }, { status: isNew ? 201 : 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });

        return response;

    } catch (error) {
        console.error('Error en /api/usuarios:', error);
        return NextResponse.json({ error: 'Error al crear/actualizar usuario' }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Usuario from '../../../models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { uid, nombreCompleto, correo } = body;

    // Buscar si el usuario ya existe
    let usuario = await Usuario.findOne({ uid });

    // Si no existe, lo creamos
    let isNew = false;
    if (!usuario) {
      usuario = new Usuario({
        uid,
        nombreCompleto,
        correo,
        rol: 'cliente', // rol por defecto si no se envía
      });
      await usuario.save();
      isNew = true;
    }

    // Crear token con id y rol
    const token = jwt.sign(
      {
        id: usuario._id,
        uid: usuario.uid,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // Crear respuesta y setear cookie
    const response = NextResponse.json({ usuario, token }, { status: isNew ? 201 : 200 });

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Error en /api/usuarios:', error);
    return NextResponse.json({ error: 'Error al autenticar usuario' }, { status: 500 });
  }
}

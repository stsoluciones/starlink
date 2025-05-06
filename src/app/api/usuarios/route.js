import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Usuario from '../../../models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // Verificar si el usuario ya existe
    let usuario = await Usuario.findOne({ uid: body.uid });

    // Si no existe, lo creamos
    if (!usuario) {
      usuario = new Usuario(body);
      await usuario.save();
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        rol: usuario.rol, // 👈 Asegurate de que el usuario tenga este campo
      },
      process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is not defined'); })(),
      { expiresIn: '1d' }
    );

    // Guardar token en cookies
    cookies().set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 día
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json(usuario, { status: usuario.isNew ? 201 : 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}

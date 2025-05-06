// app/api/usuarios/[uid]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { connectDB } from '../../../../lib/mongodb';
import Usuario from '../../../../models/User';

// Función para validar el token y el acceso
async function verificarAutenticacion(uid: string) {
  const token = cookies().get('token')?.value;

  if (!token) {
    return { autorizado: false, error: 'No autorizado', status: 401 };
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.id !== uid && decoded.rol !== 'admin') {
      return { autorizado: false, error: 'Acceso denegado', status: 403 };
    }

    return { autorizado: true, decoded };
  } catch (err) {
    return { autorizado: false, error: 'Token inválido o expirado', status: 403 };
  }
}

export async function GET(req, context) {
  const { uid } = context.params;

  const auth = await verificarAutenticacion(uid);
  if (!auth.autorizado) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await connectDB();
    const usuario = await Usuario.findOne({ uid });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
  }
}

export async function PUT(req, context) {
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

export async function DELETE(req, context) {
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

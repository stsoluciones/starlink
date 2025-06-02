import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import User from '../../../../models/User'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const usuarioUid = searchParams.get('usuarioUid')

  if (!usuarioUid) {
    return NextResponse.json({ message: 'Falta el UID del usuario' }, { status: 400 })
  }

  try {
    await connectDB()
    const user = await User.findOne({ uid: usuarioUid }).select('factura')

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, factura: user.factura || null })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { connectDB } from '../../../../lib/mongodb'
import User from '../../../../models/User'

export async function PUT(request: Request) {
  const body = await request.json()
  const { usuarioUid, ...datosFactura } = body

  if (!usuarioUid) {
    return NextResponse.json({ message: 'Falta el UID del usuario' }, { status: 400 })
  }

  try {
    await connectDB()

    // Normalizar condicionIva entrante para aceptar tanto labels (e.g. 'consumidorFinal')
    // como las claves internas (e.g. 'consumidorFinal') y guardarlo en el formato interno
    const mapCondicion = (val: any) => {
      if (!val || typeof val !== 'string') return val
      const m = val.trim()
      const map: Record<string, string> = {
        'consumidorFinal': 'consumidorFinal',
        'responsableInscripto': 'responsableInscripto',
        'monotributista': 'monotributista',
        'exento': 'exento'
      }
      return map[m] || val
    }

    if (datosFactura && typeof datosFactura === 'object' && 'condicionIva' in datosFactura) {
      // @ts-ignore
      datosFactura.condicionIva = mapCondicion(datosFactura.condicionIva)
    }

    const user = await User.findOneAndUpdate(
      { uid: usuarioUid },
      { factura: datosFactura },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, factura: user.factura })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Ejemplo: Crear o actualizar datos de facturación con POST también
  const body = await request.json()
  const { usuarioUid, ...datosFactura } = body

  if (!usuarioUid) {
    return NextResponse.json({ message: 'Falta el UID del usuario' }, { status: 400 })
  }

  try {
    await connectDB()

    // Normalizar condicionIva para POST también
    const mapCondicion = (val: any) => {
      if (!val || typeof val !== 'string') return val
      const m = val.trim()
      const map: Record<string, string> = {
        'consumidorFinal': 'consumidorFinal',
        'responsableInscripto': 'responsableInscripto',
        'monotributista': 'monotributista',
        'exento': 'exento'
      }
      return map[m] || val
    }

    if (datosFactura && typeof datosFactura === 'object' && 'condicionIva' in datosFactura) {
      // @ts-ignore
      datosFactura.condicionIva = mapCondicion(datosFactura.condicionIva)
    }

    // Aquí puedes decidir si quieres crear o actualizar, por ejemplo:
    const user = await User.findOneAndUpdate(
      { uid: usuarioUid },
      { factura: datosFactura },
      { new: true, upsert: true } // upsert para crear si no existe
    )

    return NextResponse.json({ success: true, factura: user.factura })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error del servidor' }, { status: 500 })
  }
}

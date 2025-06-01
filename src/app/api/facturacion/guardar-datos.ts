import { connectDB } from '../../../lib/mongodb'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' })

  try {
    const { usuarioUid, ...datosFactura } = req.body

    if (!usuarioUid) return res.status(400).json({ message: 'Falta el UID del usuario' })

    await connectDB()

    const user = await User.findOneAndUpdate(
      { uid: usuarioUid },
      { factura: datosFactura },
      { new: true }
    )

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    return res.status(200).json({ success: true, factura: user.factura })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Error del servidor' })
  }
  
}

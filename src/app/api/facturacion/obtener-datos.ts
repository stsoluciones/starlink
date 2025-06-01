import { connectDB } from '../../../lib/mongodb'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' })

  const { usuarioUid } = req.query

  if (!usuarioUid) return res.status(400).json({ message: 'Falta el UID del usuario' })

  try {
    await connectDB()
    const user = await User.findOne({ uid: usuarioUid }).select('factura')

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    return res.status(200).json({ success: true, factura: user.factura || null })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error del servidor' })
  }
}

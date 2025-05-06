import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  pais: { type: String, required: false },
  provincia: { type: String, required: false },
  ciudad: { type: String, required: false },
  calle: { type: String, required: false },
  numero: { type: String, required: false },
  casaOTorre: { type: String, required: false },
  depto: { type: String, required: false },
  codigoPostal: { type: String, required: false }
});

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  nombreCompleto: { type: String, required: false },
  correo: { type: String, required: true, unique: true },
  dniOCuit: { type: String, required: false, unique: true },
  telefono: { type: String },
  rol: { type: String, enum: ['cliente', 'admin'], default: 'cliente' },
  direccion: addressSchema,
  fechaRegistro: { type: Date, default: Date.now }
});

const usuario = mongoose.models.User || mongoose.model('User', userSchema);

export default usuario;

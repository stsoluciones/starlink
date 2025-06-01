import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  pais: { type: String },
  provincia: { type: String },
  ciudad: { type: String },
  calle: { type: String },
  numero: { type: String },
  casaOTorre: { type: String },
  depto: { type: String },
  codigoPostal: { type: String }
}, { _id: false });

const facturaSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['A', 'B', 'C'], default: 'B' },
  razonSocial: { type: String},
  cuit: { type: String },
  domicilio: { type: String },
  codigoPostal: { type: String },
  condicionIva: { type: String, enum: ['responsableInscripto', 'monotributista', 'exento', 'consumidorFinal'], default: 'consumidorFinal' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  nombreCompleto: { type: String },
  correo: { type: String, required: true, unique: true },
  dniOCuit: { type: String, unique: true, sparse: true },
  telefono: { type: String },
  rol: { type: String, enum: ['cliente', 'admin'], default: 'cliente' },
  direccion: addressSchema,
  factura: facturaSchema, // <-- Aquí se agregan los datos de facturación
  fechaRegistro: { type: Date, default: Date.now },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

const usuario = mongoose.models.User || mongoose.model('User', userSchema);

export default usuario;

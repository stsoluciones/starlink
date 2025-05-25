import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  usuarioUid: {
    type: String,
    required: true
  },
  usuarioInfo: {
    nombreCompleto: String,
    correo: String
  },
  paymentId: { type: String, required: true },
  items: [orderItemSchema],
  direccionEnvio: {
    pais: String,
    provincia: String,
    ciudad: String,
    calle: String,
    numero: String,
    casaOTorre: String,
    depto: String,
    codigoPostal: String
  },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  total: { type: Number, required: true },
  fechaPedido: { type: Date, default: Date.now }
});


const order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default order
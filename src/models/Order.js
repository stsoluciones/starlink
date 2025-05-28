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
  usuarioUid: { type: String, required: true, index: true },
  fechaPedido: { type: Date, default: Date.now },
  usuarioInfo: {
    nombreCompleto: String,
    correo: String,
    telefono: String
  },
  paymentId: String,
  paymentMethod: {
      type: String,
      enum: ['mercadopago', 'transferencia', 'efectivo'],
      required: true
    },
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
  total: { type: Number, required: true, min: 0 },
  collectionId: String,
  collectionStatus: String,
  paymentType: String,
  merchantOrderId: String,
  preferenceId: String,
  siteId: String,
  processingMode: String,
  merchantAccountId: String,
  payerEmail: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
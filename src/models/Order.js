//src/models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  nombreProducto: { type: String },
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
  pref_id: String,
  external_reference: { // Campo para la referencia externa de MP
    type: String,
    unique: true,     // Debe ser único para evitar duplicados
    sparse: true,     // Permite múltiples documentos con valor null/undefined si no todos los pedidos son con MP
    index: true,      // Bueno para búsquedas rápidas
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
  metadata: mongoose.Schema.Types.Mixed,
  paymentDetails: {
    status: String,
    status_detail: String,
    payment_method_id: String,
    payment_type_id: String,
    installments: Number,
    transaction_amount: Number,
    date_approved: Date,
    date_created: Date,
    last_updated: Date
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
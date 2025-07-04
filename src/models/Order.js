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
  usuarioInfo: { nombreCompleto: String, correo: String, telefono: String },
  pref_id: {type: String},
  external_reference: { type: String, sparse: true, index: true },
  paymentId: {type: String},
  nroComprobante: { type: String },
  paymentMethod: { type: String, enum: ['mercadopago', 'transferencia', 'efectivo'], required: true },
  items: [orderItemSchema],
  tipoFactura: {
    tipo: { type: String, enum: ['A', 'B', 'C'], default: 'B' },
    fecha: {type: Date},
    cuit: {type: String},
    razonSocial: {type: String},
    telefono: {type: String},
    email: {type: String},
    condicionIva: { type: String, enum: ['Responsable Inscripto', 'Monotributista', 'IVA Exento', 'Consumidor Final'], default: 'Consumidor Final' }
  },
  direccionEnvio: {
    pais: {type: String},
    provincia: {type: String},
    ciudad: {type: String},
    calle: {type: String},
    numero: {type: String},
    casaOTorre: {type: String},
    piso: {type: String},
    depto: {type: String},
    telefono: {type: String},
    entreCalles: {type: String},
    codigoPostal: {type: String},
    referencia: {type: String},
  },
  estado: { type: String, enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'], default: 'pendiente' },
  total: { type: Number, required: true, min: 0 },
  collectionId: {type: String},
  collectionStatus: {type: String},
  paymentType: {type: String},
  merchantOrderId: {type: String},
  preferenceId: {type: String},
  init_point: {type: String},
  siteId: {type: String},
  processingMode: {type: String},
  merchantAccountId: {type: String},
  payerEmail: {type: String},
  metadata: mongoose.Schema.Types.Mixed,
  etiquetaEnvio: { type: String, default: '' },
  trackingCode: { type: String, default: '' },
  paymentDetails: {
    status: {type: String},
    status_detail: {type: String},
    payment_method_id: {type: String},
    payment_type_id: {type: String},
    installments: {type: Number},
    transaction_amount: {type: Number},
    date_approved: {type: Date},
    date_created: {type: Date},
    last_updated: {type: Date},
  },
  }, { timestamps: true}
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
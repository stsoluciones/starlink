// Tests para `src/app/api/mercadopago/pagos/route.js` (server handler)
// Mockeamos connectDB, Order model, Payment de mercadopago y sendEmail para cubrir ramas.

vi.mock('../../src/lib/mongodb', () => ({ connectDB: vi.fn() }), { virtual: true })
vi.mock('../../src/lib/mailer', () => ({ sendEmail: vi.fn() }), { virtual: true })

// Mock modelo Order
const mockOrder = (overrides = {}) => ({
  _id: 'order1',
  estado: 'pendiente',
  paymentId: 'pay_1',
  total: 500,
  usuarioInfo: { correo: 'c@d.com', nombreCompleto: 'Cli' },
  save: vi.fn(),
  ...overrides,
})

vi.mock('../../src/models/Order', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
  // named exports for safety
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
}), { virtual: true })

// Mock Payment client de mercadopago
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: vi.fn(() => ({})),
  Payment: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
  })),
}), { virtual: true })

import { POST } from '../../src/app/api/mercadopago/pagos/route'
import Order from '../../src/models/Order'
import { Payment } from 'mercadopago'
import { sendEmail } from '../../src/lib/mailer'

describe('POST /api/mercadopago/pagos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('responde 404 si la orden no existe', async () => {
  Order.findById.mockResolvedValueOnce(null)

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ orderId: 'nope' }) })
    const res = await POST(req)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.message).toMatch(/no encontrada/i)
  })

  it('responde error si faltan paymentId', async () => {
  Order.findById.mockResolvedValueOnce(mockOrder({ paymentId: null }))
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ orderId: 'o1' }) })
    const res = await POST(req)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.message).toMatch(/sin paymentId/i)
  })

  it('actualiza orden y notifica cuando pago aprobado', async () => {
    const order = mockOrder()
  Order.findById.mockResolvedValueOnce(order)

    // Payment.get devolverá status approved
    const paymentInstance = new Payment()
    paymentInstance.get = vi.fn().mockResolvedValue({ status: 'approved', id: 'pay_1', payer: { email: 'c@d.com' }, transaction_amount: 500 })
    Payment.mockImplementation(() => paymentInstance)

  Order.findByIdAndUpdate.mockResolvedValueOnce({ ...order, estado: 'pagado', pagoNotificado: false })

    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ orderId: 'order1' }) })
    const res = await POST(req)
    const json = await res.json()

    expect(json.success).toBe(true)
    expect(sendEmail).toHaveBeenCalled()
  })
})

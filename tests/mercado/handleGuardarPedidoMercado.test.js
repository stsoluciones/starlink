// Tests para `src/Utils/handleGuardarPedidoMercado.js`
// Cubre validaciones y flujo exitoso (mock fetch hacia /api/pedidos/guardar-pedido)
import handleGuardarPedidoMercado from '../../src/Utils/handleGuardarPedidoMercado'

describe('handleGuardarPedidoMercado', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('rechaza si usuario no autenticado', async () => {
    const res = await handleGuardarPedidoMercado({}, [], {})
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/no autenticado/i)
  })

  it('rechaza carrito vacío', async () => {
    const user = { uid: 'u1', nombreCompleto: 'n', telefono: 't', direccion: 'd', correo: 'a@b.com', factura: {} }
    const res = await handleGuardarPedidoMercado(user, [], {})
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/vac[ií]o/i)
  })

  it('rechaza carrito con ítems inválidos', async () => {
    const user = { uid: 'u1', nombreCompleto: 'n', telefono: 't', direccion: 'd', correo: 'a@b.com', factura: {} }
    const cart = [{ cod_producto: '', quantity: 0, precio: 0 }]
    const res = await handleGuardarPedidoMercado(user, cart, {})
    expect(res.success).toBe(false)
  })

  it('envía petición de guardado y retorna success cuando response.ok', async () => {
    const user = { uid: 'u1', correo: 'a@b.com', nombreCompleto: 'n', telefono: 't', direccion: 'd', factura: { tipo: 'A' } }
    const cart = [{ cod_producto: 'p1', quantity: 1, precio: 100, nombre: 'P' }]
  // Primera llamada guarda el pedido -> ok, segunda llamada (notificar) -> resolved
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ orderId: 'ord123' }) })
  global.fetch.mockResolvedValueOnce({ ok: true })

    const res = await handleGuardarPedidoMercado(user, cart, { pref_id: 'p1', external_reference: 'ext1' })
    expect(global.fetch).toHaveBeenCalled()
    expect(res.success).toBe(true)
    expect(res.orderId).toBe('ord123')
  })
})

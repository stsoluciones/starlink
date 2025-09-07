// Test para `src/Utils/handleCompraMercadoPago.js`
// Verifica que la función llama a la ruta /api/pedidos/crear-preferencia con el body correcto.
import handleComprarMercadoPago from '../../src/Utils/handleCompraMercadoPago'

describe('handleComprarMercadoPago', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  it('hace POST a crear-preferencia con los datos del carrito y usuario', async () => {
    const cart = [{ cod_producto: 'p1', quantity: 2 }]
    const user = { uid: 'u1', direccion: { calle: 'x' }, nombreCompleto: 'Juan', telefono: '123' }

    const res = await handleComprarMercadoPago(cart, user)

    expect(global.fetch).toHaveBeenCalled()
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/pedidos/crear-preferencia')
    expect(opts.method).toBe('POST')
    const body = JSON.parse(opts.body)
    expect(body).toHaveProperty('cart')
    expect(body).toHaveProperty('uid', 'u1')
  })
})

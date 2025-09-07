// Test para `src/Utils/fetchProduct.js`
// Verifica comportamiento cuando el producto existe, cuando no existe, y cuando ocurre un error.
import fetchProduct from '../src/Utils/fetchProduct'

describe('fetchProduct util', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
  })

  it('retorna datos cuando la API responde OK', async () => {
    const fake = { nombre: 'producto1', precio: 100 }
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => fake })

    const res = await fetchProduct('producto1')
    expect(res).toEqual(fake)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('retorna null cuando nombre es vacío', async () => {
    const res = await fetchProduct('')
    expect(res).toBeNull()
  })

  it('retorna null cuando la respuesta no es ok', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false })
    const res = await fetchProduct('noexiste')
    expect(res).toBeNull()
  })

  it('captura errores y retorna null', async () => {
    global.fetch.mockRejectedValueOnce(new Error('fail'))
    const res = await fetchProduct('x')
    expect(res).toBeNull()
  })
})

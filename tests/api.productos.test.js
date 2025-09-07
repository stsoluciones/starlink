// Test para el endpoint `pages/api/productos.js`
// Simula req/res y mockea la conexión a Mongo y el modelo `Producto`.

vi.mock('../src/lib/mongodb', () => ({ connectDB: vi.fn() }), { virtual: true })

// Mock del modelo Producto (ubicación real: src/models/product.js)
// Como `pages/api/productos.js` importa el default, aquí devolvemos un objeto
// con `default: { find: ... }` para que `Producto.find()` funcione.
vi.mock('../src/models/product', () => {
  return {
    default: {
      // Simulamos la API de Mongoose: Producto.find().lean()
      find: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue([{ nombre: 'p1' }, { nombre: 'p2' }]),
      })),
    },
  }
}, { virtual: true })

import handler from '../pages/api/productos'

describe('API /api/productos', () => {
  it('responde con lista de productos', async () => {
    const req = {}
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalled()
    const arg = res.json.mock.calls[0][0]
    expect(arg).toHaveProperty('productos')
  })
})

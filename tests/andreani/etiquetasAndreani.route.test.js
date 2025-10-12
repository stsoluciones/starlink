// Test para la ruta API /api/etiquetasAndreani
// Verifica la generación de etiquetas a través del endpoint

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock de dependencias
vi.mock('../../../src/lib/mongodb', () => ({
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../../src/lib/andreani', () => ({
  obtenerTokenAndreani: vi.fn(),
  crearEnvio: vi.fn(),
  obtenerEtiquetaPDF: vi.fn(),
}));

vi.mock('../../../src/models/Order', () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

import { POST, GET } from '../../src/app/api/etiquetasAndreani/route';
import Order from '../../src/models/Order';
import { 
  obtenerTokenAndreani, 
  crearEnvio, 
  obtenerEtiquetaPDF 
} from '../../src/lib/andreani';

describe('API /api/etiquetasAndreani', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST - Generar Etiquetas', () => {
    
    const mockPedido = {
      _id: '673abc123def456ghi789',
      estado: 'pagado',
      usuarioInfo: {
        nombreCompleto: 'Juan Pérez',
        correo: 'juan@test.com',
        telefono: '1155551234',
      },
      direccionEnvio: {
        codigoPostal: '1636',
        provincia: 'Buenos Aires',
        ciudad: 'Olivos',
        calle: 'Av. Libertador',
        numero: '5678',
      },
      items: [{ nombreProducto: 'Test', cantidad: 1, precioUnitario: 1000 }],
      tipoFactura: { cuit: '20123456789' },
      total: 1000,
    };

    it('debe generar etiquetas exitosamente', async () => {
      const pedidosIds = ['673abc123def456ghi789'];
      
      Order.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPedido]),
      });
      
      obtenerTokenAndreani.mockResolvedValue('mock_token_12345');
      crearEnvio.mockResolvedValue({ numeroDeEnvio: 'AND12345678' });
      obtenerEtiquetaPDF.mockResolvedValue(Buffer.from('PDF_DATA'));
      Order.findByIdAndUpdate.mockResolvedValue(mockPedido);

      const req = {
        json: async () => ({ pedidos: pedidosIds }),
      };

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('exitosos', 1);
      expect(data).toHaveProperty('fallidos', 0);
      expect(data.etiquetas).toHaveLength(1);
      expect(data.etiquetas[0]).toHaveProperty('trackingCode', 'AND12345678');
    });

    it('debe rechazar si no se envían pedidos', async () => {
      const req = {
        json: async () => ({ pedidos: [] }),
      };

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('debe rechazar si no hay pedidos válidos', async () => {
      Order.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      });

      const req = {
        json: async () => ({ pedidos: ['invalid_id'] }),
      };

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('válidos');
    });

    it('debe rechazar pedidos que no estén pagados', async () => {
      const pedidoPendiente = { ...mockPedido, estado: 'pendiente' };
      
      Order.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([pedidoPendiente]),
      });

      const req = {
        json: async () => ({ pedidos: ['673abc123def456ghi789'] }),
      };

      const response = await POST(req);
      const data = await response.json();

      // No debería encontrar pedidos válidos
      expect(data.exitosos).toBe(0);
    });

    it('debe manejar errores de autenticación con Andreani', async () => {
      Order.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPedido]),
      });
      
      obtenerTokenAndreani.mockRejectedValue(new Error('Auth failed'));

      const req = {
        json: async () => ({ pedidos: ['673abc123def456ghi789'] }),
      };

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.detalle).toContain('Auth failed');
    });

    it('debe procesar múltiples pedidos', async () => {
      const pedido2 = { ...mockPedido, _id: 'otro_id_123' };
      
      Order.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPedido, pedido2]),
      });
      
      obtenerTokenAndreani.mockResolvedValue('mock_token');
      crearEnvio
        .mockResolvedValueOnce({ numeroDeEnvio: 'AND111' })
        .mockResolvedValueOnce({ numeroDeEnvio: 'AND222' });
      obtenerEtiquetaPDF
        .mockResolvedValueOnce(Buffer.from('PDF1'))
        .mockResolvedValueOnce(Buffer.from('PDF2'));
      Order.findByIdAndUpdate.mockResolvedValue(mockPedido);

      const req = {
        json: async () => ({ pedidos: ['673abc123def456ghi789', 'otro_id_123'] }),
      };

      const response = await POST(req);
      const data = await response.json();

      expect(data.exitosos).toBe(2);
      expect(data.etiquetas).toHaveLength(2);
    });

    it('debe continuar con otros pedidos si uno falla', async () => {
      const pedido2 = { ...mockPedido, _id: 'otro_id_123' };
      
      Order.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPedido, pedido2]),
      });
      
      obtenerTokenAndreani.mockResolvedValue('mock_token');
      crearEnvio
        .mockRejectedValueOnce(new Error('Error en pedido 1'))
        .mockResolvedValueOnce({ numeroDeEnvio: 'AND222' });
      obtenerEtiquetaPDF.mockResolvedValue(Buffer.from('PDF2'));
      Order.findByIdAndUpdate.mockResolvedValue(pedido2);

      const req = {
        json: async () => ({ pedidos: ['673abc123def456ghi789', 'otro_id_123'] }),
      };

      const response = await POST(req);
      const data = await response.json();

      expect(data.exitosos).toBe(1);
      expect(data.fallidos).toBe(1);
      expect(data.errores).toHaveLength(1);
    });

    it('debe detectar pedidos con etiqueta existente', async () => {
      const pedidoConEtiqueta = {
        ...mockPedido,
        trackingCode: 'AND_EXISTING',
        etiquetaEnvio: 'base64_existing',
      };
      
      Order.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([pedidoConEtiqueta]),
      });
      
      obtenerTokenAndreani.mockResolvedValue('mock_token');

      const req = {
        json: async () => ({ pedidos: ['673abc123def456ghi789'] }),
      };

      const response = await POST(req);
      const data = await response.json();

      expect(data.etiquetas[0].etiquetaExistente).toBe(true);
      expect(crearEnvio).not.toHaveBeenCalled();
    });

    it('debe actualizar el estado del pedido a enviado', async () => {
      Order.find.mockReturnValue({
        lean: vi.fn().mockResolvedValue([mockPedido]),
      });
      
      obtenerTokenAndreani.mockResolvedValue('mock_token');
      crearEnvio.mockResolvedValue({ numeroDeEnvio: 'AND12345' });
      obtenerEtiquetaPDF.mockResolvedValue(Buffer.from('PDF'));
      Order.findByIdAndUpdate.mockResolvedValue(mockPedido);

      const req = {
        json: async () => ({ pedidos: ['673abc123def456ghi789'] }),
      };

      await POST(req);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPedido._id,
        expect.objectContaining({
          estado: 'enviado',
          trackingCode: 'AND12345',
        })
      );
    });
  });

  describe('GET - Consultar Etiqueta', () => {
    
    it('debe retornar etiqueta de un pedido existente', async () => {
      const mockPedido = {
        _id: '673abc123',
        trackingCode: 'AND12345',
        etiquetaEnvio: 'base64_pdf_data',
        estado: 'enviado',
      };

      Order.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockPedido),
      });

      const url = new URL('http://localhost:3000/api/etiquetasAndreani?pedidoId=673abc123');
      const req = { url: url.toString() };

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('pedidoId');
      expect(data).toHaveProperty('trackingCode', 'AND12345');
      expect(data).toHaveProperty('etiqueta');
    });

    it('debe rechazar si no se proporciona pedidoId', async () => {
      const url = new URL('http://localhost:3000/api/etiquetasAndreani');
      const req = { url: url.toString() };

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('ID de pedido');
    });

    it('debe retornar error si el pedido no existe', async () => {
      Order.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      });

      const url = new URL('http://localhost:3000/api/etiquetasAndreani?pedidoId=invalid');
      const req = { url: url.toString() };

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('no encontrado');
    });

    it('debe retornar error si el pedido no tiene tracking', async () => {
      Order.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: '123', trackingCode: '' }),
      });

      const url = new URL('http://localhost:3000/api/etiquetasAndreani?pedidoId=123');
      const req = { url: url.toString() };

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('tracking');
    });
  });
});

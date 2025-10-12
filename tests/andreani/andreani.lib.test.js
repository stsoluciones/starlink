// Test unitario para src/lib/andreani.js
// Verifica las funciones de integración con Andreani

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock de fetch global
global.fetch = vi.fn();

// Mock de variables de entorno
process.env.ANDREANI_CLIENT_ID = 'test_client_id';
process.env.ANDREANI_CLIENT_SECRET = 'test_client_secret';
process.env.ANDREANI_CLIENT_NUMBER = 'test_contract_123';
process.env.ADMIN_EMAIL = 'test@example.com';
process.env.NODE_ENV = 'development';

import { 
  obtenerTokenAndreani, 
  crearEnvio, 
  obtenerEtiquetaPDF,
  consultarEstadoEnvio 
} from '../../src/lib/andreani';

describe('Andreani Library Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('obtenerTokenAndreani', () => {
    it('debe obtener token exitosamente', async () => {
      const mockToken = 'mock_access_token_12345';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: mockToken }),
      });

      const token = await obtenerTokenAndreani();

      expect(token).toBe(mockToken);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apissandbox.andreani.com/v2/autenticacion/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
    });

    it('debe lanzar error si falla la autenticación', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid credentials',
      });

      await expect(obtenerTokenAndreani()).rejects.toThrow();
    });

    it('debe usar URL de producción cuando NODE_ENV=production', async () => {
      process.env.NODE_ENV = 'production';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'token' }),
      });

      await obtenerTokenAndreani();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.andreani.com/v2/autenticacion/token',
        expect.any(Object)
      );

      process.env.NODE_ENV = 'development';
    });
  });

  describe('crearEnvio', () => {
    const mockPedido = {
      _id: '673abc123def456ghi789',
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
        piso: '3',
        depto: 'B',
        telefono: '1155551234',
        entreCalles: 'Entre Corrientes y Belgrano',
      },
      items: [
        {
          nombreProducto: 'Starlink Kit',
          cantidad: 1,
          precioUnitario: 299900,
        },
      ],
      tipoFactura: {
        cuit: '20123456789',
      },
      total: 299900,
    };

    const mockToken = 'mock_token_12345';

    it('debe crear envío exitosamente', async () => {
      const mockResponse = {
        numeroDeEnvio: 'AND12345678',
        bultos: [{ id: 'B1' }],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await crearEnvio(mockPedido, mockToken);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apissandbox.andreani.com/v2/ordenes-de-envio',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('debe incluir todos los datos requeridos en el payload', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ numeroDeEnvio: 'TEST' }),
      });

      await crearEnvio(mockPedido, mockToken);

      const callPayload = JSON.parse(global.fetch.mock.calls[0][1].body);
      
      expect(callPayload).toHaveProperty('contrato');
      expect(callPayload).toHaveProperty('origen');
      expect(callPayload).toHaveProperty('destino');
      expect(callPayload).toHaveProperty('destinatario');
      expect(callPayload).toHaveProperty('remitente');
      expect(callPayload).toHaveProperty('bultos');
      expect(callPayload).toHaveProperty('numeroDeTransaccion');
    });

    it('debe mapear correctamente la dirección de destino', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ numeroDeEnvio: 'TEST' }),
      });

      await crearEnvio(mockPedido, mockToken);

      const callPayload = JSON.parse(global.fetch.mock.calls[0][1].body);
      
      expect(callPayload.destino.postal.codigoPostal).toBe('1636');
      expect(callPayload.destino.postal.calle).toBe('Av. Libertador');
      expect(callPayload.destino.postal.numero).toBe('5678');
      expect(callPayload.destino.postal.localidad).toBe('Olivos');
    });

    it('debe calcular el peso basado en items', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ numeroDeEnvio: 'TEST' }),
      });

      await crearEnvio(mockPedido, mockToken);

      const callPayload = JSON.parse(global.fetch.mock.calls[0][1].body);
      
      expect(callPayload.bultos).toHaveLength(1);
      expect(callPayload.bultos[0]).toHaveProperty('kilos');
      expect(callPayload.bultos[0].kilos).toBeGreaterThan(0);
    });

    it('debe lanzar error si falla la creación', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid address',
      });

      await expect(crearEnvio(mockPedido, mockToken)).rejects.toThrow();
    });
  });

  describe('obtenerEtiquetaPDF', () => {
    const mockToken = 'mock_token_12345';
    const numeroDeEnvio = 'AND12345678';

    it('debe obtener etiqueta PDF exitosamente', async () => {
      const mockPDF = new ArrayBuffer(8);
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockPDF,
      });

      const result = await obtenerEtiquetaPDF(numeroDeEnvio, mockToken);

      expect(result).toEqual(mockPDF);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://apissandbox.andreani.com/v2/ordenes-de-envio/${numeroDeEnvio}/etiquetas`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Accept': 'application/pdf',
          }),
        })
      );
    });

    it('debe lanzar error si falla la obtención', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Envío no encontrado',
      });

      await expect(obtenerEtiquetaPDF(numeroDeEnvio, mockToken)).rejects.toThrow();
    });
  });

  describe('consultarEstadoEnvio', () => {
    const mockToken = 'mock_token_12345';
    const numeroDeEnvio = 'AND12345678';

    it('debe consultar estado exitosamente', async () => {
      const mockTrazas = {
        trazas: [
          { estado: 'En tránsito', fecha: '2025-10-12' },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrazas,
      });

      const result = await consultarEstadoEnvio(numeroDeEnvio, mockToken);

      expect(result).toEqual(mockTrazas);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://apissandbox.andreani.com/v2/envios/${numeroDeEnvio}/trazas`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });
});

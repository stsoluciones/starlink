// Test para el handler de generación de etiquetas desde el frontend
// Verifica la función handleGenerarAndreani

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de SweetAlert2
const mockSwal = {
  fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  close: vi.fn(),
  showLoading: vi.fn(),
};

vi.mock('sweetalert2', () => ({
  default: mockSwal,
}));

// Mock de fetch global
global.fetch = vi.fn();

// Mock del DOM para descarga de archivos
global.document = {
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  createElement: vi.fn(() => ({
    click: vi.fn(),
    href: '',
    download: '',
  })),
};

global.window = {
  URL: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
  atob: vi.fn((str) => str), // Simplificado para tests
};

import {handleGenerarAndreani} from '../../src/Utils/handleGenerarAndreani';

describe('handleGenerarAndreani', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe rechazar si no hay pedidos seleccionados', async () => {
    await handleGenerarAndreani([]);

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: 'Error al generar etiquetas',
      })
    );
  });

  it('debe mostrar loading durante el proceso', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exitosos: 1,
        fallidos: 0,
        etiquetas: [
          {
            pedidoId: '123',
            trackingCode: 'AND123',
            etiqueta: 'base64data',
          },
        ],
      }),
    });

    await handleGenerarAndreani(['123']);

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Generando etiquetas...',
      })
    );
  });

  it('debe generar etiquetas exitosamente', async () => {
    const mockResponse = {
      exitosos: 2,
      fallidos: 0,
      etiquetas: [
        {
          pedidoId: '123',
          trackingCode: 'AND123',
          etiqueta: 'base64_pdf_1',
          mensaje: 'Etiqueta generada exitosamente',
        },
        {
          pedidoId: '456',
          trackingCode: 'AND456',
          etiqueta: 'base64_pdf_2',
          mensaje: 'Etiqueta generada exitosamente',
        },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await handleGenerarAndreani(['123', '456']);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/etiquetasAndreani',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidos: ['123', '456'] }),
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('debe manejar errores de la API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Error de autenticación',
        detalle: 'Credenciales inválidas',
      }),
    });

    await handleGenerarAndreani(['123']);

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: 'Error al generar etiquetas',
      })
    );
  });

  it('debe mostrar errores específicos por pedido', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exitosos: 1,
        fallidos: 1,
        etiquetas: [
          {
            pedidoId: '123',
            trackingCode: 'AND123',
            etiqueta: 'base64',
          },
        ],
        errores: [
          {
            pedidoId: '456',
            error: 'Dirección incompleta',
          },
        ],
      }),
    });

    await handleGenerarAndreani(['123', '456']);

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'success',
        html: expect.stringContaining('Fallidos'),
      })
    );
  });

  it('debe ofrecer descarga de etiquetas', async () => {
    mockSwal.fire
      .mockResolvedValueOnce({ isConfirmed: false }) // loading
      .mockResolvedValueOnce({ isConfirmed: true }); // confirmación de descarga

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exitosos: 1,
        fallidos: 0,
        etiquetas: [
          {
            pedidoId: '123',
            trackingCode: 'AND123',
            etiqueta: 'base64_pdf_data',
          },
        ],
      }),
    });

    await handleGenerarAndreani(['123']);

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmButtonText: 'Ver Etiquetas',
        showCancelButton: true,
      })
    );
  });

  it('debe rechazar si no hay etiquetas en la respuesta', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        exitosos: 0,
        fallidos: 0,
        etiquetas: [],
      }),
    });

    await handleGenerarAndreani(['123']);

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
      })
    );
  });

  it('debe manejar errores de red', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    await handleGenerarAndreani(['123']);

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: 'Error al generar etiquetas',
      })
    );
  });

  it('debe validar el array de pedidos', async () => {
    await handleGenerarAndreani(null);

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
      })
    );
  });
});

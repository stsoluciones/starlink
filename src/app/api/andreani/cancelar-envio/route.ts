// src/app/api/andreani/cancelar-envio/route.ts

import { NextResponse } from 'next/server';
import { cancelarEnvioAndreani } from '../../../../lib/andreaniEliminar';

// Opcional, pero recomendado para este tipo de llamadas externas
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('[API Andreani] 🎯 Endpoint cancelar-envio llamado');
  console.log('[API Andreani] 📨 Método: POST');

  try {
    const body = await req.json();
    console.log('[API Andreani] 📥 Body recibido:', body);

    const {
      numeroAndreani, // string o string[]
    } = body || {};

    if (!numeroAndreani || (Array.isArray(numeroAndreani) && numeroAndreani.length === 0)) {
      console.error('[API Andreani] ❌ Falta numeroAndreani en el body');
      return NextResponse.json(
        {
          ok: false,
          mensaje: 'Falta numeroAndreani en el body. Debe ser un string o un array de strings.',
        },
        { status: 400 }
      );
    }

    // Llamamos a la utilidad que habla con Andreani
    const andreaniResponse = await cancelarEnvioAndreani({ numeroAndreani });

    console.log('[API Andreani] ✅ Cancelación procesada correctamente por Andreani');

    return NextResponse.json(
      {
        ok: true,
        mensaje:
          andreaniResponse?.mensaje ||
          'Solicitud de Acción: cancelación ejecutada correctamente.',
        andreaniResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Andreani] ❌ Error en cancelar-envio:', error);

    const errorMessage =
      error?.message || 'Error inesperado al intentar cancelar el envío en Andreani.';

    return NextResponse.json(
      {
        ok: false,
        mensaje: errorMessage,
      },
      { status: 500 }
    );
  }
}

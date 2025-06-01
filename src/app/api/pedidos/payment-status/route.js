// app/api/pedidos/payment-status/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const externalReference = searchParams.get('external_reference');

    if (!externalReference) {
      return NextResponse.json({ error: 'Missing external_reference parameter' }, { status: 400 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Mercado Pago Access Token not found in environment variables.');
      return NextResponse.json({ error: 'Missing Mercado Pago Access Token' }, { status: 500 });
    }

    const mpSearchResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!mpSearchResponse.ok) {
      const errorData = await mpSearchResponse.json();
      console.error('Error fetching payment status from Mercado Pago:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch payment status from Mercado Pago', details: errorData },
        { status: mpSearchResponse.status }
      );
    }

    const mpSearchResult = await mpSearchResponse.json();

    // The search endpoint returns an array of results. Usually, with a specific external_reference, there should be one or a few related payments.
    // We can return the entire result or process it further to return a specific payment or status.
    return NextResponse.json({ results: mpSearchResult.results });

  } catch (error) {
    console.error('Error in /api/mercadopago/payment-status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
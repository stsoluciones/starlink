// lib/verifyPagoPorExternalReference.js

export default async function verifyPagoPorExternalReference(pref_id) {
  const url = `https://api.mercadopago.com/v1/payments/search?external_reference=${pref_id}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al consultar MP: ${text}`);
  }

  const data = await res.json();
  return data.results?.[0] || null;
}

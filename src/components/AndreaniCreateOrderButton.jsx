// components/AndreaniCreateOrderButton.jsx
import { useState } from 'react';

export default function AndreaniCreateOrderButton({ order }) {
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState(null);
  const [error, setError] = useState(null);

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        orderId: order.id,
        customer: {
          nombre: order.customer.firstName,
          apellido: order.customer.lastName,
          email: order.customer.email,
          telefono: order.customer.phone,
          documento: order.customer.document, // si lo tenés
        },
        shipping: {
          calle: order.shipping.street,
          numero: order.shipping.number,
          piso: order.shipping.floor,
          depto: order.shipping.apartment,
          localidad: order.shipping.city,
          provincia: order.shipping.state,
          codigoPostal: order.shipping.zip,
        },
        items: order.items.map((item) => ({
          sku: item.sku,
          descripcion: item.name,
          cantidad: item.quantity,
          pesoKg: item.weightKg,
          valorUnitario: item.price,
        })),
        totals: {
          valorDeclarado: order.totalAmount,
          pesoTotalKg: order.items.reduce(
            (acc, item) => acc + item.weightKg * item.quantity,
            0,
          ),
        },
      };

      const res = await fetch('/api/andreani/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'No se pudo crear la orden');
      }

      setLabel(data.andreani); // acá tendrás el número de envío / código según la respuesta
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCreateOrder}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-[#1a2f98] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#182c8f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Generando orden Andreani…' : 'Generar orden de envío Andreani'}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {label && (
        <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
{JSON.stringify(label, null, 2)}
        </pre>
      )}
    </div>
  );
}

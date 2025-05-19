export default function FailurePage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600">El pago fue rechazado</h1>
      <p className="mt-4">Hubo un problema con tu transacción. Intenta de nuevo.</p>
    </div>
  );
}

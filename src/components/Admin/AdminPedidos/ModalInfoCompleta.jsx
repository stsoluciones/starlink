import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ModalInfoCompleta = ({ pedido, isOpen, onClose }) => {
  if (!isOpen || !pedido) return null;

  // Formatear fecha
  const fmtFecha = (f) => {
    const d = new Date(f);
    return isNaN(d) ? "-" : d.toLocaleString("es-AR");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Información Completa del Pedido</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información General */}
          <section className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-primary">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>ID Pedido:</strong> {pedido._id}</div>
              <div><strong>Número de Pedido:</strong> {pedido.numeroPedido || 'N/A'}</div>
              <div><strong>Estado:</strong> <span className="font-semibold text-blue-600">{pedido.estado}</span></div>
              <div><strong>Fecha:</strong> {fmtFecha(pedido.fechaPedido)}</div>
              <div><strong>Total:</strong> <span className="font-bold text-green-600">{pedido.total?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</span></div>
              <div><strong>Método de Pago:</strong> {pedido.paymentMethod || 'N/A'}</div>
              {pedido.paymentId && <div className="col-span-2"><strong>Payment ID:</strong> {pedido.paymentId}</div>}
            </div>
          </section>

          {/* Usuario */}
          <section className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-primary">Información del Usuario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><strong>User ID:</strong> {pedido.userId || 'N/A'}</div>
              <div><strong>Correo:</strong> {pedido.usuarioInfo?.correo || pedido.email || 'N/A'}</div>
              <div><strong>Nombre:</strong> {pedido.nombreCompleto || pedido.usuarioInfo?.nombre || 'N/A'}</div>
              <div><strong>Teléfono:</strong> {pedido.usuarioInfo?.telefono || pedido.direccionEnvio?.telefono || 'N/A'}</div>
            </div>
          </section>

          {/* Facturación */}
          {pedido.tipoFactura && (
            <section className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-primary">Datos de Facturación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>Razón Social:</strong> {pedido.tipoFactura.razonSocial || 'N/A'}</div>
                <div><strong>CUIT:</strong> {pedido.tipoFactura.cuit || 'N/A'}</div>
                <div><strong>Condición IVA:</strong> {pedido.tipoFactura.condicionIva || 'N/A'}</div>
                <div><strong>Fecha Factura:</strong> {pedido.tipoFactura.fecha ? new Date(pedido.tipoFactura.fecha).toLocaleDateString('es-AR') : 'N/A'}</div>
              </div>
            </section>
          )}

          {/* Dirección de Envío */}
          {pedido.direccionEnvio && (
            <section className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-primary">Dirección de Envío</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><strong>País:</strong> {pedido.direccionEnvio.pais || 'N/A'}</div>
                <div><strong>Provincia:</strong> {pedido.direccionEnvio.provincia || 'N/A'}</div>
                <div><strong>Ciudad:</strong> {pedido.direccionEnvio.ciudad || 'N/A'}</div>
                <div><strong>Código Postal:</strong> {pedido.direccionEnvio.codigoPostal || 'N/A'}</div>
                <div><strong>Calle:</strong> {pedido.direccionEnvio.calle || 'N/A'}</div>
                <div><strong>Número:</strong> {pedido.direccionEnvio.numero || 'N/A'}</div>
                <div><strong>Piso:</strong> {pedido.direccionEnvio.piso || 'N/A'}</div>
                <div><strong>Departamento:</strong> {pedido.direccionEnvio.depto || 'N/A'}</div>
                <div><strong>Torre/Casa:</strong> {pedido.direccionEnvio.casaOTorre || 'N/A'}</div>
                <div><strong>Entre Calles:</strong> {pedido.direccionEnvio.entreCalles || 'N/A'}</div>
                <div className="col-span-2"><strong>Referencia:</strong> {pedido.direccionEnvio.referencia || 'N/A'}</div>
                <div><strong>Teléfono:</strong> {pedido.direccionEnvio.telefono || 'N/A'}</div>
              </div>
            </section>
          )}

          {/* Productos */}
          <section className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-primary">Productos del Pedido</h3>
            <div className="space-y-3">
              {pedido.metadata?.cart?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded bg-gray-50">
                  <Image 
                    src={item.foto_1_1 || '/images/sinFoto.webp'} 
                    alt={item.nombre || item.nombre_producto} 
                    width={80} 
                    height={80}
                    className="w-20 h-20 object-contain rounded"
                    unoptimized={true}
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">{item.titulo_de_producto || item.nombre_producto || 'Sin nombre'}</p>
                    <p className="text-gray-600">SKU: {item.sku || item.codigo || 'N/A'}</p>
                    <p className="text-gray-600">Cantidad: <span className="font-bold text-red-500">{item.quantity || item.cantidad}</span></p>
                    <p className="text-gray-600">Precio Unit.: <span className="font-bold">${item.precio || item.precio_unitario}</span></p>
                    <p className="text-gray-700 font-semibold">Subtotal: ${(item.precio || item.precio_unitario) * (item.quantity || item.cantidad)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Información de Envío/Tracking */}
          {(pedido.etiquetaEnvio || pedido.trackingCode) && (
            <section className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-primary">Información de Envío</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {pedido.trackingCode && (
                  <div><strong>Tracking Code:</strong> {pedido.trackingCode}</div>
                )}
                {pedido.etiquetaEnvio && (
                  <div className="col-span-2">
                    <strong>Etiqueta de Envío:</strong>{' '}
                    <Link 
                      href={pedido.etiquetaEnvio} 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                    >
                      Ver etiqueta
                    </Link>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Metadata adicional */}
          {pedido.metadata && (
            <section className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-primary">Metadata Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {pedido.metadata.ticketUrl && (
                  <div className="col-span-2">
                    <strong>Ticket URL:</strong>{' '}
                    <Link 
                      href={pedido.metadata.ticketUrl} 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                    >
                      Ver ticket
                    </Link>
                  </div>
                )}
                {pedido.metadata.mpOrderId && (
                  <div><strong>MP Order ID:</strong> {pedido.metadata.mpOrderId}</div>
                )}
                {pedido.metadata.preferenceId && (
                  <div><strong>Preference ID:</strong> {pedido.metadata.preferenceId}</div>
                )}
              </div>
            </section>
          )}

          {/* JSON completo (colapsable) */}
          <details className="border rounded-lg p-4">
            <summary className="text-lg font-semibold cursor-pointer text-primary hover:text-primary-hover">
              Ver JSON Completo (Desarrolladores)
            </summary>
            <pre className="mt-3 bg-gray-100 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(pedido, null, 2)}
            </pre>
          </details>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
          <button 
            onClick={onClose} 
            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoCompleta;

// components/PedidoCard.tsx
import React from 'react'
import { Pedido } from './Dashboard' 

const ESTADO_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  procesando: 'bg-blue-100 text-blue-800',
  enviado: 'bg-green-100 text-green-800',
  completado: 'bg-purple-100 text-purple-800',
  cancelado: 'bg-red-100 text-red-800'
}

const PedidoCard = ({ pedido }: { pedido: Pedido }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">Pedido #{pedido._id.slice(-6).toUpperCase()}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[pedido.estado]}`}>
          {pedido.estado.toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-500">Fecha</p>
          <p>{new Date(pedido.fechaPedido).toLocaleDateString('es-ES')}</p>
        </div>
        <div>
          <p className="text-gray-500">Total</p>
          <p className="font-medium">${pedido.total.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Productos</p>
          <p>{pedido.items.length}</p>
        </div>
      </div>
      
      <details className="group">
        <summary className="flex items-center cursor-pointer text-sm text-blue-600 hover:text-blue-800">
          Ver detalles
          <svg className="ml-1 w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-2 pl-2 border-l-2 border-gray-200">
          <h4 className="font-medium mb-1">Productos:</h4>
          <ul className="space-y-1">
            {pedido.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.producto}</span>
                <span className="text-gray-600">
                  {item.cantidad} × ${item.precioUnitario.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  )
}

export default PedidoCard
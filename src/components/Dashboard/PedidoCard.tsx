import React from 'react'
import { Pedido } from './Dashboard'

const ESTADO_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  procesando: 'bg-blue-100 text-blue-800',
  enviado: 'bg-green-100 text-green-800',
  entregado: 'bg-purple-100 text-purple-800',
  cancelado: 'bg-red-100 text-red-800'
}

const ESTADOS_ORDENADOS = ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado"] as const

const PedidoCard = ({ pedido }: { pedido: Pedido }) => {
  // Determinar el índice del estado actual
  const currentStateIndex = ESTADOS_ORDENADOS.includes(pedido.estado as any)
    ? ESTADOS_ORDENADOS.indexOf(pedido.estado as typeof ESTADOS_ORDENADOS[number])
    : -1;
  const isCanceled = pedido.estado === 'cancelado'

  return (
    <div className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${isCanceled ? 'bg-red-50' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">Pedido #{pedido._id.slice(-6).toUpperCase()}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[pedido.estado]}`}>
          {pedido.estado.toUpperCase()}
        </span>
      </div>
      
      {/* Línea de tiempo de estados */}
      <div className="mb-4">
        <div className="flex items-center justify-between relative">
          {/* Línea de conexión */}
          <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 z-0">
            {/* Progreso completado */}
            <div className={`h-1 ${isCanceled ? 'bg-red-400' : 'bg-blue-500'}`} style={{ width: `${isCanceled ? 100 : (currentStateIndex / (ESTADOS_ORDENADOS.length - 2)) * 100}`
              }}></div>
          </div>
          
          {ESTADOS_ORDENADOS.map((estado, index) => {
            // No mostrar "cancelado" en la línea de tiempo
            if (estado === 'cancelado') return null
            
            const isCompleted = index <= currentStateIndex
            const isCurrent = index === currentStateIndex
            const isCanceledState = isCanceled && index === ESTADOS_ORDENADOS.length - 1
            
            return (
              <div key={estado} className="flex flex-col items-center z-10 ">
                {/* Punto de estado */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center 
                  ${isCanceledState ? 'bg-red-500 ' : 
                    isCurrent ? 'bg-blue-600' : 
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {isCanceledState ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </div>
                
                {/* Etiqueta de estado */}
                <span className={`text-xs mt-1 text-center ${isCurrent ? 'font-bold text-blue-600' : 'text-gray-800'}`}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </span>
              </div>
            )
          })}
          
          {/* Estado cancelado (si aplica) */}
          {isCanceled && (
            <div className="flex flex-col items-center z-10">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-xs mt-1 font-bold text-red-600">Cancelado</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3 ">
        <div>
          <p className="text-gray-500">Fecha</p>
          <p>{new Date(pedido.fechaPedido).toLocaleDateString('es-ES')}</p>
        </div>
        <div>
          <p className="text-gray-500">Valor Total</p>
          <p className="font-medium">${pedido.total.toFixed(2)}</p>
        </div>
      </div>
      
      <details className="group">
        <summary className="flex items-center cursor-pointer text-sm text-blue-600 hover:text-blue-800 ">
          Ver detalles
          <svg className="ml-1 w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-2 pl-2 border-l-2 border-gray-200 ">
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
import React from 'react'
import { Pedido } from './Dashboard' // Asegúrate que la interfaz Pedido defina 'estado' correctamente (ej. estado?: string)

// Define los posibles estados que esperas. Incluye los de MercadoPago y los personalizados.
// Es buena práctica tener un tipo para las llaves de estado si son un conjunto conocido.
type EstadoPedido =
  | "pendiente"
  | "pagado" // Estado genérico para "pagado"
  | "procesando"
  | "enviado"
  | "entregado"
  | "cancelado"
  | "approved" // Estado de MercadoPago: Aprobado (podrías mapearlo a "pagado")
  | "pending"  // Estado de MercadoPago: Pendiente
  | "rejected" // Estado de MercadoPago: Rechazado (podrías mapearlo a "cancelado")
  | "in_process" // Estado de MercadoPago: En proceso
  | "desconocido"; // Un estado de fallback

const ESTADO_COLORS: Record<EstadoPedido, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  pagado: 'bg-sky-100 text-sky-800', // Añadido para "pagado" genérico
  procesando: 'bg-blue-100 text-blue-800',
  enviado: 'bg-green-100 text-green-800',
  entregado: 'bg-purple-100 text-purple-800',
  cancelado: 'bg-red-100 text-red-800',
  approved: 'bg-green-100 text-green-800', // MP: Aprobado
  pending: 'bg-yellow-100 text-yellow-800', // MP: Pendiente
  rejected: 'bg-red-100 text-red-800', // MP: Rechazado
  in_process: 'bg-blue-100 text-blue-800', // MP: En proceso
  desconocido: 'bg-gray-200 text-gray-700', // Fallback para estados no definidos
};

// Estados para la línea de tiempo visual. Deberías mapear los estados del backend a estos.
const ESTADOS_ORDENADOS_TIMELINE: EstadoPedido[] = ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado"];

// Función para mapear estados del backend a los estados de la línea de tiempo
const mapEstadoToTimeline = (estadoBackend?: string): EstadoPedido => {
  if (!estadoBackend) return "desconocido";
  switch (estadoBackend.toLowerCase()) {
    case 'approved':
    case 'paid': // si tuvieras un estado 'paid'
      return 'pagado';
    case 'pending': // MP pending
    case 'pendiente':
      return 'pendiente';
    case 'in_process':
      return 'procesando';
    case 'shipped': // si tuvieras 'shipped'
      return 'enviado';
    case 'delivered':
      return 'entregado';
    case 'cancelled':
    case 'rejected':
      return 'cancelado';
    default:
      // Si el estado del backend es uno de los ya definidos en ESTADOS_ORDENADOS_TIMELINE
      if ((ESTADOS_ORDENADOS_TIMELINE as string[]).includes(estadoBackend.toLowerCase())) {
        return estadoBackend.toLowerCase() as EstadoPedido;
      }
      return "desconocido"; // o 'pendiente' como fallback general
  }
};


const PedidoCard = ({ pedido }: { pedido: Pedido }) => {
  // 1. Obtener el estado de forma segura, con un fallback.
  const estadoBackend = pedido.estado || "desconocido"; // Usa 'desconocido' si pedido.estado es undefined

  // 2. Mapear el estado del backend al estado que usará la línea de tiempo
  const estadoParaTimeline = mapEstadoToTimeline(pedido.estado);
  //console.log('pedido:', pedido);
  // 3. Usar el estado original del backend (o su fallback) para el color y el texto del tag.
  // Asegúrate de que ESTADO_COLORS tiene una entrada para 'desconocido' o cualquier estado que pueda resultar.
  const estadoColorClass = ESTADO_COLORS[estadoBackend as EstadoPedido] || ESTADO_COLORS.desconocido;
  const estadoDisplayText = estadoBackend.toUpperCase();

  const isCanceled = estadoParaTimeline === 'cancelado';

  const currentStateIndex = ESTADOS_ORDENADOS_TIMELINE.includes(estadoParaTimeline)
    ? ESTADOS_ORDENADOS_TIMELINE.indexOf(estadoParaTimeline)
    : -1;

  return (
    <div className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 ${isCanceled ? 'bg-red-50' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">
          Pedido #{pedido._id ? pedido._id.slice(-6).toUpperCase() : "N/A"}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColorClass}`}>
          {/* Ya no hay riesgo de error aquí porque estadoDisplayText siempre será un string */}
          {estadoDisplayText}
        </span>
      </div>
      
      {/* Línea de tiempo de estados */}
      <div className="mb-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 z-0">
            <div 
              className={`h-1 ${isCanceled ? 'bg-red-400' : 'bg-blue-500'}`} 
              style={{ 
                width: `${isCanceled ? 100 : (currentStateIndex >=0 && ESTADOS_ORDENADOS_TIMELINE.length > 1 ? (currentStateIndex / (ESTADOS_ORDENADOS_TIMELINE.length - 2)) * 100 : 0)}%`
              }}
            ></div>
          </div>
          
          {ESTADOS_ORDENADOS_TIMELINE.map((estadoTimeline, index) => {
            // No mostrar "cancelado" en la línea de tiempo principal, se maneja al final
            if (estadoTimeline === 'cancelado' && !isCanceled) return null;
            if (estadoTimeline === 'cancelado' && isCanceled && index !== ESTADOS_ORDENADOS_TIMELINE.length -1 ) return null; // si cancelado no es el ultimo


            const isCompleted = index <= currentStateIndex;
            const isCurrent = index === currentStateIndex;
            const isCancelledNode = isCanceled && estadoTimeline === 'cancelado';
            
            return (
              <div key={estadoTimeline} className="flex flex-col items-center z-10 ">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center 
                  ${isCancelledNode ? 'bg-red-500' : 
                    isCurrent ? 'bg-blue-600' : 
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}>
                  {isCancelledNode ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </div>
                <span className={`text-xs mt-1 text-center ${isCurrent && !isCancelledNode ? 'font-bold text-blue-600' : isCancelledNode ? 'font-bold text-red-600' : 'text-gray-800'}`}>
                  {estadoTimeline.charAt(0).toUpperCase() + estadoTimeline.slice(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-row justify-between md:grid-cols-3 gap-4 text-sm mb-3 ">
        <div>
          <p className="text-gray-500">Fecha</p>
          {/* Asegurarse que pedido.fechaPedido es un string válido para Date o ya es Date */}
          <p>{pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-ES') : 'N/A'}</p>
        </div>
        <div>
          <p className="text-gray-500">Valor Total</p>
          <p className="font-medium">${(pedido.total || 0).toFixed(2)}</p>
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
            {(pedido.items || []).map((item, i) => ( // Comprobar si items existe
              <li key={i} className="flex justify-between">
                {/* Asegúrate que item.producto y item.precioUnitario existen */}
                <span>{item.producto || "Producto desconocido"}</span>
                <span className="text-gray-600">
                  {item.cantidad || 0} × ${(item.precioUnitario || 0).toFixed(2)}
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
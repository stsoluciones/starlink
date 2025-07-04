import React, { useState, useRef } from 'react'
import { Pedido } from './Dashboard' // Asegúrate que la interfaz Pedido defina 'estado' correctamente (ej. estado?: string)
import { toast } from 'react-toastify';
import Loading from '../Loading/Loading';
import Link from 'next/link';
import actualizarEstado from "../../Utils/actualizarEstado"; // Asegúrate que la ruta es correcta
import Swal from 'sweetalert2';
import userBank from '../constants/userBank';


// Define los posibles estados que esperas. Incluye los de MercadoPago y los personalizados.
// Es buena práctica tener un tipo para las llaves de estado si son un conjunto conocido.
type EstadoPedido =
  | "pendiente"
  | "pagado" // Estado genérico para "pagado"
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
const ESTADOS_ORDENADOS_TIMELINE: EstadoPedido[] = ["pendiente", "pagado", "enviado", "entregado", "cancelado"];

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
  const estadoBackend = pedido.estado || "desconocido";
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDatosModal, setShowDatosModal] = useState(false);
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [nroComprobante, setNroComprobante] = useState('');
  const estadoParaTimeline = mapEstadoToTimeline(pedido.estado);
  const estadoColorClass = ESTADO_COLORS[estadoParaTimeline] || ESTADO_COLORS.desconocido;
  const estadoDisplayText = estadoParaTimeline.toUpperCase();
  const [actualizandoId, setActualizandoId] = useState(null); // No parece usarse para feedback visual directo en este componente, pero se pasa.
  const [pedidosProcesando, setPedidosProcesando] = useState([]);




  const isCanceled = estadoParaTimeline === 'cancelado';

  const currentStateIndex = ESTADOS_ORDENADOS_TIMELINE.includes(estadoParaTimeline)
    ? ESTADOS_ORDENADOS_TIMELINE.indexOf(estadoParaTimeline)
    : -1;
  //console.log('pedido:', pedido);
  //console.log('estadoBackend:', estadoBackend);

  const handleUpload = async (pedido) => {
    if (!ticketFile || !nroComprobante) {
      alert('Debes seleccionar un archivo y escribir el número de comprobante.');
      return;
    }

    const formData = new FormData();
    formData.append('file', ticketFile);
    formData.append('numeroComprobante', nroComprobante);
    formData.append('pedidoId', pedido._id);

    setLoading(true);
    try {
      const res = await fetch('/api/pedidos/guardar-ticket', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Comprobante enviado correctamente.');
        setShowUploadModal(false);
        setTicketFile(null);
        setNroComprobante('');
      } else {
        toast.error('Error al subir el comprobante.');
      }
    } catch (error) {
      console.error('Error al subir el ticket:', error);
      toast.error('Error al subir el ticket.');
    } finally {
      setLoading(false);
    }
  };
  const handleCancelPedido = async(pedido)=>{
    //console.log(pedido._id)
    const seguro = Swal.fire({
      title:'¿Esta seguro que quiere cancelar este pedido?',
      text:'esta accion no puede deshacerse',
      icon:'error',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText:'No',
      confirmButtonText:'Estoy Seguro',
      allowOutsideClick: true,
    })
    if ((await seguro).isConfirmed){
      actualizarEstado(
        pedido._id,
        "cancelado",
        setActualizandoId, // Este setter podría usarse para mostrar un spinner individual si se quisiera
        setPedidosProcesando, // Esta función actualizará la lista local de pedidosProcesando
        true // Importante: Omitir la confirmación individual de actualizarEstado
      )
    }
  }
    // En JSX: botón para subir comprobante si corresponde
  const puedeSubirTicket =
    mapEstadoToTimeline(pedido.estado) === 'pendiente' &&
    pedido.paymentMethod === 'transferencia';
          
  return (
    <div className={`border border-gray-200 rounded-lg p-1 md:p-4 hover:shadow-md transition-shadow duration-200 ${isCanceled ? 'bg-red-50' : 'bg-white'}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 items-center text-center mb-2 gap-2">
        <div className="flex gap-2 justify-center justify-items-center items-center">
          <h3 className="text-xs md:text-sm font-semibold md:font-bold">
            Pedido #{pedido._id?.slice(-6).toUpperCase() || "N/A"}
          </h3>
          {estadoDisplayText === 'PENDIENTE' && (
            <button onClick={() => handleCancelPedido(pedido)} className="text-red-500 hover:cursor-pointer bg-red-300 px-2 align-middle  rounded-full md:text-sm" title="cancelar pedido"> X </button> )}
        </div>
        {pedido?.estado === 'pendiente' && (
          pedido?.paymentMethod === 'mercadopago' ? (
            <Link href={pedido?.init_point || '#'} target="_blank" className="text-primary hover:underline text-xs md:text-sm">
              Terminar Pago
            </Link>
          ) : (
            <button onClick={() => setShowDatosModal(true)} className="text-blue-600 hover:underline text-xs md:text-sm">
              Ver datos para Transferir
            </button>
          )
        )}
        <div>
          {puedeSubirTicket && !pedido?.metadata?.ticketUrl ? (
            <button onClick={() => setShowUploadModal(true)} className="text-blue-600 hover:underline text-xs md:text-sm">
              Adj. comprobante
            </button>
          ) : pedido?.metadata?.ticketUrl ? (
            <Link
              href={pedido.metadata.ticketUrl}
              target="_blank"
              className="text-blue-600 hover:underline text-xs md:text-sm"
            >
              Ver comprobante
            </Link>
          ) : null}
        </div>

        <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${estadoColorClass}`}>
          {estadoDisplayText}
        </span>
        {pedido.etiquetaEnvio && (
          <div className='flex flex-col items-center gap-1'>
            <Link href={pedido.etiquetaEnvio} target="_blank" className="text-white bg-blue-400 px-2 rounded-md hover:bg-blue-500 text-xs md:text-sm">
              Ver Etiqueta de Envio: <span>{pedido.trackingCode}</span>
            </Link>
          </div>
        )}
      </div>


      {/* Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Subir comprobante</h2>
            <label className="block mb-2">
              Número de comprobante:
              <input
                type="text"
                value={nroComprobante}
                onChange={(e) => setNroComprobante(e.target.value)}
                className="mt-1 w-full border rounded p-2"
              />
            </label>
            <label className="block mb-4">
              Archivo (PDF, JPG, PNG):
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={()=>handleUpload(pedido)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading ? <Loading/> : 'Subir'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal */}
      {showDatosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center">Datos para Transferencia</h2>
                  <p>Por favor, realizala a la siguiente cuenta:</p><br/>
                  <p><strong>Banco: </strong>{userBank.banco}</p>
                  <p><strong>Alias: </strong>{userBank.alias}</p>
                  <p><strong>CBU: </strong>{userBank.cbu}</p>
                  <p><strong>Titular: </strong>{userBank.titular}</p><br/>
                  <div>
                    {pedido.paymentMethod==='transferencia'?<p className="text-green-700 font-semibold">Valor Total <small className='text-xs text-green-700'>Abonado con Descuento</small></p>:<p className="text-gray-700 font-semibold">Valor Total</p>}
                    <p className="font-medium">${(pedido.total || 0).toFixed(2)}</p>
                  </div>
                  <p className="mt-4 text-sm"><span className='text-red-500'>*</span>Después de que realices la transferencia y adjuntes el comprobante, nuestro equipo verificará el pago y actualizará el estado del pedido.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDatosModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                salir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Línea de tiempo de estados */}
      <div className="mb-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-3 left-0 right-0 h-1 bg-gray-200 z-0">
            <div className={`h-1 ${isCanceled ? 'bg-red-400' : 'bg-blue-500'}`} style={{ width: `${isCanceled ? 100 : (currentStateIndex >=0 && ESTADOS_ORDENADOS_TIMELINE.length > 1 ? (currentStateIndex / (ESTADOS_ORDENADOS_TIMELINE.length - 2)) * 100 : 0)}%`}} ></div>
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
          {pedido.paymentMethod==='transferencia'?<p className="text-green-700 font-semibold">Valor Total</p>:<p className="text-gray-700 font-semibold">Valor Total</p>}
          {pedido.paymentMethod==='transferencia'?<small className='text-xs text-green-700'>Abonado con Descuento</small>:null}
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
        <div className="mt-2 p-1 md:p-4 border-gray-200 ">
          <h4 className="font-normal md:font-medium mb-1">Productos:</h4>
          <ul className="space-y-1">
            {(pedido?.metadata?.cart || []).map((item, i) => ( // Comprobar si items existe
              <li key={i} className="flex text-sm md:text-base md:justify-between items-center md:items-start md:text-start text-gray-700 gap-1 md:gap-4">
                {/* Asegúrate que item.producto y item.precioUnitario existen */}
                <span>{item.titulo_de_producto || "Producto desconocido"}</span>
                <span className='hidden md:flex'>{item.cod_producto}</span>
                <span className="text-gray-600">
                  {item.quantity || 0} × ${(parseFloat(item.precio) || 0).toFixed(2)}
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
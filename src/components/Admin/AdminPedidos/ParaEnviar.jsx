// componentes/Admin/AdminPedidos/ParaEnviar.jsx
"use client";
import { useEffect, useState } from "react";
import cargarPedidos from "../../../Utils/cargarPedidos";
import Loading from "../../Loading/Loading";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import actualizarEstado from "../../../Utils/actualizarEstado";
import Swal from "sweetalert2";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const ParaEnviar = () => {
  const [loading, setLoading] = useState(false);
  const [pedidosProcesando, setPedidosProcesando] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null);

  useEffect(() => {
    const obtenerPedidos = async () => {
      await cargarPedidos((todosLosPedidos) => {
        const filtrados = todosLosPedidos.filter(
          (pedido) => pedido.estado === 'procesando'
        );
        setPedidosProcesando(filtrados);
      }, setLoading);
    };

    obtenerPedidos();
  }, []);

  useEffect(() => {
    setTodosSeleccionados(
      pedidosProcesando.length > 0 &&
      seleccionados.length === pedidosProcesando.length
    );
  }, [seleccionados, pedidosProcesando]);

  const manejarSeleccion = (_id) => {
    setSeleccionados((prev) =>
      prev.includes(_id)
        ? prev.filter((pid) => pid !== _id)
        : [...prev, _id]
    );
  };

  const manejarSeleccionGeneral = () => {
    if (todosSeleccionados) {
      setSeleccionados([]);
    } else {
      setSeleccionados(pedidosProcesando.map((pedido) => pedido._id));
    }
    setTodosSeleccionados(!todosSeleccionados);
  };

  const handleGenerarAndreani = async (pedidosIds) => {
    try {
      const response = await fetch('/api/etiquetasAndreani', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pedidos: pedidosIds
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar etiquetas');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudieron generar las etiquetas', 'error');
      return false;
    }
  };

  const generarEtiquetas = async () => {
    const pedidosAActualizar = pedidosProcesando.filter((p) =>
      seleccionados.includes(p._id)
    );

    if (pedidosAActualizar.length === 0) {
      Swal.fire("Atención", "No hay pedidos seleccionados para generar etiquetas.", "info");
      return;
    }

    const pedidosInvalidos = pedidosAActualizar.filter(p => !objectIdRegex.test(p._id));
    if (pedidosInvalidos.length > 0) {
      console.error("Pedidos con IDs malformados:", pedidosInvalidos.map(p => p._id));
      Swal.fire({
        title: 'Error de Datos',
        html: `Se encontraron ${pedidosInvalidos.length} pedido(s) con formato de ID incorrecto. Por favor, revisa la consola para más detalles y corrige los datos en la base de datos.<br/>IDs problemáticos: ${pedidosInvalidos.map(p => p._id).join(', ')}`,
        icon: 'error'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Vas a generar etiquetas y actualizar ${pedidosAActualizar.length} pedido(s) a "enviado".`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, generar y actualizar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (!result.isConfirmed) return;
      
      // const etiquetasGeneradas = await handleGenerarAndreani(seleccionados);
      
      // if (!etiquetasGeneradas) {
      //   Swal.fire('Operación Cancelada', 'No se actualizaron los pedidos.', 'info');
      //   return;
      // }

      // etiquetasGeneradas.forEach(({ pedidoId, etiqueta }) => {
      //   const blob = new Blob([Uint8Array.from(atob(etiqueta), c => c.charCodeAt(0))], { type: 'application/pdf' });
      //   const url = URL.createObjectURL(blob);
      //   const link = document.createElement('a');
      //   link.href = url;
      //   link.download = `Etiqueta-${pedidoId}.pdf`;
      //   document.body.appendChild(link);
      //   link.click();
      //   URL.revokeObjectURL(url);
      //   link.remove();
      // });


      Swal.fire({
        title: 'Procesando...',
        html: `Actualizando estado de ${pedidosAActualizar.length} pedido(s).
        <br/>Aca se genera y se imprime las etiquetas de andreani.`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const resultados = await Promise.all(
        pedidosAActualizar.map(pedido =>
          actualizarEstado(
            pedido._id,
            "enviado",
            setActualizandoId,
            setPedidosProcesando,
            true
          )
        )
      );

      const actualizadosConExito = resultados.filter(r => r && r.success).length;
      
      if (actualizadosConExito > 0) {
        setPedidosProcesando(prevPedidos =>
          prevPedidos.filter(p =>
            !resultados.some(r => r && r.success && r.pedido && r.pedido._id === p._id)
          )
        );
      }

      Swal.fire({
        title: '¡Éxito!',
        text: `Se actualizaron ${actualizadosConExito} pedido(s) a "enviado".`,
        icon: 'success'
      });

      setSeleccionados([]);
      setTodosSeleccionados(false);

    } catch (error) {
      console.error("Error al generar etiquetas y actualizar pedidos:", error);
      Swal.fire({
        title: 'Error General',
        text: error.message || "Ocurrió un error inesperado durante el proceso.",
        icon: 'error'
      });
    }
  };

  return (
    <section className="bg-gray-50 p-0 md:p-8 rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Pedidos para Enviar</h2>
      {loading ? (
        <Loading />
      ) : pedidosProcesando.length === 0 ? (
        <p className="text-gray-600">No hay pedidos en estado &quot;procesando&quot;.</p>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2 text-left">
            <input
              type="checkbox"
              id="seleccionarTodos"
              checked={todosSeleccionados}
              onChange={manejarSeleccionGeneral}
            />
            <label htmlFor="seleccionarTodos" className="font-medium cursor-pointer">Seleccionar todos</label>
          </div>

          <ul className="text-left space-y-2 mb-4">
            {pedidosProcesando.map((pedido, index) => (
              <li key={pedido._id || index} className="flex items-center gap-2 p-1 text-sm md:text-base md:p-2 border rounded hover:bg-gray-100">
                <input
                  type="checkbox"
                  id={`pedido-${pedido._id || index}`}
                  checked={seleccionados.includes(pedido._id)}
                  onChange={() => manejarSeleccion(pedido._id)}
                />
                <label htmlFor={`pedido-${pedido._id || index}`} className="flex-grow cursor-pointer">
                  <strong className="uppercase">{pedido.estado}{" "}</strong>
                  <span>ID: {pedido._id}</span> - {" "}
                  <span>
                    {format(new Date(pedido.createdAt), "dd-MM-yyyy HH:mm", {
                      locale: es,
                    })}
                  </span> - {" "}
                  <span>{pedido.usuarioInfo?.nombreCompleto || "Sin nombre"}</span>
                  {pedido.usuarioInfo?.correo && (<span> - {pedido.usuarioInfo.correo}</span>)}
                </label>
              </li>
            ))}
          </ul>

          <button
            onClick={generarEtiquetas}
            disabled={seleccionados.length === 0 || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            Generar etiquetas y Marcar como Enviados ({seleccionados.length})
          </button>
        </>
      )}
    </section>
  );
};

export default ParaEnviar;
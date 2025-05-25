// componentes/Admin/AdminPedidos/AdminPedidos.jsx
"use client";
import { useEffect, useState } from "react";
import cargarPedidos from "../../../Utils/cargarPedidos";
import Loading from "../../Loading/Loading";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import actualizarEstado from "../../../Utils/actualizarEstado"; // Asegúrate que la ruta es correcta
import Swal from "sweetalert2";

// Regex simple para validar formato de ObjectId (24 caracteres hexadecimales)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const EnTransito= () => {
  const [loading, setLoading] = useState(false);
  const [pedidosProcesando, setPedidosProcesando] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null); // No parece usarse para feedback visual directo en este componente, pero se pasa.

  useEffect(() => {
    const obtenerPedidos = async () => {
      await cargarPedidos((todosLosPedidos) => {
        const filtrados = todosLosPedidos.filter(
          (pedido) => pedido.estado === "enviado"
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

  const generarEtiquetas = async () => {
    const pedidosAActualizar = pedidosProcesando.filter((p) =>
      seleccionados.includes(p._id)
    );

    if (pedidosAActualizar.length === 0) {
      Swal.fire("Atención", "No hay pedidos seleccionados para generar etiquetas.", "info");
      return;
    }

    // Validar IDs antes de proceder
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

      Swal.fire({
        title: 'Procesando...',
        html: `Actualizando estado de ${pedidosAActualizar.length} pedido(s).`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const resultadosPromises = pedidosAActualizar.map(pedido =>
        actualizarEstado(
          pedido._id,
          "entregado",
          setActualizandoId, // Este setter podría usarse para mostrar un spinner individual si se quisiera
          setPedidosProcesando, // Esta función actualizará la lista local de pedidosProcesando
          true // Importante: Omitir la confirmación individual de actualizarEstado
        )
      );

      const resultados = await Promise.all(resultadosPromises);

      const actualizadosConExito = resultados.filter(r => r && r.success).length;
      const actualizadosConError = pedidosAActualizar.length - actualizadosConExito;

      // Actualizar la lista de pedidosProcesando después de todas las operaciones
      // Esto es importante porque setPedidosProcesando dentro de actualizarEstado
      // opera sobre el estado `prev` que podría no estar sincronizado en un bucle rápido.
      // Es mejor hacerlo una vez al final basado en los resultados.
      if (actualizadosConExito > 0) {
         setPedidosProcesando(prevPedidos =>
            prevPedidos.filter(p => !resultados.find(r => r && r.success && r.pedido && r.pedido._id === p._id && r.pedido.estado === "enviado"))
        );
      }


      if (actualizadosConError > 0) {
        Swal.fire({
          title: 'Operación Parcialmente Exitosa',
          text: `Se actualizaron ${actualizadosConExito} pedido(s) a "enviado". ${actualizadosConError} pedido(s) no pudieron ser actualizados. Revisa la consola o los mensajes de error individuales.`,
          icon: 'warning'
        });
      } else {
        Swal.fire({
          title: '¡Éxito!',
          text: `Se actualizaron ${actualizadosConExito} pedido(s) a "enviado".`,
          icon: 'success'
        });
      }

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
    <section className="bg-gray-50 p-8 rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Pedidos Entregados</h2>
      {loading ? (
        <Loading />
      ) : pedidosProcesando.length === 0 ? (
        <p className="text-gray-600">No hay pedidos en estado "Entregado".</p>
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2 text-left">
            <input
              type="checkbox"
              id="seleccionarTodos" // Añadir ID para asociar con label
              checked={todosSeleccionados}
              onChange={manejarSeleccionGeneral}
            />
            <label htmlFor="seleccionarTodos" className="font-medium cursor-pointer">Seleccionar todos</label>
          </div>

          <ul className="text-left space-y-2 mb-4">
            {pedidosProcesando.map((pedido, index) => (
              <li key={pedido._id || index} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-100"> {/* Usar pedido._id para key si es único */}
                <input
                  type="checkbox"
                  id={`pedido-${pedido._id || index}`} // ID único para el input
                  checked={seleccionados.includes(pedido._id)}
                  onChange={() => manejarSeleccion(pedido._id)}
                />
                <label htmlFor={`pedido-${pedido._id || index}`} className="flex-grow cursor-pointer"> {/* Label para hacer clickeable toda la fila */}
                  <strong className="uppercase">{pedido.estado}{" "}</strong>
                  <span>ID: {pedido._id}</span> - {" "}
                  <span>
                    {format(new Date(pedido.fechaPedido), "dd-MM-yyyy HH:mm", { // Añadir hora
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
            disabled={seleccionados.length === 0 || loading} // Deshabilitar si está cargando
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            Generar etiquetas y Marcar como Entregados ({seleccionados.length})
          </button>
        </>
      )}
    </section>
  );
};

export default EnTransito;
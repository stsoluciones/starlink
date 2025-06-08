// componentes/Admin/AdminPedidos/AdminPedidos.jsx
"use client";
import { useEffect, useState } from "react";
import cargarPedidos from "../../../Utils/cargarPedidos";
import Loading from "../../Loading/Loading";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const EnTransito= () => {
  const [loading, setLoading] = useState(false);
  const [pedidosProcesando, setPedidosProcesando] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);

  useEffect(() => {
    const obtenerPedidos = async () => {
      await cargarPedidos((todosLosPedidos) => {
        const filtrados = todosLosPedidos.filter(
          (pedido) => pedido.estado === 'entregado'
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


  return (
    <section className="bg-gray-50 p-8 rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Pedidos Entregados</h2>
      {loading ? (
        <Loading />
      ) : pedidosProcesando.length === 0 ? (
        <p className="text-gray-600">No hay pedidos en estado &quot;Entregado&quot;.</p>
      ) : (
        <>
          {/* <div className="mb-2 flex items-center gap-2 text-left">
            <input
              type="checkbox"
              id="seleccionarTodos" // Añadir ID para asociar con label
              checked={todosSeleccionados}
              onChange={manejarSeleccionGeneral}
            />
            <label htmlFor="seleccionarTodos" className="font-medium cursor-pointer">Seleccionar todos</label>
          </div> */}

          <ul className="text-left space-y-2 mb-4">
            {pedidosProcesando.map((pedido, index) => (
              <li key={pedido._id || index} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-100"> {/* Usar pedido._id para key si es único */}
                {/* <input
                  type="checkbox"
                  id={`pedido-${pedido._id || index}`} // ID único para el input
                  checked={seleccionados.includes(pedido._id)}
                  onChange={() => manejarSeleccion(pedido._id)}
                /> */}
                <label htmlFor={`pedido-${pedido._id || index}`} className="flex-grow cursor-pointer"> {/* Label para hacer clickeable toda la fila */}
                  <strong className="uppercase">{pedido.estado}{" "}</strong>
                  <span>ID: {pedido._id}</span> - {" "}
                  <span>{pedido.usuarioInfo?.nombreCompleto || "Sin nombre"}</span>
                  {pedido.usuarioInfo?.correo && (<span> - {pedido.usuarioInfo.correo}</span>)}
                </label>
                  <span>
                      {pedido.fechaPedido && !isNaN(new Date(pedido.fechaPedido).getTime())
                        ? format(new Date(pedido.fechaPedido), "dd-MM-yyyy", { locale: es })
                        : ""}
                  </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default EnTransito;
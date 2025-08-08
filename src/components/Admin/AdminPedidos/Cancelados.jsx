// componentes/Admin/AdminPedidos/AdminPedidos.jsx
"use client";
import { useEffect, useState } from "react";
import cargarPedidos from "../../../Utils/cargarPedidos";
import Loading from "../../Loading/Loading";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { FaBackward, FaForward } from "react-icons/fa";

// Regex simple para validar formato de ObjectId (24 caracteres hexadecimales)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const Cancelados = () => {
  const [loading, setLoading] = useState(false);
  const [pedidosProcesando, setPedidosProcesando] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 25;

  useEffect(() => {
    const obtenerPedidos = async () => {
      await cargarPedidos((todosLosPedidos) => {
        const filtrados = todosLosPedidos.filter(
          (pedido) => pedido.estado === "cancelado"
        );
        setPedidosProcesando(filtrados);
      }, setLoading);
    };

    obtenerPedidos();
  }, []);

  // Calcular los pedidos que se muestran en la página actual
  const indiceInicio = (paginaActual - 1) * pedidosPorPagina;
  const indiceFin = indiceInicio + pedidosPorPagina;
  const pedidosPagina = pedidosProcesando.slice(indiceInicio, indiceFin);

  const totalPaginas = Math.ceil(pedidosProcesando.length / pedidosPorPagina);

  const siguientePagina = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  return (
    <section className="bg-gray-50 p-8 rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Pedidos Cancelados</h2>
      {loading ? (
        <Loading />
      ) : pedidosProcesando.length === 0 ? (
        <p className="text-gray-600">
          No hay pedidos en estado &quot;Cancelado&quot;.
        </p>
      ) : (
        <>
          <ul className="text-left space-y-2 mb-4">
            {pedidosPagina.map((pedido, index) => (
              <li
                key={pedido._id || index}
                className="flex items-center gap-2 p-2 border rounded hover:bg-gray-100"
              >
                <label
                  htmlFor={`pedido-${pedido._id || index}`}
                  className="flex-grow cursor-pointer"
                >
                  <strong className="uppercase">{pedido.estado}{" "}</strong>
                  <span>ID: {pedido._id}</span> -{" "}
                  <span>
                    {pedido.usuarioInfo?.nombreCompleto || "Sin nombre"}
                  </span>
                </label>
                <span>
                  {pedido.fechaPedido &&
                  !isNaN(new Date(pedido.fechaPedido).getTime())
                    ? format(new Date(pedido.fechaPedido), "dd-MM-yyyy", {
                        locale: es,
                      })
                    : ""}
                </span>
                {pedido?.etiquetaEnvio && (
                  <Link href={pedido.etiquetaEnvio} target="_blank">
                    {" "}
                    - Reimprimir{" "}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Paginador */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={paginaAnterior}
              disabled={paginaActual === 1}
              className="p-2 bg-gray-200 rounded disabled:opacity-50"
            >
              <FaBackward />
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={siguientePagina}
              disabled={paginaActual === totalPaginas}
              className="p-2 bg-gray-200 rounded disabled:opacity-50"
            >
              <FaForward />
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default Cancelados;

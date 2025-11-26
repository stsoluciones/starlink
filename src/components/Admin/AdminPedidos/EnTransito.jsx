// componentes/Admin/AdminPedidos/AdminPedidos.jsx
"use client";
import { useEffect, useState } from "react";
import cargarPedidos from "../../../Utils/cargarPedidos";
import Loading from "../../Loading/Loading";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import actualizarEstado from "../../../Utils/actualizarEstado";
import Swal from "sweetalert2";
import Link from "next/link";
import userData from "../../constants/userData";

// Regex simple para validar formato de ObjectId (24 caracteres hexadecimales)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const EnTransito = () => {
  const [loading, setLoading] = useState(false);
  const [pedidosProcesando, setPedidosProcesando] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null);

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

  // 🔹 NUEVO: sincronizar un pedido puntual con Andreani
  const handleSyncAndreani = async (pedidoId) => {
    try {
      setActualizandoId(pedidoId);

      const res = await fetch(`/api/pedidos/actualizar-pedido/${pedidoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncDesdeAndreani: true }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Error al sincronizar con Andreani"
        );
      }

      const pedidoActualizado = data.pedido;

      // Actualizar lista local y sacar el pedido si ya no está "enviado"
      setPedidosProcesando((prev) =>
        prev
          .map((p) => (p._id === pedidoActualizado._id ? pedidoActualizado : p))
          .filter((p) => p.estado === "enviado")
      );

      await Swal.fire({
        title: "Estado actualizado",
        html: `
          <p><b>Estado Andreani:</b> ${
            data.andreani?.descripcion || data.andreani?.codigo || "-"
          }</p>
          <p><b>Código:</b> ${data.andreani?.codigo || "-"}</p>
          ${
            data.esEntregado
              ? '<p class="text-green-600 mt-2"><b>El pedido fue marcado como ENTREGADO.</b></p>'
              : ""
          }
        `,
        icon: "success",
      });
    } catch (err) {
      console.error("Error en handleSyncAndreani:", err);
      await Swal.fire({
        title: "Error",
        text: err.message || "Error al sincronizar con Andreani",
        icon: "error",
      });
    } finally {
      setActualizandoId(null);
    }
  };

  const handleEntregados = async () => {
    const pedidosAActualizar = pedidosProcesando.filter((p) =>
      seleccionados.includes(p._id)
    );

    if (pedidosAActualizar.length === 0) {
      Swal.fire("Atención", "No hay pedidos seleccionados.", "info");
      return;
    }

    const pedidosInvalidos = pedidosAActualizar.filter(
      (p) => !objectIdRegex.test(p._id)
    );
    if (pedidosInvalidos.length > 0) {
      console.error(
        "Pedidos con IDs malformados:",
        pedidosInvalidos.map((p) => p._id)
      );
      Swal.fire({
        title: "Error de Datos",
        html: `Se encontraron ${
          pedidosInvalidos.length
        } pedido(s) con formato de ID incorrecto. Por favor, revisa la consola para más detalles y corrige los datos en la base de datos.<br/>IDs problemáticos: ${pedidosInvalidos
          .map((p) => p._id)
          .join(", ")}`,
        icon: "error",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: `Vas a actualizar ${pedidosAActualizar.length} pedido(s) a "entregados".`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Procesando...",
        html: `Actualizando estado de ${pedidosAActualizar.length} pedido(s).`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const resultadosPromises = pedidosAActualizar.map((pedido) =>
        actualizarEstado(
          pedido._id,
          "entregado",
          setActualizandoId,
          setPedidosProcesando,
          true,
          userData
        )
      );

      const resultados = await Promise.all(resultadosPromises);

      const actualizadosConExito = resultados.filter(
        (r) => r && r.success
      ).length;
      const actualizadosConError =
        pedidosAActualizar.length - actualizadosConExito;

      // 🔧 Ajuste: sacar de la lista los que ya no estén en "enviado"
      setPedidosProcesando((prev) =>
        prev.filter(
          (p) =>
            !resultados.find(
              (r) =>
                r &&
                r.success &&
                r.pedido &&
                r.pedido._id === p._id &&
                r.pedido.estado !== "enviado"
            )
        )
      );

      if (actualizadosConError > 0) {
        Swal.fire({
          title: "Operación Parcialmente Exitosa",
          text: `Se actualizaron ${actualizadosConExito} pedido(s) a "entregado". ${actualizadosConError} pedido(s) no pudieron ser actualizados.`,
          icon: "warning",
        });
      } else {
        Swal.fire({
          title: "¡Éxito!",
          text: `Se actualizaron ${actualizadosConExito} pedido(s) a "entregado".`,
          icon: "success",
        });
      }

      setSeleccionados([]);
      setTodosSeleccionados(false);
    } catch (error) {
      console.error(
        "Error al marcar como entregados y actualizar pedidos:",
        error
      );
      Swal.fire({
        title: "Error General",
        text: error.message || "Ocurrió un error inesperado durante el proceso.",
        icon: "error",
      });
    }
  };

  return (
    <section className="bg-gray-50 p-8 rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Pedidos En Tránsito</h2>
      {loading ? (
        <Loading />
      ) : pedidosProcesando.length === 0 ? (
        <p className="text-gray-600">
          No hay pedidos en estado &quot;enviado&quot;.
        </p>
      ) : (
        <>
          {/* Si querés volver a habilitar selección múltiple, descomenta esto
          <div className="mb-2 flex items-center gap-2 text-left">
            <input
              type="checkbox"
              id="seleccionarTodos"
              checked={todosSeleccionados}
              onChange={manejarSeleccionGeneral}
            />
            <label htmlFor="seleccionarTodos" className="font-medium cursor-pointer">
              Seleccionar todos
            </label>
          </div>
          */}

          <ul className="text-left space-y-2 mb-4">
            {pedidosProcesando.map((pedido, index) => (
              <li
                key={pedido._id || index}
                className="flex items-center gap-2 p-2 border rounded hover:bg-gray-100"
              >
                {/* Si volvés a usar selección por checkbox:
                <input
                  type="checkbox"
                  id={`pedido-${pedido._id || index}`}
                  checked={seleccionados.includes(pedido._id)}
                  onChange={() => manejarSeleccion(pedido._id)}
                />
                */}
                <label
                  htmlFor={`pedido-${pedido._id || index}`}
                  className="flex-grow cursor-pointer"
                >
                  <strong className="uppercase">{pedido.estado} </strong>
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

                {/* Reimprimir etiqueta */}
                {pedido?.etiquetaEnvio && (
                  <Link
                    href={`/api/andreani/etiqueta?url=${encodeURIComponent(
                      pedido.etiquetaEnvio
                    )}&pedidoId=${pedido._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white bg-blue-600 py-1 px-3 rounded-md hover:bg-blue-700 text-xs md:text-sm"
                  >
                    Reimprimir
                  </Link>
                )}

                {/* 🔹 Botón Sync Andreani POR PEDIDO (ahora dentro del map) */}
                {/* {pedido.trackingCode && (
                  <button
                    disabled={actualizandoId === pedido._id}
                    onClick={() => handleSyncAndreani(pedido._id)}
                    className="px-2 py-1 text-xs md:text-sm bg-amber-500 text-white rounded hover:bg-amber-600"
                  >
                    Sync Andreani
                  </button>
                )} */}
              </li>
            ))}
          </ul>

          {/* Botón masivo para marcar como entregados manualmente */}
          <button
            onClick={handleEntregados}
            disabled={seleccionados.length === 0 || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            Marcar como Entregados ({seleccionados.length})
          </button>
        </>
      )}
    </section>
  );
};

export default EnTransito;

"use client";
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loading from '../../Loading/Loading';
import AuthForm from '../../Login/AuthForm';

// Cargamos el formulario de registro existente para reusar en modal
const Register = dynamic(() => import('../../Login/AuthForm').then(m => m.default), { ssr: false });

const PAGE_SIZE = 50;

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewUser, setShowNewUser] = useState(false);

  const fetchUsers = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/usuarios?page=${p}&limit=${PAGE_SIZE}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const data = await res.json();
      setUsers(data.users || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const nextPage = () => page < totalPages && fetchUsers(page + 1);
  const prevPage = () => page > 1 && fetchUsers(page - 1);

  return (
    <div className="p-1 md:p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Usuarios</h2>
        <button onClick={() => setShowNewUser(true)} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover text-sm" aria-label="agregar usuario">Nuevo Usuario</button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading && <div className="text-sm"><Loading /></div>}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Correo</th>
              <th className="px-3 py-2 text-left hidden md:block">Teléfono</th>
              <th className="px-3 py-2 text-center">Pedidos</th>
              <th className="px-3 py-2 text-center">Entregados</th>
              <th className="px-3 py-2 text-center">Cancelados</th>
              <th className="px-3 py-2 text-left hidden md:block">Rol</th>
              <th className="px-3 py-2 text-left hidden md:block">UID</th>
              <th className="px-3 py-2 text-left hidden md:block">Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-center text-gray-500">Sin usuarios</td>
              </tr>
            )}
            {users.map(u => (
              <tr key={u.uid} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">{u.nombreCompleto || '-'}</td>
                <td className="px-3 py-2">{u.correo}</td>
                <td className="px-3 py-2 hidden md:block">{u.telefono || '-'}</td>
                <td className="px-3 py-2 text-center font-medium">{u.totalPedidos}</td>
                <td className="px-3 py-2 text-center text-green-600">{u.entregadas}</td>
                <td className="px-3 py-2 text-center text-red-600">{u.canceladas}</td>
                <td className="px-3 py-2 hidden md:block">{u.rol}</td>
                <td className="px-3 py-2 text-xs max-w-[160px] truncate hidden md:block" title={u.uid}>{u.uid}</td>
                <td className="px-3 py-2 text-xs hidden md:block">{u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-gray-600">Página {page} de {totalPages}</div>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={prevPage} className={`px-3 py-1 rounded border text-sm ${page===1? 'opacity-40 cursor-not-allowed':'hover:bg-gray-100'}`}>Anterior</button>
          <button disabled={page === totalPages} onClick={nextPage} className={`px-3 py-1 rounded border text-sm ${page===totalPages? 'opacity-40 cursor-not-allowed':'hover:bg-gray-100'}`}>Siguiente</button>
        </div>
      </div>

      {/* {showNewUser && (
        <div className="fixed inset-0flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded shadow-lg p-4 relative">
            <button onClick={()=>setShowNewUser(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" aria-label="cerrar">✕</button>
            <h3 className="text-lg font-semibold mb-2">Crear nuevo usuario</h3>
            <Suspense fallback={<Loading />}>
              <AuthForm mode="register" />
            </Suspense>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Usuarios;
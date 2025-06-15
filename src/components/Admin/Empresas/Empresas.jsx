'use client';

import { useState } from 'react';
import useEmpresas from '../../../Hooks/useEmpresas';
import { Input } from '../../../components/ui/input';
import { Buttons } from '../../../components/ui/Buttons';
import { Card, CardContent } from '../../../components/ui/Card';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';

export default function EmpresaForm() {
  const { empresas, fetchEmpresas } = useEmpresas();
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    mail: '',
    telefono: '',
    cuil: '',
    observaciones: '',
    tipo:''
  });
  const [editingId, setEditingId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const empresasPorPagina = 25;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre) {
      alert('Falta el nombre de la empresa.');
      return;
    }

    const res = await fetch(editingId ? `/api/empresa/${editingId}` : '/api/empresa', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      fetchEmpresas();
      setForm({ nombre: '', direccion: '', mail: '', telefono: '', cuil: '', tipo: '' });
      setEditingId(null);
    }
  };

  const handleEdit = (empresa) => {
    setForm(empresa);
    setEditingId(empresa._id);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de que querés eliminar esta empresa?')) {
      await fetch(`/api/empresa/${id}`, { method: 'DELETE' });
      fetchEmpresas();
    }
  };

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const empresasFiltradas = empresas.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(empresasFiltradas.length / empresasPorPagina);
  const empresasPaginadas = empresasFiltradas.slice(
    (paginaActual - 1) * empresasPorPagina,
    paginaActual * empresasPorPagina
  );

  return (
    <div className="max-w-7xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Administrar Empresa</h1>

      {/* Buscador */}
      <div className="mb-6">
        <TextField
          label="Buscar empresa por nombre"
          variant="outlined"
          fullWidth
          value={busqueda}
          onChange={handleBusqueda}
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {['nombre', 'direccion', 'mail', 'telefono', 'cuil'].map((field) => (
          <Input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          />
        ))}

        {/* Selector para tipo */}
        <select
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          required
        >
          <option value="">Seleccionar tipo</option>
          <option value="Consumidor Final">Consumidor Final</option>
          <option value="Monotributo Social">Monotributo Social</option>
          <option value="Monotributo">Monotributo</option>
          <option value="Exento">IVA Exento</option>
          <option value="No Responsable">No Responsable</option>
          <option value="Responsable inscripto">Responsable inscripto</option>
        </select>

        <div className="flex gap-4">
          <Buttons type="submit" className="col-span-1 md:col-span-2 w-40">
            {editingId ? 'Actualizar Empresa' : 'Crear Empresa'}
          </Buttons>
          {editingId && (
            <Buttons
              type="Buttons"
              variant="outline"
              className="col-span-1 md:col-span-2 bg-red-500 text-white w-40"
              onClick={() => {
                setForm({ nombre: '', direccion: '', mail: '', telefono: '', cuil: '', tipo: '' });
                setEditingId(null);
              }}
            >
              Cancelar
            </Buttons>
          )}
        </div>
      </form>


    {/* Lista paginada */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {empresasPaginadas.map((empresa) => (
        <Card key={empresa._id} className="p-2 bg-slate-200">
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold">{empresa.nombre}</p>
            <p>{empresa.direccion}</p>
            <p>{empresa.mail}</p>
            <p>{empresa.telefono}</p>
            <p>{empresa.cuil}</p>
            <p>{empresa.tipo}</p>
            <div className="flex gap-2 mt-2">
              <Buttons size="sm" onClick={() => handleEdit(empresa)}>
                Editar
              </Buttons>
              <Buttons size="sm" variant="destructive" onClick={() => handleDelete(empresa._id)}>
                Eliminar
              </Buttons>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>


      {/* Paginador */}
      {totalPaginas > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            count={totalPaginas}
            page={paginaActual}
            onChange={(_, page) => setPaginaActual(page)}
            color="primary"
          />  
        </div>
      )}
    </div>
  );
}

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Buttons } from '../../ui/Buttons';
import { Input } from '../../ui/input';
import { Card } from '../../ui/Card';

export default function CargarEmpresaModal({ empresas, onEmpresaSeleccionada }) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const empresasFiltradas = empresas.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Buttons type="button" className='my-2'>Cargar una empresa</Buttons>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 fixed inset-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-xl font-bold mb-4">Seleccionar Empresa</Dialog.Title>

          <Input
            placeholder="Buscar empresa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="mb-4"
          />

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {empresasFiltradas.map((empresa) => (
              <Card
                key={empresa._id}
                className="p-4 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  onEmpresaSeleccionada(empresa);
                  setOpen(false); // Cierra el modal
                }}
              >
                <p className="font-semibold">{empresa.nombre}</p>
                <p className="text-sm text-gray-600">{empresa.direccion}</p>
              </Card>
            ))}
            {empresasFiltradas.length === 0 && (
              <p className="text-sm text-gray-500">No se encontraron empresas.</p>
            )}
          </div>

          <Dialog.Close asChild>
            <Buttons variant="outline" className="mt-4 w-full">Cerrar</Buttons>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

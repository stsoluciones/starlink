'use client'

import React, { useEffect, useState } from 'react'
import newFetchProductos from '../../../Hooks/useNewFetchProducts';
import Swal from 'sweetalert2'
import handleShare from '../../../Utils/handleShare'
import generarPDF from '../../../Utils/generarPDF'
import SearchInPresupuesto from './SearchAdmin'

const Presupuestos = () => {    
  const [productos, setProductos] = useState([]);
  const [dolar, setDolar] = useState(0)
  const [showModal, setShowModal] = useState(false)
  

  const [items, setItems] = useState([])
  const [empresa, setEmpresa] = useState({
    nombre: '',
    direccion: '',
    mail: '',
    telefono: '',
    cuil: '',
    observaciones:''
  })

  const fetchProductos = async () => {
    const res = await newFetchProductos()
    setProductos(res);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { cantidad: 1, producto: '', codigo: '', precio: 0, usd: false, dolar:dolar }])
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = field === 'cantidad' || field === 'precio' ? Number(value) : value
    setItems(updated)
  }

 const confirmarYGenerar = () => {
  if (!empresa.nombre || items.length === 0) {
    Swal.fire('Error', 'Completa los datos de la empresa y agrega al menos un producto.', 'error')
    return
  }
    Swal.fire({
      title: '¿El presupuesto está correcto?',
      text: 'Podrás editarlo si lo necesitas',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar PDF',
      cancelButtonText: 'No, editar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const pdf = await generarPDF(empresa, items)
  
        Swal.fire({
          title: 'PDF generado',
          text: 'El PDF ha sido generado',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Sí, compartir',
          cancelButtonText: 'No'
        }).then(async (result) => {
          if (result.isConfirmed) {
            await handleShare(pdf)
          }
  
          // ✅ Reiniciar formulario después de generar (independientemente si comparte o no)
          setEmpresa({
            nombre: '',
            direccion: '',
            mail: '',
            telefono: '',
            cuil: '',
            observaciones:''
          })
          setItems([])
  
          Swal.fire({
            icon: 'success',
            title: 'Formulario reiniciado',
            timer: 1500,
            showConfirmButton: false
          })
        })
      } else {
        Swal.fire({
          title: '¿Desea reiniciar el formulario?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, reiniciar',
          cancelButtonText: 'No'
        }).then((result) => {
          if (result.isConfirmed) {
            setEmpresa({
              nombre: '',
              direccion: '',
              mail: '',
              telefono: '',
              cuil: '',
              observaciones:''

            })
            setItems([])
            Swal.fire({
              icon: 'success',
              title: 'Formulario reiniciado',
              timer: 1500,
              showConfirmButton: false
            })
          }
        })
      }
    })
  }
  
  const calcularTotal = () => {
    return items.reduce((acc, item) => {
      const precio = item.usd ? item.precio * dolar : item.precio;
      return acc + item.cantidad * precio;
    }, 0)
  }

  const handleRemoveItem = (index) => {
    const updated = [...items]
    updated.splice(index, 1)
    setItems(updated)
  }

  const handleSelectProduct = (producto) => {
    setItems([ ...items,
      {
        cantidad: 1,
        producto: producto.nombre || '',
        codigo: producto.cod_producto || '',
        precio: producto.precio || 0,
        usd: producto.usd,
        dolar: dolar
      }
    ])
    setShowModal(false)
  }
  

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-lg md:text-2xl font-bold mb-2">Generar Presupuesto</h2>
      <h3 className="text-base md:text-xl font-bold mb-4">Datos Empresa</h3>

      {/* Empresa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.keys(empresa).map((field) => (
          field !== 'observaciones'?
            <input
            key={field}
            type="text"
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={empresa[field]}
            onChange={e => setEmpresa({ ...empresa, [field]: e.target.value })}
            className="border p-2 rounded"
            />
          :null          
        ))}
         <input
            type="number"
            placeholder={'$ Dolar'}
            value={dolar}
            onChange={e => setDolar(Number(e.target.value) )}
            className="border p-2 rounded"
          />
      </div>

      {/* Productos */}
      <h3 className="text-xl font-semibold mb-2">Productos</h3>
      {items.map((item, index) => (
        <div key={index} className="mb-4 border-b pb-2 sm:grid sm:grid-cols-5 sm:gap-2">
            <div className="mt-2 sm:mt-0 sm:col-span-5 flex justify-end">
                <button onClick={() => handleRemoveItem(index)} className="text-red-600 rounded-full px-1 text-sm font-extrabold hover:scale-110 hover:ring-1 hover:ring-red-500 hover:bg-red-500 hover:text-white">X</button>
            </div>
            {/* Etiquetas solo visibles en móvil */}
            <div className="sm:hidden mb-2">
                <label className="text-xs block mb-1">Cantidad</label>
                <input
                type="number"
                min="0"
                value={item.cantidad}
                onChange={e => handleItemChange(index, 'cantidad', e.target.value)}
                className="border p-1 rounded w-full"
                />
            </div>

            <div className="sm:hidden mb-2">
                <label className="text-xs block mb-1">Producto</label>
                <input
                type="text"
                value={item.producto}
                onChange={e => handleItemChange(index, 'producto', e.target.value)}
                className="border p-1 rounded w-full"
                />
            </div>

            <div className="sm:hidden mb-2">
                <label className="text-xs block mb-1">Código</label>
                <input
                type="text"
                value={item.codigo}
                onChange={e => handleItemChange(index, 'codigo', e.target.value)}
                className="border p-1 rounded w-full"
                />
            </div>

            <div className="sm:hidden mb-2">
                <label className="text-xs block mb-1">Precio</label>
                <input
                type="number"
                min="0"
                value={item.precio}
                onChange={e => handleItemChange(index, 'precio', e.target.value)}
                className="border p-1 rounded w-full"
                />
                <label className="text-sm">USD</label>
              <input type="checkbox"
                checked={item.usd}
                onChange={e => handleItemChange(index, 'usd', e.target.checked)}
                className="sm:col-span-1"
              />
            </div>
            <div className="sm:hidden mb-2 text-right text-sm">
                <span className="font-semibold">Total: </span>
                {(item.usd? item.cantidad * item.precio * dolar :item.cantidad * item.precio ).toLocaleString('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2
                })}
            </div>

            {/* Vista para pantallas sm en adelante */}
            <input
                type="number"
                min="0"
                value={item.cantidad}
                onChange={e => handleItemChange(index, 'cantidad', e.target.value)}
                className="hidden sm:block border p-1 rounded w-full"
            />
            <input
                type="text"
                value={item.producto}
                onChange={e => handleItemChange(index, 'producto', e.target.value)}
                className="hidden sm:block border p-1 rounded w-full"
            />
            <input
                type="text"
                value={item.codigo}
                onChange={e => handleItemChange(index, 'codigo', e.target.value)}
                className="hidden sm:block border p-1 rounded w-full"
            />
            <div className="flex">
              <input
                  type="number"
                  min="0"
                  value={item.precio}
                  onChange={e => handleItemChange(index, 'precio', e.target.value)}
                  className="hidden sm:block border p-1 rounded w-full"
              />
              <div className="flex flex-col">
                <label className="text-sm">USD</label>
                <input type="checkbox"
                  checked={item.usd}
                  onChange={e => handleItemChange(index, 'usd', e.target.checked)}
                  className="sm:col-span-1"
                  />
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-end p-2 text-sm">
                {(item.usd? item.cantidad * item.precio * dolar:item.cantidad * item.precio  ).toLocaleString('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2
                })}
            </div>
        </div>
      ))}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-xl w-full relative">
                    <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg">✕</button>
                    <h3 className="text-lg font-semibold mb-4">Seleccionar Producto</h3>
                    {/* SearchBase puede ser un autocomplete o buscador personalizado */}
                    <SearchInPresupuesto products={productos} onSelect={handleSelectProduct}/>
                </div>
            </div>
        )}
    <div className="flex gap-4 mt-4">
       <button onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">ADD Manualmente</button>
       <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">ADD Producto</button>
    </div>
    {/* <-- observaciones --> */}
    <div className="flex gap-4 mt-4">
      <label htmlFor="observaciones">Observaciones</label>
      <input 
          id='observaciones' 
          name='observaciones' 
          type="text" 
          value={empresa.observaciones} 
          onChange={e => setEmpresa({ ...empresa, observaciones: e.target.value })} 
          className="hidden sm:block border p-1 rounded w-full"
        />
    </div>

      {/* Total y acciones */}
      <div className="mt-6 text-right">
        <p className="text-lg font-bold">
          Total: {calcularTotal().toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
          })}
        </p>
        <button onClick={confirmarYGenerar} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Generar PDF</button>
      </div>
    </div>
  )
}

export default Presupuestos

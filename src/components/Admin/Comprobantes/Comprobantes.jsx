'use client'

import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import handleShare from '../../../Utils/handleShare'
import generarPDF from '../../../Utils/generarPDF'
import CargarEmpresaModal from './CargarEmpresa';
import useEmpresas from '../../../Hooks/useEmpresas'
import { Buttons } from '../../ui/Buttons'
import newFetchProductos from '../../../Hooks/useNewFetchProducts'
import SearchInPresupuesto from './SearchAdmin'

const Comprobantes = () => {    
  const [tipoDocumento, setTipoDocumento] = useState('presupuesto')
  const { empresas } = useEmpresas()
  const [productos, setProductos] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [pagos, setPagos] = useState([{tipo: '', monto: 0, CH_n:'', Bco:'',cuit:'', date:new Date().toISOString().split('T')[0] }])
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)  
  const [empresa, setEmpresa] = useState({
    nombre: '',
    direccion: '',
    mail: '',
    telefono: '',
    cuil: '',
    observaciones:'',
    tipo: ''
  })

    const fetchProductos = async () => {
    const res = await newFetchProductos()
    setProductos(res);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSelectEmpresa = (empresaSeleccionada) => {
    if (!empresaSeleccionada) return
    setEmpresa({
      nombre: empresaSeleccionada.nombre || '',
      direccion: empresaSeleccionada.direccion || '',
      mail: empresaSeleccionada.mail || '',
      telefono: empresaSeleccionada.telefono || '',
      cuil: empresaSeleccionada.cuil || '',
      observaciones: empresaSeleccionada.observaciones || '',
      tipo: empresaSeleccionada.tipo || ''
    })
  }

  const formatFecha = (fechaString) => {
    const [year, month, day] = fechaString.split('-')
    return `${day}-${month}-${year.slice(-2)}`
  }
  
  const fechaPresupuesto = formatFecha(fecha)
  const handleAddItem = () => {
    setItems([...items, { cantidad: 1, producto: '', codigo: '', precio: 0 }])
  }
  const handleAddPago = () => {
    setPagos([...pagos, { tipo: '', monto: 0, CH_n:'', Bco:'', cuit:'', date:'' }])
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = field === 'cantidad' || field === 'precio' ? Number(value) : value
    setItems(updated)
  }
  const handlePagoChange = (index, field, value) => {
    const updated = [...pagos]
    updated[index][field] = field === 'monto' ? Number(value) : value
    setPagos(updated)
  }
  
  
  const handleRemovePago = (index) => {
    const updated = [...pagos]
    updated.splice(index, 1)
    setPagos(updated)
  }

  const confirmarYGenerar = () => {
    Swal.fire({
      title: '¿El presupuesto está correcto?',
      text: 'Podrás editarlo si lo necesitas',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar PDF',
      cancelButtonText: 'No, editar'
    }).then(async (result) => {
      if (result.isConfirmed) {
  
        // 🔹 Preguntar si quiere guardar la empresa
        const guardarEmpresa = await Swal.fire({
          title: '¿Desea guardar esta empresa?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, guardar',
          cancelButtonText: 'No'
        })
  
        if (guardarEmpresa.isConfirmed) {
          const nombreNormalizado = empresa.nombre.trim().toLowerCase()
        
          // 🔍 Buscar coincidencias parciales de nombre
          const empresasSimilares = empresas.filter(e =>
            e.nombre.toLowerCase().includes(nombreNormalizado)
          )
        
          if (empresasSimilares.length > 0) {
            const nombresSimilares = empresasSimilares.map(e => `• ${e.nombre}`).join('\n')
        
            const confirmar = await Swal.fire({
              title: 'Empresa similar encontrada',
              text: `Ya existe una empresa con un nombre parecido:\n${nombresSimilares}\n¿Es la misma empresa?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, es la misma',
              cancelButtonText: 'No, continuar y guardar'
            })
        
            if (confirmar.isConfirmed) {
              return // No hacer nada si es la misma
            }
          }
        
          // ⚠️ Verificación final por CUIL y nombre exacto
          const empresaYaExiste = empresas.some(
            e => e.cuil === empresa.cuil && e.nombre.toLowerCase() === empresa.nombre.toLowerCase()
          )
        
          if (!empresaYaExiste) {
            //console.log('first', JSON.stringify(empresa))
            const res = await fetch('/api/empresa', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(empresa)
            })
        
            if (!res.ok) {
              Swal.fire('Error', 'No se pudo guardar la empresa', 'error')
              return
            }
          }
        }
        
        // ✅ Generar PDF
        const pdf = await generarPDF(empresa, items, tipoDocumento, fecha, pagos)
  
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
  
          // 🔄 Reiniciar formulario
          setEmpresa({
            nombre: '',
            direccion: '',
            mail: '',
            telefono: '',
            cuil: '',
            observaciones: '',
            tipo: ''
          })
          setItems([])
          setPagos([{
            tipo: '', monto: 0, CH_n: '', Bco: '', cuit: '', date: new Date().toISOString().split('T')[0]
          }])
  
          Swal.fire({
            icon: 'success',
            title: 'Formulario reiniciado',
            timer: 1500,
            showConfirmButtons: false
          })
        })
      } else {
        // ❌ No generar, preguntar si quiere reiniciar
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
              observaciones: '',
              tipo: ''
            })
            setItems([])
            setPagos([{
              tipo: '', monto: 0, CH_n: '', Bco: '', cuit: '', date: new Date().toISOString().split('T')[0]
            }])
            Swal.fire({
              icon: 'success',
              title: 'Formulario reiniciado',
              timer: 1500,
              showConfirmButtons: false
            })
          }
        })
      }
    })
  }
  
  
  const calcularTotal = () => {
    return items.reduce((acc, item) => acc + item.cantidad * item.precio, 0)
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
        usd: producto.usd || false
      }
    ])
    setShowModal(false)
  }
  

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-lg md:text-2xl font-bold mb-2">Generar Presupuesto o Recibo</h2>
      {/* Tipo de documento y Fecha */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            value={tipoDocumento}
            onChange={e => setTipoDocumento(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="presupuesto">Presupuesto</option>
            <option value="recibo">Recibo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>
      </div>

      <h3 className="text-base md:text-xl font-bold mb-4">Datos Empresa</h3>
      <CargarEmpresaModal empresas={empresas} onEmpresaSeleccionada={(empresa) => {
          setEmpresa({
            nombre: empresa.nombre,
            direccion: empresa.direccion,
            mail: empresa.mail,
            telefono: empresa.telefono,
            cuil: empresa.cuil,
            tipo: empresa.tipo,
          });
      }}/>
      <Buttons
        className="col-span-1 md:col-span-2 w-40 m-2"
        onClick={() =>
          setEmpresa({
            nombre: '',
            direccion: '',
            mail: '',
            telefono: '',
            cuil: '',
            observaciones: '',
            tipo: ''
          })
        }
      >
        Limpiar Empresa
      </Buttons>

      {/* Empresa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {Object.keys(empresa).map((field) => (
          field !== 'observaciones' && field !== 'tipo'
            ?<input key={field} type="text" placeholder={field[0].toUpperCase() + field.slice(1)} value={empresa[field]} onChange={e => setEmpresa({ ...empresa, [field]: e.target.value })} className="border p-2 rounded" />
            :null     
          ))}
        <div>
          <select value={empresa.tipo} onChange={e => setEmpresa({ ...empresa, tipo: e.target.value })} className="border rounded p-2 w-full" >
            <option value="Responsable inscripto">Responsable inscripto</option>
            <option value="No Responsable">No Responsable</option>
            <option value="Exento">Exento</option>
            <option value="Monotributo">Monotributo</option>
            <option value="Monotributo Social">Monotributo Social</option>
            <option value="Consumidor Final">Consumidor Final</option>
          </select>
        </div>
      </div>
      {/* Solo visible si es Recibo */}
      {tipoDocumento === 'recibo' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Formas de Pago</label>
          {pagos.map((pago, index) => (
          <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 mb-4 border-b pb-2">
            <select value={pago.tipo} onChange={e => handlePagoChange(index, 'tipo', e.target.value)} className="border p-2 rounded w-full md:w-1/5" >
              <option value="" disabled>Seleccionar</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
              <option value="transferencia">Transferencia</option>
              <option value="retenciones">Retenciones</option>
            </select>

            <input type="number" placeholder="Monto" value={pago.monto} onChange={e => handlePagoChange(index, 'monto', e.target.value)} className="border p-2 rounded w-full md:w-1/5" />
              <>
                <input
                  type="text"
                  placeholder="CH N°"
                  value={pago.CH_n}
                  onChange={e => handlePagoChange(index, 'CH_n', e.target.value)}
                  className="border p-2 rounded w-full md:w-1/5"
                />
                <input
                  type="text"
                  placeholder="Bco"
                  value={pago.Bco}
                  onChange={e => handlePagoChange(index, 'Bco', e.target.value)}
                  className="border p-2 rounded w-full md:w-1/5"
                />
              </>

            <input
              type="date"
              value={pago.date}
              onChange={e => handlePagoChange(index, 'date', e.target.value)}
              className="border p-2 rounded w-full md:w-1/5"
            />

            <Buttons onClick={() => handleRemovePago(index)} className="text-red-500 hover:text-red-700 text-lg self-start md:self-center"
              aria-label="Eliminar forma de pago" > ✕ </Buttons>
          </div>
        ))}

          <Buttons onClick={handleAddPago} className="mt-2 text-sm text-blue-600 hover:underline">+ Agregar forma de pago</Buttons>
        </div>
      )}

      {/* Productos Solo visible si es Presupuesto */}
      {tipoDocumento === 'presupuesto' && ( 
        <>
          <h3 className="text-xl font-semibold mb-2">Productos</h3>
          {items.map((item, index) => (
            <div key={index} className="mb-4 border-b pb-2 sm:grid sm:grid-cols-5 sm:gap-2">
                <div className="mt-2 sm:mt-0 sm:col-span-5 flex justify-end">
                    <Buttons onClick={() => handleRemoveItem(index)} className="text-red-600 bg-inherit rounded-full px-1 text-sm font-extrabold hover:scale-110 hover:ring-1 hover:ring-red-500 hover:bg-red-500 hover:text-white">X</Buttons>
                </div>
                {/* Etiquetas solo visibles en móvil */}
                <div className="sm:hidden mb-2">
                    <label className="text-xs block mb-1">Cantidad</label>
                    <input
                    type="number"
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
                    value={item.precio}
                    onChange={e => handleItemChange(index, 'precio', e.target.value)}
                    className="border p-1 rounded w-full"
                    />
                </div>
                <div className="sm:hidden mb-2 text-right text-sm">
                    <span className="font-semibold">Total: </span>
                    {(item.cantidad * item.precio).toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 2
                    })}
                </div>

                {/* Vista para pantallas sm en adelante */}
                <input type="number" value={item.cantidad} onChange={e => handleItemChange(index, 'cantidad', e.target.value)} className="hidden sm:block border p-1 rounded w-full" />
                <input type="text" value={item.producto} onChange={e => handleItemChange(index, 'producto', e.target.value)} className="hidden sm:block border p-1 rounded w-full" />
                <input type="text" value={item.codigo} onChange={e => handleItemChange(index, 'codigo', e.target.value)} className="hidden sm:block border p-1 rounded w-full"/>
                <input type="number" value={item.precio} onChange={e => handleItemChange(index, 'precio', e.target.value)} className="hidden sm:block border p-1 rounded w-full" />
                <div className="hidden sm:flex items-center justify-end p-2 text-sm">
                    {(item.cantidad * item.precio).toLocaleString('es-AR', {
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
          <Buttons onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">ADD Manualmente</Buttons>
          <Buttons onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">ADD Producto</Buttons>
        </div>
        <div className="mt-6 text-right">
          <p className="text-lg font-bold">Total: {calcularTotal().toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 2
            })}
          </p>
        </div>

      </>
      )}
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
        <Buttons onClick={confirmarYGenerar} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Generar PDF</Buttons>
      </div>
    </div>
  )
}

export default Comprobantes

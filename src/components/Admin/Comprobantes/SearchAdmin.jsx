'use client'
import { useState } from "react"

const SearchInPresupuesto = ({ products, onSelect }) => {
    const [search, setSearch] = useState('')
  
    const filtered = products.filter(p => {
        const nombre = typeof p.nombre === 'string' ? p.nombre.toLowerCase() : '';
        const codigo = typeof p.codigo === 'string' ? p.codigo.toLowerCase() : '';
        return nombre.includes(search.toLowerCase()) || codigo.includes(search.toLowerCase());
      });
      
  
    return (
      <div>
        <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="border p-2 w-full mb-4"/>
        <ul className="max-h-64 overflow-y-auto">
          {filtered.map((prod, i) => (
            <li key={i} onClick={() => onSelect(prod)} className="cursor-pointer hover:bg-gray-100 p-2 border-b">
              <div className="font-semibold">{prod.nombre}</div>
              <div className="text-sm text-gray-600">Código: {prod.cod_producto}</div>
              <div className="text-sm text-gray-600">Precio: {prod.precio ? `$${prod.precio}` : 'Sin precio'}</div>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  export default SearchInPresupuesto
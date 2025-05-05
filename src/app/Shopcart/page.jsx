import React from 'react'
import dynamic from 'next/dynamic';

const ShopCart = dynamic(() => import("../../components/Tienda/ShoopingCart/ShopCart"));
const ClientLayout = dynamic(() => import("../ClientLayout"));


const Shopcart = () => {
  return (
    <ClientLayout title="Carrito de Consultas" className="flex flex-col h-screen">
      <main className="flex-1 flex items-center justify-center bg-white" >
        <ShopCart />
      </main>
    </ClientLayout>
  )
}

export default Shopcart
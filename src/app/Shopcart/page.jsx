import React from 'react'
import dynamic from 'next/dynamic';

const ShopCart = dynamic(() => import("../../components/Tienda/ShoopingCart/ShopCart"));
const ClientLayout = dynamic(() => import("../ClientLayout"));


const Shopcart = () => {
  return (
    <div className="flex flex-col h-screen">
      <ClientLayout title="Carrito de Consultas" >
        <main className="flex-grow" >
          <ShopCart />
        </main>
      </ClientLayout>
    </div>
  )
}

export default Shopcart
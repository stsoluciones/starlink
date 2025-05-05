import React from 'react'
import dynamic from 'next/dynamic';

const EnviosPage = dynamic(() => import( '../../components/Envios/EnviosPage'))
const ClientLayout = dynamic(() => import( '../ClientLayout'))

const Envios = () => {
  return (
    <ClientLayout title="Envios" className="flex flex-col h-screen"> 
      <main className="flex-1 flex items-center justify-center bg-white">
        <EnviosPage />
      </main>
    </ClientLayout>
  )
}

export default Envios
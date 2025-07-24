import React from 'react'
import dynamic from 'next/dynamic';

const EnviosPage = dynamic(() => import( '../../components/Envíos  /EnviosPage'))
const ClientLayout = dynamic(() => import( '../ClientLayout'))

const Envíos   = () => {
  return (
    <ClientLayout title="Envíos  " className="flex flex-col h-screen"> 
      <main className="flex-1 flex items-center justify-center bg-white">
        <EnviosPage />
      </main>
    </ClientLayout>
  )
}

export default Envíos  
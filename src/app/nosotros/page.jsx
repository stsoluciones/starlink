import React from 'react'
import dynamic from 'next/dynamic';

const NosotrosPage = dynamic(() => import( '../../components/SobreMi/NosotrosPage'))
const ClientLayout = dynamic(() => import( '../ClientLayout'))


const NosPage = () => {
  return (
    <ClientLayout title="Nosotros" className="flex flex-col h-screen">
      <main className="flex-1 flex items-center justify-center bg-white" >
          <NosotrosPage />
      </main>
    </ClientLayout>
  )
}

export default NosPage
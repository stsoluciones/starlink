import React from 'react'
import Link from 'next/link'
import {IoCartOutline} from 'react-icons/io5'

 const EmptyCart = () => {
  return (
    <div className='flex justify-center items-center '>
        <IoCartOutline size={150} className='mx-5' />
        <div className="flex flex-col items-start">
            <h1 className='text-xl font-semibold text-text-primary-title'>Tu carrito de consultas esta vacio</h1>
            <Link href='/#productos' className='text-text-primary-active mt-2 text-3xl' title='ir a buscar'>IR A BUSCAR</Link>
       </div>
    </div>
  )
}

export default EmptyCart
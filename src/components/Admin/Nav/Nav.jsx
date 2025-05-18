'use client'
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { removeFromLocalStorage } from '../../../Hooks/localStorage';
import Swal from 'sweetalert2';
import { logOutBack } from '../../../lib/firebase';

const DownloadCSVButton = dynamic(()=> import( '../../../components/DownloadCSVButton/DownloadCSVButton'))

export default function Nav({ handleSelectSection }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogOut = async () => {
    try {
      const result = await Swal.fire({
        icon: 'info',
        title: '¿Está seguro que quiere salir?',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        await logOutBack();
        removeFromLocalStorage('USER');
        await Swal.fire('Sesión cerrada con éxito', '', 'success');
        router.push('/');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Ocurrió un problema', 'error');
    }
  };

  return (
    <section className="border-gray-200 bg-[url('/bg/bg-banner.webp')]">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between flex-row-reverse mx-auto p-4">
        <Link href="/" className="flex items-center space-x-3" title="Volver al home">
          <Image
            src="/logos/logo.webp"
            width={64}
            height={64}
            className="rounded-full"
            alt="Logo eshop device"
            loading="lazy"
          />
        </Link>

        <button
          aria-label="Abrir menú"
          onClick={toggleMenu}
          type="button"
          className="p-2 w-10 h-10 text-sm bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="drawer-navigation"
          aria-expanded={isMenuOpen}
        >
          <svg className="w-5 h-5" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>
      </div>

      {/* Drawer */}
      <div
        id="drawer-navigation"
        className={`fixed top-0 left-0 z-50 h-screen p-4 overflow-y-auto transition-transform transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-primary w-64`}
        tabIndex="-1"
        aria-labelledby="drawer-navigation-label"
      >
        <h5 id="drawer-navigation-label" className="text-base font-semibold text-gray-200 uppercase">Menú</h5>

        <button
          aria-label="Cerrar menú"
          onClick={toggleMenu}
          className="bg-gray-300 text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg w-8 h-8 absolute top-2.5 right-2.5 flex items-center justify-center"
        >
          <svg className="w-3 h-3" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
        </button>

        <ul className="py-4 space-y-2 font-medium">
          <li>
            <button
              className="flex w-full items-center p-2 text-gray-200 rounded-lg hover:bg-primary-hover"
              onClick={() => {
                handleSelectSection('Productos');
                toggleMenu();
              }}
            >
              <span className="ml-3">Productos</span>
            </button>
          </li>

          <li>
            <button
              className="flex w-full items-center p-2 text-gray-200 rounded-lg hover:bg-primary-hover"
              onClick={() => {
                handleSelectSection('Destacados');
                toggleMenu();
              }}
            >
              <span className="ml-3">Productos destacados</span>
            </button>
          </li>

          <li>
            <DownloadCSVButton toggleMenu={toggleMenu} />
          </li>
              {/* Presupuestos */}
          <li>
              <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-primary-hover group" onClick={() => { handleSelectSection("Presupuestos"); toggleMenu()}} title='Presupuestos '>
                <span className="ml-3 text-gray-200">Presupuestos</span>
              </a>
            </li>

          <li>
            <Link
              href="/"
              className="flex items-center p-2 text-gray-200 rounded-lg hover:bg-primary-hover"
              onClick={toggleMenu}
            >
              <span className="ml-3">Regresar a la Web</span>
            </Link>
          </li>

          <li>
            <button
              className="flex w-full items-center p-2 text-gray-200 rounded-lg hover:bg-primary-hover"
              onClick={handleLogOut}
            >
              <span className="ml-3">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

import { removeFromLocalStorage } from '../../../Hooks/localStorage';
import { logOutBack } from '../../../lib/firebase';

const DownloadCSVButton = dynamic(() => import('../../DownloadCSVButton/DownloadCSVButton'));

// --- Componentes reutilizables ---
const NavItemButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <li>
    <button
      className="flex w-full items-center p-2 text-gray-200 rounded-lg hover:bg-primary-hover"
      onClick={onClick}
    >
      <span className="ml-3">{label}</span>
    </button>
  </li>
);

const NavItemLink = ({ label, href, onClick }: { label: string; href: string; onClick?: () => void }) => (
  <li>
    <Link
      href={href}
      className="flex items-center p-2 text-gray-200 rounded-lg hover:bg-primary-hover"
      onClick={onClick}
    >
      <span className="ml-3">{label}</span>
    </Link>
  </li>
);

export default function Nav({ handleSelectSection }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

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
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Ocurrió un problema', 'error');
    }
  };

  return (
    <section className="border-gray-200 bg-[url('/bg/bg-banner.webp')]">
      {/* Header */}
      <div className="max-w-screen-xl mx-auto p-4 flex flex-wrap items-center justify-between flex-row-reverse">
        <Link href="/" className="flex items-center space-x-3" title="Volver al home">
          <Image
            src="/logos/logo.webp"
            width={64}
            height={64}
            className="rounded-full"
            alt="Logo sls device"
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
        className={`fixed top-0 left-0 z-50 h-screen p-4 w-64 overflow-y-auto bg-primary transition-transform transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        tabIndex={-1}
        aria-labelledby="drawer-navigation-label"
      >
        <h5 id="drawer-navigation-label" className="text-base font-semibold text-gray-200 uppercase">Menú</h5>

        {/* Cerrar menú */}
        <button
          aria-label="Cerrar menú"
          onClick={toggleMenu}
          className="absolute top-2.5 right-2.5 w-8 h-8 flex items-center justify-center bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <svg className="w-3 h-3" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
        </button>

        {/* Menú items */}
        <ul className="py-4 space-y-2 font-medium">
          <NavItemButton label="Productos" onClick={() => { handleSelectSection('Productos'); toggleMenu(); }} />
          <NavItemButton label="Productos destacados" onClick={() => { handleSelectSection('Destacados'); toggleMenu(); }} />
          <NavItemButton label="Comprobantes" onClick={() => { handleSelectSection('Comprobantes'); toggleMenu(); }} />
          <NavItemButton label="Empresas" onClick={() => { handleSelectSection('Empresas'); toggleMenu(); }} />
          <NavItemButton label="Etiquetas Manuales" onClick={() => { handleSelectSection('Etiquetas'); toggleMenu(); }} />
          <NavItemButton label="Pedidos" onClick={() => { handleSelectSection('Pedidos'); toggleMenu(); }} />
          <NavItemLink label="Regresar a la Web" href="/" onClick={toggleMenu} />
          <li><DownloadCSVButton toggleMenu={toggleMenu} /></li>
          <NavItemButton label="Logout" onClick={handleLogOut} />
        </ul>
      </div>
    </section>
  );
}

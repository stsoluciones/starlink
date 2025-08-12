'use client'
import React, { useContext, useEffect, useState } from 'react';
import { removeFromLocalStorage, getInLocalStorage } from '../../Hooks/localStorage';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../../public/logos/logoSLS120.webp';
import UserMenu from './UserMenu';
import { IoCartOutline } from 'react-icons/io5';
import { CartContext } from '../Context/ShoopingCartContext';
import Swal from 'sweetalert2';
import useLinks from '../../components/constants/Links';
import { usePathname, useRouter } from 'next/navigation';
import { logOutBack } from '../../lib/firebase';

const NavBar = () => {
  const [cart, setCart] = useContext(CartContext);
  const Links = useLinks(); 
  const path =usePathname()
  const router = useRouter();

  const quantity = cart ? cart.reduce((acc, curr) => acc + curr.quantity, 0) : 0;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState('/');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getInLocalStorage('USER');
    setUser(userData);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (href) => {
    setCurrentLink(href);
  };

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
        setUser(null);
        await Swal.fire('Sesión cerrada con éxito', '', 'success');
        router.push('/');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Ocurrió un problema', 'error');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const handleGoToLogin = () => {
    router.push('/user/Login');
  };

  return (
    <section className="bg-white border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-2 py-1">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse rounded-full" title="starlinksoluciones Logo">
          <Image src={Logo.src} width={100} height={100} alt="starlinksolucionesLogo" title="starlinksoluciones Logo" loading='lazy' className='rounded-full w-16 lg:w-20 m-2' unoptimized={true}/>
        </Link>

        {/* Mobile menu and cart */}
        <div className="flex items-center gap-4 justify-between align-middle m-2">
          {/* User menu for mobile */}
          <div className="block md:hidden align-middle items-center">
            {user ? (
              <UserMenu user={user} toggleDropdown={toggleDropdown} isDropdownOpen={isDropdownOpen} handleLogOut={handleLogOut} />
            ) : (
              <button
                className="hidden text-primary font-semibold uppercase text-sm px-2"
                onClick={handleGoToLogin}
                title="Login usuario"
                aria-label="Login usuario"
              >
                Ingresar
              </button>
            )}
          </div>
          {/* Cart icon for mobile */}
          <Link href='/Shopcart' className="relative block md:hidden" title="Shopcart">
            <div className={` absolute px-2 m-1 text-white rounded-full right-[-10px] top-[-15px] ${quantity > 0 ? 'bg-primary hover:bg-primary-hover active:bg-primary-active block' : 'bg-transparent hidden'}`}>{quantity}</div>
            <IoCartOutline size={30} color="text-primary hover:text-primary-hover" />
          </Link>
          {/* Hamburger menu button */}
          <button
            aria-label="menu"
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-800 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-default"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-label="abrir menu" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>

        {/* Main navigation menu */}
        <article className={`w-full md:block md:w-auto ${isMenuOpen ? 'block' : 'hidden'}`} id="navbar-default">
          <ul className="flex flex-col p-4 md:p-0 mt-4 border items-center border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white text-sm md:text-md md:font-normal md:text-base">
            {Links?.map((link, key) => (
              <li key={key}>
                <Link href={link.href.startsWith('/') ? link.href : (path !== '/' ? '/' + link.href : link.href)} className={`block py-2 px-3 font-semibold text-primary hover:text-primary-hover ${currentLink === link.href ? 'text-primary hover:text-primary-hover font-bold' : 'text-gray-900'} rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:p-0 `} aria-current="page" onClick={() => handleLinkClick(link.href)} title={link.name.toUpperCase()}>
                  {link.name.toUpperCase()}
                </Link>
              </li>
            ))}
            {/* Desktop user buttons */}
            {!user ? (
              <button
                className="md:flex items-center justify-center text-normal uppercase text-primary font-semibold pt-2 md:py-2 align-middle md:text-base px-2"
                onClick={handleGoToLogin}
                title="Login usuario"
                aria-label="Login usuario"
              >
                Ingresar
              </button>
            ) : (
              <div className="hidden md:block">
                <UserMenu user={user} toggleDropdown={toggleDropdown} isDropdownOpen={isDropdownOpen} handleLogOut={handleLogOut} />
              </div>
            )}
            {/* Desktop cart icon */}
            <Link href='/Shopcart' className='relative' title='Carrito de compras'>
              <div className={`hidden md:block absolute text-white px-2 m-1 rounded-full right-[-10px] top-[-15px] ${quantity > 0 ? 'bg-primary hover:bg-primary-hover active:bg-primary-active block' : 'bg-transparent hidden'}`}>{quantity}</div>
              <IoCartOutline size={30} className='hidden md:block' color='text-primary hover:text-primary-hover' />
            </Link>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default NavBar;
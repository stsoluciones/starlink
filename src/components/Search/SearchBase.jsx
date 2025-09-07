 'use client';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useContext, useState, useEffect } from "react";
import { IoCartOutline } from 'react-icons/io5';
import { CartContext } from '../Context/ShoopingCartContext';
import Link from "next/link";

const SearchBase = ({ inputClassName = '', placeholder = 'Buscar...' }) => {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [isScrolled, setIsScrolled] = useState(false);
  const [cart] = useContext(CartContext);

  const quantity = cart?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set("search", searchInput);
      params.set("page", 1);
    } else {
      params.delete("search");
    }
    const newPath = path === '/Admin' ? '/Admin' : '/';
    router.push(`${newPath}?${params.toString()}#productos${newPath === '/Admin' ? 'Admin' : ''}`);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    const newPath = path === '/Admin' ? '/Admin' : '/';
    router.push(`${newPath}?${params.toString()}#productos${newPath === '/Admin' ? 'Admin' : ''}`);
  };

  const cartBadgeVisible = quantity > 0;
  const isHomePage = path === '/';
  const containerClass = `flex items-center justify-between max-w-xl mx-auto sticky top-0 z-40 my-4 ${
    isScrolled ? 'bg-white w-full rounded-lg shadow-md' : ''
  }`;

  return (
      <div id="searchSticky" className={containerClass}>
        <form id="formSearchBar" onSubmit={handleSearch} className={`relative flex-1 ${inputClassName}`}>
          <label htmlFor="default-search" className="sr-only">Buscar</label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              className="block w-full p-4 pl-10 text-sm border rounded-lg"
              placeholder={placeholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-24 bottom-2.5 text-black bg-red-500 font-medium rounded-lg text-sm px-2 py-2 hover:bg-gray-400"
                aria-label="Limpiar búsqueda"
              >
                X
              </button>
            )}
            <button
              type="submit"
              className="text-white absolute right-2.5 bottom-2.5 font-medium rounded-lg text-sm px-4 py-2 bg-primary hover:bg-primary-hover active:bg-primary-active"
              aria-label="buscar"
            >
              BUSCAR
            </button>
          </div>
        </form>
        {isHomePage && (
          <div className={`relative ${isScrolled ? 'block' : 'hidden'}`}>
            <Link href="/Shopcart" title="Ir al carrito de compras">
              {cartBadgeVisible && (
                <div className="absolute text-white px-2 m-1 rounded-full right-[10px] top-[-15px] bg-boton-primary hover:bg-boton-primary-hover active:bg-boton-primary-active">
                  {quantity}
                </div>
              )}
              <IoCartOutline size={30} className="mx-5" />
            </Link>
          </div>
        )}
      </div>
  );
};

export default SearchBase;

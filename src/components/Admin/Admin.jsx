'use client'
import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import newFetchProductos from '../../Hooks/useNewFetchProducts';
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import UpdateProduct from "./UpdateProduct/UpdateProduct";
import Comprobantes from "./Comprobantes/Comprobantes";
import AddProduct from "./AddProduct/AddProduct";
import EmpresaForm from "./Empresas/Empresas";
import Etiquetas from "./Etiquetas/Etiquetas";
import AdminPedidos from "./AdminPedidos/AdminPedidos";
import fetchFiltersData, { startAutoUpdateFilters } from "../../Hooks/useBrandsCategories";
import Usuarios from "./Usuarios/Usuarios";

// const Swal = dynamic(() => import("sweetalert2"), { ssr: false });
// const AddProduct = dynamic(() => import("./AddProduct/AddProduct"), { ssr: false });
// const UpdateProduct = dynamic(() => import("./UpdateProduct/UpdateProduct"), { ssr: false });
const Loading = dynamic(() => import("../Loading/Loading"), { ssr: false });
const SearchBase = dynamic(() => import("../Search/SearchBase"), { ssr: false });
const Nav = dynamic(() => import("./Nav/Nav"), { ssr: false });
const TablaDestacados = dynamic(() => import("./TablaDestacados/TablaDestacados"), { ssr: false });
const DownloadCSVButton = dynamic(() => import("../DownloadCSVButton/DownloadCSVButton"), { ssr: false });
const Pagination = dynamic(() => import("@mui/material").then((mod) => mod.Pagination), { ssr: false });


export default function Admin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClose, setIsModalClose] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [section, setSection] = useState('Pedidos')
  const [currentPage, setCurrentPage] = useState(1);
  const [productos, setProductos] = useState([]);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      const filters = await fetchFiltersData();
      setMarcas(filters.marcas);
      setCategorias(filters.categorias);
    };
  
    fetchFilters(); // Carga inicial de datos
  
    const intervalId = startAutoUpdateFilters(); // Guardamos el ID del intervalo
  
    return () => clearInterval(intervalId); // Limpiamos el intervalo al desmontar el componente
  }, []);
  

  const fetchProductos = async () => {
    const res = await newFetchProductos();
    const filteredProducts = searchQuery? res.filter(producto => producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())): res;
    setProductos(filteredProducts);
  };


  useEffect(() => {
    fetchProductos();
  }, [searchQuery]);


    const itemsPerPage = 20;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = productos.slice(startIndex, endIndex);

  const openModal = (type, product = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setIsModalClose(false);
    setModalType(type);
    if (type === 'update') {
      window.location.hash = 'update';
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsModalClose(true);
    window.history.pushState(null, null, ' ');
  };

  useEffect(() => {
    if (isModalClose) {
      fetchProductos(); // <-- Esto puede causar una actualización anidada
    }
    const handlePopState = () => {
      if (window.location.hash !== '#update' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isModalClose, isModalOpen]);


  const handleEliminarArchivos = async (producto) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Una vez eliminado, no podrás recuperar este producto ni sus imágenes asociadas.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const fotosAEliminar = [];

        Swal.fire({
          title: 'Eliminando producto...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        Object.keys(producto).forEach((key) => {
          if (key.startsWith('foto_') && producto[key]) {
            const imgPrevAEliminar = producto[key].split('/').pop().split('.')[0];
            const imgAEliminar = `Products/${imgPrevAEliminar}`;
            fotosAEliminar.push(imgAEliminar);
          }
        });

        await Promise.all(
          fotosAEliminar.map(async (imgAEliminar) => {
            const res = await fetch('api/deleteImage', {
              method: 'DELETE',
              body: JSON.stringify({ file: imgAEliminar })
            });
            const data = await res.json();
            return data;
          })
        );

        const resBDD = await fetch('api/deleteProduct', {
          method: 'DELETE',
          body: JSON.stringify({ id: producto._id })
        });
        const dataBDD = await resBDD.json();

        if (dataBDD.success) {
          fetchProductos();
          Swal.fire({
            icon: 'success',
            title: 'El producto ha sido eliminado correctamente.',
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          console.error('Error al eliminar el producto en la base de datos:', dataBDD.error);
          Swal.fire('Error', 'Ha ocurrido un error al intentar eliminar el producto.', 'error');
        }
      }
    } catch (error) {
      console.error('Error al eliminar las imágenes o producto:', error);
      Swal.fire('Error', 'Ha ocurrido un error al intentar eliminar el producto o sus imágenes.', 'error');
    }
  };

  const handleSelectSection = (section) => {
    setSection(section);
  };

const handleDiscount = async (descuento) => {
  if (typeof descuento !== 'number' || descuento <= 0 || descuento > 100) {
    Swal.fire('Error', 'Descuento inválido', 'error');
    return;
  }

  try {
    Swal.fire({
      title: 'Aplicando descuento...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await fetch('/api/updateDescuentoAll', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descuento }),
    });

    const data = await res.json();
    Swal.close();

    if (res.ok) {
      Swal.fire('Éxito', data.message, 'success');
      fetchProductos();
    } else {
      throw new Error(data.error || 'Error desconocido');
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudo aplicar el descuento', 'error');
  }
};

  return (
    <Suspense fallback={<Loading/>}>
      <div className="flex flex-col min-h-screen">
        <Nav handleSelectSection={handleSelectSection} />
        {section === 'Productos' && (
          <div>
            <section id="tablaProductosAdmin" className="bg-primary-background p-2 md:p-4 lg:p-6">
              <div className="mx-auto max-w-screen-xl px-0 lg:px-12">
                <div className="bg-white relative shadow-md sm:rounded-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div className="w-full md:w-1/2">
                      <SearchBase />
                    </div>
                    <div className="md:flex md:justify-end gap-3 grid grid-cols-5 w-full">
                      <div className="col-span-3">
                        <button type="button" aria-label="agregar producto" className="flex items-center text-white border bg-primary hover:bg-primary-hover active:bg-primary-active font-medium w-full justify-center rounded-lg h-10 text-xs xs:text-sm px-5 py-2 text-center " onClick={() => openModal('add')}>+  Agregar producto</button>
                        {isModalOpen && modalType === 'add' && (
                          <AddProduct toggleModal={closeModal} isOpenModal={isModalOpen} marca={marcas} categoria={categorias} />
                        )}
                      </div>
                    </div>
                    <div className="flex">
                      <label htmlFor="descuento" className="sr-only">Descuento</label>
                      <input
                        type="number"
                        id="descuento"
                        placeholder="Descuento"
                        step="0.01"
                        min="0"
                        max="90"
                        className="w-24 text-xs md:text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                      />
                      <button
                        type="button"
                        aria-label="Aplicar descuento"
                        className="flex items-center text-white border bg-primary hover:bg-primary-hover active:bg-primary-active font-medium w-full justify-center rounded-lg h-10 text-xs xs:text-sm px-5 py-2 text-center ms-2"
                        onClick={() => {
                          const descuentoInput = document.getElementById('descuento');
                          const descuento = parseFloat(descuentoInput.value.trim());

                          if (!isNaN(descuento) && descuento > 0 && descuento <= 90) {
                            handleDiscount(descuento);
                          } else {
                            Swal.fire({
                              title: 'Descuento inválido',
                              text: 'Por favor, ingresá un número válido entre 0 y 90.',
                              icon: 'error',
                              confirmButtonText: 'Aceptar'
                            });
                          }
                        }}
                      >
                        Aplicar
                      </button>
                    </div>

                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-base text-left text-gray-500" id="productosAdmin">
                      <thead className="text-xs text-gray-900 uppercase bg-gray-400">
                        <tr>
                          <th scope="col" className="px-1 py-2 md:px-4 md:py-3 text-center">Producto</th>
                          <th scope="col" className="px-1 py-2 md:px-4 md:py-3 text-center">Precio</th>
                          <th scope="col" className="px-1 py-2 md:px-4 md:py-3 text-center hidden md:table-cell">Categoría</th>
                          <th scope="col" className="px-1 py-2 md:px-4 md:py-3 text-center hidden md:table-cell">Marca</th>
                          <th scope="col" className="px-1 py-2 md:px-4 md:py-3 text-center hidden lg:table-cell">Descripción</th>
                          <th scope="col" className="px-1 py-2 md:px-4 md:py-3 text-center">Acción</th>
                        </tr>
                      </thead>
                      {paginatedProducts.length ? (
                        <tbody>
                          {paginatedProducts.map((product, index) => (
                            <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}`}>
                              <th scope="row" className="px-1 py-6 md:px-4 md:py-4 font-medium text-gray-900 whitespace-nowrap text-xs uppercase">{product.nombre.length > 20 ? `${product.nombre.slice(0, 20)}...` : product.nombre}</th>
                              <th scope="row" className="px-1 py-6 md:px-4 md:py-4 font-medium text-gray-900 whitespace-nowrap text-xs uppercase">{product.precio}{product.usd?'usd':'ar'}</th>
                              <td scope="row" className="px-1 py-6 md:px-4 md:py-4 hidden md:table-cell text-xs uppercase">{product.categoria}</td>
                              <td scope="row" className="px-1 py-6 md:px-4 md:py-4 hidden md:table-cell text-xs uppercase">{product.marca}</td>
                              <td scope="row" title={product.descripcion} className="px-1 py-1 md:px-4 md:py-3 text-center text-ellipsis hidden lg:table-cell text-xs uppercase">{product.descripcion.length > 50 ? `${product.descripcion.slice(0, 50)}...` : product.descripcion}</td>
                              <td scope="row" className="px-1 py-6 md:px-4 md:py-4">
                                <div className="flex justify-evenly items-center mx-1">
                                  <button aria-label="editar producto" id="updateProductButton" data-modal-target="updateProductModal" data-modal-toggle="updateProductModal"
                                    className="hidden md:flex px-3 py-2 text-xs items-center focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg me-2 " type="button" onClick={() => openModal('update', product)}>Editar</button>
                                  <button aria-label="Eliminar Producto" onClick={() => handleEliminarArchivos(product)} type="button" className="hidden md:flex px-3 py-2 text-xs focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg ">
                                    Eliminar
                                  </button>
                                  <button aria-label="editar producto" id="updateProductButton" data-modal-target="updateProductModal" data-modal-toggle="updateProductModal"
                                    className=" md:hidden px-3 py-2 text-xs items-center focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg me-2 " type="button" onClick={() => openModal('update', product)}>E</button>
                                  <button aria-label="Eliminar Producto" onClick={() => handleEliminarArchivos(product)} type="button" className=" md:hidden px-3 py-2 text-xs focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg ">X </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      ) : (
                        <tbody>
                          <tr className="text-center">
                            <td colSpan="5" className="py-10">
                              <span className="text-gray-500 font-semibold">No se encontraron productos.</span>
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </table>
                  </div>
                  <Pagination
                      count={Math.ceil(productos.length / itemsPerPage)}
                      page={currentPage}
                      onChange={(_, value) => handlePageChange(value)}
                      siblingCount={1}
                      boundaryCount={1}
                      size="medium"
                      variant="outlined"
                      shape="rounded"
                      aria-label="Paginación de productos"
                      title="Paginación de productos"
                    />
                </div>
              </div>
            </section>
            {isModalOpen && modalType === 'update' && selectedProduct && (
              <UpdateProduct toggleModal={closeModal} isOpenModal={isModalOpen} product={selectedProduct} marca={marcas} categoria={categorias} />
            )}
          </div>
        )}

        <div className="flex-1 bg-primary-background p-3 sm:p-5">
          {section === 'Destacados' && (
            <div className="mx-auto max-w-screen-xl lg:px-12">
              <TablaDestacados />
            </div>
          )}

          {section === 'DescargarCSV' && (
            <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
              <DownloadCSVButton />
            </div>
          )}
          {section === 'Comprobantes' && (
            <div className="mx-auto max-w-screen-xl px-1 md:px-4 lg:px-12">
              <Comprobantes />
            </div>
          )}
          {section === 'Empresas' && (
            <div className="mx-auto max-w-screen-xl px-1 md:px-4 lg:px-12">
              <EmpresaForm />
            </div>
          )}
          {section === 'Etiquetas' && (
            <div className="mx-auto max-w-screen-xl px-1 md:px-4 lg:px-12">
              <Etiquetas />
            </div>
          )}
          {section === 'Pedidos' && (
            <div className="mx-auto max-w-screen-xl px-1 md:px-4 lg:px-12">
              <AdminPedidos />
            </div>
          )}
          {section === 'Usuarios' && (
            <div className="mx-auto max-w-screen-xl px-1 md:px-4 lg:px-12">
              <Usuarios />
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
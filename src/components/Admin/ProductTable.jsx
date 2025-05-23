import React from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { Pagination } from "@mui/material";
import newFetchProductos from '../../Hooks/useNewFetchProducts';
import { useSearchParams } from "next/navigation";

const UpdateProduct = dynamic(() => import('./UpdateProduct/UpdateProduct'));

const ProductTable = ({ handleEliminarArchivos }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClose, setIsModalClose] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productos, setProductos] = useState([]);
  
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const { marcas: fetchedMarcas, categorias: fetchedCategorias } = useFetchFilters();

  useEffect(() => {
    if (fetchedMarcas && fetchedCategorias) {
      setMarcas(fetchedMarcas);
      setCategorias(fetchedCategorias);
    }
  }, [fetchedMarcas, fetchedCategorias]);


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
        fetchProductos();
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3">Imagen</th>
            <th scope="col" className="px-4 py-3">Nombre</th>
            <th scope="col" className="px-4 py-3">Marca</th>
            <th scope="col" className="px-4 py-3">Categoría</th>
            <th scope="col" className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((producto) => (
              <tr key={producto._id} className="bg-white border-b">
                <td className="px-4 py-3">
                  {producto.foto_1 ? (
                    <Image
                      src={producto.foto_1}
                      alt={producto.nombre}
                      width={50}
                      height={50}
                      className="rounded-lg"
                      title={producto.nombre}
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-gray-400">Sin imagen</span>
                  )}
                </td>
                <td className="px-4 py-3">{producto.nombre}</td>
                <td className="px-4 py-3">{producto.marca || "N/A"}</td>
                <td className="px-4 py-3">{producto.categoria || "N/A"}</td>
                <td className="px-4 py-3 flex space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" onClick={() => openModal(producto, "#update")}>E</button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" onClick={() => openModal(producto, "#update")}>E</button>

                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleEliminarArchivos(producto)}>X</button>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded" onClick={() => handleEliminarArchivos(producto)}>X</button>

                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No hay productos disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isModalOpen && selectedProduct && (
        <UpdateProduct
          product={selectedProduct}
          onClose={closeModal}
          isOpenModal={isModalOpen}
          marca={brands}
          categoria={categories}
          onUpdate={fetchProducts} 
        />
      )}
      {paginatedProducts.length > 0 && (
        <div className="flex justify-center mt-4">
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
      )}
    </div>
  );
};

export default ProductTable;

import Card from '../Card/Card';
import SkeletonCard from '../Card/SkeletonCard';
import { useMediaQuery, Pagination } from "@mui/material";


const Cards = ({ 
  productos, 
  handleProductSelect,
  isLoading,
  currentPage, 
  handlePageChange 
 }) => {

  const isMobile = useMediaQuery("(max-width: 767px)");
  const itemsPerPage = isMobile ? 8 : 9;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = productos.slice(startIndex, endIndex);

  return (
      <section>
            <nav aria-label="Paginación de productos" className="flex flex-col md:flex-row justify-center my-4 gap-4 items-center">
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
            </nav>
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-2 py-1 w-full mx-auto md:max-w-7xl px-2 sm:px-6 lg:px-8 justify-items-center">
              {isLoading ? (
                    <>
                        {[...Array(9)].map((_, i) => (
                            <li key={i} className="w-full">
                                <SkeletonCard />
                            </li>
                        ))}
                    </>
                ) : paginatedProducts.length > 0 ? ( // Solo renderiza las tarjetas si hay productos
                  paginatedProducts.map((product, i) => (
                      <li key={i}>
                        <Card key={product.cod_producto} product={product} handleProductSelect={handleProductSelect} />
                      </li>
                    ))
                ) : (
                <li className="w-full md:w-1/2 lg:w-1/3"> {/* Ocupa todo el ancho en pantallas pequeñas, la mitad en medianas y un tercio en grandes */}
                    <div className="flex flex-col justify-center items-center mx-4 mt-6 px-20 py-10 border rounded-md shadow-lg bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" className="w-10 h-10" viewBox="0 0 24 24">
                          <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm3.707 10.707L12 11.414l-1.707 1.707-1.414-1.414L10.586 10 8.879 8.293l1.414-1.414L12 8.586l1.707-1.707 1.414 1.414L13.414 10l1.707 1.707-1.414 1.414z"/>
                        </svg>
                        <p className="text-gray-800 font-semibold">No se encontraron productos que coincidan con tu búsqueda.</p>
                    </div>
                </li>
              )}
            </ul>
            <div className="lg:pt-14 xl:pt-10">

            <nav aria-label="Paginación de productos" className="flex flex-col md:flex-row justify-center my-4 gap-4 items-center">
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
            </nav>
                </div>
      </section>
  );
  
};

export default Cards;

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
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-1 w-full mx-auto md:max-w-7xl px-2 sm:px-6 lg:px-8 justify-items-center">
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
                      <svg fill="#000000" className="w-10 h-10" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" >
                        <path d="m9 4.45-2 2-2-2-1 1 2 2-2 2 1 1 2-2 2 2 2 1-1-2-2 2-2zm2.77 6.63c.77-1.01 1.23-2.27 1.23-3.63 0-3.31-2.69-6-6-6s-6 2.69-6 6 2.69 6 6 6c1.37 0 2.63-.46 3.64-1.24l2.79 2.79 1.13-1.13zm-4.87.76c-2.48 0-4.49-2.02-4.49-4.5s2.02-4.5 4.49-4.5 4.5 2.02 4.5 4.5-2.03 4.5-4.5 4.5z" />
                      </svg>
                        <p className="text-gray-800 font-semibold">No se encontraron productos que coincidan con tu búsqueda.</p>
                    </div>
                </li>
              )}
            </ul>
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
      </section>
  );
  
};

export default Cards;

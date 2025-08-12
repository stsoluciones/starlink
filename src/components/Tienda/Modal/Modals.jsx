'use client'
import { useContext, useState } from 'react';
import { CartContext } from '../../../components/Context/ShoopingCartContext';
import addToCart from '../../../Utils/addToCart';
import userData from '../../../components/constants/userData';
import ProductoDetalle from './ProductoDetalle';
import handleShare from '../../../Utils/handleShare';
import Destacados from '../../Destacados/Destacados';


const Modal = ({ selectedProduct, closeModal, isDialog = true }) => {

  const [cart, setCart] = useContext(CartContext);
  const [mainImage, setMainImage] = useState(selectedProduct.foto_1_1);

  // Array de miniaturas filtrando las imágenes no disponibles
  const thumbnails = [
    { src: selectedProduct.foto_1_1, alt: `${selectedProduct.nombre} - miniatura 1` },
    { src: selectedProduct.foto_1_2, alt: `${selectedProduct.nombre} - miniatura 2` },
    { src: selectedProduct.foto_1_3, alt: `${selectedProduct.nombre} - miniatura 3` },
    { src: selectedProduct.foto_1_4, alt: `${selectedProduct.nombre} - miniatura 4` },
  ].filter((img) => img.src);

  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(selectedProduct, cart, setCart);
  };
  const handleClose = closeModal || (() => setIsOpen(false));

  const texto = `Hola, quería consultar por ${selectedProduct.nombre} (${selectedProduct.cod_producto}), `;
  const enviar = `https://wa.me/+${userData.codigoPais}${userData.contact}?text=${encodeURIComponent(
    texto || userData.textoPredefinido
  )}`;

  return (
    <>
      {isDialog ? (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-hidden"
        >
          <div className={`bg-white p-2 rounded-none lg:rounded-lg max-w-6xl w-full max-h-full overflow-y-auto ${selectedProduct.vendido ? "rounded-t-lg w-full bg-black opacity-95 grayscale" : ''}`}>
            <article className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 bg-gray-200 hover:bg-gray-300 hover:text-gray-500 rounded-lg text-sm w-10 h-10 ms-auto inline-flex justify-center items-center"
                aria-label="Cerrar la ventana"
                title="Cerrar ventana"
              >
                <svg
                  className="w-4 h-4"
                  aria-label="flecha para cerrar"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>
            </article>
            <ProductoDetalle
              selectedProduct={selectedProduct}
              mainImage={mainImage}
              handleThumbnailClick={handleThumbnailClick}
              thumbnails={thumbnails}
              handleShare={(e)=>handleShare(e,selectedProduct)}
              handleAddToCart={handleAddToCart}
          />
          <Destacados />
          </div>
        </section>
      ) : (
        <div className="max-w-6xl w-full mx-auto my-10">
          <ProductoDetalle
              selectedProduct={selectedProduct}
              mainImage={mainImage}
              handleThumbnailClick={handleThumbnailClick}
              thumbnails={thumbnails}
              handleShare={(e)=>handleShare(e,selectedProduct)}
              handleAddToCart={handleAddToCart}
          />
        </div>
      )}
    </>
  );

};

export default Modal;

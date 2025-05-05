'us client'
import { useState, useCallback, useEffect } from 'react';

const useProductModal = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = useCallback(() => {
    setSelectedProduct(null);
    setIsModalOpen(false);
    window.history.pushState(null, '', window.location.pathname + window.location.search);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    window.location.hash = 'producto';
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash !== '#update' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isModalOpen, closeModal]);

  return { selectedProduct, isModalOpen, closeModal, handleProductSelect };
};

export default useProductModal;

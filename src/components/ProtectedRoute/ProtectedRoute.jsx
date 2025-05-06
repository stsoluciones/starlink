'use client'
import { useEffect, useState } from 'react';
import Loading from '../Loading/Loading';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false); // ya redirige el middleware
  }, []);

  return isLoading ? <Loading ancho='120px' alto='120px' /> : children;
};

export default ProtectedRoute;

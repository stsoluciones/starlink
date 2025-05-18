// hooks/useEmpresas.ts
import { useEffect, useState } from 'react';

const useEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);

  const fetchEmpresas = async () => {
    const res = await fetch('/api/empresa');
    const data = await res.json();
    setEmpresas(data);
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return { empresas, fetchEmpresas };
};

export default useEmpresas;

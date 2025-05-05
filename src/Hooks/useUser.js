import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../pages/api/firebase'; // Asegúrate de la ruta correcta
import { setInLocalStorage } from '../Hooks/localStorage'; 

const useUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
      setUser(usuarioFirebase);
      if (usuarioFirebase) {
        setInLocalStorage('USER', usuarioFirebase);
      } else {
        localStorage.removeItem('USER');
      }
    });

    return () => unsubscribe();
  }, []);

  return user;
};

export default useUser;

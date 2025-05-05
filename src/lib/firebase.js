import {
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
  } from 'firebase/auth';
  import { auth } from '../../pages/api/firebase'; 
  
  //------------------ Auth --------------------///
  
  // Iniciar sesión con usuario y contraseña
  export const signIn = async (data) => {
    const { email, contraseña } = data;
    return await signInWithEmailAndPassword(auth, email, contraseña);
  }
  
  // Crear un nuevo usuario con email y contraseña
  export const signUp = async (data) => {
    const { email, contraseña } = data;
    return await createUserWithEmailAndPassword(auth, email, contraseña);
  }
  
  // Iniciar sesión con Google
  export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  }
  
  // Cerrar sesión
  export const logOut = () => {
    signOut(auth);
    return { message: 'Cerró la sesión exitosamente' };
  }
  
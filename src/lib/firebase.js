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
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, contraseña);
    return userCredential;  // Retorna el objeto completo con el usuario autenticado
  } catch (error) {
    throw new Error(error.message);  // Maneja y lanza el error para capturarlo en el frontend
  }
}

// Crear un nuevo usuario con email y contraseña
export const signUp = async (data) => {
  const { email, contraseña } = data;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, contraseña);
    return userCredential;  // Retorna el objeto completo con el nuevo usuario
  } catch (error) {
    throw new Error(error.message);  // Maneja y lanza el error para capturarlo en el frontend
  }
}

// Iniciar sesión con Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result;  // Retorna el resultado de la autenticación con Google
  } catch (error) {
    throw new Error(error.message);  // Maneja y lanza el error para capturarlo en el frontend
  }
}

// Cerrar sesión
export const logOut = async () => {
  try {
    await signOut(auth);
    return { message: 'Cerró la sesión exitosamente' };
  } catch (error) {
    throw new Error(error.message);  // Maneja y lanza el error si ocurre algún problema al cerrar sesión
  }
}

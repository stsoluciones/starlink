//----------------LocalStorage------------///
'use client'
// Función para guardar un elemento del localStorage
export const setInLocalStorage = (key,value)=>{
  return localStorage.setItem(key,JSON.stringify(value))
}

// Función para pedir un elemento del localStorage
export const getInLocalStorage = (key) => {
  try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null; // Devuelve `null` si no existe
  } catch (error) {
      console.error(`Error al parsear ${key} desde localStorage:`, error);
      return null; // Devuelve `null` en caso de error
  }
};

// Función para eliminar un elemento del localStorage
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    //console.log(`Clave "${key}" eliminada de localStorage.`);
  } catch (error) {
    console.error(`Error al eliminar "${key}" de localStorage:`, error);
  }
};

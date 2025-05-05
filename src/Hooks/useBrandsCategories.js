import { getInLocalStorage, setInLocalStorage } from "../Hooks/localStorage";

const fetchFiltersData = async () => {
  try {
    const lastUpdate = getInLocalStorage("filters_timestamp");
    const now = Date.now();

    // Si han pasado menos de 3 minutos, evita la petición innecesaria
    if (lastUpdate && now - lastUpdate < 3 * 60 * 1000) {
      //console.log("Usando filtros almacenados en localStorage");
      return getInLocalStorage("filters");
    }

    const res = await fetch("/api/brandsCategories");

    if (!res.ok) {
      throw new Error("Error al cargar los filtros");
    }

    const data = await res.json();
    setInLocalStorage("filters", data);
    setInLocalStorage("filters_timestamp", now); // Guardamos el tiempo de actualización
    //console.log("Filtros actualizados:", data);

    return data;
  } catch (error) {
    console.error("Error en fetchFiltersData:", error);
    return { marcas: [], categorias: [] };
  }
};

// Función para iniciar la actualización automática
export const startAutoUpdateFilters = () => {
  fetchFiltersData(); // Carga inicial

  const intervalId = setInterval(() => {
    fetchFiltersData();
  }, 3 * 60 * 1000); // Cada 3 minutos

  return intervalId; // Devolvemos el ID del intervalo por si es necesario limpiarlo
};

export default fetchFiltersData;

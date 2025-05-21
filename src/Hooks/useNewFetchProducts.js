import { getInLocalStorage, setInLocalStorage } from "../Hooks/localStorage";

const newFetchProductos = async () => {
    try {
        const lastUpdate = getInLocalStorage("productos_timestamp");
        const now = Date.now();

        // Si han pasado menos de 3 minutos, usa los productos almacenados
        if (lastUpdate && now - lastUpdate < 3 * 60 * 1000) {
            const productosGuardados = getInLocalStorage("productos");
            if (productosGuardados) {
                return productosGuardados;
            }
        }

        // Si no hay productos o han pasado más de 3 minutos, hacer la petición
        const res = await fetch("/api/productos");
        //console.log('res:', res);
        
        if (!res.ok) {
            throw new Error("Error al cargar los productos");
        }

        const data = await res.json();
        setInLocalStorage("productos", data.productos);
        setInLocalStorage("productos_timestamp", now); // Guardamos el tiempo de actualización

        return data.productos;
    } catch (error) {
        console.error("Error en newFetchProductos:", error);
        return [];
    }
};

// Función para iniciar la actualización automática de productos
export const startAutoUpdateProductos = () => {
    newFetchProductos(); // Carga inicial

    const intervalId = setInterval(() => {
        newFetchProductos();
    }, 3 * 60 * 1000); // Cada 3 minutos

    return intervalId; // Devolvemos el ID del intervalo por si es necesario limpiarlo
};

export default newFetchProductos;

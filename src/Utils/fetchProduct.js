const fetchProduct= async(nombre) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productos/${nombre}`, {
      cache: "no-store", // Evita caché y asegura datos frescos
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return null;
  }
}

export default fetchProduct;
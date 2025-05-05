import toast from 'react-hot-toast';

const addToCart = (product, cart, setCart) => {  
    // Verificamos si el producto ya existe en el carrito actual
    const isProductInCart = cart.some(item => item.cod_producto === product.cod_producto);
    if (isProductInCart) {
      toast.error(`El producto ${product.nombre}, cod:${product.cod_producto} ya se encuentra en el carrito.`);
      return;
    }
    setCart((currItems) => {
      return [...currItems, { ...product, quantity: 1 }];
    });
    toast.success(`Agregando ${product.nombre}, cod:${product.cod_producto} al carrito.`);
};

export default addToCart;

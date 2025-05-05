const handleShare = async (arg1, arg2) => {
  if (arg1 instanceof File) {
    // Caso: compartir un archivo
    const file = arg1;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Presupuesto',
          text: 'Te envío el presupuesto en PDF',
          files: [file]
        });
      } catch (error) {
        console.error('Error al compartir archivo:', error);
      }
    } else {
      // Fallback si no soporta compartir archivos
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      alert('Tu navegador no permite compartir archivos. El PDF fue descargado.');
    }
  } else {
    // Caso: compartir producto con evento + datos
    const e = arg1;
    const product = arg2;

    e.preventDefault();
    e.stopPropagation();

    const productUrl = `${window.location.origin}/productos/${product.nombre.replace(/\s+/g, '_')}`;
    const shareData = {
      title: product.nombre,
      text: `Mira este producto: ${product.nombre} - ${product.marca} - ${product.precio ? `Precio: ${product.precio}${product.usd ? 'usd' : 'ar'}` : ''}`,
      url: productUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        alert('Enlace copiado al portapapeles');
      } catch (error) {
        console.error('Error al copiar el enlace:', error);
      }
    }
  }
};

export default handleShare;

const processSingleImage = (imageFile, mode = 'padding') => {
  const targetSize = 400;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = targetSize;
      canvas.height = targetSize;

      if (mode === 'padding') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetSize, targetSize);

        const ratio = Math.min(targetSize / img.width, targetSize / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        const xOffset = (targetSize - newWidth) / 2;
        const yOffset = (targetSize - newHeight) / 2;

        ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
      } else if (mode === 'crop') {
        const side = Math.min(img.width, img.height);
        const offsetX = (img.width - side) / 2;
        const offsetY = (img.height - side) / 2;

        ctx.drawImage(img, offsetX, offsetY, side, side, 0, 0, targetSize, targetSize);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const processedFile = new File([blob], 'image.webp', { type: 'image/webp' });
          resolve(processedFile);
        } else {
          reject(new Error('Error al procesar la imagen'));
        }
      }, 'image/webp', 0.8);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};
export default processSingleImage;
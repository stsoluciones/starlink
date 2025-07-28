'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Box, Button } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  textAlign: 'center',
  borderRadius: '10px',
};

export default function UploadImageEditor({ imageFile, open, onClose, onImageProcessed }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [imageFile]);

  const processImage = (image, mode = 'padding') => {
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
            const processedFile = new File([blob], image.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
            });
            resolve(processedFile);
          } else {
            reject(new Error('Error al procesar la imagen'));
          }
        }, 'image/webp', 0.9);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(image);
    });
  };

  const handleProcess = async (mode) => {
    try {
      const result = await processImage(imageFile, mode);
      onImageProcessed(result);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} display="flex" flexDirection="column" alignItems="center">
        <h2 className='text-primary font-bold my-2'>¿Cómo querés ajustar esta imagen?</h2>
        {preview && (
          <img
            src={preview}
            alt="Previsualización"
            style={{ maxWidth: '100%', maxHeight: 300, marginBottom: 16 }}
            className='rounded-lg shadow-md self-center'
          />
        )}
        <Box display="flex" justifyContent="space-around" m={2} p={1} gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleProcess('padding')}
          >
            Agregar bandas blancas
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleProcess('crop')}
          >
            Recortar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

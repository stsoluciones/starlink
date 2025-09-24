'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Box, Button } from '@mui/material';
import NextImage from 'next/image';
import Loading from '../Loading/Loading';
import { set } from 'mongoose';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  textAlign: 'center',
  borderRadius: '10px',
  p: {
    xs: 1,   // móviles: 8px
    md: 3,   // desde 900px en adelante: 24px
  },
};

export default function UploadImageEditor({ imageFile, open, onClose, onImageProcessed }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreview(objectUrl);
      setLoading(false);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [imageFile]);

  const processImage = (image, mode = 'padding') => {
    const targetSize = 400;

    return new Promise((resolve, reject) => {
      const img = new window.Image();
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
      const tmpUrl = URL.createObjectURL(image);
      img.src = tmpUrl;
      // Liberar el objeto URL temporal una vez cargado o si hay error
      const cleanup = () => URL.revokeObjectURL(tmpUrl);
      img.onload = ((origOnload) => (e) => { cleanup(); origOnload(e); })(img.onload);
      img.onerror = ((origOnError) => (e) => { cleanup(); origOnError(e); })(img.onerror);
    });
  };

  const handleProcess = async (mode) => {
    try {
      setLoading(true);
      const result = await processImage(imageFile, mode);
      onImageProcessed(result);
      setLoading(false);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} display="flex" flexDirection="column" alignItems="center">
        <h2 className='text-primary font-bold my-2'>¿Cómo querés ajustar esta imagen?</h2>
        {preview && (
          <NextImage
            src={preview}
            alt="Previsualización"
            style={{ maxWidth: '100%', maxHeight: 300, marginBottom: 16 }}
            className='rounded-lg shadow-md self-center'
            unoptimized={true}
            width={400}
            height={400}
          />
        )}
        <Box display="flex" justifyContent="space-around" m={2} p={1} gap={2}>
          {loading && <p className='text-secondary self-center'><Loading /></p>}
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleProcess('padding')}
              sx={{
                fontSize: {
                  xs: '0.75rem', // text-xs
                  md: '1rem',    // text-base
                  },
                }}
          >
            bandas blancas
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleProcess('crop')}
            sx={{
                fontSize: {
                  xs: '0.75rem', // text-xs
                  md: '1rem',    // text-base
                  },
                }}
          >
            Recortar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

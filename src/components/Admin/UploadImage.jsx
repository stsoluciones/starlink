'use client'
import React, { useState } from "react";
import { Button, styled } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import processImage from "../../Utils/proccesImage";
import NextImage from 'next/image';
import Image from 'next/image';
import UploadImageEditor from './UploadImageEditor';

export default function UploadImage({ imagenes, updateImages, handleRemoveImage }) {
    const [archivoNoValido, setArchivoNoValido] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
// Inicializar el estado con URLs y archivos
  const [archivos, setArchivos] = useState(
    imagenes
      .filter(Boolean) // Filtrar elementos vacíos
      .map((img) => ({
        name:  typeof img ==='string' && img.split('/').pop(), // Extraer el nombre del archivo desde la URL
        preview: img,
        isURL: true,
      }))
  );
  
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });
  
  // Verificar si la imagen tiene una relación de aspecto 1:1
  const isAspectRatioOneToOne = (image, tolerance = 0.02) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const isOneToOne = Math.abs(ratio - 1) < tolerance;
        resolve(isOneToOne);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(image);
    });
  };

  // Manejar la selección de archivos
  const handleArchivoSeleccionado = async (e) => {
    const fileList = Array.from(e.target.files);

    // Calcular cuántos espacios quedan
    const espacioDisponible = 4 - archivos.length;

    if (espacioDisponible <= 0) {
      toast.error("Ya alcanzaste el límite de 4 fotos.");
      return;
    }

    if (fileList.length > espacioDisponible) {
      toast.error(`Solo podés subir ${espacioDisponible} imagen${espacioDisponible === 1 ? '' : 'es'} más.`);
      return;
    }

    const nuevosArchivos = [];

    for (let i = 0; i < fileList.length; i++) {
      let archivo = fileList[i];

      if (!archivo.type.startsWith("image/")) {
        toast.error("Solo se pueden cargar archivos de imagen.");
        continue;
      }

      // Convertir HEIC a JPEG si es necesario
      const isHEIC =
        archivo.type === "image/heic" ||
        archivo.type === "image/heif" ||
        archivo.name.endsWith(".heic") ||
        archivo.name.endsWith(".heif");

      if (isHEIC) {
        try {
          const heic2any = (await import("heic2any")).default;
          const convertedBlob = await heic2any({ blob: archivo, toType: "image/jpeg" });
          archivo = new File([convertedBlob], archivo.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: "image/jpeg",
          });
        } catch (error) {
          console.error("Error al convertir HEIC a JPEG:", error);
          toast.error("Error al convertir archivo HEIC.");
          continue;
        }
      }

      const yaExiste = archivos.some((a) => a.name === archivo.name);
      if (yaExiste) continue;

      const isOneToOne = await isAspectRatioOneToOne(archivo, 0.02);
      if (!isOneToOne) {
        Swal.close(); // cerrar loader si estaba abierto
        setArchivoNoValido(archivo);
        setModalOpen(true);
        return; // detener la carga y esperar a que el usuario edite
      }

      Swal.fire({
        title: "Cargando...",
        text: "Subiendo imagen(es), por favor espere.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const procesado = await processImage([archivo]);
      const imagenFinal = procesado[0];
      imagenFinal.preview = URL.createObjectURL(imagenFinal);
      const res = await submitUpdateImage(imagenFinal);

      if (res) nuevosArchivos.push(res);
    }

    const actualizados = [...archivos, ...nuevosArchivos];
    setArchivos(actualizados);
    updateImages(actualizados);
    Swal.close();
  };

    const handleImageProcesada = async (imagenAjustada) => {
      imagenAjustada.preview = URL.createObjectURL(imagenAjustada);
      const res = await submitUpdateImage(imagenAjustada);
      const nuevos = [...archivos, res];
      setArchivos(nuevos);
      updateImages(nuevos.map((a) => a));
      setModalOpen(false);
      setArchivoNoValido(null);
    };

  // Manejar la eliminación de archivos
  const handleEliminarArchivo = async (index) => {
    const [imgPrevAEliminar] = archivos.filter((_, i) => i === index)[0].name.split('.');
    const imgAEliminar = `Products/${imgPrevAEliminar}`;

    Swal.fire({
      title: 'Eliminando...',
      text: 'Eliminando imagen, por favor espere.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const res = await fetch('api/deleteImage', {
        method: 'DELETE',
        body: JSON.stringify({ file: imgAEliminar }) // Correctly pass the image to be deleted
    });

    const data = await res.json();
    
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    const archivoAEliminar = archivos[index];
    if (!archivoAEliminar.isURL && archivoAEliminar.preview) {
      URL.revokeObjectURL(archivoAEliminar.preview);
    }
    handleRemoveImage(index);

    setArchivos(nuevosArchivos);
    updateImages(nuevosArchivos.map(archivo => archivo));

    Swal.close();
  };

  // Manejar la visualización de archivos
  const handleVerArchivo = (archivo) => {
    if (archivo.preview) {
      window.open(archivo.preview);
    } else {
      window.open(URL.createObjectURL(archivo));
    }
  };


  const submitUpdateImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const res = await fetch('/api/uploadImage', { // Asegúrate de que la ruta sea correcta
        method: 'POST',
        body: formData
      });
  
      if (!res.ok) throw new Error('Error al subir imagen');
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error en submitUpdateImage:', error);
      return null;
    }
  };
  

  return (
    <div>
      <ToastContainer
        className="toast-container"
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex mt-[10px]">
        <Button
          component="label"
          role={undefined}
          variant="outlined"
          tabIndex={-1}
        >
          Subir Archivo
          <VisuallyHiddenInput type="file" multiple onChange={handleArchivoSeleccionado} />
        </Button>
      </div>
      <UploadImageEditor
        open={modalOpen}
        imageFile={archivoNoValido}
        onClose={() => {
          setModalOpen(false);
          setArchivoNoValido(null);
        }}
        onImageProcessed={handleImageProcesada}
      />
      {archivos.length !== 0 && (
        <div className="relative pb-[50px] bg-white mt-[20px] rounded-md ">
          <div className="grid grid-cols-4 gap-4">
            {archivos.map((archivo, index) => (
              <div key={index} className="relative shadow-md rounded-lg">
                {/* Vista previa de la imagen */}
                <Image
                  src={archivo.preview || URL.createObjectURL(archivo)}
                  alt={archivo.name}
                  className="w-full object-cover cursor-pointer h-36 max-w-full rounded-lg"
                  onClick={() => handleVerArchivo(archivo)}
                  loading='lazy'
                  title={archivo.name}
                  height={144}
                  width={144}
                />

                 <Button
                    type="button"
                    aria-label="eliminar archivo"
                    onClick={() => handleEliminarArchivo(index)}
                    aria-controls="drawer-navigation"
                    className="absolute top-1 right-1 cursor-pointer bg-gray-300 text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg text-sm w-6 h-6  inline-flex items-center justify-center "
                  >
                    <svg
                      className="w-3 h-3"
                      aria-label="eliminar archivo"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                  </Button>

              </div>
            ))}
          </div>
         
        </div>
      )}
    </div>
  );
}
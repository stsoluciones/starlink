'use client' // por windows y document
import React from 'react';

const DownloadCSVButton = ({toggleMenu}) => {
  const handleDownload = () => {
    fetch('/api/download-csv')
      .then((response) => {
        if (response.status === 200) {
          return response.blob();
        } else {
          throw new Error('Error al descargar el archivo CSV');
        }
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'productos.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => console.error('Error al descargar el archivo CSV:', error));
  };

  return (
    <button
    aria-label="descargar base de datos"
      onClick={() => {
        handleDownload();
        toggleMenu();
      }}
      className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-primary  group"
    >
      <svg
        className="w-5 h-5 text-gray-400"
        aria-label="Descargar"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 16 18"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
        />
      </svg>
      <span className="ml-3 text-gray-200 ">Descargar CSV</span>
    </button>
  );
};

export default DownloadCSVButton;

import { createRoot } from 'react-dom/client';
import FormularioDireccion from './FormularioDireccion';
import Swal from 'sweetalert2';

export const solicitarNuevaDireccion = () => {
  return new Promise((resolve) => {
    Swal.fire({
      html: '<div id="form-direccion-envio"></div>',
      showConfirmButton: false,
      didOpen: () => {
        const root = document.getElementById('form-direccion-envio');
        const container = document.createElement('div');
        root.appendChild(container);

        const rootReact = createRoot(container);
        rootReact.render(
          <FormularioDireccion onSubmit={(data) => {resolve(data); Swal.close();}} onCancel={() => {resolve(null); Swal.close();}}/>
        );
      }
    });
  });
};

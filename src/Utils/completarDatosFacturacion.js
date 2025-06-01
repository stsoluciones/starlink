import { createRoot } from 'react-dom/client';
import Swal from 'sweetalert2';
import FormularioFactura from '../components/Perfil/FormularioFactura';

const completarDatosFacturacion = async (user, setUser) => {
  try {
    // 1. Obtener datos actuales del usuario
    const userResponse = await fetch(`/api/usuarios/${user.uid}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Error al obtener datos del usuario');
    }

    const userData = await userResponse.json();
    
    // 2. Verificar campos obligatorios
    const requiredFields = {
      personales: ['nombreCompleto', 'telefono', 'dniOCuit'],
      direccion: ['pais', 'provincia', 'ciudad', 'calle', 'numero', 'codigoPostal']
    };

    const missingPersonalFields = requiredFields.personales.filter(
      field => !userData[field] || userData[field]?.trim() === ''
    );

    const missingAddressFields = requiredFields.direccion.filter(
      field => !userData.direccion?.[field] || userData.direccion[field]?.trim() === ''
    );

    const allMissingFields = [...missingPersonalFields, ...missingAddressFields];
    
    // Si no faltan campos, retornar el usuario actual
    if (allMissingFields.length === 0) {
      return userData;
    }

    // Calcular progreso
    const totalRequiredFields = [...requiredFields.personales, ...requiredFields.direccion].length;
    const completedFields = totalRequiredFields - allMissingFields.length;
    const progress = Math.round((completedFields / totalRequiredFields) * 100);

    // Mostrar modal para completar datos
    const { value: action } = await Swal.fire({
      title: 'Datos incompletos',
      html: `
        <div>
          <p>Para continuar con la compra, completa tu información:</p>
          <div class="w-full bg-gray-200 rounded-full h-4 mb-4 mt-4">
            <div class="bg-blue-600 h-4 rounded-full" style="width: ${progress}%"></div>
          </div>
          <p class="text-sm text-gray-600">${completedFields}/${totalRequiredFields} campos (${progress}%)</p>
          ${allMissingFields.length > 0 ? `<p class="text-xs text-red-500 mt-2">Faltan: ${allMissingFields.join(', ')}</p>` : ''}
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Completar ahora',
      cancelButtonText: 'Cancelar compra',
      reverseButtons: true
    });

    if (!action) {
      throw new Error('Compra cancelada: datos incompletos');
    }
    let root;
    // Mostrar formulario modal
    const updatedUser = await new Promise((resolve) => {
    Swal.fire({
      title: 'Completa tus datos',
      html: `<div id="formulario-envio-container"></div>`,
      showConfirmButton: false,
      showCancelButton: false,
      width: '800px',
      willOpen: () => {
        const container = document.getElementById('formulario-envio-container');
        if (container) {
          root = createRoot(container);
          root.render(
            <FormularioFactura
              user={userData}
              missingFields={allMissingFields}
              onCancel={() => {
                Swal.close();
                resolve(null);
              }}
              onSubmit={async (formData) => {
                try {
                  const response = await fetch(`/api/usuarios/${user.uid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                    credentials: 'include'
                  });

                  if (!response.ok) throw new Error('Error al guardar');

                  const updatedUser = await response.json();
                  setUser(updatedUser);
                  Swal.close();
                  resolve(updatedUser);
                } catch (error) {
                  Swal.fire('Error', 'No se pudieron guardar los datos', 'error');
                  resolve(null);
                }
              }}
            />
          );
        }
      },
      willClose: () => {
        if (root) {
          root.unmount();
        }
      }
    });
    });

    if (!updatedUser) {
      throw new Error('No se completaron los datos requeridos');
    }

    return updatedUser;

  } catch (error) {
    console.error('Error en completarDatosUser:', error);
    throw error;
  }
};

export default completarDatosFacturacion;
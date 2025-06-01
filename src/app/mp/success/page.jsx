// app/mp/success/page.js
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function SuccessPage() {
  const router = useRouter();
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const payment_id = urlParams.get('payment_id');
        const preference_id = urlParams.get('preference_id');
        
        if (!payment_id || !preference_id) {
          throw new Error('Faltan parámetros de pago');
        }
        
        // Verificar el pago con tu backend
        const { data } = await axios.post('/api/pedidos/verificar-pago', {
          paymentId: payment_id,
          preferenceId: preference_id
        });
        
        if (data.order.estado === 'pagado') {
          await Swal.fire({
            icon: 'success',
            title: '¡Pago exitoso!',
            text: 'Tu pago ha sido procesado correctamente.',
            confirmButtonText: 'Ver mis pedidos'
          });
          
          router.push('/mis-pedidos');
        } else {
          throw new Error('El pago no ha sido aprobado aún');
        }
      } catch (error) {
        console.error('Error verificando pago:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error al verificar pago',
          text: error.message || 'Ocurrió un error al verificar tu pago',
          confirmButtonText: 'Volver al inicio'
        });
        
        router.push('/');
      }
    };
    
    verifyPayment();
  }, [router]);
  
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Procesando tu pago...</h1>
      <p>Por favor espera mientras verificamos el estado de tu transacción.</p>
    </div>
  );
}
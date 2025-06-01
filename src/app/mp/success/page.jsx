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
        
        if (!payment_id) {
          throw new Error('No se encontró el ID de pago en la URL');
        }

        const { data } = await axios.post('/api/pedidos/verificar-pago', {
          paymentId: payment_id,
          preferenceId: preference_id
        }, {
          timeout: 10000 // 10 segundos de timeout
        });

        if (!data.success) {
          throw new Error(data.error || 'Error al verificar el pago');
        }

        if (data.order.estado === 'pagado') {
          await Swal.fire({
            icon: 'success',
            title: '¡Pago exitoso!',
            text: 'Tu pago ha sido procesado correctamente.',
            confirmButtonText: 'Ver mis pedidos'
          });
          router.push('/mis-pedidos');
        } else {
          await Swal.fire({
            icon: 'info',
            title: 'Pago pendiente',
            text: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
            confirmButtonText: 'Entendido'
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Error verificando pago:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error al verificar pago',
          text: error.response?.data?.error || error.message || 'Ocurrió un error',
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
// app/mp/success/page.js
useEffect(() => {
  const verifyPayment = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const payment_id = urlParams.get('payment_id');
      
      if (!payment_id) {
        throw new Error('Missing payment_id in URL');
      }

      // First verify endpoint exists
      const endpointCheck = await fetch('/api/pedidos/verificar-pendientes', {
        method: 'OPTIONS'
      });
      
      if (!endpointCheck.ok) {
        throw new Error(`Endpoint returned ${endpointCheck.status}`);
      }

      // Then make the actual request
      const { data } = await axios.post(
        '/api/pedidos/verificar-pendientes', 
        { paymentId: payment_id },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      // Handle successful payment
      if (data.order.estado === 'pagado') {
        await Swal.fire({
          icon: 'success',
          title: '¡Pago exitoso!',
          text: 'Tu pago ha sido procesado correctamente.',
          confirmButtonText: 'Ver mis pedidos'
        });
        router.push('/Dashboard');
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
      console.error('Payment verification error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error de verificación',
        html: `No se pudo confirmar tu pago:<br>
               <small>${error.response?.data?.error || error.message}</small>`,
        confirmButtonText: 'Reintentar'
      }).then((result) => {
        result.isConfirmed ? window.location.reload() : router.push('/');
      });
    }
  };
  
  verifyPayment();
}, [router]);
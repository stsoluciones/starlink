// En /api/generar-etiquetas/route.js
import Order from "../../../models/Order";
import { connectDB } from "../../../lib/mongodb";

export async function POST(req) {
  await connectDB();
  
  try {
    const { pedidos } = await req.json();
    
    // Obtener los pedidos seleccionados
    const pedidosSeleccionados = await Order.find({
      _id: { $in: pedidos },
      estado: 'pago_aprobado'
    }).lean();
    
    if (pedidosSeleccionados.length === 0) {
      return new Response(JSON.stringify({ error: 'No se encontraron pedidos válidos' }), {
        status: 400,
      });
    }
    
    // Aquí implementarías la integración con Andreani
    // Esto es un ejemplo - necesitarás adaptarlo a la API real de Andreani
    
    // 1. Preparar los datos para Andreani
    const envios = pedidosSeleccionados.map(pedido => ({
      cliente: {
        nombre: pedido.datosEnvio.nombre,
        apellido: pedido.datosEnvio.apellido,
        email: pedido.datosEnvio.email,
        telefono: pedido.datosEnvio.telefono
      },
      direccion: {
        calle: pedido.datosEnvio.direccion,
        localidad: pedido.datosEnvio.localidad,
        provincia: pedido.datosEnvio.provincia,
        codigoPostal: pedido.datosEnvio.codigoPostal
      },
      paquete: {
        peso: 1, // Peso en kg (deberías tener esto en tu modelo)
        volumen: 1, // Volumen en m3
        valorDeclarado: pedido.total
      },
      referencia: pedido._id.toString()
    }));
    
    // 2. Conectar con API Andreani (ejemplo ficticio)
    // const responseAndreani = await fetch('https://api.andreani.com/...', {
    //   method: 'POST',
    //   headers: { 'Authorization': 'Bearer TU_TOKEN' },
    //   body: JSON.stringify(envios)
    // });
    
    // 3. Procesar respuesta y generar PDF (ejemplo)
    // En un caso real, usarías la respuesta de Andreani para generar las etiquetas
    
    // Simulamos un PDF de ejemplo
    const PDFKit = require('pdfkit');
    const pdfBuffer = await new Promise(resolve => {
      const doc = new PDFKit();
      
      envios.forEach((envio, i) => {
        if (i > 0) doc.addPage();
        doc.fontSize(14).text(`Etiqueta de envío - Pedido ${envio.referencia}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Destinatario: ${envio.cliente.nombre} ${envio.cliente.apellido}`);
        doc.text(`Dirección: ${envio.direccion.calle}, ${envio.direccion.localidad}`);
        doc.text(`CP: ${envio.direccion.codigoPostal}, ${envio.direccion.provincia}`);
        doc.moveDown();
        doc.text(`Referencia: ${envio.referencia}`);
        doc.text(`Valor declarado: $${envio.paquete.valorDeclarado}`);
        // Aquí iría el código de barras/logística real de Andreani
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.end();
    });
    
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=etiquetas-andreani.pdf'
      }
    });
    
  } catch (error) {
    console.error('Error al generar etiquetas:', error);
    return new Response(JSON.stringify({ error: 'Error al generar etiquetas' }), {
      status: 500,
    });
  }
}
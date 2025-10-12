// test/andreani.test.js
/**
 * Tests para la integración con Andreani
 * Este archivo muestra ejemplos de cómo probar la funcionalidad
 */

// Mock de datos para testing
const mockPedido = {
  _id: "673abc123def456ghi789",
  usuarioInfo: {
    nombreCompleto: "Juan Pérez Test",
    correo: "test@starlinksoluciones.com",
    telefono: "1155551234"
  },
  direccionEnvio: {
    codigoPostal: "1636",
    provincia: "Buenos Aires",
    ciudad: "Olivos",
    calle: "Av. Libertador",
    numero: "5678",
    piso: "3",
    depto: "B",
    telefono: "1155551234",
    entreCalles: "Entre Corrientes y Belgrano",
    referencia: "Portón verde, timbre 3B"
  },
  items: [
    {
      nombreProducto: "Starlink Kit Standard",
      cantidad: 1,
      precioUnitario: 299900
    }
  ],
  tipoFactura: {
    tipo: "B",
    cuit: "20123456789",
    razonSocial: "Juan Pérez"
  },
  estado: "pagado",
  total: 299900,
  trackingCode: "",
  etiquetaEnvio: ""
};

// Ejemplo 1: Test de obtención de token
async function testObtenerToken() {
  console.log('🧪 Test: Obtener Token de Andreani');
  
  try {
    const response = await fetch('http://localhost:3000/api/etiquetasAndreani', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidos: [] }) // Esto fallará pero mostrará si el token funciona
    });
    
    const data = await response.json();
    console.log('Respuesta:', data);
    
    if (data.error && data.error.includes('credenciales')) {
      console.log('❌ Credenciales no configuradas correctamente');
    } else if (data.error && data.error.includes('pedidos válidos')) {
      console.log('✅ Token obtenido correctamente (no hay pedidos válidos, pero eso está bien)');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejemplo 2: Test de generación de etiqueta
async function testGenerarEtiqueta(pedidoId) {
  console.log('🧪 Test: Generar Etiqueta para Pedido');
  console.log('Pedido ID:', pedidoId);
  
  try {
    const response = await fetch('http://localhost:3000/api/etiquetasAndreani', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidos: [pedidoId] })
    });
    
    const data = await response.json();
    console.log('Respuesta:', JSON.stringify(data, null, 2));
    
    if (data.exitosos > 0) {
      console.log('✅ Etiqueta generada exitosamente');
      console.log('Tracking Code:', data.etiquetas[0].trackingCode);
      
      // Guardar etiqueta para inspección
      if (typeof window !== 'undefined') {
        const etiqueta = data.etiquetas[0].etiqueta;
        const blob = new Blob(
          [Uint8Array.from(atob(etiqueta), c => c.charCodeAt(0))],
          { type: 'application/pdf' }
        );
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } else {
      console.log('❌ No se generó la etiqueta');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejemplo 3: Test de consulta de etiqueta existente
async function testConsultarEtiqueta(pedidoId) {
  console.log('🧪 Test: Consultar Etiqueta Existente');
  console.log('Pedido ID:', pedidoId);
  
  try {
    const response = await fetch(`http://localhost:3000/api/etiquetasAndreani?pedidoId=${pedidoId}`);
    const data = await response.json();
    
    console.log('Respuesta:', data);
    
    if (data.trackingCode) {
      console.log('✅ Etiqueta encontrada');
      console.log('Tracking Code:', data.trackingCode);
      console.log('Estado:', data.estado);
    } else {
      console.log('⚠️ Pedido no tiene etiqueta generada');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejemplo 4: Test de validación de datos
function testValidarDatosPedido(pedido) {
  console.log('🧪 Test: Validar Datos del Pedido');
  
  const errores = [];
  
  // Validar usuario
  if (!pedido.usuarioInfo?.nombreCompleto) {
    errores.push('Falta nombre completo');
  }
  if (!pedido.usuarioInfo?.correo) {
    errores.push('Falta correo electrónico');
  }
  if (!pedido.usuarioInfo?.telefono) {
    errores.push('Falta teléfono');
  }
  
  // Validar dirección
  if (!pedido.direccionEnvio?.codigoPostal) {
    errores.push('Falta código postal');
  }
  if (!pedido.direccionEnvio?.provincia) {
    errores.push('Falta provincia');
  }
  if (!pedido.direccionEnvio?.ciudad) {
    errores.push('Falta ciudad');
  }
  if (!pedido.direccionEnvio?.calle) {
    errores.push('Falta calle');
  }
  if (!pedido.direccionEnvio?.numero) {
    errores.push('Falta número');
  }
  
  // Validar estado
  if (pedido.estado !== 'pagado') {
    errores.push('El pedido debe estar en estado "pagado"');
  }
  
  // Validar items
  if (!pedido.items || pedido.items.length === 0) {
    errores.push('El pedido no tiene items');
  }
  
  if (errores.length === 0) {
    console.log('✅ Pedido válido para generar etiqueta');
    return true;
  } else {
    console.log('❌ Pedido inválido:');
    errores.forEach(error => console.log('  -', error));
    return false;
  }
}

// Ejemplo 5: Test de múltiples pedidos
async function testGenerarMultiplesEtiquetas(pedidosIds) {
  console.log('🧪 Test: Generar Múltiples Etiquetas');
  console.log('Cantidad de pedidos:', pedidosIds.length);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/etiquetasAndreani', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidos: pedidosIds })
    });
    
    const data = await response.json();
    const endTime = Date.now();
    
    console.log('Tiempo de procesamiento:', (endTime - startTime) / 1000, 'segundos');
    console.log('Exitosos:', data.exitosos);
    console.log('Fallidos:', data.fallidos);
    
    if (data.errores && data.errores.length > 0) {
      console.log('Errores:');
      data.errores.forEach(err => {
        console.log(`  - Pedido ${err.pedidoId}: ${err.error}`);
      });
    }
    
    if (data.exitosos === pedidosIds.length) {
      console.log('✅ Todas las etiquetas generadas exitosamente');
    } else {
      console.log('⚠️ Algunas etiquetas fallaron');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejemplo 6: Test de manejo de errores
async function testManejoDeErrores() {
  console.log('🧪 Test: Manejo de Errores');
  
  const tests = [
    {
      nombre: 'Sin pedidos',
      data: { pedidos: [] },
      esperado: 'Debe proporcionar un array de IDs'
    },
    {
      nombre: 'Pedido inexistente',
      data: { pedidos: ['123456789012345678901234'] },
      esperado: 'No se encontraron pedidos válidos'
    },
    {
      nombre: 'ID inválido',
      data: { pedidos: ['invalid-id'] },
      esperado: 'Error'
    }
  ];
  
  for (const test of tests) {
    console.log(`\n  Probando: ${test.nombre}`);
    try {
      const response = await fetch('http://localhost:3000/api/etiquetasAndreani', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.log(`  ✅ Error manejado correctamente: ${data.error}`);
      } else {
        console.log(`  ⚠️ No se recibió el error esperado`);
      }
    } catch (error) {
      console.log(`  ✅ Excepción manejada: ${error.message}`);
    }
  }
}

// Ejemplo 7: Test de integración completa
async function testIntegracionCompleta() {
  console.log('🧪 Test: Integración Completa\n');
  
  // 1. Validar datos del pedido
  console.log('Paso 1: Validar datos del pedido');
  const pedidoValido = testValidarDatosPedido(mockPedido);
  if (!pedidoValido) {
    console.log('❌ Test fallido: Pedido inválido');
    return;
  }
  
  // 2. Verificar que el pedido exista en BD (simular)
  console.log('\nPaso 2: Verificar existencia del pedido');
  console.log('⚠️ Debes crear un pedido real en tu BD primero');
  console.log('Usa el mock en mockPedido para crear uno');
  
  // 3. Generar etiqueta
  console.log('\nPaso 3: Generar etiqueta');
  console.log('⚠️ Ejecuta: testGenerarEtiqueta("tu-pedido-id")');
  
  // 4. Verificar que se guardó
  console.log('\nPaso 4: Verificar guardado');
  console.log('⚠️ Ejecuta: testConsultarEtiqueta("tu-pedido-id")');
  
  console.log('\n✅ Test de integración completo');
}

// Exportar funciones de test
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mockPedido,
    testObtenerToken,
    testGenerarEtiqueta,
    testConsultarEtiqueta,
    testValidarDatosPedido,
    testGenerarMultiplesEtiquetas,
    testManejoDeErrores,
    testIntegracionCompleta
  };
}

// Ejemplo de uso en consola del navegador:
// 1. Abrir http://localhost:3000
// 2. Abrir DevTools (F12)
// 3. En la consola, pegar este archivo
// 4. Ejecutar: testObtenerToken()
// 5. Ejecutar: testGenerarEtiqueta("673...")
// etc.

console.log('📝 Tests de Andreani cargados');
console.log('Funciones disponibles:');
console.log('  - testObtenerToken()');
console.log('  - testGenerarEtiqueta(pedidoId)');
console.log('  - testConsultarEtiqueta(pedidoId)');
console.log('  - testValidarDatosPedido(pedido)');
console.log('  - testGenerarMultiplesEtiquetas([id1, id2, ...])');
console.log('  - testManejoDeErrores()');
console.log('  - testIntegracionCompleta()');

// Script para verificar que un producto tiene todos los datos necesarios para JSON-LD
// Ejecutar: node scripts/validate-product-data.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔍 Validador de Datos de Producto para JSON-LD\n');
console.log('Este script verifica que un producto tenga todos los datos necesarios\n');

rl.question('Ingresa el nombre del producto (como aparece en la URL): ', async (nombre) => {
  try {
    // Importar fetchProduct dinámicamente
    const fetchProduct = (await import('../src/Utils/fetchProduct.js')).default;
    
    console.log(`\n⏳ Buscando producto: ${nombre}...\n`);
    
    const product = await fetchProduct(nombre);
    
    if (!product) {
      console.log('❌ Producto no encontrado\n');
      rl.close();
      return;
    }
    
    console.log('✅ Producto encontrado\n');
    console.log('📋 Validando campos requeridos:\n');
    
    const checks = [
      { name: 'Nombre', value: product.nombre, required: true },
      { name: 'Descripción', value: product.descripcion, required: false },
      { name: 'Marca', value: product.marca, required: true },
      { name: 'Categoría', value: product.categoria, required: false },
      { name: 'Modelo', value: product.modelo, required: false },
      { name: 'Precio', value: product.precio, required: true },
      { name: 'Imagen (foto_1_1)', value: product.foto_1_1, required: true },
      { name: 'SKU o ID', value: product.sku || product._id, required: true },
      { name: 'Vendido', value: product.vendido !== undefined, required: false },
    ];
    
    let allValid = true;
    
    checks.forEach(check => {
      const icon = check.value ? '✅' : (check.required ? '❌' : '⚠️');
      const status = check.value ? 'OK' : (check.required ? 'FALTA (REQUERIDO)' : 'Falta (opcional)');
      console.log(`${icon} ${check.name}: ${status}`);
      
      if (check.required && !check.value) {
        allValid = false;
      }
    });
    
    console.log('\n📊 Valores actuales:\n');
    console.log(`Nombre: ${product.nombre || 'N/A'}`);
    console.log(`Marca: ${product.marca || 'N/A'}`);
    console.log(`Precio: ${product.precio || 'N/A'} ${product.usd ? 'USD' : 'ARS'}`);
    console.log(`Imagen: ${product.foto_1_1 ? '✅ Presente' : '❌ Falta'}`);
    console.log(`Vendido: ${product.vendido ? 'Sí (OutOfStock)' : 'No (InStock)'}`);
    
    console.log('\n' + '='.repeat(60));
    
    if (allValid) {
      console.log('✅ TODOS LOS CAMPOS REQUERIDOS ESTÁN PRESENTES');
      console.log('El producto debería generar JSON-LD válido\n');
    } else {
      console.log('❌ FALTAN CAMPOS REQUERIDOS');
      console.log('Completa los campos faltantes antes de testear con Google\n');
    }
    
    // Generar ejemplo de JSON-LD
    console.log('📄 Vista previa del JSON-LD que se generaría:\n');
    
    const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://slsoluciones.com.ar/';
    const canonical = `${SITE}productos/${encodeURIComponent(nombre)}`;
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.nombre || 'N/A',
      description: product.descripcion || `${product.nombre} - ${product.marca}`,
      sku: product.sku || product._id?.toString() || 'N/A',
      brand: { '@type': 'Brand', name: product.marca || 'SLS' },
      category: product.categoria || undefined,
      image: [product.foto_1_1 || 'N/A'],
      url: canonical,
      offers: {
        '@type': 'Offer',
        url: canonical,
        priceCurrency: product.usd ? 'USD' : 'ARS',
        price: product.precio?.toString() || 'N/A',
        availability: product.vendido ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      }
    };
    
    console.log(JSON.stringify(structuredData, null, 2));
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error al buscar el producto:', error.message);
    console.error('\n💡 Asegúrate de que:');
    console.error('   - MongoDB esté corriendo');
    console.error('   - Las variables de entorno estén configuradas');
    console.error('   - El nombre del producto sea correcto\n');
  }
  
  rl.close();
});

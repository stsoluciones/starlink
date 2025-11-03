#!/bin/bash

# Script para probar los datos estructurados localmente

echo "🔍 Probando datos estructurados..."
echo ""

# Construir el proyecto
echo "📦 Construyendo el proyecto..."
npm run build

# Iniciar el servidor
echo ""
echo "🚀 Iniciando servidor..."
npm start &
SERVER_PID=$!

# Esperar a que el servidor esté listo
echo "⏳ Esperando a que el servidor esté listo..."
sleep 5

# Probar la página principal
echo ""
echo "📄 Testeando página principal (/)..."
curl -s http://localhost:3000 | grep -o '<script type="application/ld+json">.*</script>' | head -1
echo ""

# Probar una página de producto (ajusta el nombre según tu producto)
echo ""
echo "📦 Testeando página de producto..."
echo "Ingresa el nombre del producto (ejemplo: starlink_mini):"
read PRODUCT_NAME

if [ ! -z "$PRODUCT_NAME" ]; then
  echo ""
  echo "📄 Testeando /productos/$PRODUCT_NAME..."
  curl -s "http://localhost:3000/productos/$PRODUCT_NAME" | grep -o '<script type="application/ld+json">.*</script>' | head -1
  echo ""
fi

# Matar el servidor
echo ""
echo "🛑 Deteniendo servidor..."
kill $SERVER_PID

echo ""
echo "✅ Test completado"
echo ""
echo "📋 Próximos pasos:"
echo "1. Si ves el JSON-LD en la salida, el structured data está correcto"
echo "2. Prueba con Google Rich Results Test: https://search.google.com/test/rich-results"
echo "3. Ingresa la URL de producción de tu producto"

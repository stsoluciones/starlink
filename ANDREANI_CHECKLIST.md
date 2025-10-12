# ✅ Checklist de Implementación Andreani

## 📋 Pre-implementación

### Obtener Credenciales
- [ ] Contactar a Andreani para solicitar credenciales
- [ ] Obtener `ANDREANI_CLIENT_ID`
- [ ] Obtener `ANDREANI_CLIENT_SECRET`
- [ ] Obtener `ANDREANI_CLIENT_NUMBER` (Número de contrato)
- [ ] Confirmar acceso al ambiente sandbox

### Preparar Datos de la Empresa
- [ ] Tener CUIT de la empresa
- [ ] Dirección completa de origen (para despachos)
- [ ] Código postal del punto de origen
- [ ] Teléfono de contacto
- [ ] Email de contacto

---

## 🔧 Configuración Inicial

### Variables de Entorno
- [ ] Abrir archivo `.env` en la raíz del proyecto
- [ ] Agregar/completar las siguientes líneas:
  ```env
  ANDREANI_CLIENT_ID=tu_client_id_aqui
  ANDREANI_CLIENT_SECRET=tu_client_secret_aqui
  ANDREANI_CLIENT_NUMBER=tu_numero_de_contrato
  ```
- [ ] Guardar el archivo
- [ ] Verificar que `.env` esté en `.gitignore`

### Configurar Datos de Origen
- [ ] Abrir `src/lib/andreani.js`
- [ ] Buscar la sección `origen` (línea ~55)
- [ ] Actualizar con tu dirección:
  ```javascript
  origen: {
    postal: {
      codigoPostal: "1636", // TU código postal
      calle: "Mitre",       // TU calle
      numero: "1234",       // TU número
      localidad: "Olivos",  // TU localidad
      region: "AR-B",       // TU provincia (ver tabla)
      pais: "Argentina"
    }
  }
  ```
- [ ] Guardar el archivo

### Configurar Datos del Remitente
- [ ] En el mismo archivo, buscar la sección `remitente` (línea ~88)
- [ ] Actualizar con tus datos:
  ```javascript
  remitente: {
    nombreCompleto: "Starlink Soluciones", // TU empresa
    email: "info@tuempresa.com",           // TU email
    documentoTipo: "CUIT",
    documentoNumero: "20123456789",        // TU CUIT
    telefonos: [{
      tipo: 1,
      numero: "1140000000"                 // TU teléfono
    }]
  }
  ```
- [ ] Guardar el archivo

---

## 🧪 Testing en Sandbox

### Preparar Ambiente de Desarrollo
- [ ] Verificar que `NODE_ENV` sea `development` o no esté definido
- [ ] Reiniciar el servidor: `npm run dev`
- [ ] Verificar que el servidor esté corriendo en `http://localhost:3000`

### Test de Credenciales
- [ ] Abrir la consola del navegador (F12)
- [ ] Copiar el contenido de `test/andreani.test.js`
- [ ] Pegar en la consola del navegador
- [ ] Ejecutar: `testObtenerToken()`
- [ ] Verificar que no haya error de credenciales

### Crear Pedido de Prueba
- [ ] Ir a la tienda: `http://localhost:3000`
- [ ] Agregar productos al carrito
- [ ] Completar el proceso de compra
- [ ] Anotar el ID del pedido creado

### Actualizar Pedido a "Pagado"
- [ ] Ir al Dashboard Admin
- [ ] Buscar el pedido de prueba
- [ ] Cambiar estado a "pagado"

### Test de Generación de Etiqueta
- [ ] En Admin → Pedidos
- [ ] Seleccionar el pedido de prueba
- [ ] Click en "Generar Etiquetas Andreani"
- [ ] Verificar que aparezca el modal de carga
- [ ] Esperar a que termine el proceso
- [ ] Verificar que se descargue el PDF

### Validar Resultado
- [ ] Abrir el PDF descargado
- [ ] Verificar que tenga:
  - [ ] Código de barras
  - [ ] Dirección de origen correcta
  - [ ] Dirección de destino correcta
  - [ ] Tracking code
- [ ] En la BD, verificar que el pedido tenga:
  - [ ] `trackingCode` lleno
  - [ ] `etiquetaEnvio` lleno
  - [ ] Estado "enviado"

---

## 🚀 Testing con Múltiples Pedidos

### Crear Varios Pedidos
- [ ] Crear 3-5 pedidos de prueba
- [ ] Cambiar todos a estado "pagado"

### Test de Generación Masiva
- [ ] Seleccionar múltiples pedidos
- [ ] Click en "Generar Etiquetas Andreani"
- [ ] Verificar que se procesen todos
- [ ] Verificar que se descarguen todos los PDFs

### Validar Manejo de Errores
- [ ] Intentar generar etiqueta para pedido "pendiente"
- [ ] Verificar mensaje de error apropiado
- [ ] Intentar generar etiqueta sin seleccionar pedidos
- [ ] Verificar mensaje de advertencia

---

## 🔍 Validación de Datos

### Verificar Campos Requeridos en Pedidos
- [ ] Todos los pedidos tienen `usuarioInfo.nombreCompleto`
- [ ] Todos los pedidos tienen `usuarioInfo.correo`
- [ ] Todos los pedidos tienen `usuarioInfo.telefono`
- [ ] Todos los pedidos tienen `direccionEnvio.codigoPostal`
- [ ] Todos los pedidos tienen `direccionEnvio.provincia`
- [ ] Todos los pedidos tienen `direccionEnvio.ciudad`
- [ ] Todos los pedidos tienen `direccionEnvio.calle`
- [ ] Todos los pedidos tienen `direccionEnvio.numero`

### Validar Formato de Datos
- [ ] Código postal es string de 4 dígitos
- [ ] Provincia usa nombre completo ("Buenos Aires" no "Bs As")
- [ ] Teléfono tiene formato válido
- [ ] CUIT tiene formato válido (11 dígitos)

---

## 📊 Monitoreo y Logs

### Configurar Logs
- [ ] Abrir la consola del servidor (terminal)
- [ ] Verificar que aparezcan logs cuando se genera etiqueta
- [ ] Logs esperados:
  ```
  Generando etiquetas para pedidos: ['673abc...']
  Token de Andreani obtenido exitosamente
  Procesando pedido 673abc...
  Envío creado para pedido 673abc...
  Etiqueta obtenida para pedido 673abc...
  ✓ Etiqueta generada para pedido 673abc...
  ```

### Revisar Logs del Frontend
- [ ] Abrir DevTools → Console
- [ ] Verificar logs durante el proceso
- [ ] Verificar que no haya errores no manejados

---

## 🔐 Seguridad

### Verificar Configuración de Seguridad
- [ ] `.env` está en `.gitignore`
- [ ] No hay credenciales hardcodeadas en el código
- [ ] Las credenciales solo están en variables de entorno
- [ ] El token no se guarda en la BD

### Test de Permisos
- [ ] Solo usuarios admin pueden generar etiquetas
- [ ] Usuarios no autenticados no pueden acceder a la API
- [ ] Verificar que no se puedan generar etiquetas desde el frontend sin auth

---

## 🌐 Preparación para Producción

### Antes de Deployar
- [ ] Obtener credenciales de producción de Andreani
- [ ] Configurar variables de entorno en el servidor de producción
- [ ] Cambiar `NODE_ENV` a `production`
- [ ] Verificar que la dirección de origen sea la correcta
- [ ] Verificar que los datos del remitente sean correctos

### Test en Staging (si aplica)
- [ ] Deployar a ambiente de staging
- [ ] Ejecutar todos los tests de sandbox nuevamente
- [ ] Verificar logs
- [ ] Validar PDFs generados

### Deploy a Producción
- [ ] Deployar a producción
- [ ] Hacer un test con un pedido real
- [ ] Verificar que la etiqueta sea válida
- [ ] Verificar con Andreani que el tracking sea válido

---

## 📱 Capacitación del Equipo

### Documentación para el Equipo
- [ ] Compartir `ANDREANI_CONFIG.md`
- [ ] Compartir `ANDREANI_USAGE.md`
- [ ] Explicar el flujo de generación de etiquetas

### Capacitar al Personal
- [ ] Mostrar cómo generar etiquetas
- [ ] Explicar qué hacer si hay errores
- [ ] Mostrar dónde ver los tracking codes
- [ ] Explicar cómo descargar etiquetas nuevamente

---

## 🆘 Troubleshooting

### Si algo falla...

#### Error de Credenciales
- [ ] Verificar que las credenciales en `.env` sean correctas
- [ ] Verificar que no haya espacios antes/después de los valores
- [ ] Reiniciar el servidor después de cambiar `.env`
- [ ] Contactar a Andreani para verificar las credenciales

#### Error de Datos
- [ ] Verificar que el pedido tenga todos los campos requeridos
- [ ] Verificar formato del código postal (4 dígitos)
- [ ] Verificar que la provincia esté bien escrita
- [ ] Usar la consola para ver el error exacto

#### PDF no se descarga
- [ ] Verificar que el navegador permita descargas
- [ ] Verificar que no esté bloqueado por popup blocker
- [ ] Intentar descargar manualmente desde la BD
- [ ] Revisar logs para ver si la etiqueta se generó

---

## ✅ Checklist Final

- [ ] ✅ Credenciales configuradas
- [ ] ✅ Datos de origen configurados
- [ ] ✅ Datos de remitente configurados
- [ ] ✅ Tests en sandbox exitosos
- [ ] ✅ Generación de etiqueta única exitosa
- [ ] ✅ Generación masiva exitosa
- [ ] ✅ PDFs válidos y legibles
- [ ] ✅ Tracking codes guardados correctamente
- [ ] ✅ Estados de pedidos actualizados
- [ ] ✅ Logs funcionando correctamente
- [ ] ✅ Manejo de errores validado
- [ ] ✅ Seguridad verificada
- [ ] ✅ Documentación completa
- [ ] ✅ Equipo capacitado

---

## 🎉 ¡Listo para Producción!

Una vez completado este checklist, tu sistema de generación de etiquetas Andreani está listo para ser usado en producción.

### Próximos pasos recomendados:
1. Monitorear los primeros pedidos en producción
2. Recopilar feedback del equipo
3. Documentar casos especiales que surjan
4. Considerar automatizaciones adicionales (ej: generación automática al pagar)

---

**Fecha de creación**: Octubre 2025  
**Versión**: 1.0  
**Mantenedor**: Starlink Soluciones

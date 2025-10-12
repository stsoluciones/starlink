# 🚀 Sistema de Generación de Etiquetas Andreani - Implementado

## ✅ Archivos Modificados/Creados

### 1. **src/lib/andreani.js** - Biblioteca de integración con Andreani
Implementa:
- ✅ `obtenerTokenAndreani()` - Autenticación con OAuth2
- ✅ `crearEnvio()` - Creación de órdenes de envío
- ✅ `obtenerEtiquetaPDF()` - Descarga de etiquetas en PDF
- ✅ `consultarEstadoEnvio()` - Consulta de tracking
- ✅ Funciones auxiliares (mapeo de provincias, cálculo de peso)
- ✅ Soporte para ambiente sandbox y producción

### 2. **src/app/api/etiquetasAndreani/route.js** - API Endpoint
Implementa:
- ✅ POST `/api/etiquetasAndreani` - Genera etiquetas para múltiples pedidos
- ✅ GET `/api/etiquetasAndreani?pedidoId=xxx` - Consulta etiqueta de un pedido
- ✅ Validación de pedidos (solo estado "pagado")
- ✅ Procesamiento por lotes con manejo de errores
- ✅ Actualización automática del estado a "enviado"
- ✅ Guardado de tracking code y etiqueta en base64

### 3. **src/Utils/handleGenerarAndreani.js** - Handler Frontend
Implementa:
- ✅ Función principal para generar etiquetas desde el frontend
- ✅ Validación de pedidos seleccionados
- ✅ Interfaz con SweetAlert2 (loading, confirmación, resultados)
- ✅ Descarga automática de PDFs
- ✅ Manejo de errores con mensajes informativos

### 4. **src/components/Admin/AdminPedidos/Todos.jsx** - Componente UI
Cambios:
- ✅ Importación de `handleGenerarAndreani` (descomentado)
- ✅ Función `generarEtiquetas` actualizada
- ✅ Integración con el flujo de actualización de pedidos
- ✅ Notificación automática a clientes

### 5. **ANDREANI_CONFIG.md** - Documentación de Configuración
Incluye:
- ✅ Requisitos previos
- ✅ Configuración de variables de entorno
- ✅ Tabla de códigos de provincia
- ✅ Datos de origen y remitente
- ✅ Troubleshooting

### 6. **ANDREANI_USAGE.md** - Guía de Uso
Incluye:
- ✅ Ejemplos de código
- ✅ Estructura de datos
- ✅ Documentación de API endpoints
- ✅ Flujo completo del proceso
- ✅ Casos de uso comunes

## 🔧 Configuración Requerida

### Variables de Entorno (.env)

```env
ANDREANI_CLIENT_ID=tu_client_id
ANDREANI_CLIENT_SECRET=tu_client_secret
ANDREANI_CLIENT_NUMBER=tu_numero_de_contrato
```

### Datos a Configurar en `src/lib/andreani.js`

1. **Dirección de Origen** (línea ~55)
```javascript
origen: {
  postal: {
    codigoPostal: "TU_CODIGO_POSTAL",
    calle: "TU_CALLE",
    numero: "TU_NUMERO",
    localidad: "TU_LOCALIDAD",
    region: "AR-X", // Tu provincia
    pais: "Argentina"
  }
}
```

2. **Datos del Remitente** (línea ~88)
```javascript
remitente: {
  nombreCompleto: "TU_EMPRESA",
  email: "tu@email.com",
  documentoTipo: "CUIT",
  documentoNumero: "TU_CUIT",
  telefonos: [{
    tipo: 1,
    numero: "TU_TELEFONO"
  }]
}
```

## 🎯 Flujo de Uso

```
1. Admin selecciona pedidos con estado "pagado"
   ↓
2. Click en "Generar Etiquetas Andreani"
   ↓
3. Sistema obtiene token de autenticación
   ↓
4. Por cada pedido:
   - Crea orden de envío en Andreani
   - Obtiene etiqueta PDF
   - Guarda tracking code en BD
   - Actualiza estado a "enviado"
   ↓
5. Descarga automática de PDFs
   ↓
6. Notificación a clientes (opcional)
```

## 📦 Estructura de Datos

### Pedido Requerido (Order Model)

```javascript
{
  estado: "pagado", // REQUERIDO
  usuarioInfo: {
    nombreCompleto: string, // REQUERIDO
    correo: string,        // REQUERIDO
    telefono: string       // REQUERIDO
  },
  direccionEnvio: {
    codigoPostal: string,  // REQUERIDO (4 dígitos)
    provincia: string,     // REQUERIDO (nombre completo)
    ciudad: string,        // REQUERIDO
    calle: string,         // REQUERIDO
    numero: string,        // REQUERIDO
    piso?: string,
    depto?: string,
    telefono: string,      // REQUERIDO
    entreCalles?: string,
    referencia?: string
  },
  tipoFactura: {
    cuit: string           // REQUERIDO (para identificación)
  },
  items: Array<{
    nombreProducto: string,
    cantidad: number,
    precioUnitario: number
  }>,
  total: number,
  // Campos que se llenan automáticamente:
  trackingCode: string,    // Se genera
  etiquetaEnvio: string    // Base64 del PDF
}
```

## 🌐 API Endpoints

### POST /api/etiquetasAndreani
**Genera etiquetas para pedidos**

Request:
```json
{
  "pedidos": ["pedidoId1", "pedidoId2"]
}
```

Response (200):
```json
{
  "mensaje": "Se procesaron 2 de 2 pedidos",
  "exitosos": 2,
  "fallidos": 0,
  "etiquetas": [
    {
      "pedidoId": "...",
      "trackingCode": "AND12345678",
      "etiqueta": "base64_pdf...",
      "mensaje": "Etiqueta generada exitosamente"
    }
  ]
}
```

### GET /api/etiquetasAndreani?pedidoId=xxx
**Consulta etiqueta de un pedido**

Response (200):
```json
{
  "pedidoId": "...",
  "trackingCode": "AND12345678",
  "etiqueta": "base64_string...",
  "estado": "enviado"
}
```

## ⚙️ Características Implementadas

### ✅ Funcionalidades Principales
- [x] Autenticación OAuth2 con Andreani
- [x] Creación de órdenes de envío
- [x] Generación de etiquetas PDF
- [x] Descarga automática de etiquetas
- [x] Guardado de tracking code en BD
- [x] Actualización de estado de pedidos
- [x] Soporte para múltiples pedidos simultáneos
- [x] Detección de etiquetas existentes
- [x] Validación de datos completos

### ✅ Manejo de Errores
- [x] Validación de credenciales
- [x] Verificación de estado de pedidos
- [x] Validación de datos de dirección
- [x] Manejo de errores por pedido individual
- [x] Mensajes informativos al usuario
- [x] Logs detallados en consola

### ✅ UX/UI
- [x] Loading spinner durante el proceso
- [x] Confirmación antes de generar
- [x] Resultados detallados (exitosos/fallidos)
- [x] Descarga automática de PDFs
- [x] Notificaciones con SweetAlert2

### ✅ Seguridad
- [x] Credenciales en variables de entorno
- [x] Token temporal (no guardado)
- [x] Validación de permisos (solo admin)
- [x] Sanitización de datos

## 🧪 Testing

### Ambiente Sandbox (Desarrollo)
```
URL: https://apissandbox.andreani.com
NODE_ENV: development
```

### Ambiente Producción
```
URL: https://api.andreani.com
NODE_ENV: production
```

El sistema cambia automáticamente según `NODE_ENV`.

## 📋 Próximos Pasos

1. **Configurar Credenciales**
   - Solicitar credenciales a Andreani
   - Completar variables en `.env`

2. **Configurar Datos de Empresa**
   - Actualizar dirección de origen
   - Actualizar datos del remitente

3. **Probar en Sandbox**
   - Crear pedido de prueba
   - Generar etiqueta
   - Verificar PDF descargado

4. **Configurar en Producción**
   - Verificar credenciales de producción
   - Configurar `NODE_ENV=production`
   - Probar con pedido real

## 🆘 Soporte y Recursos

### Documentación
- [Configuración](./ANDREANI_CONFIG.md)
- [Guía de Uso](./ANDREANI_USAGE.md)
- [Andreani Developers](https://developers-sandbox.andreani.com/)

### Logs Importantes
```javascript
// Ver logs de generación
console.log('Generando etiquetas para pedidos:', pedidosIds);
console.log('Token de Andreani obtenido exitosamente');
console.log('Envío creado:', envio);
console.log('✓ Etiqueta generada para pedido', pedidoId);
```

### Comandos Útiles
```bash
# Reiniciar servidor
npm run dev

# Ver variables de entorno
echo $ANDREANI_CLIENT_ID

# Limpiar caché
rm -rf .next
npm run dev
```

## 🎉 Resumen

El sistema de generación de etiquetas de Andreani está **completamente implementado** y listo para usar. Solo necesitas:

1. ✅ Obtener credenciales de Andreani
2. ✅ Configurar variables de entorno
3. ✅ Actualizar datos de origen/remitente
4. ✅ ¡Empezar a generar etiquetas!

---

**Creado el**: 12 de Octubre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Implementado y Documentado

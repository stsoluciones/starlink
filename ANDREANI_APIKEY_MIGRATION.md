# Configuración de Andreani con APIKEY

## 🔧 Cambio Importante: OAuth → APIKEY

El sistema ha sido actualizado para usar autenticación con **APIKEY** en lugar de OAuth (client_id/client_secret).

## 📋 Variables de Entorno Requeridas

### 1. Copiar archivo de ejemplo

```bash
# Copiar las variables de Andreani a tu archivo .env.local
cat .env.andreani.example >> .env.local
```

### 2. Configurar APIKEY

Edita tu archivo `.env.local` y reemplaza `TU_API_KEY_AQUI` con tu APIKEY real proporcionada por Andreani:

```env
ANDREANI_API_KEY=tu_api_key_real_de_andreani
```

### 3. Verificar datos del remitente

Asegúrate de actualizar estos datos con tu información real:

```env
ANDREANI_REMITENTE_NOMBRE=Tu Empresa
ANDREANI_REMITENTE_EMAIL=tu@email.com
ANDREANI_REMITENTE_CUIT=20312345678
ANDREANI_REMITENTE_TEL=1140000000

# Dirección de origen
ANDREANI_ORIGEN_CP=1878
ANDREANI_ORIGEN_CALLE=Tu Calle
ANDREANI_ORIGEN_NUMERO=123
ANDREANI_ORIGEN_LOCALIDAD=Tu Localidad
ANDREANI_ORIGEN_REGION=AR-B
```

## 🧪 Probar la configuración

### Opción 1: Usar el script de prueba

```bash
node src/Utils/crear-orden-andreani-apikey.js
```

### Opción 2: Desde la aplicación

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Ve al Dashboard de pedidos
3. Selecciona un pedido en estado "pagado"
4. Haz clic en "Generar Etiquetas"

## 📝 Variables Obsoletas

Estas variables ya **NO son necesarias** con APIKEY:

- ~~`ANDREANI_CLIENT_ID`~~
- ~~`ANDREANI_CLIENT_SECRET`~~

Puedes eliminarlas de tu archivo `.env.local` si las tienes.

## 🔍 Solución de Problemas

### Error: "Error al autenticar con Andreani"

**Causa:** La variable `ANDREANI_API_KEY` no está configurada o es incorrecta.

**Solución:**
1. Verifica que el archivo `.env.local` existe en la raíz del proyecto
2. Confirma que la variable `ANDREANI_API_KEY` está definida
3. Verifica que la APIKEY es correcta (proporcionada por Andreani)
4. Reinicia el servidor de desarrollo: `npm run dev`

### Error: "Error al crear envío"

**Posibles causas:**
- APIKEY incorrecta
- Datos del pedido incompletos
- Datos del remitente incorrectos

**Solución:**
1. Revisa los logs de la consola del servidor
2. Verifica que todos los datos del remitente estén completos
3. Asegúrate de que el pedido tenga dirección de envío completa

## 📚 Endpoints actualizados

Los endpoints ahora usan APIKEY en lugar de Bearer token:

```javascript
// Crear orden de envío
fetch('https://apissandbox.andreani.com/beta/transporte-distribucion/ordenes-de-envio', {
  method: 'POST',
  headers: {
    'Authorization': 'APIKEY tu_api_key',
    'Content-Type': 'application/json'
  }
})

// Obtener etiqueta
fetch('https://apissandbox.andreani.com/beta/transporte-distribucion/ordenes-de-envio/{numeroDeEnvio}/etiquetas', {
  method: 'GET',
  headers: {
    'Authorization': 'APIKEY tu_api_key',
    'Accept': 'application/pdf'
  }
})
```

## 🎯 Archivos modificados

- ✅ `src/lib/andreani.js` - Funciones actualizadas para usar APIKEY
- ✅ `src/app/api/etiquetasAndreani/route.js` - API actualizada
- ✅ `.env.andreani.example` - Template de variables de entorno

## 📞 Soporte

Si continúas teniendo problemas, verifica:
1. Documentación de Andreani: https://developers-sandbox.andreani.com/
2. Que tu APIKEY esté activa en el ambiente sandbox/producción correcto
3. Los logs del servidor para ver el error exacto

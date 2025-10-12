# Configuración de Andreani para Generación de Etiquetas

Este documento describe cómo configurar la integración con Andreani para generar etiquetas de envío automáticamente.

## 📋 Requisitos Previos

1. **Cuenta de Andreani**: Debes tener una cuenta empresarial con Andreani
2. **Credenciales API**: Solicitar credenciales de API a Andreani
   - Client ID
   - Client Secret
   - Número de Cliente/Contrato

## 🔧 Configuración

### 1. Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto y completa las siguientes variables:

```env
# Credenciales de Andreani
ANDREANI_CLIENT_ID=tu_client_id_aqui
ANDREANI_CLIENT_SECRET=tu_client_secret_aqui
ANDREANI_CLIENT_NUMBER=tu_numero_de_cliente_aqui
```

### 2. Configurar Datos de Origen

Edita el archivo `src/lib/andreani.js` y actualiza los datos de tu punto de origen:

```javascript
origen: {
  postal: {
    codigoPostal: "1636", // TU código postal
    calle: "Tu Calle",    // TU dirección
    numero: "1234",       // TU número
    localidad: "Tu Localidad",
    region: "AR-B",       // Código de provincia
    pais: "Argentina",
    componenteDeDireccion: []
  }
}
```

### 3. Configurar Datos del Remitente

En el mismo archivo, actualiza los datos del remitente:

```javascript
remitente: {
  nombreCompleto: "Tu Empresa S.A.",
  email: "tu@email.com",
  documentoTipo: "CUIT",
  documentoNumero: "20123456789", // Tu CUIT
  telefonos: [
    {
      tipo: 1,
      numero: "1140000000" // Tu teléfono
    }
  ]
}
```

## 🌍 Códigos de Provincia (region)

Utiliza estos códigos para el campo `region`:

| Provincia | Código |
|-----------|--------|
| Buenos Aires | AR-B |
| CABA | AR-C |
| Catamarca | AR-K |
| Chaco | AR-H |
| Chubut | AR-U |
| Córdoba | AR-X |
| Corrientes | AR-W |
| Entre Ríos | AR-E |
| Formosa | AR-P |
| Jujuy | AR-Y |
| La Pampa | AR-L |
| La Rioja | AR-F |
| Mendoza | AR-M |
| Misiones | AR-N |
| Neuquén | AR-Q |
| Río Negro | AR-R |
| Salta | AR-A |
| San Juan | AR-J |
| San Luis | AR-D |
| Santa Cruz | AR-Z |
| Santa Fe | AR-S |
| Santiago del Estero | AR-G |
| Tierra del Fuego | AR-V |
| Tucumán | AR-T |

## 🚀 Uso

### Generar Etiquetas desde el Admin

1. Ve a **Dashboard** → **Pedidos**
2. Selecciona los pedidos con estado **"pagado"**
3. Haz clic en **"Generar Etiquetas Andreani"**
4. Las etiquetas se generarán automáticamente y se descargarán como PDF

### Proceso Automático

El sistema realizará automáticamente:

1. ✅ Validación de pedidos (solo estado "pagado")
2. ✅ Obtención de token de autenticación con Andreani
3. ✅ Creación de órdenes de envío
4. ✅ Generación de etiquetas PDF
5. ✅ Guardado del tracking code en cada pedido
6. ✅ Actualización del estado del pedido a "enviado"
7. ✅ Descarga automática de etiquetas

## 📦 Campos Requeridos en el Pedido

Para que se pueda generar una etiqueta, el pedido debe tener:

### Información del Usuario
- `usuarioInfo.nombreCompleto`
- `usuarioInfo.correo`
- `usuarioInfo.telefono`

### Dirección de Envío
- `direccionEnvio.codigoPostal`
- `direccionEnvio.calle`
- `direccionEnvio.numero`
- `direccionEnvio.ciudad`
- `direccionEnvio.provincia`
- `direccionEnvio.telefono`

### Información de Factura
- `tipoFactura.cuit` (para identificación)

## 🧪 Ambiente de Pruebas (Sandbox)

Durante el desarrollo, el sistema usa automáticamente el ambiente de pruebas:

```
https://apissandbox.andreani.com
```

En producción (NODE_ENV=production), usará:

```
https://api.andreani.com
```

## 🔍 Debugging

### Ver logs en consola

Los logs detallados aparecerán en:
- **Frontend**: Consola del navegador
- **Backend**: Terminal del servidor

### Errores Comunes

1. **"Error al obtener token"**
   - Verifica que las credenciales en `.env` sean correctas
   - Asegúrate de que no haya espacios extras

2. **"No se pudo generar el envío"**
   - Verifica que los datos del pedido estén completos
   - Revisa el código postal (debe ser válido)
   - Asegúrate de que la provincia esté bien mapeada

3. **"El pedido no está en estado pagado"**
   - Solo se pueden generar etiquetas para pedidos pagados
   - Actualiza el estado del pedido primero

## 📚 Documentación Oficial

- [Andreani Developers](https://developers-sandbox.andreani.com/)
- [API Reference](https://developers-sandbox.andreani.com/docs/category/andreani/datos-maestros)

## 🆘 Soporte

Para problemas técnicos:
1. Revisa los logs en la consola
2. Verifica que todas las variables de entorno estén configuradas
3. Consulta la documentación oficial de Andreani
4. Contacta al soporte técnico de Andreani si el problema persiste

## 📝 Notas Importantes

- Las etiquetas se guardan en la base de datos en formato base64
- El tracking code se guarda automáticamente en cada pedido
- Los pedidos se actualizan a "enviado" solo si la etiqueta se genera correctamente
- Puedes regenerar etiquetas si es necesario (verifica primero si ya existe)

## 🔐 Seguridad

- **NUNCA** compartas tus credenciales de Andreani
- Las credenciales deben estar solo en `.env` (no en git)
- El archivo `.env` debe estar en `.gitignore`

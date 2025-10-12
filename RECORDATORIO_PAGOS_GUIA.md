# 📧 Recordatorio de Pagos Pendientes - MercadoPago

## Descripción

Esta funcionalidad permite enviar recordatorios automáticos a clientes que tienen pedidos pendientes de pago a través de MercadoPago. El sistema envía un email con el enlace directo (`init_point`) para que puedan completar su pago.

## Características

### ✅ Funcionalidades Implementadas

1. **Envío Individual**: Botón para enviar recordatorio a un pedido específico
2. **Envío Masivo**: Botón para enviar recordatorios a todos los pedidos pendientes de MercadoPago en la vista actual
3. **Validación Automática**: Solo se envían recordatorios a pedidos que cumplan:
   - Estado: `pendiente`
   - Método de pago: `mercadopago`
   - Tengan `init_point` disponible
4. **Registro de Envíos**: Guarda la fecha del último recordatorio en el campo `ultimoRecordatorio`
5. **Feedback Visual**: Confirmaciones y alertas con SweetAlert2

## Ubicación en el Sistema

### Componente Frontend
**Archivo**: `src/components/Admin/AdminPedidos/Todos.jsx`

### API Endpoint
**Archivo**: `src/app/api/pedidos/recordatorio-pago/route.js`  
**Método**: `POST`  
**Body**:
```json
{
  "pedidoIds": ["id1", "id2", "id3"]
}
```

### Modelo de Datos
**Archivo**: `src/models/Order.js`  
**Campo nuevo**: `ultimoRecordatorio` (Date)

## Cómo Usar

### Desde el Panel de Administración

#### Opción 1: Envío Individual

1. Ve al panel de Admin → Pedidos → Todos
2. Busca un pedido con estado **"pendiente"** y método **"MercadoPago"**
3. Verás el botón **"📧 Recordar Pago"** junto al pedido
4. Haz clic en el botón
5. Confirma el envío en el modal
6. El sistema enviará el email y mostrará confirmación

#### Opción 2: Envío Masivo

1. Ve al panel de Admin → Pedidos → Todos
2. Filtra por estado **"pendiente"** usando el selector
3. Aparecerá el botón **"📧 Recordar Pagos Pendientes"** en la barra de filtros
4. Haz clic en el botón
5. Confirma cuántos recordatorios se enviarán
6. El sistema procesará todos los pedidos pendientes de MercadoPago

### Visualización del Botón

El botón **"📧 Recordar Pago"** solo aparece cuando:
- ✅ El pedido está en estado `pendiente`
- ✅ El método de pago es `mercadopago`
- ✅ Existe un `init_point` (enlace de pago)

## Contenido del Email

El email enviado incluye:

- **Asunto**: "⏰ Recordatorio: Completa el pago de tu pedido #XXXXXX"
- **Contenido**:
  - Saludo personalizado con nombre del cliente
  - Número de pedido (últimos 6 dígitos)
  - Monto total formateado
  - Botón destacado **"💳 Completar Pago"** que redirige al `init_point`
  - Enlace alternativo en texto plano
  - Logo de SLS
  - Footer con copyright

### Ejemplo Visual

```
┌─────────────────────────────────────┐
│         [Logo SLS]                  │
├─────────────────────────────────────┤
│ Hola Juan Pérez,                    │
│                                     │
│ Tu pedido #123456 está pendiente   │
│ Monto: $50,000.00                   │
│                                     │
│     [💳 Completar Pago]            │
│                                     │
│ Enlace: https://mpago.li/...       │
└─────────────────────────────────────┘
```

## Validaciones

### En el Backend (route.js)

```javascript
// Validación 1: Pedido existe
if (!order) → Error: "Pedido no encontrado"

// Validación 2: Estado y método de pago
if (estado !== 'pendiente' || paymentMethod !== 'mercadopago')
  → Error: "El pedido debe estar pendiente y ser de MercadoPago"

// Validación 3: Existe init_point
if (!init_point) → Error: "El pedido no tiene un enlace de pago"
```

### En el Frontend (Todos.jsx)

```javascript
// Solo muestra botón si cumple todas las condiciones
{pedido?.estado === 'pendiente' && 
 pedido?.paymentMethod === 'mercadopago' && 
 pedido?.init_point && (
  <button>📧 Recordar Pago</button>
)}
```

## Respuesta de la API

### Éxito

```json
{
  "success": true,
  "message": "Se enviaron 3 recordatorio(s) de pago. 0 fallaron.",
  "resultados": [
    {
      "pedidoId": "60d5ec49eb12345678901234",
      "success": true,
      "email": "cliente@example.com"
    }
  ]
}
```

### Error

```json
{
  "success": false,
  "error": "Debe proporcionar al menos un ID de pedido"
}
```

## Casos de Uso

### 1. Cliente Olvidó Completar el Pago

**Escenario**: Un cliente agregó productos al carrito, inició el pago en MercadoPago pero no lo completó.

**Solución**:
1. Admin filtra pedidos pendientes
2. Identifica el pedido del cliente
3. Hace clic en "📧 Recordar Pago"
4. Cliente recibe email con enlace directo
5. Cliente completa el pago

### 2. Campaña de Recordatorios Masiva

**Escenario**: Al final del día hay 10 pedidos pendientes de pago.

**Solución**:
1. Admin va a la vista de pedidos pendientes
2. Hace clic en "📧 Recordar Pagos Pendientes"
3. Sistema envía 10 emails simultáneamente
4. Admin recibe reporte de envíos exitosos/fallidos

### 3. Seguimiento Post-Recordatorio

**Escenario**: Quieres saber cuándo se envió el último recordatorio.

**Solución**:
- El campo `ultimoRecordatorio` guarda la fecha
- Puedes consultar en la base de datos:
  ```javascript
  const pedido = await Order.findById(id);
  console.log(pedido.ultimoRecordatorio); // 2025-10-12T14:30:00.000Z
  ```

## Consideraciones

### ⚠️ Importante

1. **Límite de Envíos**: No hay límite automático de recordatorios. Considera implementar:
   - Máximo 3 recordatorios por pedido
   - Esperar al menos 24 horas entre recordatorios

2. **Validez del init_point**: Los enlaces de MercadoPago pueden expirar. Verifica:
   - Preferencia aún válida
   - Productos disponibles
   - Precios actualizados

3. **Spam**: Evita enviar recordatorios repetitivos al mismo cliente en poco tiempo

### 💡 Mejoras Futuras

1. **Dashboard de Recordatorios**:
   - Ver historial de recordatorios enviados
   - Tasa de conversión post-recordatorio
   - Pedidos con múltiples recordatorios

2. **Automatización**:
   - Envío automático después de X horas
   - Recordatorio escalonado (24h, 48h, 72h)
   - Cancelación automática después de 7 días

3. **Personalización**:
   - Templates de email por tipo de producto
   - Descuentos en recordatorios
   - Urgencia visual ("¡Solo quedan 2 días!")

4. **Analytics**:
   - Tasa de apertura de emails
   - Tasa de clics en init_point
   - Tasa de conversión a pagado

## Testing

### Manual Testing

1. **Crear un pedido pendiente de MercadoPago**:
   ```javascript
   // En la base de datos o a través de la app
   {
     estado: 'pendiente',
     paymentMethod: 'mercadopago',
     init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?...',
     usuarioInfo: {
       correo: 'test@example.com',
       nombreCompleto: 'Usuario Test'
     },
     total: 50000
   }
   ```

2. **Enviar recordatorio individual**:
   - Verificar que el botón aparece
   - Hacer clic y confirmar
   - Revisar email recibido

3. **Enviar recordatorios masivos**:
   - Filtrar por pendientes
   - Hacer clic en botón masivo
   - Verificar cantidad de emails enviados

### API Testing con cURL

```bash
curl -X POST http://localhost:3000/api/pedidos/recordatorio-pago \
  -H "Content-Type: application/json" \
  -d '{"pedidoIds": ["60d5ec49eb12345678901234"]}'
```

## Logs y Debugging

### Backend Logs

```javascript
// En route.js línea ~XX
console.log('Procesando recordatorio para pedido:', pedidoId);
console.log('Email enviado a:', clienteEmail);
console.log('Init point:', initPoint);
```

### Frontend Logs

```javascript
// En Todos.jsx
console.log('Enviando recordatorio a pedido:', pedidoId);
console.log('Respuesta API:', data);
```

## Solución de Problemas

### Error: "El pedido no tiene un enlace de pago"

**Causa**: El campo `init_point` está vacío o undefined  
**Solución**: Verificar que el proceso de creación de preferencia guardó el init_point

### Error: "Error al enviar el recordatorio"

**Causa**: Problema con el servicio de email (mailer)  
**Solución**: 
- Verificar credenciales SMTP en `.env`
- Revisar logs del servidor
- Verificar que el email del cliente sea válido

### El botón no aparece

**Causa**: El pedido no cumple las condiciones  
**Solución**: Verificar que:
- Estado sea exactamente 'pendiente' (minúsculas)
- paymentMethod sea 'mercadopago'
- init_point tenga valor

## Código de Referencia

### Envío Individual

```javascript
const enviarRecordatorioPago = async (pedidoId) => {
  // Confirmación con SweetAlert2
  const result = await Swal.fire({
    title: '¿Enviar recordatorio de pago?',
    icon: 'question',
    showCancelButton: true
  });

  if (!result.isConfirmed) return;

  // Llamada a la API
  const response = await fetch('/api/pedidos/recordatorio-pago', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pedidoIds: [pedidoId] })
  });

  const data = await response.json();
  
  // Mostrar resultado
  Swal.fire({
    title: '¡Enviado!',
    text: 'El recordatorio fue enviado correctamente.',
    icon: 'success'
  });
};
```

### Envío Masivo

```javascript
const enviarRecordatoriosMasivos = async () => {
  // Filtrar pedidos elegibles
  const pedidosPendientesMercadoPago = pedidosPaginados.filter(
    pedido => pedido.estado === 'pendiente' && 
              pedido.paymentMethod === 'mercadopago' && 
              pedido.init_point
  );

  // Enviar a la API
  const response = await fetch('/api/pedidos/recordatorio-pago', {
    method: 'POST',
    body: JSON.stringify({ 
      pedidoIds: pedidosPendientesMercadoPago.map(p => p._id) 
    })
  });
};
```

## Integración con Otros Sistemas

### Con Google Analytics

```javascript
// Trackear envío de recordatorio
gtag('event', 'recordatorio_enviado', {
  event_category: 'pagos',
  event_label: pedidoId,
  value: montoTotal
});
```

### Con CRM

```javascript
// Registrar actividad en CRM
await crmAPI.registrarActividad({
  tipo: 'recordatorio_pago',
  cliente: clienteEmail,
  pedido: pedidoId,
  fecha: new Date()
});
```

## Mantenimiento

### Limpieza de Datos

```javascript
// Eliminar pedidos pendientes antiguos (> 30 días)
const treintaDiasAtras = new Date();
treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

await Order.updateMany(
  { 
    estado: 'pendiente',
    fechaPedido: { $lt: treintaDiasAtras }
  },
  { 
    $set: { estado: 'cancelado' }
  }
);
```

## Contacto y Soporte

Para dudas o problemas con esta funcionalidad:
- Email: infostarlinksoluciones@gmail.com
- Revisar logs en: `/var/log/app/`
- Documentación API: `/api/pedidos/recordatorio-pago`

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0

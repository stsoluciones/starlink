# 🧪 Guía de Pruebas Manuales - Andreani

Esta guía te ayudará a probar manualmente la integración con Andreani paso a paso.

## 📋 Pre-requisitos

Antes de comenzar las pruebas:

- [ ] Credenciales de Andreani configuradas en `.env`
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Acceso al Dashboard Admin
- [ ] Al menos un pedido en estado "pagado"

## 🧪 Suite de Pruebas Manuales

### 1. Verificar Configuración

#### 1.1 Verificar Variables de Entorno
```bash
# Verificar que las variables estén configuradas
echo $ANDREANI_CLIENT_ID
echo $ANDREANI_CLIENT_SECRET
echo $ANDREANI_CLIENT_NUMBER
```

**Resultado Esperado**: Deben mostrar valores (no vacío)

#### 1.2 Verificar Datos de Origen
1. Abrir `src/lib/andreani.js`
2. Buscar la sección `origen`
3. Verificar que los datos sean correctos

**Checklist**:
- [ ] Código postal correcto
- [ ] Dirección completa
- [ ] Provincia con código correcto (AR-X)

---

### 2. Pruebas en Consola del Navegador

#### 2.1 Test de Token
```javascript
// Abrir DevTools (F12) → Console
// Copiar y pegar este código:

async function testToken() {
  try {
    const response = await fetch('/api/etiquetasAndreani', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidos: [] })
    });
    const data = await response.json();
    console.log('Respuesta:', data);
    
    if (data.error && data.error.includes('credenciales')) {
      console.error('❌ Credenciales incorrectas');
    } else {
      console.log('✅ Token obtainible');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testToken();
```

**Resultado Esperado**: 
- ✅ "Token obtainible" o error de "pedidos válidos"
- ❌ NO debe decir "credenciales incorrectas"

#### 2.2 Test de Validación de Pedido
```javascript
// Reemplaza 'TU_PEDIDO_ID' con un ID real
const pedidoId = 'TU_PEDIDO_ID';

async function testValidarPedido() {
  try {
    const response = await fetch(`/api/etiquetasAndreani?pedidoId=${pedidoId}`);
    const data = await response.json();
    
    console.log('Estado del pedido:', data);
    
    if (data.trackingCode) {
      console.log('✅ Pedido ya tiene etiqueta:', data.trackingCode);
    } else if (data.error) {
      console.log('⚠️ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testValidarPedido();
```

---

### 3. Pruebas en el Dashboard Admin

#### 3.1 Crear Pedido de Prueba

1. **Ir a la tienda**: `http://localhost:3000`
2. **Agregar productos al carrito**
3. **Completar compra** con estos datos:

```
Nombre: Test Andreani
Email: test@andreani.com
Teléfono: 1140000000

Dirección:
  Código Postal: 1636
  Provincia: Buenos Aires
  Ciudad: Olivos
  Calle: Av. Libertador
  Número: 5678
  
CUIT: 20123456789
```

4. **Anotar el ID del pedido creado**: `_________________________`

#### 3.2 Actualizar Estado del Pedido

1. Ir a **Dashboard** → **Pedidos**
2. Buscar el pedido de prueba
3. **Cambiar estado a "pagado"**
4. Verificar que aparezca en la lista de pedidos pagados

**Checklist**:
- [ ] Pedido visible en la lista
- [ ] Estado muestra "pagado"
- [ ] Datos completos visibles

#### 3.3 Generar Etiqueta Individual

1. En la lista de pedidos, **seleccionar el pedido de prueba**
2. **Click en "Generar Etiquetas Andreani"**
3. Observar el proceso

**Lo que deberías ver**:
- [ ] Modal "Generando etiquetas..."
- [ ] Loading spinner
- [ ] Proceso que tarda 3-10 segundos
- [ ] Modal de resultado con "Exitosos: 1"
- [ ] Opción "Ver Etiquetas"

4. **Click en "Ver Etiquetas"**

**Resultado Esperado**:
- [ ] Se descarga un archivo PDF
- [ ] El PDF se llama `etiqueta-ANDXXXXX.pdf`
- [ ] El PDF contiene código de barras
- [ ] Dirección de origen visible
- [ ] Dirección de destino correcta

#### 3.4 Verificar Actualización en BD

1. Ir a la lista de pedidos
2. **Refrescar la página**
3. Buscar el pedido de prueba

**Verificar**:
- [ ] Estado cambió a "enviado"
- [ ] Tiene número de tracking (AND...)
- [ ] El tracking es clickeable/visible

---

### 4. Pruebas de Múltiples Pedidos

#### 4.1 Crear 3 Pedidos de Prueba

Repetir el proceso de "3.1" tres veces con datos diferentes:

**Pedido 1**: Juan Pérez - Olivos (1636)
**Pedido 2**: María García - Caballito (1407)
**Pedido 3**: Carlos López - Belgrano (1425)

Anotar IDs:
- Pedido 1: `_________________________`
- Pedido 2: `_________________________`
- Pedido 3: `_________________________`

#### 4.2 Actualizar Todos a "Pagado"

- [ ] Los 3 pedidos en estado "pagado"

#### 4.3 Generar Etiquetas Masivas

1. **Seleccionar los 3 pedidos** (checkbox)
2. **Click en "Generar Etiquetas Andreani"**
3. Observar el proceso

**Verificar**:
- [ ] Modal muestra "Procesando 3 pedido(s)"
- [ ] Proceso tarda 10-30 segundos
- [ ] Resultado: "Exitosos: 3, Fallidos: 0"
- [ ] Se descargan 3 PDFs automáticamente

#### 4.4 Verificar Etiquetas

Abrir cada PDF descargado:

**PDF 1**:
- [ ] Nombre correcto (Juan Pérez)
- [ ] Dirección correcta (Olivos)
- [ ] Código de barras legible

**PDF 2**:
- [ ] Nombre correcto (María García)
- [ ] Dirección correcta (Caballito)
- [ ] Código de barras legible

**PDF 3**:
- [ ] Nombre correcto (Carlos López)
- [ ] Dirección correcta (Belgrano)
- [ ] Código de barras legible

---

### 5. Pruebas de Errores

#### 5.1 Pedido sin Pagar

1. Crear un pedido nuevo
2. **NO cambiar a pagado** (dejar en "pendiente")
3. Intentar generar etiqueta

**Resultado Esperado**:
- [ ] Error: "No se encontraron pedidos válidos"
- [ ] El pedido NO se procesa

#### 5.2 Pedido con Datos Incompletos

1. En MongoDB/BD, editar un pedido
2. **Eliminar el código postal**
3. Cambiar a "pagado"
4. Intentar generar etiqueta

**Resultado Esperado**:
- [ ] Error relacionado con datos faltantes
- [ ] Mensaje descriptivo del problema

#### 5.3 Sin Seleccionar Pedidos

1. En la lista de pedidos
2. **NO seleccionar ninguno**
3. Click en "Generar Etiquetas"

**Resultado Esperado**:
- [ ] Alerta: "No hay pedidos seleccionados"

#### 5.4 Pedido con Etiqueta Existente

1. Seleccionar un pedido que ya tiene etiqueta
2. Intentar generar de nuevo

**Resultado Esperado**:
- [ ] Mensaje: "Ya tiene etiqueta generada"
- [ ] NO genera etiqueta nueva
- [ ] Muestra el tracking existente

---

### 6. Pruebas de Performance

#### 6.1 Tiempo de Generación

**Pedido Individual**:
- Tiempo esperado: 3-10 segundos
- Tiempo real: `________ segundos`

**3 Pedidos**:
- Tiempo esperado: 10-30 segundos
- Tiempo real: `________ segundos`

**10 Pedidos**:
- Tiempo esperado: 30-90 segundos
- Tiempo real: `________ segundos`

#### 6.2 Uso de Recursos

Durante la generación de 10 etiquetas:
- [ ] El navegador NO se congela
- [ ] Se puede navegar a otras pestañas
- [ ] El servidor responde a otras peticiones

---

### 7. Pruebas de UI/UX

#### 7.1 Mensajes de Usuario

**Verificar que todos los mensajes sean claros**:
- [ ] Loading: "Generando etiquetas..."
- [ ] Éxito: "✓ Exitosos: X"
- [ ] Error: Mensaje descriptivo
- [ ] Confirmación antes de generar

#### 7.2 Descarga de Archivos

- [ ] Los PDFs tienen nombres descriptivos
- [ ] Se guardan en la carpeta de Descargas
- [ ] Se pueden abrir sin errores
- [ ] Son imprimibles

#### 7.3 Estado Visual

- [ ] Los pedidos "enviados" tienen indicador visual
- [ ] El tracking code es visible
- [ ] Se puede copiar el tracking code
- [ ] Los botones están deshabilitados durante el proceso

---

### 8. Pruebas en Producción (Staging)

**⚠️ IMPORTANTE**: Antes de probar en producción:

- [ ] Verificar credenciales de producción
- [ ] Configurar `NODE_ENV=production`
- [ ] Verificar datos de origen/remitente
- [ ] Hacer backup de la BD

#### 8.1 Test con Pedido Real

1. Crear un pedido real
2. Pagar con método real
3. Generar etiqueta
4. **Verificar con Andreani** que el tracking sea válido

#### 8.2 Envío Real

1. Imprimir etiqueta
2. Pegar en paquete
3. Entregar a Andreani
4. Hacer seguimiento con tracking

---

## 📊 Reporte de Resultados

### Resumen de Pruebas

| Categoría | Total | Pasadas | Fallidas |
|-----------|-------|---------|----------|
| Configuración | 3 | ___ | ___ |
| Consola | 2 | ___ | ___ |
| Dashboard | 4 | ___ | ___ |
| Múltiples | 4 | ___ | ___ |
| Errores | 4 | ___ | ___ |
| Performance | 2 | ___ | ___ |
| UI/UX | 3 | ___ | ___ |
| **TOTAL** | **22** | ___ | ___ |

### Problemas Encontrados

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Notas Adicionales

_______________________________________________
_______________________________________________
_______________________________________________

---

## ✅ Checklist Final

- [ ] Todas las pruebas básicas pasaron
- [ ] Los PDFs se generan correctamente
- [ ] Los tracking codes son válidos
- [ ] No hay errores en la consola
- [ ] La UI responde correctamente
- [ ] Los mensajes son claros
- [ ] El sistema maneja errores apropiadamente

---

**Fecha de prueba**: _______________
**Probado por**: _______________
**Ambiente**: [ ] Development [ ] Staging [ ] Production
**Resultado**: [ ] ✅ APROBADO [ ] ❌ REQUIERE CORRECCIONES

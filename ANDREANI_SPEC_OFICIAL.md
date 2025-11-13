# ✅ Implementación según Documentación Oficial de Andreani

**Fuente:** https://developers-sandbox.andreani.com/docs/andreani/beta/creacion-de-una-nueva-orden-de-envio

## 🔑 Autenticación

### Header de Autorización
```
Authorization: <API_KEY_VALUE>
```

**NO** usar:
- ❌ `Authorization: Bearer <token>`
- ❌ `Authorization: APIKEY <value>`

**Usar:**
- ✅ `Authorization: <API_KEY_VALUE>` (valor directo)

## 📡 Endpoint

### Crear Orden de Envío
```
POST https://apissandbox.andreani.com/beta/transporte-distribucion/ordenes-de-envio
```

### Headers
```
Content-Type: application/json
Accept: text/plain
Authorization: <TU_API_KEY>
```

## 📦 Estructura del Request Body

### Campos Obligatorios

```javascript
{
  // CONTRATO Y SERVICIO
  "contrato": "400006637",           // Tu número de contrato con Andreani
  "tipoDeServicio": "estandar",      // Tipo: "estandar", "express", etc.
  "idPedido": "PEDIDO-123",          // Tu ID interno del pedido
  
  // ORIGEN (tu dirección)
  "origen": {
    "postal": {
      "codigoPostal": "1878",
      "calle": "Roque Saenz Peña",
      "numero": "529",
      "localidad": "Quilmes",
      "region": "AR-B",              // Formato: AR-{CODIGO_PROVINCIA}
      "pais": "Argentina",
      "componentesDeDireccion": []
    }
  },
  
  // DESTINO (cliente)
  "destino": {
    "postal": {
      "codigoPostal": "1600",
      "calle": "Ejemplo",
      "numero": "100",
      "piso": "",                     // Opcional
      "departamento": "",             // Opcional
      "localidad": "Olivos",
      "region": "AR-B",
      "pais": "Argentina",
      "componentesDeDireccion": []    // Opcional: entre calles, etc.
    }
  },
  
  // REMITENTE (tu empresa)
  "remitente": {
    "nombreCompleto": "SL Soluciones",
    "email": "infostarlinksoluciones@gmail.com",
    "documentoTipo": "CUIT",
    "documentoNumero": "20312345678",
    "telefonos": [
      {
        "tipo": 1,                    // 1: Móvil
        "numero": "1140000000"
      }
    ]
  },
  
  // DESTINATARIO (cliente) - Array de 1 elemento
  "destinatario": [
    {
      "nombreCompleto": "Cliente Ejemplo",
      "email": "cliente@ejemplo.com",
      "documentoTipo": "DNI",
      "documentoNumero": "30123456",
      "telefonos": [
        {
          "tipo": 1,
          "numero": "1155555555"
        }
      ]
    }
  ],
  
  // BULTOS (paquetes)
  "bultos": [
    {
      "kilos": 1.2,
      "largoCm": 20,
      "altoCm": 10,
      "anchoCm": 15,
      "volumenCm": 3000,              // largoCm * altoCm * anchoCm
      "valorDeclarado": 15000,        // Valor en pesos
      "descripcion": "Dispositivo electrónico"
    }
  ],
  
  "pagoPendienteEnMostrador": false
}
```

## 📊 Respuesta Exitosa (202 Accepted)

```javascript
{
  "estado": "string",
  "tipo": "string",
  "sucursalDeDistribucion": { ... },
  "sucursalDeRendicion": { ... },
  "sucursalDeImposicion": { ... },
  "sucursalAbastecedora": { ... },
  "fechaCreacion": "2025-11-13T10:30:00",
  "zonaDeReparto": "string",
  "numeroDePermisionaria": "string",
  "descripcionServicio": "string",
  "etiquetaRemito": "string",
  "bultos": [
    {
      "numeroDeEnvio": "300012345678",  // ⭐ IMPORTANTE: Este es el tracking number
      "kilos": 1.2,
      "largoCm": 20,
      "altoCm": 10,
      "anchoCm": 15,
      "volumenCm": 3000,
      "valorDeclarado": 15000
    }
  ],
  "fechaEstimadaDeEntrega": "2025-11-15",
  "huellaDeCarbono": "string",
  "gastoEnergetico": "string",
  "agrupadorDeBultos": "string",
  "etiquetasPorAgrupador": "string",
  "etiquetasDocumentoDeCambio": "string"
}
```

## 🏷️ Obtener Etiqueta PDF

```
GET https://apissandbox.andreani.com/beta/transporte-distribucion/ordenes-de-envio/{numeroDeEnvio}/etiquetas
```

### Headers
```
Authorization: <TU_API_KEY>
Accept: application/pdf
```

### Respuesta
- **Content-Type:** `application/pdf`
- **Body:** PDF binary data (etiqueta para imprimir)

## 🗺️ Códigos de Regiones (Provincias)

Formato: `AR-{CODIGO}`

| Provincia | Código | Ejemplo |
|-----------|--------|---------|
| Buenos Aires | B | AR-B |
| CABA | C | AR-C |
| Catamarca | K | AR-K |
| Chaco | H | AR-H |
| Chubut | U | AR-U |
| Córdoba | X | AR-X |
| Corrientes | W | AR-W |
| Entre Ríos | E | AR-E |
| Formosa | P | AR-P |
| Jujuy | Y | AR-Y |
| La Pampa | L | AR-L |
| La Rioja | F | AR-F |
| Mendoza | M | AR-M |
| Misiones | N | AR-N |
| Neuquén | Q | AR-Q |
| Río Negro | R | AR-R |
| Salta | A | AR-A |
| San Juan | J | AR-J |
| San Luis | D | AR-D |
| Santa Cruz | Z | AR-Z |
| Santa Fe | S | AR-S |
| Santiago del Estero | G | AR-G |
| Tierra del Fuego | V | AR-V |
| Tucumán | T | AR-T |

## ⚠️ Errores Comunes

### 400 Bad Request
- Falta campo obligatorio
- Formato incorrecto de datos
- Código postal inválido
- Región (provincia) incorrecta

### 401 Unauthorized
- API KEY incorrecta o no enviada
- API KEY expirada

### 500 Internal Server Error
- Error del servidor de Andreani
- Contactar soporte

## 🧪 Testing

### Ejecutar script de prueba
```bash
# Asegúrate de tener ANDREANI_API_KEY en .env.local
node src/Utils/crear-orden-andreani-apikey.js
```

### Desde la aplicación
```bash
npm run dev
# Ir a Dashboard > Seleccionar pedido pagado > Generar Etiquetas
```

## 📋 Checklist de Implementación

- ✅ Usar endpoint `/beta/transporte-distribucion/ordenes-de-envio`
- ✅ Header `Authorization: <API_KEY>` (sin "Bearer" ni "APIKEY")
- ✅ Header `Accept: text/plain` para crear orden
- ✅ Header `Accept: application/pdf` para obtener etiqueta
- ✅ `volumenCm` calculado como `largoCm * altoCm * anchoCm`
- ✅ `region` en formato `AR-{CODIGO}`
- ✅ `destinatario` como array (aunque sea 1 elemento)
- ✅ `telefonos` como array con objetos `{tipo: 1, numero: "..."}`
- ✅ Extraer `numeroDeEnvio` de `bultos[0].numeroDeEnvio`
- ✅ Manejo de errores con logs detallados

## 🔍 Debugging

### Ver request completo
```javascript
console.log('URL:', url);
console.log('Headers:', headers);
console.log('Payload:', JSON.stringify(payload, null, 2));
```

### Ver response completo
```javascript
console.log('Status:', response.status);
console.log('Headers:', response.headers);
console.log('Body:', responseBody);
```

## 📞 Soporte

- **Documentación:** https://developers-sandbox.andreani.com/
- **Email:** soporte@andreani.com (verificar email real)
- **Ambiente Sandbox:** https://apissandbox.andreani.com
- **Ambiente Producción:** https://api.andreani.com

## 📝 Variables de Entorno Requeridas

```env
# API
ANDREANI_API_KEY=tu_api_key_aqui
ANDREANI_API_URL_SANDBOX=https://apissandbox.andreani.com
ANDREANI_API_URL_PRODUCCION=https://api.andreani.com

# Contrato
ANDREANI_CONTRATO=400006637
ANDREANI_TIPO_SERVICIO=estandar

# Remitente
ANDREANI_REMITENTE_NOMBRE=SL Soluciones
ANDREANI_REMITENTE_EMAIL=infostarlinksoluciones@gmail.com
ANDREANI_REMITENTE_CUIT=20312345678
ANDREANI_REMITENTE_TEL=1140000000

# Origen
ANDREANI_ORIGEN_CP=1878
ANDREANI_ORIGEN_CALLE=Roque Saenz Peña
ANDREANI_ORIGEN_NUMERO=529
ANDREANI_ORIGEN_LOCALIDAD=Quilmes
ANDREANI_ORIGEN_REGION=AR-B
```

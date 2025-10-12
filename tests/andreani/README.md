# Tests de Andreani

Este directorio contiene tests para la integración con Andreani.

## 📂 Estructura de Tests

```
tests/andreani/
├── andreani.lib.test.js           # Tests unitarios de la librería
├── etiquetasAndreani.route.test.js # Tests del endpoint API
├── handleGenerarAndreani.test.js   # Tests del handler frontend
├── andreani.integration.test.js    # Tests de integración E2E
└── README.md                       # Este archivo
```

## 🧪 Tipos de Tests

### 1. Tests Unitarios (`andreani.lib.test.js`)
Prueba cada función de la librería de forma aislada:
- ✅ `obtenerTokenAndreani()`
- ✅ `crearEnvio()`
- ✅ `obtenerEtiquetaPDF()`
- ✅ `consultarEstadoEnvio()`

### 2. Tests de API (`etiquetasAndreani.route.test.js`)
Prueba los endpoints de la API:
- ✅ POST `/api/etiquetasAndreani` - Generar etiquetas
- ✅ GET `/api/etiquetasAndreani?pedidoId=xxx` - Consultar etiqueta

### 3. Tests de Frontend (`handleGenerarAndreani.test.js`)
Prueba el handler de generación desde el UI:
- ✅ Validación de pedidos
- ✅ Interacción con SweetAlert2
- ✅ Manejo de errores
- ✅ Descarga de PDFs

### 4. Tests de Integración (`andreani.integration.test.js`)
Prueba el flujo completo end-to-end:
- ✅ Flujo completo de generación
- ✅ Manejo de múltiples pedidos
- ✅ Casos de error
- ✅ Validaciones
- ✅ Performance

## 🚀 Ejecutar Tests

### Todos los tests de Andreani
```bash
npm test -- andreani
```

### Test específico
```bash
# Tests unitarios de la librería
npm test -- andreani.lib.test.js

# Tests del API endpoint
npm test -- etiquetasAndreani.route.test.js

# Tests del handler frontend
npm test -- handleGenerarAndreani.test.js

# Tests de integración
npm test -- andreani.integration.test.js
```

### Con coverage
```bash
npm test -- andreani --coverage
```

### Modo watch (desarrollo)
```bash
npm test -- andreani --watch
```

## 📊 Cobertura de Tests

Los tests cubren:

- ✅ **Autenticación**: Obtención y validación de tokens
- ✅ **Creación de envíos**: Mapeo de datos y validaciones
- ✅ **Generación de etiquetas**: Obtención de PDFs
- ✅ **Manejo de errores**: Todos los casos de error posibles
- ✅ **Validación de datos**: Campos requeridos y formatos
- ✅ **Múltiples pedidos**: Procesamiento en lote
- ✅ **UI/UX**: Interacción con el usuario
- ✅ **Performance**: Tiempos de respuesta

## 🔧 Configuración

### Variables de Entorno para Tests
Los tests usan mocks, pero puedes configurar variables para tests de integración:

```env
# .env.test
ANDREANI_CLIENT_ID=test_client_id
ANDREANI_CLIENT_SECRET=test_client_secret
ANDREANI_CLIENT_NUMBER=test_contract
NODE_ENV=test
```

### Mocks
Los tests utilizan mocks para:
- `fetch` global
- Conexión a MongoDB
- Modelo Order
- SweetAlert2
- APIs de Andreani

## 📝 Ejemplos de Tests

### Test Unitario Simple
```javascript
it('debe obtener token exitosamente', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: 'token' }),
  });

  const token = await obtenerTokenAndreani();
  
  expect(token).toBe('token');
});
```

### Test de Integración
```javascript
it('debe completar el flujo completo', async () => {
  // 1. Validar pedido
  // 2. Obtener token
  // 3. Crear envío
  // 4. Obtener PDF
  // 5. Guardar en BD
  
  expect(resultado).toMatchObject({
    trackingCode: expect.any(String),
    etiqueta: expect.any(String),
  });
});
```

## 🐛 Debugging Tests

### Ver logs detallados
```bash
npm test -- andreani --reporter=verbose
```

### Ejecutar un solo test
```javascript
it.only('debe hacer algo específico', async () => {
  // Solo este test se ejecutará
});
```

### Saltar un test temporalmente
```javascript
it.skip('test que falla', async () => {
  // Este test se saltará
});
```

## 📈 Métricas de Éxito

### Cobertura Objetivo
- ✅ Líneas: > 80%
- ✅ Funciones: > 90%
- ✅ Branches: > 75%

### Casos Cubiertos
- ✅ Happy path (flujo exitoso)
- ✅ Error handling (manejo de errores)
- ✅ Edge cases (casos extremos)
- ✅ Validaciones
- ✅ Performance

## 🔄 CI/CD

Los tests se ejecutan automáticamente en:
- ✅ Pre-commit hooks
- ✅ Pull requests
- ✅ Deploy a staging
- ✅ Deploy a producción

## 📚 Recursos

- [Documentación Vitest](https://vitest.dev/)
- [Documentación Andreani](https://developers-sandbox.andreani.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🆘 Troubleshooting

### Los tests fallan en CI/CD
- Verificar que las dependencias estén instaladas
- Revisar los mocks de fetch
- Verificar las variables de entorno

### Timeouts
- Aumentar el timeout en tests lentos
- Verificar que los mocks se resuelvan correctamente

### Errores de importación
- Verificar las rutas de los imports
- Revisar la configuración de Vitest

## ✅ Checklist antes de Commit

- [ ] Todos los tests pasan
- [ ] Cobertura > 80%
- [ ] No hay tests con `.only` o `.skip`
- [ ] Los tests son claros y descriptivos
- [ ] Se prueban casos de éxito y error
- [ ] Los mocks están correctamente configurados

---

**Última actualización**: Octubre 2025  
**Mantenedor**: Starlink Soluciones

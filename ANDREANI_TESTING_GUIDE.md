# 🧪 Testing de Andreani - Guía Rápida

## 📁 Archivos de Test Creados

```
tests/andreani/
├── andreani.lib.test.js              # Tests unitarios
├── etiquetasAndreani.route.test.js   # Tests de API
├── handleGenerarAndreani.test.js     # Tests de frontend
├── andreani.integration.test.js      # Tests E2E
└── README.md                         # Documentación

scripts/
├── test-andreani.sh                  # Script para Linux/Mac
└── test-andreani.bat                 # Script para Windows

docs/
├── ANDREANI_MANUAL_TESTING.md        # Guía de pruebas manuales
└── ANDREANI_TESTING_GUIDE.md         # Este archivo
```

## 🚀 Cómo Ejecutar los Tests

### Opción 1: NPM Scripts (Recomendado)

```bash
# Todos los tests de Andreani
npm run test:andreani

# Tests específicos
npm run test:andreani:unit        # Tests unitarios
npm run test:andreani:api         # Tests de API
npm run test:andreani:frontend    # Tests de frontend
npm run test:andreani:e2e         # Tests E2E

# Con coverage
npm run test:andreani:coverage

# Modo watch (desarrollo)
npm run test:watch -- tests/andreani
```

### Opción 2: Scripts Interactivos

**Linux/Mac**:
```bash
chmod +x scripts/test-andreani.sh
./scripts/test-andreani.sh
```

**Windows**:
```bash
scripts\test-andreani.bat
```

### Opción 3: Vitest CLI

```bash
# Todos los tests
npx vitest tests/andreani

# Un archivo específico
npx vitest tests/andreani/andreani.lib.test.js

# Con UI
npx vitest --ui tests/andreani
```

## 📊 Interpretando los Resultados

### Resultado Exitoso ✅
```
✓ tests/andreani/andreani.lib.test.js (15 tests)
✓ tests/andreani/etiquetasAndreani.route.test.js (12 tests)
✓ tests/andreani/handleGenerarAndreani.test.js (8 tests)
✓ tests/andreani/andreani.integration.test.js (10 tests)

Test Files  4 passed (4)
     Tests  45 passed (45)
  Start at  10:30:00
  Duration  2.34s
```

### Resultado con Errores ❌
```
✓ tests/andreani/andreani.lib.test.js (15 tests)
✗ tests/andreani/etiquetasAndreani.route.test.js (12 tests) 1 failed
  ✗ debe generar etiquetas exitosamente
    AssertionError: expected false to be true
```

## 🔧 Configuración

### Variables de Entorno para Tests

Los tests usan mocks por defecto, pero si quieres ejecutar tests reales:

```env
# .env.test
ANDREANI_CLIENT_ID=test_client_id
ANDREANI_CLIENT_SECRET=test_client_secret
ANDREANI_CLIENT_NUMBER=test_contract
NODE_ENV=test
```

### Estructura de un Test

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Nombre del grupo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe hacer algo específico', async () => {
    // Arrange (preparar)
    const input = 'test';
    
    // Act (actuar)
    const result = await functionToTest(input);
    
    // Assert (verificar)
    expect(result).toBe('expected');
  });
});
```

## 📈 Coverage Report

Después de ejecutar tests con coverage:

```bash
npm run test:andreani:coverage
```

Se generará un reporte HTML en:
```
coverage/
├── index.html          # Abrir este archivo en el navegador
└── ...
```

### Métricas de Coverage

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Statements | > 80% | Verificar |
| Branches | > 75% | Verificar |
| Functions | > 90% | Verificar |
| Lines | > 80% | Verificar |

## 🐛 Debugging Tests

### Ver Logs Detallados

```bash
npm run test:andreani -- --reporter=verbose
```

### Ejecutar Solo un Test

```javascript
// En el archivo de test
it.only('este test se ejecutará solo', async () => {
  // ...
});
```

### Saltar un Test Temporalmente

```javascript
it.skip('este test se saltará', async () => {
  // ...
});
```

### Inspeccionar con Debugger

```javascript
it('test con debugger', async () => {
  debugger; // El test se detendrá aquí
  const result = await myFunction();
  expect(result).toBe('expected');
});
```

Luego ejecutar:
```bash
node --inspect-brk node_modules/vitest/vitest.mjs tests/andreani
```

## 🧪 Tests Manuales

Para pruebas manuales completas, consulta:
```
ANDREANI_MANUAL_TESTING.md
```

### Quick Test Manual

1. **Abrir navegador**: `http://localhost:3000`
2. **Abrir DevTools**: F12 → Console
3. **Ejecutar**:

```javascript
// Test rápido de token
fetch('/api/etiquetasAndreani', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pedidos: [] })
})
.then(r => r.json())
.then(d => console.log('✅ API funcionando:', d))
.catch(e => console.error('❌ Error:', e));
```

## 📋 Checklist Antes de Commit

- [ ] `npm run test:andreani` pasa sin errores
- [ ] Coverage > 80%
- [ ] No hay tests con `.only` o `.skip`
- [ ] Los tests son descriptivos
- [ ] Se prueban casos de éxito y error
- [ ] Los mocks están correctamente configurados
- [ ] No hay warnings en consola

## 🔄 Integración Continua

Los tests se ejecutarán automáticamente en:

### Pre-commit Hook (Si está configurado)
```bash
# Se ejecuta antes de cada commit
npm run test:andreani
```

### GitHub Actions / CI Pipeline
```yaml
# .github/workflows/test.yml
- name: Run Andreani Tests
  run: npm run test:andreani:coverage
```

## 📚 Recursos Adicionales

### Documentación
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Andreani API](https://developers-sandbox.andreani.com/)

### Tests Relacionados
- `tests/api.productos.test.js` - Ejemplo de tests de API
- `tests/firebase.mock.test.js` - Ejemplo de mocking

## 🆘 Troubleshooting

### Problema: Tests no encuentran módulos

**Solución**:
```bash
npm install
npm run test:andreani
```

### Problema: Timeouts en tests

**Solución**:
```javascript
// Aumentar timeout en test específico
it('test lento', async () => {
  // ...
}, 10000); // 10 segundos
```

### Problema: Mocks no funcionan

**Solución**:
```javascript
// Limpiar mocks antes de cada test
beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
```

### Problema: Tests fallan en CI pero pasan local

**Solución**:
1. Verificar variables de entorno en CI
2. Verificar versiones de Node
3. Limpiar cache: `rm -rf node_modules .vitest`

## 📊 Reporte de Tests

### Comando para Reporte Detallado

```bash
npm run test:andreani -- --reporter=json --outputFile=test-results.json
```

### Ver Resultados Anteriores

```bash
# HTML Coverage
open coverage/index.html

# JSON Results
cat test-results.json | jq
```

## ✅ Casos de Prueba Cubiertos

### Casos de Éxito ✅
- [x] Obtener token de Andreani
- [x] Crear envío con datos válidos
- [x] Generar etiqueta PDF
- [x] Procesar múltiples pedidos
- [x] Actualizar estado del pedido
- [x] Guardar tracking code

### Casos de Error ❌
- [x] Credenciales inválidas
- [x] Pedido sin pagar
- [x] Datos incompletos
- [x] Dirección inválida
- [x] Error de red
- [x] Timeout de Andreani

### Edge Cases 🔍
- [x] Pedido con etiqueta existente
- [x] Array vacío de pedidos
- [x] ID de pedido malformado
- [x] Provincia no mapeada
- [x] Código postal inválido

## 🎯 Próximos Pasos

1. **Ejecutar tests**: `npm run test:andreani`
2. **Verificar coverage**: Debe ser > 80%
3. **Tests manuales**: Seguir `ANDREANI_MANUAL_TESTING.md`
4. **Deploy a staging**: Si todos los tests pasan
5. **Test en staging**: Con pedido real
6. **Deploy a producción**: ✅

---

**Creado**: Octubre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para usar

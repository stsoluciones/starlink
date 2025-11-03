# ✅ Checklist Rápido - Datos Estructurados

## 🎯 Antes de Testear con Google

### Paso 1: Build Local
```bash
npm run build
```
- [ ] El build termina sin errores críticos (ignora warnings de MongoDB)

### Paso 2: Test Local
```bash
npm start
```
Luego abrir: http://localhost:3000/productos/[nombre-producto]

- [ ] La página carga correctamente
- [ ] Click derecho → "Ver código fuente"
- [ ] Buscar `<script type="application/ld+json">`
- [ ] El JSON contiene `"@type": "Product"`
- [ ] El JSON contiene `"@type": "BreadcrumbList"`

### Paso 3: Verificar Datos del Producto
- [ ] El producto tiene `nombre`
- [ ] El producto tiene `precio` (número válido)
- [ ] El producto tiene `foto_1_1` (URL válida)
- [ ] El producto tiene `marca`

### Paso 4: Deploy a Producción
- [ ] Hacer commit y push
- [ ] El sitio se deploya correctamente
- [ ] La URL del producto es accesible públicamente

### Paso 5: Test con Google
Ir a: https://search.google.com/test/rich-results

- [ ] Ingresar URL completa: `https://slsoluciones.com.ar/productos/[nombre]`
- [ ] Esperar 10-30 segundos
- [ ] Google detecta "Product" ✅
- [ ] Google detecta "BreadcrumbList" ✅
- [ ] Sin errores ✅

## 🚨 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "No se detecta ningún elemento" | URL incorrecta (localhost o home) | Usar URL de producción del producto |
| "Solo detecta Organization" | Testeando `/` en vez de `/productos/X` | Testear URL completa del producto |
| "Script no aparece en código fuente" | Error en build o fetchProduct | Verificar logs y base de datos |
| "Imagen no válida" | URL de imagen retorna 404 | Verificar que imagen sea accesible |
| "Precio faltante" | Campo `precio` es null/undefined | Completar precio en base de datos |

## 📞 Si Todo Falla

1. ✅ Verifica que el sitio sea accesible públicamente
2. ✅ Espera 24-48 horas para re-indexación
3. ✅ Usa Schema Validator: https://validator.schema.org/
4. ✅ Revisa Google Search Console
5. ✅ Solicita indexación manual en Search Console

## 🎉 Éxito

Si ves esto en el test de Google:

```
Elementos detectados

✅ Product
   name: "Tu Producto"
   brand: "Tu Marca"
   price: "XXXXX"
   
✅ BreadcrumbList
   Inicio → Productos → Tu Producto
```

**¡Felicitaciones! Los datos estructurados están funcionando correctamente.** 🎉

---

**Siguiente paso**: Esperar 24-48 horas para que Google indexe los cambios y comenzar a ver resultados enriquecidos en las búsquedas.

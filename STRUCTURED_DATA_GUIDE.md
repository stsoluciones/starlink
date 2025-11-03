# Guía de Datos Estructurados (JSON-LD)

## ✅ Cambios Implementados

Se ha corregido la implementación de datos estructurados (JSON-LD) para que Google y otros motores de búsqueda puedan detectarlos correctamente.

### Problema Anterior
- Se usaba `metadata.other` que Next.js **no renderiza** como script en el HTML
- El test de resultados enriquecidos de Google no detectaba ningún elemento
- El componente `<Script>` de Next.js con `strategy="beforeInteractive"` no funciona en Server Components

### Solución Implementada
- Se usa el **elemento HTML nativo `<script>`** directamente en el JSX
- El JSON-LD se renderiza correctamente en el HTML inicial del servidor
- Compatible con Server Components de Next.js 14+

---

## 📄 Páginas Actualizadas

### 1. **Página Principal** (`src/app/page.jsx`)
Incluye datos estructurados para:
- ✅ **Organization** - Información de SLS Soluciones
- ✅ **WebSite** - Información del sitio web
- ✅ **WebPage** - Información de la página principal

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "SLS Soluciones",
      "url": "https://slsoluciones.com.ar/",
      "logo": { ... },
      "sameAs": [...],
      "contactPoint": { ... }
    },
    {
      "@type": "WebSite",
      "url": "https://slsoluciones.com.ar/",
      "name": "SLS Soluciones",
      "description": "..."
    },
    {
      "@type": "WebPage",
      "url": "https://slsoluciones.com.ar/",
      "name": "..."
    }
  ]
}
```

### 2. **Páginas de Producto** (`src/app/productos/[nombre]/page.jsx`)
Incluye datos estructurados para:
- ✅ **Product** - Información del producto con ofertas
- ✅ **BreadcrumbList** - Navegación breadcrumb para SEO

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "name": "Nombre del Producto",
      "description": "...",
      "sku": "...",
      "brand": { "@type": "Brand", "name": "..." },
      "image": [...],
      "offers": {
        "@type": "Offer",
        "price": "...",
        "priceCurrency": "ARS",
        "availability": "https://schema.org/InStock"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "..." },
        { "@type": "ListItem", "position": 2, "name": "Productos", "item": "..." },
        { "@type": "ListItem", "position": 3, "name": "...", "item": "..." }
      ]
    }
  ]
}
```

---

## 🧪 Cómo Validar los Datos Estructurados

### 0. **Test Local Primero** ⚠️ IMPORTANTE
Antes de probar con Google, verifica localmente:

```bash
# Windows
.\scripts\test-structured-data.bat

# Linux/Mac
./scripts/test-structured-data.sh
```

O manualmente:
1. `npm run build && npm start`
2. Abre http://localhost:3000/productos/[nombre-producto]
3. Click derecho → **Ver código fuente** (NO inspeccionar elemento)
4. Busca `<script type="application/ld+json">`
5. Deberías ver el JSON con **Product** y **BreadcrumbList**

**🚨 Si no ves el script en el código fuente, Google tampoco lo verá**

### 1. **Test de Resultados Enriquecidos de Google**
⚠️ **Solo funciona con URLs públicas en producción**

1. Ir a: https://search.google.com/test/rich-results
2. Ingresar la URL **DE PRODUCCIÓN** de tu producto (ej: `https://slsoluciones.com.ar/productos/starlink_mini`)
3. Esperar a que Google analice la página (puede tardar 10-30 segundos)
4. Deberías ver:
   - ✅ **Product** detectado con todos sus campos
   - ✅ **BreadcrumbList** detectado
   - ✅ Sin errores ni advertencias

**Nota**: El test de Google NO funciona con localhost. Debes tener el sitio deployado en producción.

### 2. **Schema Markup Validator**
1. Ir a: https://validator.schema.org/
2. Pegar la URL de tu página
3. Verificar que todos los tipos se detecten correctamente

### 3. **Google Search Console**
1. Ir a: https://search.google.com/search-console
2. Navegar a **Mejoras** → **Productos**
3. Verificar que los productos se indexen correctamente
4. Revisar cualquier error o advertencia

### 4. **Inspección Manual del HTML**
```bash
# Ver el código fuente de la página
# Buscar <script type="application/ld+json">
# Deberías ver el JSON-LD completo en el HTML
```

---

## 📋 Checklist de Validación

Antes de considerar que todo está correcto, verifica:

- [ ] El script JSON-LD aparece en el código fuente HTML
- [ ] El test de resultados enriquecidos detecta los elementos
- [ ] No hay errores de validación en schema.org
- [ ] Los datos son correctos (precios, nombres, imágenes)
- [ ] Las URLs son absolutas (incluyen https://)
- [ ] Las imágenes tienen URLs válidas y accesibles
- [ ] El precio está presente y es un número válido
- [ ] La disponibilidad refleja el estado real del producto
- [ ] Los breadcrumbs tienen la jerarquía correcta

---

## 🔧 Estructura de Archivos Modificados

```
src/app/
  ├── page.jsx                           ← JSON-LD de Organization/WebSite
  └── productos/
      └── [nombre]/
          └── page.jsx                   ← JSON-LD de Product/BreadcrumbList
```

---

## 🚀 Próximos Pasos

1. **Build de producción**:
   ```bash
   npm run build
   ```

2. **Deploy a producción** (si aplica)

3. **Esperar 24-48 horas** para que Google re-indexe las páginas

4. **Validar en Search Console** que los productos se detecten

5. **Opcional**: Solicitar re-indexación manual en Search Console:
   - Ir a **Inspección de URLs**
   - Pegar la URL del producto
   - Click en **Solicitar indexación**

---

## � Troubleshooting

### Problema: "No se detecta ningún elemento"

**Posibles causas:**

1. **Estás testeando localhost**: El test de Google solo funciona con URLs públicas.
   - ✅ Solución: Testea con la URL de producción

2. **El sitio no está deployado**: Google no puede acceder al sitio.
   - ✅ Solución: Deploy a producción y espera a que esté accesible públicamente

3. **El script no está en el HTML**: Verificar con "Ver código fuente"
   - ✅ Solución: Revisar que el build incluya el script. Probar localmente primero.

4. **Error de sintaxis en el JSON**: JSON mal formado
   - ✅ Solución: Validar el JSON en https://jsonlint.com/

5. **Campo requerido faltante**: Faltan campos obligatorios del schema
   - ✅ Solución: Verificar en https://validator.schema.org/

### Problema: "Solo detecta Organization, no Product"

**Posibles causas:**

1. **Testeando la URL incorrecta**: Estás probando `/` en vez de `/productos/[nombre]`
   - ✅ Solución: Testea la URL completa del producto: `https://tudominio.com/productos/nombre-producto`

2. **El producto no existe**: La página retorna 404
   - ✅ Solución: Verificar que el producto exista en la base de datos

3. **Error en fetchProduct**: El producto no se carga correctamente
   - ✅ Solución: Revisar logs del servidor y que MongoDB esté funcionando

### Problema: "El JSON está en el HTML pero Google no lo detecta"

**Posibles causas:**

1. **Campos con valores undefined o null**: Schema.org no acepta valores nulos
   - ✅ Solución: Asegurar que todos los campos tengan valores válidos o se omitan

2. **URLs relativas en vez de absolutas**: Las URLs deben incluir `https://`
   - ✅ Solución: Usar la función `toAbs()` para todas las URLs

3. **Imagen no accesible**: La URL de la imagen retorna 404 o error
   - ✅ Solución: Verificar que las imágenes sean accesibles públicamente

4. **Precio faltante o inválido**: El precio es obligatorio en Product
   - ✅ Solución: Asegurar que `product.precio` existe y es un número

## �📚 Referencias

- [Schema.org - Product](https://schema.org/Product)
- [Schema.org - BreadcrumbList](https://schema.org/BreadcrumbList)
- [Schema.org - Organization](https://schema.org/Organization)
- [Google - Datos Estructurados](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

---

## ⚠️ Notas Importantes

1. **Elemento `<script>` nativo**: Usamos `<script>` HTML nativo en vez del componente `<Script>` de Next.js porque los Server Components no soportan `strategy="beforeInteractive"`.

2. **@graph**: Usamos `@graph` cuando tenemos múltiples tipos de datos estructurados en la misma página (Product + BreadcrumbList).

3. **URLs Absolutas**: Todas las URLs deben ser absolutas (incluir `https://`). Verificar que no falten barras (`/`) entre dominio y ruta.

4. **Precios dinámicos**: Si los precios cambian frecuentemente, considera agregar `priceValidUntil` con una fecha futura.

5. **Productos sin stock**: Cambiar `availability` a `https://schema.org/OutOfStock` cuando `product.vendido === true`.

6. **Test con URL de producción**: El test de Google Rich Results **solo funciona con URLs públicas**, NO con localhost.

7. **Ver código fuente vs Inspeccionar**: Siempre usa "Ver código fuente" (Ctrl+U) para verificar el HTML inicial del servidor. "Inspeccionar elemento" muestra el DOM después de JS, que no es lo que Google ve.

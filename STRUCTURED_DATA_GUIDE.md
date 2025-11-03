# Guía de Datos Estructurados (JSON-LD)

## ✅ Cambios Implementados

Se ha corregido la implementación de datos estructurados (JSON-LD) para que Google y otros motores de búsqueda puedan detectarlos correctamente.

### Problema Anterior
- Se usaba `metadata.other` que Next.js **no renderiza** como script en el HTML
- El test de resultados enriquecidos de Google no detectaba ningún elemento

### Solución Implementada
- Se usa el componente `<Script>` de Next.js con `type="application/ld+json"`
- El JSON-LD se renderiza correctamente en el HTML de la página

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

### 1. **Test de Resultados Enriquecidos de Google**
1. Ir a: https://search.google.com/test/rich-results
2. Ingresar la URL de tu sitio (ej: `https://slsoluciones.com.ar/productos/starlink-mini`)
3. Esperar a que Google analice la página
4. Deberías ver:
   - ✅ **Producto** detectado con todos sus campos
   - ✅ **BreadcrumbList** detectado
   - ✅ Sin errores ni advertencias

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

## 📚 Referencias

- [Schema.org - Product](https://schema.org/Product)
- [Schema.org - BreadcrumbList](https://schema.org/BreadcrumbList)
- [Schema.org - Organization](https://schema.org/Organization)
- [Google - Datos Estructurados](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Next.js - Script Component](https://nextjs.org/docs/app/api-reference/components/script)

---

## ⚠️ Notas Importantes

1. **Strategy `beforeInteractive`**: El script se carga antes de que Next.js hidrate la página, asegurando que Google lo detecte en el HTML inicial.

2. **@graph**: Usamos `@graph` cuando tenemos múltiples tipos de datos estructurados en la misma página (Product + BreadcrumbList).

3. **URLs Absolutas**: Todas las URLs deben ser absolutas (incluir `https://`).

4. **Precios dinámicos**: Si los precios cambian frecuentemente, considera agregar `priceValidUntil` con una fecha futura.

5. **Productos sin stock**: Cambiar `availability` a `https://schema.org/OutOfStock` cuando `product.vendido === true`.

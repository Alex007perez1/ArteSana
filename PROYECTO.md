# ArteSana - Documentacion del Proyecto

Aplicacion web para ArteSana: catalogo publico de productos naturales, carrito con pedido por WhatsApp y panel administrativo conectado a Supabase para gestionar productos, imagenes, stock, contenido editable e inventario resumido.

## Resumen

- **Framework**: Next.js 16 con App Router.
- **Lenguaje**: TypeScript.
- **UI**: React 19, Tailwind CSS v4, lucide-react.
- **Backend**: Supabase.
- **Base de datos**: PostgreSQL en Supabase.
- **Auth**: Supabase Auth, usuario administrador con email/password.
- **Storage**: Supabase Storage bucket `product-images`.
- **Deploy**: Netlify con exportacion estatica.
- **Repositorio GitHub**: `https://github.com/Alex007perez1/ArteSana.git`.

## Estructura Principal

```txt
arts/
  netlify.toml
  PROYECTO.md
  web/
    package.json
    next.config.ts
    README.md
    .env.local
    supabase_setup.sql
    supabase_migration_v2.sql
    supabase_migration_v3.sql
    supabase_sync_pptx.sql
    public/
      catalog/
        logo.png
        logo-small.png
        qr-whatsapp.png
        qr-pago.png
        *.png
    src/
      app/
        layout.tsx
        page.tsx
        admin/
          login/page.tsx
          dashboard/page.tsx
      lib/
        supabase.ts
        catalog-data.ts
```

## Comandos

Ejecutar desde `web/`:

```bash
npm install
npm run dev
npm run build
npm run lint
```

- `npm run dev`: servidor local.
- `npm run build`: genera exportacion estatica en `web/out`.
- `npm run lint`: corre ESLint.

## Variables de Entorno

Crear `web/.env.local` en local y configurar las mismas variables en Netlify.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

No guardar llaves privadas ni service role keys en el repositorio.

## Rutas

- `/`: catalogo publico, carrito y pedido por WhatsApp.
- `/admin/login`: login del administrador.
- `/admin/dashboard`: panel de administracion.

## Funcionalidades Publicas

- Catalogo de productos ArteSana.
- Carga productos desde Supabase.
- Si Supabase falla, usa datos fallback de `src/lib/catalog-data.ts`.
- Imagenes locales fallback en `public/catalog/`.
- Selector de variantes/presentaciones cuando el producto tiene `variants`.
- Carrito en `localStorage`.
- Pedido por WhatsApp al numero `+591 68703773`.
- Seccion de contacto con QR WhatsApp y QR de pago.
- Logo, QR y textos principales pueden editarse desde el admin.

## Funcionalidades Admin

Archivo principal: `web/src/app/admin/dashboard/page.tsx`.

El admin permite:

- Crear productos.
- Editar productos.
- Eliminar productos.
- Activar/desactivar productos publicos.
- Subir imagen de producto a Supabase Storage.
- Cambiar stock con botones `+` y `-`.
- Registrar movimientos de stock en `inventory_log`.
- Ver resumen de inventario: disponible y vendido por producto.
- Editar variantes del producto.
- Cambiar logo publico.
- Cambiar QR WhatsApp.
- Cambiar QR de pago.
- Editar textos de portada, pasos de pedido y combo.

## Supabase

### Tabla `products`

Creada por `web/supabase_setup.sql`.

Campos principales:

- `id`: UUID.
- `name`: nombre del producto.
- `category`: categoria.
- `image_url`: URL de imagen.
- `presentation`: presentacion base.
- `price`: precio base.
- `stock`: stock disponible.
- `variants`: JSONB, agregado por migracion v2.
- `intro`, `benefit`, `use`, `apply`, `recommend`, `note`: textos del producto.
- `accent`: color visual.
- `is_active`: si aparece en catalogo.
- `created_at`: fecha de creacion.

### Tabla `site_settings`

Creada por `web/supabase_migration_v2.sql`.

Guarda configuracion editable del sitio con clave/valor:

- `logo_url`
- `qr_whatsapp`
- `qr_pago`
- `page_content`

`page_content` es un JSON serializado con textos de la pagina publica.

### Tabla `inventory_log`

Creada por `web/supabase_migration_v3.sql`.

Registra movimientos de stock:

- `product_id`
- `product_name`
- `previous_stock`
- `new_stock`
- `change_amount`
- `reason`
- `created_at`

El resumen de vendidos se calcula sumando los movimientos negativos (`change_amount < 0`) por producto.

## Orden de SQL en Supabase

Ejecutar en Supabase SQL Editor:

1. `web/supabase_setup.sql`
2. `web/supabase_migration_v2.sql`
3. `web/supabase_sync_pptx.sql` si se quiere sincronizar datos extraidos del PPTX.
4. `web/supabase_migration_v3.sql`

Despues crear manualmente un usuario admin en Supabase Auth.

## Seguridad y RLS

Las politicas actuales son:

- `products`: lectura publica, escritura solo usuarios autenticados.
- `site_settings`: lectura publica, escritura solo usuarios autenticados.
- `inventory_log`: lectura e insercion solo usuarios autenticados.
- `product-images`: lectura publica, subida/edicion/borrado solo autenticados.

El frontend usa anon key. Las restricciones reales dependen de las politicas RLS.

## Storage

Bucket usado: `product-images`.

Se usa para:

- Imagenes de productos subidas desde admin.
- Logo configurable.
- QR WhatsApp configurable.
- QR de pago configurable.

Las imagenes estaticas fallback estan en:

```txt
web/public/catalog/
```

## Imagenes y Favicon

Archivos principales:

- `web/public/catalog/logo.png`: logo grande y Open Graph preview.
- `web/public/catalog/logo-small.png`: favicon/icono de navegador.

La metadata se configura en:

```txt
web/src/app/layout.tsx
```

Incluye:

- `openGraph.images`: `/catalog/logo.png`.
- `icons`: `/catalog/logo-small.png`.

Si WhatsApp muestra una imagen vieja, limpiar cache en:

```txt
https://developers.facebook.com/tools/debug/
```

## Catalogo Fallback

Archivo:

```txt
web/src/lib/catalog-data.ts
```

Contiene productos estaticos para que el catalogo pueda renderizar aunque Supabase no responda.

Tambien contiene la funcion `mergeWithCatalogData()`, que mezcla datos de Supabase con datos estaticos, preservando campos importantes como imagen, presentacion y variantes.

## Configuracion de Supabase Client

Archivo:

```txt
web/src/lib/supabase.ts
```

Usa:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deploy en Netlify

Archivo:

```txt
netlify.toml
```

Configuracion actual:

```toml
[build]
  base = "web"
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "22"
```

Next esta configurado como exportacion estatica:

```ts
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

Despues de cada push a GitHub, Netlify deberia desplegar automaticamente si esta conectado al repo.

## Consideraciones para Desarrolladores

- Es una app estatica en produccion, no depender de SSR ni API routes del servidor.
- Mantener las rutas `/`, `/admin/login` y `/admin/dashboard` compatibles con static export.
- Para imagenes de Next usar `img` normal o mantener `images.unoptimized`.
- No exponer service role key en frontend.
- Si se agregan tablas nuevas, crear SQL versionado similar a `supabase_migration_v*.sql`.
- Si se cambia la estructura de `products`, actualizar tambien `catalog-data.ts`, el admin y los SQL.
- Si se cambia el numero de WhatsApp, buscar `68703773` en el proyecto.

## Flujo para Modificar Productos

1. Entrar a `/admin/login`.
2. Iniciar sesion con usuario de Supabase Auth.
3. Entrar a `/admin/dashboard`.
4. Crear o editar producto.
5. Subir imagen si corresponde.
6. Activar/desactivar con el control de visibilidad.
7. Guardar cambios.

## Flujo para Inventario

1. En admin, usar `+` para aumentar stock.
2. Usar `-` para disminuir stock por venta o salida.
3. Abrir `Inventario`.
4. Ver resumen por producto:
   - Disponible: valor actual de `products.stock`.
   - Vendidos: suma de salidas registradas en `inventory_log`.

## Archivos Clave

- `web/src/app/page.tsx`: catalogo publico, carrito, WhatsApp, secciones de contacto.
- `web/src/app/admin/dashboard/page.tsx`: CRUD, stock, inventario, configuracion.
- `web/src/app/admin/login/page.tsx`: login admin.
- `web/src/app/layout.tsx`: metadata, Open Graph, favicon.
- `web/src/lib/supabase.ts`: cliente Supabase.
- `web/src/lib/catalog-data.ts`: fallback del catalogo y merge con Supabase.
- `web/supabase_setup.sql`: tabla productos, storage, seed inicial.
- `web/supabase_migration_v2.sql`: variantes y site settings.
- `web/supabase_sync_pptx.sql`: sincronizacion de datos PPTX.
- `web/supabase_migration_v3.sql`: log de inventario.
- `netlify.toml`: deploy Netlify.

## Problemas Comunes

### El admin no carga productos

- Verificar `.env.local`.
- Verificar variables en Netlify.
- Verificar que `supabase_setup.sql` fue ejecutado.
- Verificar RLS y usuario autenticado.

### El inventario muestra vendidos en cero

- Ejecutar `supabase_migration_v3.sql`.
- Registrar salidas usando el boton `-`.
- Los vendidos solo cuentan movimientos negativos registrados.

### WhatsApp muestra imagen vieja

- Verificar `layout.tsx`.
- Verificar que `/catalog/logo.png` existe en produccion.
- Usar Facebook Sharing Debugger para limpiar cache.

### Netlify muestra 404

- Verificar `netlify.toml`.
- Verificar que `base = "web"`.
- Verificar que `publish = "out"`.
- Verificar que `next.config.ts` tenga `output: 'export'`.

## Estado Actual

- Build local correcto con `npm run build`.
- Favicon por defecto de Next eliminado.
- Icono de ArteSana configurado.
- Open Graph configurado para compartir en WhatsApp.
- Inventario simplificado a resumen por producto.
- Cambios principales subidos a GitHub.

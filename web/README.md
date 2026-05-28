# ArteSana Web

Aplicación Next.js para catálogo público, carrito por WhatsApp y panel de administración con Supabase.

## Configuración local

1. Copia `.env.local.example` a `.env.local`.
2. Coloca `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` desde Supabase.
3. Ejecuta `supabase_setup.sql` en el SQL Editor de Supabase.
4. Crea un usuario administrador en Supabase Auth.
5. Ejecuta `npm run dev`.

## Rutas

- `/`: catálogo público y carrito.
- `/admin/login`: acceso del dueño.
- `/admin/dashboard`: inventario, productos, stock e imágenes.

## Despliegue en Netlify

El archivo `../netlify.toml` ya configura el proyecto con base `web`. En Netlify agrega las mismas variables de entorno de Supabase.

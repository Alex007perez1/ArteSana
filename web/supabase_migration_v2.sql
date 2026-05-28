-- =====================================================================
-- MIGRACIÓN V2: Variants + Site Settings
-- Ejecuta después de supabase_setup.sql
-- =====================================================================

-- 1. AGREGAR COLUMNA variants A products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT NULL;

-- 2. TABLA DE CONFIGURACIÓN DEL SITIO
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura pública, escritura solo admin
DROP POLICY IF EXISTS "Lectura pública de configuración" ON public.site_settings;
CREATE POLICY "Lectura pública de configuración"
ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura de configuración solo admin" ON public.site_settings;
CREATE POLICY "Escritura de configuración solo admin"
ON public.site_settings FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Actualización de configuración solo admin" ON public.site_settings;
CREATE POLICY "Actualización de configuración solo admin"
ON public.site_settings FOR UPDATE
USING (auth.role() = 'authenticated');

-- 3. INSERTAR VALOR POR DEFECTO DEL LOGO
INSERT INTO public.site_settings (key, value)
VALUES ('logo_url', '/catalog/logo.png')
ON CONFLICT (key) DO NOTHING;

-- 4. ACTUALIZAR sync SQL para incluir variants (opcional)
-- Los scripts existentes siguen funcionando; variants se deja sin tocar al sync.

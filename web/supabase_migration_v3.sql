-- =====================================================================
-- MIGRACIÓN V3: Control de inventario (stock movements log)
-- Ejecutar después de supabase_migration_v2.sql
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  reason TEXT DEFAULT 'Ajuste manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inventory_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de inventario solo admin" ON public.inventory_log;
CREATE POLICY "Lectura de inventario solo admin"
ON public.inventory_log FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Inserción de inventario solo admin" ON public.inventory_log;
CREATE POLICY "Inserción de inventario solo admin"
ON public.inventory_log FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

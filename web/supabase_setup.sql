-- =====================================================================
-- CONFIGURACIÓN DE SUPABASE - PROYECTO ARTESANA
-- Copia y pega este script completo en el editor SQL de Supabase
-- =====================================================================

-- 1. CREACIÓN DE LA TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    presentation TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0.0,
    stock INTEGER NOT NULL DEFAULT 10,
    intro TEXT NOT NULL,
    benefit TEXT NOT NULL,
    use TEXT NOT NULL,
    apply TEXT NOT NULL,
    recommend TEXT NOT NULL,
    note TEXT NOT NULL,
    accent TEXT NOT NULL DEFAULT 'rosa',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) en productos
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS DE SEGURIDAD PARA PRODUCTOS
DROP POLICY IF EXISTS "Permitir lectura publica de productos" ON public.products;
CREATE POLICY "Permitir lectura publica de productos" 
ON public.products FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Permitir insercion solo a admins" ON public.products;
CREATE POLICY "Permitir insercion solo a admins" 
ON public.products FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir actualizacion solo a admins" ON public.products;
CREATE POLICY "Permitir actualizacion solo a admins" 
ON public.products FOR UPDATE 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir borrado solo a admins" ON public.products;
CREATE POLICY "Permitir borrado solo a admins" 
ON public.products FOR DELETE 
USING (auth.role() = 'authenticated');


-- 3. CONFIGURACIÓN DEL BUCKET DE ALMACENAMIENTO DE IMÁGENES
-- Crear el bucket de imagenes si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS en almacenamiento (ya viene habilitado por defecto en storage.objects)
-- Políticas de almacenamiento para el bucket public 'product-images'
DROP POLICY IF EXISTS "Lectura publica de imagenes" ON storage.objects;
CREATE POLICY "Lectura publica de imagenes" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Subida de imagenes para admins" ON storage.objects;
CREATE POLICY "Subida de imagenes para admins" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Actualizacion de imagenes para admins" ON storage.objects;
CREATE POLICY "Actualizacion de imagenes para admins" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Borrado de imagenes para admins" ON storage.objects;
CREATE POLICY "Borrado de imagenes para admins" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');


-- 4. INSERCIÓN DE DATOS INICIALES (SEEDING)
-- Limpia los productos existentes para evitar duplicados en pruebas limpias (opcional)
-- TRUNCATE TABLE public.products RESTART IDENTITY;

INSERT INTO public.products 
(name, category, presentation, price, stock, intro, benefit, use, apply, recommend, note, accent, is_active)
VALUES 
(
    'Jabón de Carbón', 
    'Jabones artesanales', 
    '90 g', 
    25.0, 
    15, 
    'Limpieza profunda para piel con exceso de grasa, brillo e impurezas visibles.',
    'El carbón activado ayuda a adsorber sebo, partículas e impurezas superficiales.',
    'Humedecer rostro o cuerpo, espumar 30 a 45 segundos y retirar con agua.',
    'Usar 1 vez al día en piel grasa. Alternar si la piel se siente reseca.',
    'Aplicar hidratante después de la limpieza para conservar la barrera cutánea.',
    'Uso seguro siguiendo recomendaciones de aplicación.',
    'verde',
    true
),
(
    'Jabón de Manzanilla', 
    'Piel sensible', 
    '90 g', 
    25.0, 
    12, 
    'Suavidad herbal para limpiar, nutrir y dar confort a pieles delicadas.',
    'La manzanilla aporta compuestos calmantes asociados al confort de la piel sensible.',
    'Masajear con movimientos circulares suaves, sin fricción intensa.',
    'Ideal para uso diario en rostro, cuello o zonas con sensación de tirantez.',
    'Secar con toalla limpia a toques y complementar con crema ligera.',
    'Fórmula artesanal pensada para una limpieza amable y sensorial.',
    'rosa',
    true
),
(
    'Jabón de Romero', 
    'Herbal revitalizante', 
    '90 g', 
    25.0, 
    8, 
    'Limpieza estimulante con aroma herbal para una piel con sensación fresca y tonificada.',
    'El romero contiene antioxidantes naturales usados tradicionalmente en cuidado cutáneo.',
    'Crear espuma en manos y aplicar sobre piel húmeda durante 30 segundos.',
    'Recomendado para ducha matinal o después de actividad física ligera.',
    'Guardar en jabonera drenante para conservar su textura por más tiempo.',
    'Cuidado artesanal con sensación herbal, limpia y vigorizante.',
    'terracota',
    true
),
(
    'Jabón de Aloe Vera', 
    'Humectacion diaria', 
    '90 g', 
    25.0, 
    20, 
    'Una barra suave para acompañar la hidratación y el cuidado cotidiano de la piel.',
    'El aloe vera es valorado por su contenido de mucílagos con efecto humectante.',
    'Aplicar sobre piel húmeda, espumar suavemente y enjuagar con agua fresca.',
    'Puede usarse en rostro y cuerpo como limpieza diaria de baja agresividad.',
    'Combinar con crema facial cuando se busque mayor suavidad al tacto.',
    'Uso seguro siguiendo recomendaciones de aplicación.',
    'verde',
    true
),
(
    'Jabón de Arroz', 
    'Luminosidad natural', 
    '90 g', 
    28.0, 
    14, 
    'Para una piel más suave, uniforme y luminosa dentro de una rutina constante.',
    'El arroz aporta almidones y compuestos suavizantes usados en cosmética natural.',
    'Masajear la espuma en rostro o cuerpo, evitando el contorno de ojos.',
    'Usar en la noche y complementar de día con hidratación y protección solar.',
    'Combo sugerido: Jabón de Arroz + Crema Facial + Shampoo Anti-Stress.',
    'Ideal para rutinas que buscan suavidad, tono visual más parejo y cuidado constante.',
    'rosa',
    true
),
(
    'Jabón de Azufre', 
    'Control de brillo', 
    '90 g', 
    25.0, 
    6, 
    'Limpieza específica para piel grasa, brillo persistente y sensación de poros congestionados.',
    'El azufre se usa en cosmética por su apoyo en higiene de piel grasa.',
    'Aplicar solo en zonas necesarias, dejar actuar brevemente y enjuagar bien.',
    'Iniciar 3 veces por semana. Aumentar solo si la piel lo tolera bien.',
    'No combinar el mismo día con exfoliación intensa para evitar resequedad.',
    'Uso seguro siguiendo recomendaciones de aplicación.',
    'terracota',
    true
),
(
    'Crema Facial', 
    'Hidratación nutritiva', 
    'Gramos', 
    45.0, 
    10, 
    'Sábila, colágeno, pepino y vitaminas A, E y C para una piel con sensación nutrida y flexible.',
    'Apoya la hidratación superficial y mejora la sensación de elasticidad.',
    'Aplicar una pequeña cantidad sobre rostro limpio, mañana y noche.',
    'Distribuir hacia arriba en mejillas, frente, cuello y escote.',
    'Usar después del Jabón de Arroz para una rutina de luminosidad.',
    'Textura para cuidado diario, con enfoque artesanal natural.',
    'verde',
    true
),
(
    'Crema Anti-Stress', 
    'Cuidado corporal', 
    '150 g', 
    55.0, 
    10, 
    'Fórmula relajante con magnesio y aceites esenciales para masaje localizado.',
    'El masaje favorece la sensación de descanso muscular y bienestar corporal.',
    'Aplicar en cuello, hombros, espalda o piernas con movimientos lentos.',
    'Usar por la noche o después de una jornada de esfuerzo físico.',
    'Realizar masaje de 3 a 5 minutos hasta lograr absorción confortable.',
    'Uso externo. Uso seguro siguiendo recomendaciones de aplicación.',
    'rosa',
    true
),
(
    'Crema Vital-Flex', 
    'Alivio corporal rapido', 
    '150 g', 
    55.0, 
    8, 
    'Crema para masaje en zonas de tensión articular o muscular con sensación de calor intenso.',
    'El masaje localizado ayuda a activar la sensación térmica y confort en la zona.',
    'Aplicar poca cantidad sobre la zona y masajear hasta absorción.',
    'Evitar contacto con ojos, mucosas o piel recién rasurada.',
    'Lavar manos después de aplicar y no cubrir con calor adicional.',
    'Uso seguro siguiendo recomendaciones de aplicación.',
    'terracota',
    true
),
(
    'Shampoo Anti-Stress', 
    'Cuidado capilar', 
    '160 g', 
    40.0, 
    15, 
    'Refrescante y relajante, con aceites esenciales y extractos botánicos para cuero cabelludo y cabello.',
    'Apoya la limpieza capilar con sensación fresca, suave y aromática.',
    'Aplicar sobre cabello mojado, masajear cuero cabelludo y enjuagar.',
    'Repetir si se requiere mayor limpieza. Usar 2 a 4 veces por semana.',
    'Combo especial con Jabón de Arroz y Crema Facial.',
    'Producto unisex para una rutina de frescura y cuidado natural.',
    'verde',
    true
),
(
    'Kérfir de Leche', 
    'Probiotico artesanal', 
    '1 Litro', 
    30.0, 
    25, 
    'Bebida probiótica artesanal de consumo diario, elaborada para acompañar hábitos de bienestar.',
    'Contiene microorganismos asociados al equilibrio de la microbiota intestinal.',
    'Consumir frío. Agitar suavemente antes de servir.',
    'Iniciar con porciones pequeñas y aumentar según preferencia personal.',
    'Mantener refrigerado. Producto de consumo diario.',
    'Sin azúcar, sin conservantes, sin lactosa y probiótico artesanal.',
    'rosa',
    true
)
ON CONFLICT DO NOTHING;

export interface Variant {
  presentation: string;
  price: number;
  stock: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  presentation: string;
  price: number;
  stock: number;
  variants: Variant[] | null;
  intro: string;
  benefit: string;
  use: string;
  apply: string;
  recommend: string;
  note: string;
  accent: string;
  is_active: boolean;
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'ppt-arroz',
    name: 'Jabón de Arroz',
    category: 'Luminosidad natural',
    image_url: '/catalog/jabon-arroz.png',
    presentation: '90 g',
    price: 35,
    stock: 14,
    variants: null,
    intro: 'Para una piel más suave, uniforme y luminosa dentro de una rutina constante.',
    benefit: 'Empareja la textura cutánea. Remueve impurezas dejando la piel tersa, profundamente suave y renovada.',
    use: 'Barra dermocosmética de limpieza formulada artesanalmente con extracto nativo de arroz.',
    apply: 'Frotar la barra con las manos húmedas hasta obtener espuma, masajear la zona con movimientos circulares durante unos segundos y enjuagar con abundante agua.',
    recommend: 'Combo sugerido: Jabón de Arroz + Crema Facial. Ideal para rutina en las mañanas: elimina toxinas nocturnas y prepara la piel para recibir hidratación.',
    note: 'Ideal para pieles opacas, con falta de brillo, manchas y tono irregular.',
    accent: 'rosa',
    is_active: true,
  },
  {
    id: 'ppt-aloe',
    name: 'Jabón de Aloe Vera',
    category: 'Humectación diaria',
    image_url: '/catalog/jabon-aloe-vera.png',
    presentation: '90 g',
    price: 35,
    stock: 20,
    variants: null,
    intro: 'Una barra suave para acompañar la hidratación y el cuidado cotidiano de la piel.',
    benefit: 'Estimula la regeneración celular y repara microlesiones cutáneas. Calma irritaciones, desinflama y devuelve la elasticidad.',
    use: 'Elaborada con gel concentrado de aloe vera. Limpieza extrasuave que ayuda a restaurar la hidratación celular y sanar tejidos de la piel.',
    apply: 'Frotar la barra con las manos húmedas hasta obtener espuma, masajear la zona con movimientos circulares durante unos segundos y enjuagar con abundante agua.',
    recommend: 'Es el aliado perfecto para recuperar la piel después de la exposición solar o el afeitado. Incorpórelo en su rutina diaria para tener un rostro fresco y protegido.',
    note: 'Es el jabón más noble, ideal para todo tipo de piel.',
    accent: 'verde',
    is_active: true,
  },
  {
    id: 'ppt-azufre',
    name: 'Jabón de Azufre',
    category: 'Control de brillo',
    image_url: '/catalog/jabon-azufre.png',
    presentation: '90 g',
    price: 35,
    stock: 6,
    variants: null,
    intro: 'Limpieza específica para piel grasa, brillo persistente y poros congestionados.',
    benefit: 'Ofrece una potente acción seborreguladora y antiséptica que combate eficazmente la bacteria responsable del acné. Previene puntos negros.',
    use: 'El azufre se usa en cosmética por su apoyo en higiene de piel grasa, limpieza de poros obstruidos y control del brillo.',
    apply: 'Frotar la barra con las manos húmedas hasta obtener espuma, masajear la zona T con movimientos circulares durante unos segundos y enjuagar con abundante agua.',
    recommend: 'Incorpórelo inicialmente de 2 a 3 veces por semana en la rutina nocturna. Al notar reducción de grasa, espaciar su uso para evitar resecar la piel.',
    note: 'Uso exclusivo por las noches, sin exposición al sol, al viento ni al maquillaje.',
    accent: 'terracota',
    is_active: true,
  },
  {
    id: 'ppt-manzanilla',
    name: 'Jabón de Manzanilla',
    category: 'Piel sensible',
    image_url: '/catalog/jabon-manzanilla.png',
    presentation: '90 g',
    price: 30,
    stock: 12,
    variants: null,
    intro: 'Suavidad herbal para limpiar, nutrir y dar confort a pieles delicadas.',
    benefit: 'Su alto contenido de azuleno y bisabolol aporta una potente acción desinflamatoria que calma irritaciones y rojeces.',
    use: 'La manzanilla aporta compuestos calmantes asociados al confort de la piel sensible sin generar tirantez ni resequedad.',
    apply: 'Frotar la barra con las manos húmedas hasta obtener espuma, masajear la zona con movimientos circulares durante unos segundos y enjuagar con abundante agua.',
    recommend: 'Es el aliado para relajar el cutis al final del día. Incorporar en la rutina nocturna para liberar la piel del estrés ambiental acumulado.',
    note: 'Fórmula artesanal para un tratamiento calmante por excelencia.',
    accent: 'rosa',
    is_active: true,
  },
  {
    id: 'ppt-romero',
    name: 'Jabón de Romero',
    category: 'Herbal revitalizante',
    image_url: '/catalog/jabon-romero.png',
    presentation: '90 g',
    price: 30,
    stock: 8,
    variants: null,
    intro: 'Limpieza estimulante con aroma herbal para una piel fresca y tonificada.',
    benefit: 'Aporta una potente acción antioxidante que protege el colágeno natural. Minimiza poros dilatados y reafirma los tejidos.',
    use: 'El romero contiene antioxidantes naturales usados en cuidado cutáneo.',
    apply: 'Frotar la barra con las manos húmedas hasta obtener espuma, masajear la zona con movimientos circulares, dejar que los activos botánicos actúen y enjuagar con abundante agua.',
    recommend: 'Incorpórelo en su rutina de baño matutina; su aroma herbal alivia la fatiga mental, aclara las ideas y recarga energía para iniciar el día con frescura.',
    note: 'Ideal para pieles mixtas a grasas y zonas que requieren activación circulatoria.',
    accent: 'terracota',
    is_active: true,
  },
  {
    id: 'ppt-carbon',
    name: 'Jabón de Carbón',
    category: 'Jabones artesanales',
    image_url: '/catalog/jabon-carbon.png',
    presentation: '90 g',
    price: 30,
    stock: 15,
    variants: null,
    intro: 'Limpieza profunda para piel con exceso de grasa, brillo e impurezas visibles.',
    benefit: 'Funciona como imán que atrae y remueve toxinas, metales pesados y residuos de contaminación urbana. Limpia poros a profundidad, elimina exceso de sebo y oxigena capas cutáneas.',
    use: 'El carbón activado ayuda a adsorber sebo, partículas e impurezas superficiales.',
    apply: 'Frotar la barra con las manos húmedas hasta obtener espuma, masajear la zona con movimientos circulares, dejar que los activos botánicos actúen y enjuagar con abundante agua.',
    recommend: 'Incorporar de 2 a 3 veces por semana en la rutina nocturna.',
    note: 'Ideal para pieles urbanas, mixtas, grasas o con tendencia a puntos negros.',
    accent: 'verde',
    is_active: true,
  },
  {
    id: 'ppt-bicarbonato',
    name: 'Jabón de Bicarbonato',
    category: 'Jabón artesanal',
    image_url: '/catalog/jabon-bicarbonato.png',
    presentation: '90 g',
    price: 30,
    stock: 10,
    variants: null,
    intro: 'Limpieza purificante y curativa que actúa como micro exfoliante natural sin componentes sintéticos agresivos.',
    benefit: 'Piel: elimina células muertas, controla exceso de grasa y combate el acné. Cabello: limpia el cuero cabelludo y ayuda a reducir la caspa.',
    use: 'Jabón artesanal y orgánico de limpieza profunda. Actúa como micro exfoliante natural que purifica la piel sin químicos agresivos.',
    apply: 'Rostro y cuerpo: generar espuma, aplicar con masajes circulares suaves y enjuagar. Cabello: aplicar sobre cuero cabelludo húmedo, masajear la raíz y enjuagar.',
    recommend: 'Uso ideal de 2 a 3 veces por semana en pieles mixtas a grasas. Hidratar la piel después de su uso.',
    note: 'Evitar en pieles muy secas, sensibles o irritadas.',
    accent: 'terracota',
    is_active: true,
  },
  {
    id: 'ppt-anti-stress',
    name: 'Crema Anti-Stress',
    category: 'Cuidado corporal',
    image_url: '/catalog/crema-anti-stress.png',
    presentation: '150 g',
    price: 99,
    stock: 10,
    variants: null,
    intro: 'Fórmula relajante con magnesio y aceites esenciales para masaje localizado.',
    benefit: 'Actúa sobre fibras musculares tensas, disminuyendo niveles corporales de cortisol. Alivia contracturas de cuello, espalda y hombros.',
    use: 'Emulsión corporal terapéutica de rápida absorción para aliviar fatiga neuromuscular y promover relajación muscular profunda.',
    apply: 'Dosificar una cantidad generosa y aplicar con masaje firme y pausado en zonas de tensión como nuca, hombros, espalda o planta de los pies hasta absorción completa.',
    recommend: 'Utilícela después de una ducha tibia antes de acostarse. En caso de migraña, masajear con poco producto a nivel de la sien.',
    note: 'Ideal para aromaterapia: colocar un poco en la palma, frotar y respirar profundo.',
    accent: 'rosa',
    is_active: true,
  },
  {
    id: 'ppt-vital-flex',
    name: 'Crema Vital-Flex',
    category: 'Alivio corporal rápido',
    image_url: '/catalog/crema-vital-flex.png',
    presentation: '150 g',
    price: 99,
    stock: 8,
    variants: null,
    intro: 'Crema para masaje en zonas de tensión con sensación de calor intenso.',
    benefit: 'Acción analgésica y antiinflamatoria natural que alivia tensiones, rigidez y molestias articulares. Su efecto calor mejora flexibilidad y recuperación post-esfuerzo.',
    use: 'Emulsión terapéutica de acción térmica con extractos puros de árnica y copaiba. Estimula microcirculación local y prepara la estructura muscular para esfuerzo físico.',
    apply: 'Dosificar la cantidad necesaria y aplicar con masaje vigoroso y circular en áreas que requieran activación o alivio hasta absorción.',
    recommend: 'Aplicar de 15 a 20 minutos antes de entrenar para prevenir tirones, optimizar elasticidad y disipar fatiga en articulaciones.',
    note: 'Altamente recomendado para deportistas y personas físicamente activas en su día a día.',
    accent: 'terracota',
    is_active: true,
  },
  {
    id: 'ppt-facial',
    name: 'Crema Facial',
    category: 'Hidratación nutritiva',
    image_url: '/catalog/crema-facial.png',
    presentation: '50 g',
    price: 39,
    stock: 10,
    variants: null,
    intro: 'Sábila, colágeno, pepino y vitaminas A, E y C para piel nutrida y flexible.',
    benefit: 'Efecto reafirmante y antioxidante que combate signos de envejecimiento prematuro. Reduce líneas de expresión y restaura luminosidad natural.',
    use: 'Crema regeneradora con colágeno soluble, ácido láctico y extractos botánicos puros. Diseñada para fundirse con la piel y aportar hidratación profunda.',
    apply: 'Aplicar una pequeña cantidad con movimientos ascendentes y suaves desde el centro hacia afuera en rostro, cuello y escote.',
    recommend: 'Usar en mañanas y noches. Por sus propiedades de pepino y aloe, desinflama y refresca dejando la piel tersa y protegida.',
    note: 'Ideal para pieles maduras, secas, opacas o con pérdida de elasticidad.',
    accent: 'verde',
    is_active: true,
  },
  {
    id: 'ppt-shampoo',
    name: 'Shampoo Anti-Stress',
    category: 'Cuidado capilar',
    image_url: '/catalog/shampoo-anti-stress.png',
    presentation: '160 g',
    price: 99,
    stock: 15,
    variants: null,
    intro: 'Refrescante y relajante, con aceites esenciales y extractos botánicos.',
    benefit: 'Triple acción terapéutica: estimula microcirculación para frenar caída, fortalece el folículo desde la raíz y regula exceso de grasitud.',
    use: 'Tratamiento capilar libre de sal y parabenos, enriquecido con extractos de ortiga, romero, menta y lavanda.',
    apply: 'Aplicar sobre el cuero cabelludo, masajear suavemente con las yemas durante 2 a 3 minutos y enjuagar con abundante agua.',
    recommend: 'Utilizar diariamente o de 3 a 4 veces por semana. Sus aromas herbales y efecto frío ayudan a disipar el cansancio mental.',
    note: 'Producto unisex que aporta frescura, alivia tensión acumulada y devuelve brillo natural.',
    accent: 'verde',
    is_active: true,
  },
  {
    id: 'ppt-kefir',
    name: 'Kéfir de Leche',
    category: 'Probiótico artesanal',
    image_url: '/catalog/kefir-leche.png',
    presentation: '1 Litro',
    price: 40,
    stock: 25,
    variants: [
      { presentation: '1/2 Litro', price: 25, stock: 10 },
    ],
    intro: 'Bebida probiótica artesanal de consumo diario para hábitos de bienestar.',
    benefit: 'Restaura y fortalece la microbiota intestinal gracias a bacterias benéficas y levaduras. Mejora digestión, reduce inflamación abdominal y potencia el sistema inmunológico.',
    use: 'Alimento lácteo fermentado vivo y artesanal obtenido mediante nódulos de kéfir en leche entera. Superalimento natural libre de conservantes.',
    apply: 'Iniciar con 5 ml al día en ayunas e incrementar progresivamente hasta llegar a consumir un vaso diario.',
    recommend: 'Mantener refrigerado y consumir dentro del periodo de vida útil. Puede consumirse solo, con miel o en batidos de frutas y cereales.',
    note: 'Vida útil de 15 días desde elaboración. Se prepara únicamente a pedido con 1 día de anticipación.',
    accent: 'rosa',
    is_active: true,
  },
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const catalogByName = new Map(
  CATALOG_PRODUCTS.map((product) => [normalize(product.name), product])
);

export function mergeWithCatalogData<T extends { name: string; id?: string; stock?: number; is_active?: boolean; image_url?: string | null }>(product: T): T & CatalogProduct {
  const catalogProduct = catalogByName.get(normalize(product.name));

  if (!catalogProduct) return product as T & CatalogProduct;

  const supabaseImage = product.image_url;

  return {
    ...catalogProduct,
    ...product,
    id: product.id ?? catalogProduct.id,
    stock: product.stock ?? catalogProduct.stock,
    is_active: product.is_active ?? catalogProduct.is_active,
    image_url: supabaseImage || catalogProduct.image_url,
    presentation: (product as any).presentation || catalogProduct.presentation,
    variants: (product as any).variants || catalogProduct.variants,
  };
}

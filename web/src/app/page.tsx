'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { CATALOG_PRODUCTS, mergeWithCatalogData, type Variant } from '@/lib/catalog-data';
import {
  ShoppingBag, ShoppingCart, Info, Check, X, Phone,
  Sparkles, MapPin, Award, CheckCircle, Clock
} from 'lucide-react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

interface Product {
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

interface CartItem {
  product: Product;
  quantity: number;
  variantKey: string | null;
}

const FALLBACK_PRODUCTS: Product[] = CATALOG_PRODUCTS;

const DEFAULT_CONTENT: Record<string, string> = {
  hero_badge: 'Catálogo de Bienestar 2026',
  hero_title: 'Bienestar natural para cada día',
  hero_subtitle: 'Productos artesanales seleccionados para acompañar el cuidado de la piel, el cabello y el equilibrio diario.',
  contact_title: '¿Cómo pedir?',
  contact_subtitle: 'Elige tus productos, escríbenos por WhatsApp y recibe en la puerta de tu casa.',
  step1_title: 'Agrega al carrito',
  step1_desc: 'Selecciona los productos y sus presentaciones desde el catálogo.',
  step2_title: 'Revisa tu carrito',
  step2_desc: 'Confirma cantidades y variantes. El total se calcula automáticamente.',
  step3_title: 'Envía tu pedido',
  step3_desc: 'Haz clic en "Realizar Pedido por WhatsApp" y te llegará un mensaje listo para enviar.',
  step4_title: 'Recibe en casa',
  step4_desc: 'Te confirmamos disponibilidad, te enviamos QR de pago y coordinamos la entrega gratuita.',
  combo_title: 'Combo Luminosidad',
  combo_desc: 'Llévate Jabón de Arroz + Crema Facial + Shampoo Anti-Stress por un precio especial.',
  combo_cta: 'Consultar combo',
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const [logoUrl, setLogoUrl] = useState('/catalog/logo.png');
  const [qrWhatsappUrl, setQrWhatsappUrl] = useState('/catalog/qr-whatsapp.png');
  const [qrPagoUrl, setQrPagoUrl] = useState('/catalog/qr-pago.png');
  const [pageContent, setPageContent] = useState<Record<string, string>>({...DEFAULT_CONTENT});

  const [mounted, setMounted] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedCart = localStorage.getItem('artesana-cart');
    if (!savedCart) return [];
    try {
      return JSON.parse(savedCart) as CartItem[];
    } catch {
      localStorage.removeItem('artesana-cart');
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value');
        const map = new Map((data || []).map(r => [r.key, r.value]));
        if (map.has('logo_url')) setLogoUrl(map.get('logo_url')!);
        if (map.has('qr_whatsapp')) setQrWhatsappUrl(map.get('qr_whatsapp')!);
        if (map.has('qr_pago')) setQrPagoUrl(map.get('qr_pago')!);
        const contentVal = map.get('page_content');
        if (contentVal) {
          try {
            setPageContent({...DEFAULT_CONTENT, ...JSON.parse(contentVal)});
          } catch { /* usar defaults */ }
        }
      } catch {
        // fallback local
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error || !data || data.length === 0) {
          setProducts(FALLBACK_PRODUCTS);
        } else {
          const merged = data.map((p) => mergeWithCatalogData(p) as Product);
          const existingNames = new Set(merged.map((p) => p.name.toLowerCase()));
          const missing = CATALOG_PRODUCTS.filter(
            (p) => !existingNames.has(p.name.toLowerCase())
          );
          setProducts([...merged, ...missing]);
        }
      } catch {
        console.warn('Supabase no conectado. Usando productos locales.');
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const saveCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('artesana-cart', JSON.stringify(newCart));
  }, []);

  const addToCart = useCallback((product: Product, variantKey?: string | null) => {
    if (product.stock === 0) return;

    const key = variantKey || '__default__';

    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && (item.variantKey || '__default__') === key
    );
    let newCart = [...cart];

    if (existingIndex > -1) {
      if (newCart[existingIndex].quantity >= product.stock) {
        alert(`Solo quedan ${product.stock} unidades.`);
        return;
      }
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({ product, quantity: 1, variantKey: variantKey || null });
    }

    saveCart(newCart);
  }, [cart, saveCart]);

  const updateQuantity = useCallback((productId: string, variantKey: string | null, amount: number) => {
    const index = cart.findIndex(
      (item) => item.product.id === productId && item.variantKey === variantKey
    );
    if (index === -1) return;

    const newCart = [...cart];
    const newQty = newCart[index].quantity + amount;

    if (newQty <= 0) {
      newCart.splice(index, 1);
    } else {
      const maxStock = newCart[index].product.stock;
      if (newQty > maxStock) {
        alert(`Límite alcanzado. Solo ${maxStock} unidades.`);
        return;
      }
      newCart[index].quantity = newQty;
    }

    saveCart(newCart);
  }, [cart, saveCart]);

  const removeFromCart = useCallback((productId: string, variantKey: string | null) => {
    const newCart = cart.filter(
      (item) => !(item.product.id === productId && item.variantKey === variantKey)
    );
    saveCart(newCart);
  }, [cart, saveCart]);

  const totalItems = cart.reduce((t, item) => t + item.quantity, 0);
  const totalPrice = cart.reduce((t, item) => {
    if (item.variantKey) {
      const variant = item.product.variants?.find((v) => v.presentation === item.variantKey);
      return t + (variant ? variant.price : item.product.price) * item.quantity;
    }
    return t + item.product.price * item.quantity;
  }, 0);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;

    const phone = '59168703773';
    let msg = '🌿 *NUEVO PEDIDO - ARTESANA* 🌿\n';
    msg += '------------------------------------------\n';
    msg += 'Deseo adquirir:\n\n';

    cart.forEach((item, i) => {
      const vPrice = item.variantKey
        ? item.product.variants?.find((v) => v.presentation === item.variantKey)?.price
        : null;
      const price = vPrice ?? item.product.price;
      const pres = item.variantKey ?? item.product.presentation;
      msg += `*${i + 1}. ${item.product.name}*\n`;
      msg += `   • Cant: ${item.quantity} | ${pres}\n`;
      msg += `   • Subtotal: Bs ${price * item.quantity}\n\n`;
    });

    msg += '------------------------------------------\n';
    msg += `💰 *TOTAL: Bs ${totalPrice}*\n\n`;
    msg += '📍 _Confirmar disponibilidad y coordinar pago/envío._';

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }, [cart, totalPrice]);

  return (
    <div className="min-h-screen bg-[#fbf5ea] flex flex-col text-[#2f2e2b] font-sans relative overflow-x-hidden">

      {/* HEADER */}
      <header className="bg-[#fbf5ea] border-b border-[#732135]/15 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <img src={logoUrl} alt="ArteSana" className="h-10 sm:h-12 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-[#732135] text-white hover:bg-[#b76545] rounded-full shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95">
              <ShoppingCart className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2d5a27] text-white font-bold text-2xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#fbe3e4] via-[#fff8ef] to-[#efe2d3] border-b border-[#732135]/10 relative py-12 md:py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-5 md:space-y-6 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#732135] text-white text-3xs font-black tracking-widest rounded-full uppercase">
              <Sparkles className="w-3 h-3 text-[#fbe3e4]" />
              {pageContent.hero_badge}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#732135] font-medium leading-[1.05] tracking-tight">
              {pageContent.hero_title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#2f2e2b]/80 max-w-xl leading-relaxed">
              {pageContent.hero_subtitle}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2d5a27]"><CheckCircle className="w-4 h-4" /> 100% Hecho a Mano</span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2d5a27]"><Clock className="w-4 h-4" /> Envío gratis en Santa Cruz (hasta 4to anillo)</span>
            </div>
          </div>
          <div className="md:col-span-5 flex justify-center">
            <img src={logoUrl} alt="ArteSana" className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain filter drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* ANUNCIO */}
      <section className="max-w-6xl mx-auto w-full px-4 pt-8">
        <div className="bg-white/60 border border-[#732135]/10 rounded-2xl px-3 py-2">
          <AdBanner />
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-6xl mx-auto w-full px-4 pt-10 pb-6 sticky top-[72px] bg-[#fbf5ea]/90 backdrop-blur-xs z-30">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === category
                  ? 'bg-[#732135] text-white border-[#732135] shadow-md'
                  : 'bg-white text-[#2f2e2b]/70 border-gray-200 hover:border-[#732135]/40 hover:text-[#732135]'
              }`}>
              {category === 'All' ? 'Todos los Productos' : category}
            </button>
          ))}
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="max-w-6xl mx-auto w-full px-4 pb-20 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#732135]" />
            <span className="text-xs text-[#2f2e2b]/60 font-medium">Cargando catálogo...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-[#732135]/30 mx-auto mb-3" />
            <span className="text-sm text-gray-500">No hay productos en esta categoría.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock === 0;
              const hasVariants = product.variants && product.variants.length > 0;
              const selVariant = hasVariants ? selectedVariants[product.id] : null;
              const activeVariant = selVariant
                ? product.variants!.find((v) => v.presentation === selVariant)
                : null;
              const displayPrice = activeVariant?.price ?? product.price;
              const displayPres = activeVariant?.presentation ?? product.presentation;

              let colorClass = 'from-[#fbe3e4] to-[#fbf5ea]';
              if (product.accent === 'verde') colorClass = 'from-[#e2f0d9] to-[#fbf5ea]';
              else if (product.accent === 'terracota') colorClass = 'from-[#fbe7e0] to-[#fbf5ea]';

              return (
                <div key={product.id} className="bg-white rounded-2xl border border-[#732135]/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden">
                  {/* IMAGEN GRANDE */}
                  <div className={`h-80 sm:h-96 bg-gradient-to-br ${colorClass} relative flex items-center justify-center p-4 group-hover:scale-[1.01] transition-transform duration-300`}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-lg transform group-hover:scale-105 transition-transform duration-300 select-none" />
                    ) : (
                      <div className="text-[#732135]/20 flex flex-col items-center gap-1.5 select-none">
                        <ShoppingBag className="w-16 h-16 stroke-[1.5]" />
                        <span className="text-3xs tracking-widest font-bold uppercase">ArteSana</span>
                      </div>
                    )}
                    {isOutOfStock ? (
                      <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-red-600 text-white font-bold text-3xs tracking-widest uppercase rounded-full shadow-md z-10">Agotado</span>
                    ) : product.stock < 5 ? (
                      <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-[#b76545] text-white font-bold text-3xs tracking-widest uppercase rounded-full shadow-md z-10 animate-pulse">Pocas unidades</span>
                    ) : null}
                  </div>

                  {/* DETALLES */}
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-3xs font-extrabold text-[#b76545] tracking-widest uppercase mb-1 block">{product.category}</span>
                    <h3 className="font-serif font-bold text-xl text-[#2f2e2b] mb-2 leading-tight group-hover:text-[#732135] transition-colors">{product.name}</h3>
                    <p className="text-xs text-[#2f2e2b]/70 line-clamp-3 mb-3 leading-relaxed">{product.intro}</p>

                    {/* SELECTOR DE VARIANTES */}
                    {hasVariants && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => setSelectedVariants((prev) => ({ ...prev, [product.id]: '' }))}
                          className={`px-3 py-1 text-3xs font-extrabold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                            !selVariant ? 'bg-[#732135] text-white border-[#732135]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#732135]/40'
                          }`}>
                          {product.presentation} — Bs {product.price}
                        </button>
                        {product.variants!.map((v) => (
                          <button key={v.presentation} onClick={() => setSelectedVariants((prev) => ({ ...prev, [product.id]: v.presentation }))}
                            className={`px-3 py-1 text-3xs font-extrabold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                              selVariant === v.presentation ? 'bg-[#732135] text-white border-[#732135]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#732135]/40'
                            }`}>
                            {v.presentation} — Bs {v.price}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* PRESENTACIÓN Y PRECIO */}
                    <div className="flex items-baseline gap-3 mt-auto pt-4 border-t border-gray-100">
                      <span className="text-xl font-black text-[#732135]">{displayPres}</span>
                      <span className="text-xl font-black text-[#732135]">Bs {displayPrice}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button onClick={() => setSelectedProduct(product)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer bg-white text-[#732135] border border-[#732135]/30 hover:bg-[#732135] hover:text-white">
                        <Info className="w-4 h-4" />
                        <span>Detalles</span>
                      </button>
                      <button onClick={() => {
                        if (hasVariants && !selVariant) {
                          addToCart(product, null);
                        } else {
                          addToCart(product, selVariant || null);
                        }
                      }} disabled={isOutOfStock}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                          isOutOfStock ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                            : 'bg-[#732135] text-white hover:bg-[#b76545]'
                        }`}>
                        <span>Agregar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECCIÓN DE CONTACTO Y PEDIDOS */}
      <section className="bg-white border-t border-[#732135]/10 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#732135] text-white text-3xs font-black tracking-widest rounded-full uppercase mb-4">
              <Phone className="w-3 h-3" /> Contacto y Pedidos
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#732135]">{pageContent.contact_title}</h2>
            <p className="text-sm text-[#2f2e2b]/70 mt-3 max-w-lg mx-auto">{pageContent.contact_subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start max-w-4xl mx-auto">
            {/* PASOS */}
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <span className="w-9 h-9 rounded-full bg-[#732135] text-white font-bold flex items-center justify-center shrink-0 text-sm">1</span>
                <div>
                  <h3 className="font-bold text-[#2f2e2b]">{pageContent.step1_title}</h3>
                  <p className="text-xs text-[#2f2e2b]/70 mt-1">{pageContent.step1_desc}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-9 h-9 rounded-full bg-[#732135] text-white font-bold flex items-center justify-center shrink-0 text-sm">2</span>
                <div>
                  <h3 className="font-bold text-[#2f2e2b]">{pageContent.step2_title}</h3>
                  <p className="text-xs text-[#2f2e2b]/70 mt-1">{pageContent.step2_desc}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-9 h-9 rounded-full bg-[#732135] text-white font-bold flex items-center justify-center shrink-0 text-sm">3</span>
                <div>
                  <h3 className="font-bold text-[#2f2e2b]">{pageContent.step3_title}</h3>
                  <p className="text-xs text-[#2f2e2b]/70 mt-1">{pageContent.step3_desc}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-9 h-9 rounded-full bg-[#2d5a27] text-white font-bold flex items-center justify-center shrink-0 text-sm">4</span>
                <div>
                  <h3 className="font-bold text-[#2f2e2b]">{pageContent.step4_title}</h3>
                  <p className="text-xs text-[#2f2e2b]/70 mt-1">{pageContent.step4_desc}</p>
                </div>
              </div>

              <a href="https://wa.me/59168703773" target="_blank"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#2d5a27] hover:bg-[#556b2f] text-white font-bold text-sm rounded-2xl shadow-lg transition-all cursor-pointer">
                <Phone className="w-5 h-5 fill-current" /> Escribir a ArteSana
              </a>
            </div>

            {/* QRS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#fbf5ea] rounded-2xl p-5 border border-[#732135]/10 text-center">
                <img src={qrWhatsappUrl} alt="QR WhatsApp" className="w-full max-w-[180px] mx-auto object-contain mb-3" />
                <span className="text-3xs font-extrabold text-[#2f2e2b] uppercase tracking-widest">WhatsApp</span>
                <p className="text-3xs text-gray-500 mt-1">Escanear para pedir</p>
              </div>
              <div className="bg-[#fbf5ea] rounded-2xl p-5 border border-[#732135]/10 text-center">
                <img src={qrPagoUrl} alt="QR Pago" className="w-full max-w-[180px] mx-auto object-contain mb-3" />
                <span className="text-3xs font-extrabold text-[#2f2e2b] uppercase tracking-widest">Código QR de pago</span>
                <p className="text-3xs text-gray-500 mt-1">Transferencia segura</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-tr from-[#efe2d3] to-[#fbf5ea] border-t border-[#732135]/15 py-12 md:py-16 text-[#2f2e2b] font-sans">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
          <div className="space-y-4">
            <img src={logoUrl} alt="ArteSana" className="h-10 w-auto object-contain" />
            <p className="text-xs text-[#2f2e2b]/80 max-w-sm leading-relaxed">Elaboramos cosmética y probióticos artesanales con ingredientes nobles para cuidar de ti.</p>
            <div className="space-y-1.5 text-xs">
              <p className="font-bold flex items-center gap-2 text-[#732135]"><Phone className="w-4 h-4" /> +591 68703773</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /> Delivery gratis hasta 4to anillo - Santa Cruz.</p>
            </div>
          </div>
          <div className="bg-[#732135] rounded-3xl p-6 text-white space-y-4 shadow-xl">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#fbe3e4] text-[#732135] text-4xs font-black tracking-widest rounded-full uppercase">Combo Exclusivo</span>
            <h4 className="font-serif text-2xl font-bold">{pageContent.combo_title}</h4>
            <p className="text-xs text-white/80 leading-relaxed">{pageContent.combo_desc}</p>
            <a href={`https://wa.me/59168703773?text=${encodeURIComponent(`Hola ArteSana, quisiera consultar por la disponibilidad y precio del ${pageContent.combo_title}.`)}`} target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fbe3e4] hover:bg-white text-[#732135] font-extrabold text-2xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer">
              {pageContent.combo_cta}
            </a>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-serif text-xl font-bold text-[#732135]">Pedidos Seguros</h4>
            <p className="text-xs text-[#2f2e2b]/80 leading-relaxed">Realiza tu pedido cómodamente. Te enviamos QR de pago y coordinas tu entrega gratuita.</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-500 text-3xs font-bold rounded-lg flex items-center gap-1"><Award className="w-3.5 h-3.5 text-yellow-600" /> Artesanal</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-500 text-3xs font-bold rounded-lg flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#2d5a27]" /> Seguro</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-500 text-3xs font-bold rounded-lg flex items-center gap-1">📦 Entrega Rápida</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-6 border-t border-gray-200/50 text-center text-3xs text-gray-400">© 2026 ArteSana. Santa Cruz, Bolivia.</div>
      </footer>

      {mounted && totalItems > 0 && !isCartOpen && (
        <button onClick={() => setIsCartOpen(true)}
          className="fixed left-4 right-4 bottom-4 z-50 mx-auto max-w-md bg-[#732135] text-white rounded-2xl shadow-2xl border border-white/20 px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#b76545] transition-all">
          <span className="flex items-center gap-2 font-bold text-sm">
            <ShoppingCart className="w-5 h-5" /> Ver carrito ({totalItems})
          </span>
          <span className="font-black text-lg">Bs {totalPrice}</span>
        </button>
      )}

      {/* MODAL DETALLADO */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#fbf5ea] rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl relative border border-[#732135]/15 font-sans">
            <button onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 p-2 bg-white rounded-full hover:bg-gray-100 shadow-md text-[#2f2e2b] z-20 cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* LADO VISUAL — IMAGEN PROTAGONISTA */}
              <div className={`min-h-[400px] md:min-h-full bg-gradient-to-br ${
                selectedProduct.accent === 'verde' ? 'from-[#556b2f] to-[#2d5a27]' :
                selectedProduct.accent === 'terracota' ? 'from-[#b76545] to-[#732135]' : 'from-[#fbe3e4] to-[#efe2d3]'
              } p-6 md:p-10 flex flex-col items-center justify-center relative`}>
                <div className="absolute inset-6 border border-white/10 rounded-2xl pointer-events-none" />
                {selectedProduct.image_url ? (
                  <div className="w-full max-w-sm aspect-square bg-white/10 rounded-3xl p-4 flex items-center justify-center shadow-lg border border-white/5 z-10">
                    <img src={selectedProduct.image_url} alt={selectedProduct.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-xl" />
                  </div>
                ) : (
                  <div className="w-full max-w-sm aspect-square bg-white/10 rounded-3xl flex flex-col items-center justify-center text-white/40 z-10">
                    <ShoppingBag className="w-20 h-20 stroke-[1]" />
                    <span className="text-3xs font-extrabold uppercase tracking-widest mt-2">ArteSana</span>
                  </div>
                )}
                <span className="absolute bottom-6 left-6 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 text-white font-extrabold text-3xs tracking-widest uppercase rounded-full">ArteSana Original</span>
              </div>

              {/* LADO CONTENIDO */}
              <div className="p-6 sm:p-10 space-y-6 flex flex-col justify-center">
                <div className="space-y-2">
                  <span className="text-3xs font-extrabold text-[#b76545] tracking-widest uppercase block">{selectedProduct.category}</span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#732135] leading-tight">{selectedProduct.name}</h2>
                  <p className="text-sm sm:text-base text-[#2f2e2b]/80 leading-relaxed italic">&ldquo;{selectedProduct.intro}&rdquo;</p>
                </div>

                {/* VARIANTES EN MODAL */}
                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-2xs font-extrabold text-gray-500 uppercase tracking-widest self-center mr-2">Presentación:</span>
                      {[null, ...selectedProduct.variants].map((v) => {
                        const isActive = v === null
                          ? !selectedVariants[selectedProduct.id]
                          : selectedVariants[selectedProduct.id] === v.presentation;
                        const label = v === null
                          ? `${selectedProduct.presentation} — Bs ${selectedProduct.price}`
                          : `${v.presentation} — Bs ${v.price}`;
                        return (
                          <button key={v?.presentation || '__default__'}
                            onClick={() => setSelectedVariants((prev) => ({ ...prev, [selectedProduct.id]: v?.presentation || '' }))}
                            className={`px-3 py-1.5 text-3xs font-extrabold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                              isActive ? 'bg-[#732135] text-white border-[#732135]' : 'bg-white text-gray-600 border-gray-200'
                            }`}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 bg-[#fbe3e4] text-[#732135] font-extrabold text-xs tracking-wider rounded-xl border border-[#732135]/10">{(selectedVariants[selectedProduct.id] ? selectedProduct.variants?.find(v => v.presentation === selectedVariants[selectedProduct.id])?.presentation : null) || selectedProduct.presentation}</span>
                      <span className="px-3 py-1.5 bg-[#732135] text-white font-extrabold text-xs tracking-wider rounded-xl shadow-sm">Bs {(selectedVariants[selectedProduct.id] ? selectedProduct.variants?.find(v => v.presentation === selectedVariants[selectedProduct.id])?.price : null) || selectedProduct.price}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${
                        selectedProduct.stock === 0 ? 'bg-red-50 text-red-600 border-red-200' :
                        selectedProduct.stock < 5 ? 'bg-amber-50 text-[#b76545] border-amber-200' : 'bg-green-50 text-[#2d5a27] border-green-200'
                      }`}>
                        {selectedProduct.stock === 0 ? 'Agotado' : `Stock: ${selectedProduct.stock} uds`}
                      </span>
                    </div>
                  </div>
                )}

                {/* PRESENTACIÓN Y STOCK (SIN VARIANTES) */}
                {(!selectedProduct.variants || selectedProduct.variants.length === 0) && (
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-[#fbe3e4] text-[#732135] font-extrabold text-xs tracking-wider rounded-xl border border-[#732135]/10">{selectedProduct.presentation}</span>
                    <span className="px-3 py-1.5 bg-[#732135] text-white font-extrabold text-xs tracking-wider rounded-xl shadow-sm">Bs {selectedProduct.price}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${
                      selectedProduct.stock === 0 ? 'bg-red-50 text-red-600 border-red-200' :
                      selectedProduct.stock < 5 ? 'bg-amber-50 text-[#b76545] border-amber-200' : 'bg-green-50 text-[#2d5a27] border-green-200'
                    }`}>
                      {selectedProduct.stock === 0 ? 'Agotado' : `Stock: ${selectedProduct.stock} uds`}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white border border-[#732135]/10 rounded-2xl p-4 shadow-xs"><strong className="block text-2xs font-extrabold text-[#2d5a27] uppercase tracking-widest mb-1.5">Beneficio</strong><p className="text-xs text-[#2f2e2b]/80 leading-relaxed">{selectedProduct.benefit}</p></div>
                  <div className="bg-white border border-[#732135]/10 rounded-2xl p-4 shadow-xs"><strong className="block text-2xs font-extrabold text-[#2d5a27] uppercase tracking-widest mb-1.5">Uso</strong><p className="text-xs text-[#2f2e2b]/80 leading-relaxed">{selectedProduct.use}</p></div>
                  <div className="bg-white border border-[#732135]/10 rounded-2xl p-4 shadow-xs"><strong className="block text-2xs font-extrabold text-[#2d5a27] uppercase tracking-widest mb-1.5">Aplicación</strong><p className="text-xs text-[#2f2e2b]/80 leading-relaxed">{selectedProduct.apply}</p></div>
                  <div className="bg-white border border-[#732135]/10 rounded-2xl p-4 shadow-xs"><strong className="block text-2xs font-extrabold text-[#2d5a27] uppercase tracking-widest mb-1.5">Recomendación</strong><p className="text-xs text-[#2f2e2b]/80 leading-relaxed">{selectedProduct.recommend}</p></div>
                </div>

                <div className="bg-[#fbe3e4]/50 border-l-4 border-[#b76545] text-xs font-semibold text-[#732135] p-3 rounded-r-xl">{selectedProduct.note}</div>

                <button onClick={() => {
                  const sel = selectedVariants[selectedProduct.id];
                  addToCart(selectedProduct, sel || null);
                  setSelectedProduct(null);
                }} disabled={selectedProduct.stock === 0}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    selectedProduct.stock === 0
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                      : 'bg-[#732135] text-white hover:bg-[#b76545] hover:scale-[1.01] active:scale-[0.99]'
                  }`}>
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARRITO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md h-dvh bg-white flex flex-col shadow-2xl border-l border-[#732135]/10 relative">
              <div className="px-5 py-5 bg-[#fbf5ea] border-b border-[#732135]/15 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[#732135]" /><h2 className="text-lg font-serif font-bold text-[#732135]">Mi Carrito ({totalItems})</h2></div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 hover:bg-gray-200/50 rounded-xl text-[#2f2e2b] cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <ShoppingBag className="w-14 h-14 text-gray-300 stroke-[1.5]" />
                    <p className="text-sm font-bold text-gray-700">Tu carrito está vacío</p>
                    <button onClick={() => setIsCartOpen(false)} className="px-5 py-2.5 bg-[#732135] text-white text-xs font-bold rounded-xl hover:bg-[#b76545] shadow-md transition-colors cursor-pointer">Explorar Catálogo</button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const vPrice = item.variantKey
                      ? item.product.variants?.find((v) => v.presentation === item.variantKey)?.price
                      : null;
                    const price = vPrice ?? item.product.price;
                    const pres = item.variantKey ?? item.product.presentation;
                    return (
                      <div key={`${item.product.id}-${item.variantKey || ''}`} className="py-4.5 flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#fbf5ea] border border-gray-100 rounded-xl p-2 flex items-center justify-center shrink-0">
                          {item.product.image_url ? <img src={item.product.image_url} alt={item.product.name} className="max-h-full max-w-full object-contain" />
                            : <ShoppingBag className="w-6 h-6 text-[#732135]/20" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-gray-800 leading-tight pr-1">{item.product.name}</h4>
                            <span className="text-xs font-extrabold text-[#732135] shrink-0">Bs {price * item.quantity}</span>
                          </div>
                          <p className="text-3xs text-gray-400 mt-0.5">{item.product.category} • {pres}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-gray-50 p-0.5">
                              <button onClick={() => updateQuantity(item.product.id, item.variantKey, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-gray-500 font-bold text-xs cursor-pointer">-</button>
                              <span className="w-6 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.variantKey, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-gray-500 font-bold text-xs cursor-pointer">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id, item.variantKey)}
                              className="text-3xs font-extrabold text-red-500 uppercase tracking-wider cursor-pointer">Eliminar</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4 shrink-0 shadow-[0_-12px_30px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total</span><span className="text-2xl font-black text-[#732135]">Bs {totalPrice}</span></div>
                  <div className="bg-[#e2f0d9] border border-[#2d5a27]/10 rounded-xl p-3 flex gap-2"><Check className="w-4 h-4 text-[#2d5a27] shrink-0 mt-0.5" /><p className="text-3xs text-[#2f2e2b]/80">¡Tu pedido califica para <strong>DELIVERY GRATUITO</strong> hasta el 4to anillo!</p></div>
                  <button onClick={handleCheckout}
                    className="w-full py-4.5 bg-[#2d5a27] hover:bg-[#556b2f] text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5 fill-current" /><span>Realizar Pedido por WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Plus, Search, Edit2, Trash2, LogOut, X, Settings, Package,
  AlertCircle, ShoppingBag, Loader2, Upload, Eye, EyeOff, Clock
} from 'lucide-react';
import Link from 'next/link';

interface Variant {
  presentation: string;
  price: number;
  stock: number;
}

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
  created_at: string;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.';

function ContentField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-3xs font-bold text-gray-400 mb-0.5">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-[#2f2e2b] focus:outline-none focus:ring-1 focus:ring-[#732135]" />
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Estados para el Modal de Agregar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Jabones artesanales',
    presentation: '90 g',
    price: 0,
    stock: 10,
    variants: [] as Variant[],
    intro: '',
    benefit: '',
    use: '',
    apply: '',
    recommend: '',
    note: '',
    accent: 'rosa',
    is_active: true,
    image_url: ''
  });

  // Estado para configuración del sitio
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/catalog/logo.png');
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [qrWhatsappUrl, setQrWhatsappUrl] = useState('/catalog/qr-whatsapp.png');
  const [qrWhatsappInput, setQrWhatsappInput] = useState('');
  const [qrPagoUrl, setQrPagoUrl] = useState('/catalog/qr-pago.png');
  const [qrPagoInput, setQrPagoInput] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [qrUploading, setQrUploading] = useState<'none' | 'whatsapp' | 'pago'>('none');
  const [savingSettings, setSavingSettings] = useState(false);

  // Estado para control de inventario
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventoryLog, setInventoryLog] = useState<any[]>([]);
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [manualProduct, setManualProduct] = useState('');
  const [manualStock, setManualStock] = useState(0);
  const [manualReason, setManualReason] = useState('');

  // Estado para contenido editable del sitio
  const defaultContent = {
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
  const [pageContent, setPageContent] = useState<Record<string, string>>({...defaultContent});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (dbError) throw dbError;
      setProducts(data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Error al cargar los productos. Asegúrate de haber ejecutado el script SQL.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value');

      const map = new Map((data || []).map(r => [r.key, r.value]));

      const logoVal = map.get('logo_url');
      setLogoUrl(logoVal || '/catalog/logo.png');
      setLogoInputUrl(logoVal || '/catalog/logo.png');

      const qrVal = map.get('qr_whatsapp');
      setQrWhatsappUrl(qrVal || '/catalog/qr-whatsapp.png');
      setQrWhatsappInput(qrVal || '/catalog/qr-whatsapp.png');

      const qrPagoVal = map.get('qr_pago');
      setQrPagoUrl(qrPagoVal || '/catalog/qr-pago.png');
      setQrPagoInput(qrPagoVal || '/catalog/qr-pago.png');

      const contentVal = map.get('page_content');
      if (contentVal) {
        try {
          const parsed = JSON.parse(contentVal);
          setPageContent({...defaultContent, ...parsed});
        } catch { /* usar defaults */ }
      } else {
        setPageContent({...defaultContent});
      }
    } catch {
      setLogoInputUrl('/catalog/logo.png');
      setQrWhatsappInput('/catalog/qr-whatsapp.png');
      setQrPagoInput('/catalog/qr-pago.png');
      setPageContent({...defaultContent});
    }
  }, []);

  const fetchInventoryLog = useCallback(async (productId?: string) => {
    try {
      let query = supabase
        .from('inventory_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (productId) query = query.eq('product_id', productId);
      const { data } = await query;
      setInventoryLog(data || []);
    } catch {
      // tabla podría no existir aún
    }
  }, []);

  // Verificar sesión y cargar datos
  useEffect(() => {
    const checkUserAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('Supabase: No hay sesión activa. Redirigiendo a login...');
        router.push('/admin/login');
        return;
      }
      fetchProducts();
      loadSettings();
    };

    checkUserAndLoad();
  }, [fetchProducts, loadSettings, router]);

  // Ajuste rápido de Stock
  const handleStockChange = async (id: string, newStock: number, reason?: string) => {
    if (newStock < 0) return;

    const prevStock = products.find(p => p.id === id)?.stock ?? 0;
    const changeAmount = newStock - prevStock;
    if (changeAmount === 0) return;

    if (!reason && changeAmount > 0 && !confirm('Registrar como ingreso manual? Cancelar para especificar motivo.')) {
      const customReason = prompt('Motivo del ajuste (+' + changeAmount + '):', 'Reposición de stock');
      if (customReason === null) return;
      reason = customReason;
    } else if (!reason && changeAmount < 0 && !confirm('Registrar como venta? Cancelar para especificar motivo.')) {
      const customReason = prompt('Motivo del ajuste (' + changeAmount + '):', 'Venta');
      if (customReason === null) return;
      reason = customReason;
    }

    const finalReason = reason || (changeAmount > 0 ? 'Ingreso manual' : 'Venta / Ajuste');

    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id);

      if (updateError) throw updateError;

      const product = products.find(p => p.id === id);
      await supabase.from('inventory_log').insert({
        product_id: id,
        product_name: product?.name || 'Desconocido',
        previous_stock: prevStock,
        new_stock: newStock,
        change_amount: changeAmount,
        reason: finalReason,
      });
    } catch (err: unknown) {
      setError('No se pudo actualizar el stock en Supabase: ' + getErrorMessage(err));
      fetchProducts();
    }
  };

  const handleManualAdjustment = async (productId: string, newStock: number, reason: string) => {
    if (!productId || !reason.trim()) {
      setError('Selecciona un producto y escribe un motivo.');
      return;
    }
    await handleStockChange(productId, newStock, reason.trim());
    fetchInventoryLog();
  };

  // Cambiar estado activo rápidamente
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: newStatus } : p));

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (err: unknown) {
      setError('No se pudo actualizar la visibilidad: ' + getErrorMessage(err));
      fetchProducts();
    }
  };

  // Subir imagen a Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (err: unknown) {
      setError('Error al subir la imagen: ' + getErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  // Subir logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setLogoInputUrl(data.publicUrl);
    } catch (err: unknown) {
      setError('Error al subir el logo: ' + getErrorMessage(err));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError(null);

    try {
      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert([
          { key: 'logo_url', value: logoInputUrl },
          { key: 'qr_whatsapp', value: qrWhatsappInput },
          { key: 'qr_pago', value: qrPagoInput },
          { key: 'page_content', value: JSON.stringify(pageContent) },
        ], { onConflict: 'key' });

      if (upsertError) throw upsertError;
      setLogoUrl(logoInputUrl);
      setQrWhatsappUrl(qrWhatsappInput);
      setQrPagoUrl(qrPagoInput);
      setIsSettingsOpen(false);
    } catch (err: unknown) {
      setError('Error al guardar configuración: ' + getErrorMessage(err));
    } finally {
      setSavingSettings(false);
    }
  };

  // Eliminar Producto
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) return;

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: unknown) {
      setError('Error al eliminar el producto: ' + getErrorMessage(err));
    }
  };

  // Función para agregar/quitar variantes
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { presentation: '', price: 0, stock: 0 }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  // Abrir Modal para Crear
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Jabones artesanales',
      presentation: '90 g',
      price: 25.0,
      stock: 10,
      variants: [],
      intro: '',
      benefit: '',
      use: '',
      apply: '',
      recommend: '',
      note: 'Uso seguro siguiendo recomendaciones de aplicación.',
      accent: 'rosa',
      is_active: true,
      image_url: ''
    });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      presentation: product.presentation,
      price: product.price,
      stock: product.stock,
      variants: product.variants || [],
      intro: product.intro,
      benefit: product.benefit,
      use: product.use,
      apply: product.apply,
      recommend: product.recommend,
      note: product.note,
      accent: product.accent,
      is_active: product.is_active,
      image_url: product.image_url || ''
    });
    setIsModalOpen(true);
  };

  // Guardar Formulario (Crear o Editar)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsModalOpen(false);

    const payload = {
      ...formData,
      variants: formData.variants.length > 0 ? formData.variants : null,
    };

    try {
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([payload]);

        if (insertError) throw insertError;
      }
      
      fetchProducts();
    } catch (err: unknown) {
      setError('Error al guardar el producto: ' + getErrorMessage(err));
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'whatsapp' | 'pago') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `qr-${type}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      if (type === 'whatsapp') setQrWhatsappInput(data.publicUrl);
      else setQrPagoInput(data.publicUrl);
    } catch (err: unknown) {
      setError('Error al subir QR: ' + getErrorMessage(err));
    } finally {
      setQrUploading('none');
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#fbf5ea] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#732135]/10 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="ArteSana" className="h-8 w-auto object-contain" />
            <span className="hidden sm:inline-block px-3 py-1 text-xs font-bold bg-[#fbe3e4] text-[#732135] rounded-full uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                fetchInventoryLog();
                setIsInventoryOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2d5a27] hover:text-[#556b2f] transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventario</span>
            </button>
            <button
              onClick={() => {
                loadSettings();
                setIsSettingsOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#b76545] hover:text-[#732135] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configuración</span>
            </button>
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2d5a27] hover:text-[#556b2f] transition-colors"
              target="_blank"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Catálogo</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#732135] hover:bg-[#fbe3e4] rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-[#fbe3e4] border border-[#732135]/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#732135] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-[#732135] font-medium block">{error}</span>
              <span className="text-xs text-[#732135]/80 mt-1 block">
                Revisa la consola o ejecuta <code className="font-mono bg-white/50 px-1 rounded">supabase_migration_v2.sql</code> en Supabase.
              </span>
            </div>
            <button onClick={() => setError(null)} className="text-[#732135] hover:text-black"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar producto..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#732135] text-sm text-[#2f2e2b]" />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#732135] text-sm text-[#2f2e2b]">
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Todas las categorías' : cat}</option>
              ))}
            </select>
          </div>
          <button onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2d5a27] hover:bg-[#556b2f] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer">
            <Plus className="w-5 h-5" /><span>Nuevo Producto</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[#732135] animate-spin" />
            <span className="text-sm text-[#2f2e2b]/70 font-medium">Cargando base de datos...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#732135]/10 p-12 text-center shadow-sm">
            <ShoppingBag className="w-12 h-12 text-[#732135]/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#2f2e2b] mb-1">No se encontraron productos</h3>
            <p className="text-sm text-[#2f2e2b]/60">Intenta buscando con otra palabra o añade tu primer jabón artesanal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              let stockColor = 'bg-[#e2f0d9] text-[#2d5a27] border-[#2d5a27]/20';
              if (product.stock === 0) {
                stockColor = 'bg-[#fbe3e4] text-[#732135] border-[#732135]/20';
              } else if (product.stock < 5) {
                stockColor = 'bg-[#fff2cc] text-[#b76545] border-[#b76545]/20';
              }

              const hasVariants = product.variants && product.variants.length > 0;

              return (
                <div key={product.id} 
                  className={`bg-white rounded-2xl border ${product.is_active ? 'border-[#732135]/10' : 'border-gray-200 opacity-70'} overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col`}>
                  <div className="h-44 bg-[#fbf5ea] relative flex items-center justify-center p-4">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-[#732135]/30 flex flex-col items-center gap-1">
                        <ShoppingBag className="w-8 h-8" /><span className="text-xs">Sin foto</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 text-2xs font-bold bg-[#fbf5ea] border border-[#732135]/10 text-[#b76545] rounded-full uppercase tracking-wider">{product.category}</span>
                    <button onClick={() => handleToggleActive(product.id, product.is_active)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 text-[#2f2e2b] transition-all cursor-pointer"
                      title={product.is_active ? 'Ocultar del catálogo' : 'Mostrar en el catálogo'}>
                      {product.is_active ? <Eye className="w-4 h-4 text-[#2d5a27]" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-serif font-bold text-lg text-[#2f2e2b] leading-snug">{product.name}</h3>
                      <span className="font-bold text-[#732135] shrink-0 text-base">Bs {product.price}</span>
                    </div>
                    <p className="text-xs text-[#2f2e2b]/60 mb-2 line-clamp-2">{product.intro}</p>
                    
                    {hasVariants && (
                      <div className="text-3xs text-[#b76545] font-bold mb-2">
                        {product.variants!.length} variante(s): {product.variants!.map(v => v.presentation).join(', ')}
                      </div>
                    )}

                    <div className="mt-auto space-y-4">
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex flex-col">
                          <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Inventario</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold mt-1 inline-block ${stockColor}`}>
                            {product.stock === 0 ? 'Agotado' : `${product.stock} disponibles`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 border border-gray-200 rounded-xl bg-gray-50 p-1">
                          <button onClick={() => handleStockChange(product.id, product.stock - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-500 hover:text-[#732135] active:scale-95 transition-all font-bold cursor-pointer" disabled={product.stock === 0}>-</button>
                          <span className="w-8 text-center text-sm font-bold text-[#2f2e2b]">{product.stock}</span>
                          <button onClick={() => handleStockChange(product.id, product.stock + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-500 hover:text-[#2d5a27] active:scale-95 transition-all font-bold cursor-pointer">+</button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                        <button onClick={() => handleOpenEdit(product)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold border border-gray-200 text-[#2f2e2b] hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" /><span>Editar</span>
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-2 border border-[#fbe3e4] text-[#732135] hover:bg-[#fbe3e4] rounded-xl transition-all cursor-pointer" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL DE AGREGAR/EDITAR PRODUCTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#732135]/10 font-sans">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-serif font-bold text-[#732135]">
                {editingProduct ? `Editar ${editingProduct.name}` : 'Añadir Nuevo Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 text-[#2f2e2b] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre</label>
                  <input type="text" required value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" placeholder="Ej: Jabón de Lavanda" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Categoría</label>
                  <input type="text" required value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" placeholder="Ej: Jabones artesanales" />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Presentación (principal)</label>
                  <input type="text" required value={formData.presentation}
                    onChange={(e) => setFormData(prev => ({ ...prev, presentation: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" placeholder="Ej: 90 g, 1 Litro" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Precio (Bs)</label>
                    <input type="number" step="0.1" required min="0" value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock</label>
                    <input type="number" required min="0" value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" />
                  </div>
                </div>
              </div>

              {/* VARIANTES */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Variantes (presentaciones alternativas)</label>
                  <button type="button" onClick={addVariant}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-3xs font-extrabold text-[#732135] border border-[#732135]/30 rounded-xl hover:bg-[#fbe3e4] transition-all cursor-pointer">
                    <Plus className="w-3 h-3" /> Agregar variante
                  </button>
                </div>
                {formData.variants.length === 0 ? (
                  <p className="text-3xs text-gray-400 text-center py-2">Sin variantes. Útil para presentaciones múltiples como Kéfir 1L y 1/2L.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.variants.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-200">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-3xs font-bold text-gray-400 mb-0.5">Presentación</label>
                            <input type="text" value={v.presentation}
                              onChange={(e) => updateVariant(i, 'presentation', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#732135] focus:outline-none" placeholder="1/2 Litro" />
                          </div>
                          <div>
                            <label className="block text-3xs font-bold text-gray-400 mb-0.5">Precio</label>
                            <input type="number" step="0.1" min="0" value={v.price}
                              onChange={(e) => updateVariant(i, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#732135] focus:outline-none" />
                          </div>
                          <div className="flex items-end gap-1">
                            <div className="flex-1">
                              <label className="block text-3xs font-bold text-gray-400 mb-0.5">Stock</label>
                              <input type="number" min="0" value={v.stock}
                                onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#732135] focus:outline-none" />
                            </div>
                            <button type="button" onClick={() => removeVariant(i)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subida de Imagen */}
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50">
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Foto del Producto</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {formData.image_url ? (
                    <div className="w-24 h-24 bg-white border border-gray-200 rounded-xl p-2 flex items-center justify-center relative shrink-0">
                      <img src={formData.image_url} alt="Preview" className="max-h-full max-w-full object-contain" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 shrink-0">
                      <ShoppingBag className="w-6 h-6" /><span className="text-3xs">Sin foto</span>
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload-input" disabled={uploadingImage} />
                      <label htmlFor="image-upload-input"
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl text-sm font-semibold text-[#2f2e2b] cursor-pointer shadow-xs transition-all ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploadingImage ? <><Loader2 className="w-4 h-4 animate-spin text-[#732135]" /><span>Subiendo imagen...</span></>
                          : <><Upload className="w-4 h-4 text-[#732135]" /><span>Subir foto desde dispositivo</span></>}
                      </label>
                    </div>
                    <p className="text-3xs text-gray-400 mt-1.5 pl-1">O pega URL directa:</p>
                    <input type="text" placeholder="https://ejemplo.com/foto.jpg" value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      className="w-full mt-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-[#2f2e2b] focus:outline-none focus:ring-1 focus:ring-[#732135]" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Introducción Corta</label>
                  <textarea required rows={2} value={formData.intro}
                    onChange={(e) => setFormData(prev => ({ ...prev, intro: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" placeholder="Descripción rápida para la portada del catálogo." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Beneficios</label>
                    <textarea required rows={3} value={formData.benefit}
                      onChange={(e) => setFormData(prev => ({ ...prev, benefit: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Modo de Uso</label>
                    <textarea required rows={3} value={formData.use}
                      onChange={(e) => setFormData(prev => ({ ...prev, use: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Aplicación</label>
                    <textarea required rows={3} value={formData.apply}
                      onChange={(e) => setFormData(prev => ({ ...prev, apply: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Recomendación</label>
                    <textarea required rows={3} value={formData.recommend}
                      onChange={(e) => setFormData(prev => ({ ...prev, recommend: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" />
                  </div>
                </div>
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nota al Pie</label>
                  <input type="text" required value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#732135] focus:outline-none text-sm text-[#2f2e2b]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                <div>
                  <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-2">Color Temático</label>
                  <div className="flex gap-4">
                    {(['rosa', 'verde', 'terracota'] as const).map((col) => {
                      const colorsMap: Record<string, string> = {
                        rosa: 'bg-[#fbe3e4] border-[#732135]/30 text-[#732135]',
                        verde: 'bg-[#e2f0d9] border-[#2d5a27]/30 text-[#2d5a27]',
                        terracota: 'bg-[#fbe7e0] border-[#b76545]/30 text-[#b76545]'
                      };
                      return (
                        <label key={col} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="accent" value={col} checked={formData.accent === col}
                            onChange={() => setFormData(prev => ({ ...prev, accent: col }))}
                            className="text-[#732135] focus:ring-[#732135] h-4 w-4" />
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${colorsMap[col]}`}>{col}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  <label className="flex items-center gap-2 cursor-pointer mt-6">
                    <input type="checkbox" checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded text-[#2d5a27] focus:ring-[#2d5a27] h-4 w-4 cursor-pointer" />
                    <span className="text-sm font-bold text-[#2f2e2b] uppercase tracking-wide">Visible en catálogo</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-[#732135] hover:bg-[#b76545] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer">
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURACIÓN */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#732135]/10 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-serif font-bold text-[#732135]">Configuración del Sitio</h2>
              <button onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-[#2f2e2b] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-8">
              {/* LOGO */}
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-3">Logo de ArteSana</label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-[#fbf5ea] border border-gray-200 rounded-xl p-1.5 flex items-center justify-center shrink-0">
                    <img src={logoInputUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-3xs text-gray-400">Se muestra en el header del catálogo público.</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload-input" disabled={logoUploading} />
                    <label htmlFor="logo-upload-input"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl text-3xs font-bold text-[#2f2e2b] cursor-pointer shadow-xs transition-all ${logoUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {logoUploading ? <><Loader2 className="w-3 h-3 animate-spin" /><span>Subiendo...</span></>
                        : <><Upload className="w-3.5 h-3.5" /><span>Subir logo</span></>}
                    </label>
                  </div>
                  <input type="text" placeholder="URL del logo" value={logoInputUrl}
                    onChange={(e) => setLogoInputUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-[#2f2e2b] focus:outline-none focus:ring-1 focus:ring-[#732135]" />
                </div>
              </div>

              {/* QR WHATSAPP */}
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-3">Código QR - WhatsApp</label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-[#fbf5ea] border border-gray-200 rounded-xl p-1.5 flex items-center justify-center shrink-0">
                    <img src={qrWhatsappInput} alt="QR WhatsApp preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-3xs text-gray-400">Se muestra en la sección de contacto del catálogo.</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <input type="file" accept="image/*" onChange={(e) => handleQrUpload(e, 'whatsapp')} className="hidden" id="qr-whatsapp-upload-input" disabled={qrUploading !== 'none'} />
                    <label htmlFor="qr-whatsapp-upload-input"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl text-3xs font-bold text-[#2f2e2b] cursor-pointer shadow-xs transition-all ${qrUploading !== 'none' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {qrUploading === 'whatsapp' ? <><Loader2 className="w-3 h-3 animate-spin" /><span>Subiendo...</span></>
                        : <><Upload className="w-3.5 h-3.5" /><span>Subir QR WhatsApp</span></>}
                    </label>
                  </div>
                  <input type="text" placeholder="URL del QR WhatsApp" value={qrWhatsappInput}
                    onChange={(e) => setQrWhatsappInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-[#2f2e2b] focus:outline-none focus:ring-1 focus:ring-[#732135]" />
                </div>
              </div>

              {/* QR PAGO */}
              <div>
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-3">Código QR - Pago</label>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-16 h-16 bg-[#fbf5ea] border border-gray-200 rounded-xl p-1.5 flex items-center justify-center shrink-0">
                    <img src={qrPagoInput} alt="QR Pago preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-3xs text-gray-400">Se muestra en la sección de contacto del catálogo.</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <input type="file" accept="image/*" onChange={(e) => handleQrUpload(e, 'pago')} className="hidden" id="qr-pago-upload-input" disabled={qrUploading !== 'none'} />
                    <label htmlFor="qr-pago-upload-input"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 rounded-xl text-3xs font-bold text-[#2f2e2b] cursor-pointer shadow-xs transition-all ${qrUploading !== 'none' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {qrUploading === 'pago' ? <><Loader2 className="w-3 h-3 animate-spin" /><span>Subiendo...</span></>
                        : <><Upload className="w-3.5 h-3.5" /><span>Subir QR Pago</span></>}
                    </label>
                  </div>
                  <input type="text" placeholder="URL del QR Pago" value={qrPagoInput}
                    onChange={(e) => setQrPagoInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-[#2f2e2b] focus:outline-none focus:ring-1 focus:ring-[#732135]" />
                </div>
              </div>

              {/* CONTENIDO EDITABLE */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-2xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contenido del Catálogo</label>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  <ContentField label="Badge del Hero" value={pageContent.hero_badge} onChange={(v) => setPageContent(p => ({...p, hero_badge: v}))} />
                  <ContentField label="Título del Hero" value={pageContent.hero_title} onChange={(v) => setPageContent(p => ({...p, hero_title: v}))} />
                  <ContentField label="Subtítulo del Hero" value={pageContent.hero_subtitle} onChange={(v) => setPageContent(p => ({...p, hero_subtitle: v}))} />
                  <ContentField label="Título de Contacto" value={pageContent.contact_title} onChange={(v) => setPageContent(p => ({...p, contact_title: v}))} />
                  <ContentField label="Subtítulo de Contacto" value={pageContent.contact_subtitle} onChange={(v) => setPageContent(p => ({...p, contact_subtitle: v}))} />
                  <ContentField label="Paso 1 - Título" value={pageContent.step1_title} onChange={(v) => setPageContent(p => ({...p, step1_title: v}))} />
                  <ContentField label="Paso 1 - Descripción" value={pageContent.step1_desc} onChange={(v) => setPageContent(p => ({...p, step1_desc: v}))} />
                  <ContentField label="Paso 2 - Título" value={pageContent.step2_title} onChange={(v) => setPageContent(p => ({...p, step2_title: v}))} />
                  <ContentField label="Paso 2 - Descripción" value={pageContent.step2_desc} onChange={(v) => setPageContent(p => ({...p, step2_desc: v}))} />
                  <ContentField label="Paso 3 - Título" value={pageContent.step3_title} onChange={(v) => setPageContent(p => ({...p, step3_title: v}))} />
                  <ContentField label="Paso 3 - Descripción" value={pageContent.step3_desc} onChange={(v) => setPageContent(p => ({...p, step3_desc: v}))} />
                  <ContentField label="Paso 4 - Título" value={pageContent.step4_title} onChange={(v) => setPageContent(p => ({...p, step4_title: v}))} />
                  <ContentField label="Paso 4 - Descripción" value={pageContent.step4_desc} onChange={(v) => setPageContent(p => ({...p, step4_desc: v}))} />
                  <ContentField label="Combo - Título" value={pageContent.combo_title} onChange={(v) => setPageContent(p => ({...p, combo_title: v}))} />
                  <ContentField label="Combo - Descripción" value={pageContent.combo_desc} onChange={(v) => setPageContent(p => ({...p, combo_desc: v}))} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleSaveSettings} disabled={savingSettings}
                className="px-6 py-2.5 bg-[#732135] hover:bg-[#b76545] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50">
                {savingSettings ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INVENTARIO */}
      {isInventoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-[#732135]/10 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-[#2d5a27]" />
                <h2 className="text-xl font-serif font-bold text-[#732135]">Control de Inventario</h2>
              </div>
              <button onClick={() => setIsInventoryOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-[#2f2e2b] cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {/* AJUSTE MANUAL */}
            <div className="p-6 border-b border-gray-200 bg-[#fbf5ea]/50">
              <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">Ajuste Manual de Stock</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select value={manualProduct} onChange={(e) => {
                  setManualProduct(e.target.value);
                  const p = products.find(pr => pr.id === e.target.value);
                  if (p) setManualStock(p.stock);
                }}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-xs text-[#2f2e2b] focus:outline-none focus:ring-1 focus:ring-[#732135]">
                  <option value="">Seleccionar producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>
                  ))}
                </select>
                <input type="number" min="0" placeholder="Nuevo stock" value={manualStock}
                  onChange={(e) => setManualStock(parseInt(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-xs text-[#2f2e2b] focus:outline-none focus:ring-1 focus:ring-[#732135]" />
                <input type="text" placeholder="Motivo del ajuste" value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-xs text-[#2f2e2b] focus:outline-none focus:ring-1 focus:ring-[#732135]" />
                <button onClick={async () => {
                  if (!manualProduct) { setError('Selecciona un producto.'); return; }
                  if (!manualReason.trim()) { setError('Escribe un motivo.'); return; }
                  await handleManualAdjustment(manualProduct, manualStock, manualReason);
                  setManualProduct('');
                  setManualStock(0);
                  setManualReason('');
                }}
                  className="px-4 py-2 bg-[#2d5a27] hover:bg-[#556b2f] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                  Registrar Ajuste
                </button>
              </div>
            </div>

            {/* FILTROS */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <span className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Filtrar:</span>
              {['all', 'Ingreso manual', 'Venta / Ajuste', 'Reposición de stock', 'Venta'].map(f => (
                <button key={f} onClick={() => setInventoryFilter(f)}
                  className={`px-3 py-1 text-3xs font-extrabold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
                    inventoryFilter === f ? 'bg-[#732135] text-white border-[#732135]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#732135]/40'
                  }`}>
                  {f === 'all' ? 'Todos' : f}
                </button>
              ))}
            </div>

            {/* HISTORIAL */}
            <div className="flex-1 overflow-y-auto p-6">
              {inventoryLog.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">Aún no hay movimientos de inventario.</p>
                  <p className="text-xs mt-1">Usa los botones + y - en cada producto o el formulario de ajuste manual.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inventoryLog
                    .filter(e => inventoryFilter === 'all' || e.reason === inventoryFilter)
                    .map(entry => (
                      <div key={entry.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <div className="flex items-center gap-4 min-w-0">
                          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#2f2e2b] truncate">{entry.product_name}</p>
                            <p className="text-3xs text-gray-400">{new Date(entry.created_at).toLocaleString('es-BO')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-2xs text-gray-400 max-w-[120px] truncate" title={entry.reason}>{entry.reason}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">{entry.previous_stock}</span>
                            <span className="text-xs text-gray-300">→</span>
                            <span className={`text-sm font-extrabold ${entry.change_amount > 0 ? 'text-[#2d5a27]' : 'text-[#732135]'}`}>
                              {entry.new_stock}
                            </span>
                          </div>
                          <span className={`text-3xs font-extrabold px-2 py-0.5 rounded-full ${
                            entry.change_amount > 0 ? 'bg-[#e2f0d9] text-[#2d5a27]' : 'bg-[#fbe3e4] text-[#732135]'
                          }`}>
                            {entry.change_amount > 0 ? `+${entry.change_amount}` : entry.change_amount}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

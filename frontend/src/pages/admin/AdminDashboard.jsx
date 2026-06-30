import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Tag, Plus, Trash2, AlertCircle, Pencil, X, Check,
  ShoppingBag, BarChart2, Upload, Search, ChevronDown, RefreshCw,
  Eye, Grid, List as ListIcon, ArrowLeft
} from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/product.api';
import { getCategories, createCategory, deleteCategory } from '../../api/category.api';
import { getAllOrders, updateOrderStatus } from '../../api/order.api';

// ── Category emoji map ──────────────────────────────────────────────────────
const CATEGORY_EMOJI = {
  'new arrivals': '✨', 'birthday': '🎂', 'anniversary': '💍',
  'jewellery': '💎', 'greeting cards': '💌', 'mugs': '☕',
  'soft toys': '🧸', 'home decor': '🏡', 'chocolates': '🍫', 'sale': '🏷️',
};
const catEmoji = (name = '') => CATEGORY_EMOJI[name.toLowerCase()] || '📦';

// ── Status colors ───────────────────────────────────────────────────────────
const STATUS_COLORS = {
  PENDING:    { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  PROCESSING: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  SHIPPED:    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  DELIVERED:  { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  CANCELLED:  { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
};
const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// ── Small reusable bits ─────────────────────────────────────────────────────
const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-[#fafafa] transition focus:border-red-500 focus:bg-white';
const labelCls = 'text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className="rounded-xl p-3" style={{ backgroundColor: color + '18' }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Image Dropzone ───────────────────────────────────────────────────────────
const ImageDropzone = ({ files, setFiles }) => {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...newFiles].slice(0, 5)); // max 5 images
  };

  return (
    <div>
      <div
        onClick={() => ref.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className="cursor-pointer rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center py-7 gap-2"
        style={{ borderColor: dragging ? '#CC0000' : '#e5e7eb', backgroundColor: dragging ? '#fff5f5' : '#fafafa' }}
      >
        <Upload size={24} color={dragging ? '#CC0000' : '#9ca3af'} />
        <p className="text-sm font-semibold text-gray-500">
          {dragging ? 'Drop images here' : 'Click or drag images here'}
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, WEBP — up to 5 images</p>
      </div>
      <input ref={ref} type="file" multiple accept="image/*" className="hidden"
        onChange={(e) => addFiles(e.target.files)} />

      {files.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {files.map((f, i) => (
            <div key={i} className="relative group">
              <img src={URL.createObjectURL(f)} alt=""
                className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Product Form (shared for Add + Edit) ─────────────────────────────────────
const ProductForm = ({ categories, initialData, onSuccess, onCancel }) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
  name: initialData?.name || '',
  price: initialData?.price || '',
  description: initialData?.description || '',
  stock: initialData?.stock || '',
  categoryId: initialData?.category?.id || '',
});
const [files, setFiles] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// ── Reset form when switching between Add and Edit ──
useEffect(() => {
  setForm({
    name: initialData?.name || '',
    price: initialData?.price || '',
    description: initialData?.description || '',
    stock: initialData?.stock || '',
    categoryId: initialData?.category?.id || '',
  });
  setFiles([]);
  setError('');
}, [initialData]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { setError('Please select a category.'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('description', form.description);
      fd.append('stock', form.stock);
      fd.append('categoryId', form.categoryId);
      files.forEach(f => fd.append('images', f));

      if (isEdit) {
        await updateProduct(initialData.id, fd);
      } else {
        await createProduct(fd);
      }
      onSuccess(isEdit ? 'Product updated!' : 'Product added!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3.5 py-2.5">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className={labelCls}>Product Name *</label>
        <input name="name" value={form.name} onChange={handleChange} required
          placeholder="e.g. Birthday Hamper Deluxe" className={inputCls} />
      </div>

      {/* Price + Stock */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Price (₹) *</label>
          <input name="price" value={form.price} onChange={handleChange} required
            type="number" min="0" placeholder="499" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Stock *</label>
          <input name="stock" value={form.stock} onChange={handleChange} required
            type="number" min="0" placeholder="50" className={inputCls} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange}
          placeholder="Describe the product — materials, occasion, etc."
          rows={3} className={inputCls + ' resize-none'} />
      </div>

      {/* Category chips */}
      <div>
        <label className={labelCls}>Category *</label>
        <div className="grid grid-cols-2 gap-2 mt-0.5">
          {categories.map((c) => {
            const active = form.categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, categoryId: c.id }))}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm font-semibold"
                style={{
                  borderColor: active ? '#CC0000' : '#e5e7eb',
                  backgroundColor: active ? '#fff5f5' : 'white',
                  color: active ? '#CC0000' : '#374151',
                }}
              >
                <span className="text-base">{catEmoji(c.name)}</span>
                {c.name}
              </button>
            );
          })}
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-amber-600 mt-1.5">⚠ No categories yet — add one in the Categories tab first.</p>
        )}
      </div>

      {/* Image upload */}
      <div>
        <label className={labelCls}>Product Images {isEdit ? '(leave empty to keep existing)' : ''}</label>
        <ImageDropzone files={files} setFiles={setFiles} />
      </div>

      {/* Existing images preview (edit mode) */}
      {isEdit && initialData?.images?.length > 0 && files.length === 0 && (
        <div>
          <label className={labelCls}>Current Images</label>
          <div className="flex gap-2 flex-wrap">
            {initialData.images.map((url, i) => (
              <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 text-white font-black py-3 rounded-xl text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#CC0000' }}>
          {loading ? (
            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Saving…</>
          ) : (
            <>{isEdit ? <><Check size={14}/> Save Changes</> : <><Plus size={14}/> Add Product</>}</>
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
const TABS = ['Products', 'Orders', 'Categories'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null); // product or null
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Category form
  const [catName, setCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(''), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([getProducts(0, 100), getCategories()]);
      setProducts(pRes.data.content || []);
      setCategories(cRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (activeTab === 'Orders') fetchOrders(); }, [activeTab, fetchOrders]);

  // ── Product actions ──
  const handleProductSuccess = async (msg) => {
    showFlash(msg);
    setShowAddForm(false);
    setEditingProduct(null);
    const pRes = await getProducts(0, 100);
    setProducts(pRes.data.content || []);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product? (It will be set as inactive)')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showFlash('Product deleted.');
    } catch (err) { console.error(err); }
  };

  // ── Category actions ──
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setCatLoading(true);
    try {
      await createCategory({ name: catName.trim() });
      setCatName('');
      const cRes = await getCategories();
      setCategories(cRes.data || []);
      showFlash('Category added!');
    } catch (err) {
      console.error(err);
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showFlash('Category deleted.');
    } catch (err) { console.error(err); }
  };

  // ── Order status ──
  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showFlash('Order status updated!');
    } catch (err) { console.error(err); }
  };

  // ── Filtered products ──
  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category?.id === filterCat;
    return matchSearch && matchCat;
  });

  // ── Stats ──
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f5f7' }}>

      {/* ── Flash toast ── */}
      {flash && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Check size={15} className="text-green-400" /> {flash}
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition">
            <ArrowLeft size={14} /> Back to Store
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <div>
            <h1 className="text-lg font-black text-gray-900">🎁 Admin Panel</h1>
            <p className="text-xs text-gray-400">Gift Gallery Management</p>
          </div>
        </div>
        <button onClick={fetchAll}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition hover:bg-gray-50">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<Package size={20}/>} label="Total Products" value={products.length} color="#CC0000" />
          <StatCard icon={<Tag size={20}/>} label="Categories" value={categories.length} color="#7c3aed" />
          <StatCard icon={<ShoppingBag size={20}/>} label="Pending Orders" value={pendingOrders} color="#d97706" />
          <StatCard icon={<BarChart2 size={20}/>} label="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} color="#059669" />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1 w-fit mb-6 shadow-sm">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={activeTab === t
                ? { backgroundColor: '#CC0000', color: 'white' }
                : { color: '#6b7280' }}>
              {t}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════
            PRODUCTS TAB
        ════════════════════════════════════ */}
        {activeTab === 'Products' && (
          <div className="flex flex-col gap-5">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white focus:border-red-400 transition"
                />
              </div>
              {/* Category filter */}
              <div className="relative">
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                  className="pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white appearance-none focus:border-red-400 transition">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{catEmoji(c.name)} {c.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* View toggle */}
              <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode('grid')}
                  className="p-2.5 transition"
                  style={{ backgroundColor: viewMode === 'grid' ? '#fff5f5' : 'transparent', color: viewMode === 'grid' ? '#CC0000' : '#9ca3af' }}>
                  <Grid size={15} />
                </button>
                <button onClick={() => setViewMode('list')}
                  className="p-2.5 transition"
                  style={{ backgroundColor: viewMode === 'list' ? '#fff5f5' : 'transparent', color: viewMode === 'list' ? '#CC0000' : '#9ca3af' }}>
                  <ListIcon size={15} />
                </button>
              </div>
              {/* Add Product button */}
              <button onClick={() => { setShowAddForm(true); setEditingProduct(null); }}
                className="flex items-center gap-2 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#CC0000' }}>
                <Plus size={15} /> Add Product
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">

              {/* Add / Edit Form Panel */}
              {(showAddForm || editingProduct) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-gray-900">
                      {editingProduct ? '✏️ Edit Product' : '➕ New Product'}
                    </h2>
                    <button onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition">
                      <X size={16} />
                    </button>
                  </div>
                  <ProductForm
                    categories={categories}
                    initialData={editingProduct}
                    onSuccess={handleProductSuccess}
                    onCancel={() => { setShowAddForm(false); setEditingProduct(null); }}
                  />
                </div>
              )}

              {/* Products grid/list */}
              <div className={showAddForm || editingProduct ? 'lg:col-span-2' : 'lg:col-span-3'}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-600">{filtered.length} products</p>
                </div>

                {loading ? (
                  <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-sm font-medium">No products found</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* ── GRID VIEW ── */
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filtered.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="relative">
                          <img src={p.images?.[0] || 'https://placehold.co/200x160/f7f7f7/CC0000?text=Gift'}
                            alt={p.name} className="w-full h-36 object-cover" />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => { setEditingProduct(p); setShowAddForm(false); }}
                              className="bg-white rounded-lg p-1.5 shadow hover:bg-blue-50 transition">
                              <Pencil size={12} color="#3b82f6" />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)}
                              className="bg-white rounded-lg p-1.5 shadow hover:bg-red-50 transition">
                              <Trash2 size={12} color="#ef4444" />
                            </button>
                          </div>
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">
                            {catEmoji(p.category?.name)} {p.category?.name || '—'}
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{p.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-black text-sm" style={{ color: '#CC0000' }}>₹{p.price}</span>
                            <span className="text-[11px] text-gray-400">Stock: {p.stock}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* ── LIST VIEW ── */
                  <div className="flex flex-col gap-2">
                    {filtered.map(p => (
                      <div key={p.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                        <img src={p.images?.[0] || 'https://placehold.co/60x60/f7f7f7/CC0000?text=Gift'}
                          alt={p.name} className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-800 line-clamp-1">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-black text-sm" style={{ color: '#CC0000' }}>₹{p.price}</span>
                            <span className="text-[11px] text-gray-400">Stock: {p.stock}</span>
                            <span className="text-[11px] bg-gray-50 border border-gray-100 text-gray-500 px-1.5 py-0.5 rounded-lg">
                              {catEmoji(p.category?.name)} {p.category?.name || '—'}
                            </span>
                          </div>
                          {p.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => { setEditingProduct(p); setShowAddForm(false); }}
                            className="p-2 rounded-xl hover:bg-blue-50 transition text-blue-400 hover:text-blue-600 border border-transparent hover:border-blue-100">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 rounded-xl hover:bg-red-50 transition text-red-300 hover:text-red-500 border border-transparent hover:border-red-100">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            ORDERS TAB
        ════════════════════════════════════ */}
        {activeTab === 'Orders' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-gray-500">{orders.length} total orders</p>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
                <p className="text-4xl mb-3">🛍️</p>
                <p className="text-sm font-medium">No orders yet</p>
              </div>
            ) : (
              orders.map(order => {
                const col = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-400 font-mono">
                          Order #{order.id?.slice(0, 18)}…
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '—'}
                        </p>
                        {order.shippingAddress && (
                          <p className="text-xs text-gray-500 mt-1">📍 {order.shippingAddress}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-base" style={{ color: '#CC0000' }}>
                          ₹{order.totalAmount?.toFixed(2)}
                        </span>
                        {/* Status dropdown */}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border-2 outline-none cursor-pointer transition"
                          style={{ backgroundColor: col.bg, color: col.text, borderColor: col.border }}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Order items */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-gray-50">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
                            <img
                              src={item.product?.images?.[0] || 'https://placehold.co/32x32/f7f7f7/CC0000?text=G'}
                              alt=""
                              className="w-7 h-7 object-cover rounded-lg"
                            />
                            <span className="text-xs font-semibold text-gray-700 max-w-[120px] truncate">
                              {item.product?.name}
                            </span>
                            <span className="text-xs text-gray-400">×{item.quantity}</span>
                            <span className="text-xs font-bold" style={{ color: '#CC0000' }}>
                              ₹{item.priceAtPurchase}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ════════════════════════════════════
            CATEGORIES TAB
        ════════════════════════════════════ */}
        {activeTab === 'Categories' && (
          <div className="grid md:grid-cols-3 gap-5">
            {/* Add form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
              <h2 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={16} style={{ color: '#CC0000' }} /> Add Category
              </h2>
              <form onSubmit={handleAddCategory} className="flex flex-col gap-3">
                <div>
                  <label className={labelCls}>Category Name *</label>
                  <input value={catName} onChange={e => setCatName(e.target.value)} required
                    placeholder="e.g. Birthday" className={inputCls} />
                </div>
                <p className="text-xs text-gray-400">
                  This will appear in the navigation bar automatically. Emoji will be auto-assigned for known names.
                </p>
                <button type="submit" disabled={catLoading}
                  className="text-white font-bold py-2.5 rounded-xl text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#CC0000' }}>
                  {catLoading ? 'Adding…' : <><Plus size={13}/> Add Category</>}
                </button>
              </form>
            </div>

            {/* Category list */}
            <div className="md:col-span-2">
              <p className="text-sm font-bold text-gray-500 mb-3">{categories.length} categories</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(c => (
                  <div key={c.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{catEmoji(c.name)}</div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{c.name}</p>
                        <p className="text-[11px] text-gray-400">{c.slug || c.name.toLowerCase().replace(/ /g, '-')}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCategory(c.id)}
                      className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

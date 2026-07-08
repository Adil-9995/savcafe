import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Plus,
  Search,
  Grid,
  List,
  Edit2,
  Trash2,
  X,
  Upload,
  Utensils
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  tax?: number;
  gst?: number;
  description: string;
  image_path: string;
  status: 'Available' | 'Out of Stock' | 'Disabled';
  category_id: number;
  category_name?: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [viewType, setViewType] = useState<'grid' | 'table'>('table');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [tax, setTax] = useState('0');
  const [gst, setGst] = useState('0');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Available' | 'Out of Stock' | 'Disabled'>('Available');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState('');
  
  const [modalError, setModalError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cats = await api.getCategories();
      const prods = await api.getProducts();
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error('Failed loading products page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setEditId(null);
    setCode('');
    setName('');
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setPrice('');
    setTax('0');
    setGst('0');
    setDescription('');
    setStatus('Available');
    setImageFile(null);
    setImagePath('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setIsEdit(true);
    setEditId(prod.id);
    setCode(prod.code);
    setName(prod.name);
    setCategoryId(prod.category_id ? String(prod.category_id) : '');
    setPrice(String(prod.price));
    setTax(String(prod.tax || 0));
    setGst(String(prod.gst || 0));
    setDescription(prod.description || '');
    setStatus(prod.status);
    setImageFile(null);
    setImagePath(prod.image_path || '');
    setModalError(null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSaveLoading(true);

    if (!code.trim() || !name.trim() || !price.trim()) {
      setModalError('Product Code, Name, and Price are required fields.');
      setSaveLoading(false);
      return;
    }

    try {
      let finalImagePath = imagePath;

      // Upload file if new file was chosen
      if (imageFile) {
        const uploadRes = await api.uploadProductImage(imageFile);
        finalImagePath = uploadRes.imagePath;
      }

      const payload = {
        code: code.trim(),
        name: name.trim(),
        categoryId: categoryId ? parseInt(categoryId) : null,
        price: parseFloat(price) || 0,
        tax: parseFloat(tax) || 0,
        gst: parseFloat(gst) || 0,
        description: description.trim(),
        imagePath: finalImagePath,
        status
      };

      if (isEdit && editId) {
        await api.updateProduct(editId, payload);
      } else {
        await api.addProduct(payload);
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Failed saving product. Check code duplication.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        fetchData();
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  // Filter Logic
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.code.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat ? prod.category_id === parseInt(selectedCat) : true;
    const matchesStatus = selectedStatus ? prod.status === selectedStatus : true;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-savora-border rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-heading font-semibold text-savora-brown uppercase tracking-wider">
            Products Catalog
          </h2>
          <p className="text-xs text-savora-text-secondary mt-0.5">Manage bakery items, desserts, pricing, and stock.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex bg-savora-card p-1 rounded-xl border border-savora-border">
            <button
              onClick={() => setViewType('table')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'table' ? 'bg-savora-brown text-white shadow-sm' : 'text-savora-text-secondary'
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'grid' ? 'bg-savora-brown text-white shadow-sm' : 'text-savora-text-secondary'
              }`}
            >
              <Grid size={16} />
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white text-xs font-bold shadow-md shadow-savora-brown/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-savora-border rounded-3xl p-4 flex flex-col md:flex-row gap-4 shadow-sm items-center">
        
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-savora-text-secondary">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name..."
            className="w-full pl-9 pr-4 py-2.5 border border-savora-border rounded-xl text-xs outline-none bg-savora-card/20 focus:bg-white focus:ring-1 focus:ring-savora-brown"
          />
        </div>

        {/* Category Filter */}
        <div className="relative w-full md:w-48">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-2.5 border border-savora-border rounded-xl text-xs outline-none bg-savora-card/20 text-savora-text-primary"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative w-full md:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 border border-savora-border rounded-xl text-xs outline-none bg-savora-card/20 text-savora-text-primary"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
      </div>

      {loading ? (
        // Loading Skeleton
        <div className="bg-white border border-savora-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="h-10 bg-savora-card border border-savora-border rounded-xl animate-shimmer"></div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-savora-card border border-savora-border rounded-xl animate-shimmer"></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-savora-border rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-savora-card border border-savora-border flex items-center justify-center text-savora-beige mb-4">
            <Utensils size={32} />
          </div>
          <h3 className="font-heading font-semibold text-base text-savora-brown">No products catalogued</h3>
          <p className="text-xs text-savora-text-secondary mt-1 max-w-sm">
            Create categories first, and then add delicious desserts to get started.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-savora-brown text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-savora-taupe"
          >
            Create Product Entry
          </button>
        </div>
      ) : viewType === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-savora-border rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-savora-card border-b border-savora-border text-xs uppercase font-bold text-savora-text-secondary">
                <tr>
                  <th className="p-4 pl-6">Code</th>
                  <th className="p-4">Image</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-center">Tax / GST</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-savora-border/60 text-xs">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-savora-card/25 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-savora-text-secondary">#{prod.code}</td>
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg bg-savora-card border border-savora-border/60 flex items-center justify-center overflow-hidden shrink-0">
                        {prod.image_path ? (
                          <img src={`http://localhost:5000${prod.image_path}`} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Utensils size={18} className="text-savora-beige" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-savora-text-primary">{prod.name}</td>
                    <td className="p-4 text-savora-text-secondary font-medium">{prod.category_name || 'Unassigned'}</td>
                    <td className="p-4 text-right font-bold font-heading text-savora-brown">₹{prod.price.toFixed(2)}</td>
                    <td className="p-4 text-center font-semibold text-savora-text-secondary font-mono">{prod.tax || 0}% / {prod.gst || 0}%</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.status === 'Available'
                            ? 'bg-green-50 text-savora-success border border-green-200'
                            : prod.status === 'Out of Stock'
                            ? 'bg-orange-50 text-savora-warning border border-orange-200'
                            : 'bg-red-50 text-savora-error border border-red-200'
                        }`}
                      >
                        {prod.status}
                      </span>
                    </td>
                    <td className="p-4 text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 border border-savora-border hover:bg-savora-card text-savora-text-secondary hover:text-savora-brown rounded-xl transition-all cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 border border-transparent hover:border-red-200 text-savora-error hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-savora-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="relative h-44 bg-savora-card border-b border-savora-border flex items-center justify-center overflow-hidden shrink-0">
                {prod.image_path ? (
                  <img src={`http://localhost:5000${prod.image_path}`} alt={prod.name} className="w-full h-full object-cover" />
                ) : (
                  <Utensils size={40} className="text-savora-beige" />
                )}
                <span className="absolute top-3 left-3 bg-savora-brown/80 backdrop-blur-sm text-savora-peach text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                  #{prod.code}
                </span>
                <span
                  className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    prod.status === 'Available'
                      ? 'bg-green-50 text-savora-success border border-green-200'
                      : prod.status === 'Out of Stock'
                      ? 'bg-orange-50 text-savora-warning border border-orange-200'
                      : 'bg-red-50 text-savora-error border border-red-200'
                  }`}
                >
                  {prod.status}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[9px] uppercase font-bold text-savora-taupe tracking-wider">
                  {prod.category_name || 'Unassigned'}
                </span>
                <h4 className="font-heading font-semibold text-savora-text-primary text-sm mt-0.5">{prod.name}</h4>
                <p className="text-xs text-savora-text-secondary mt-1 line-clamp-2 leading-relaxed flex-grow">
                  {prod.description || 'No description provided.'}
                </p>
                <div className="mt-4 pt-3 border-t border-savora-border/40 flex justify-between items-center shrink-0">
                  <span className="text-sm font-bold font-heading text-savora-brown">₹{prod.price.toFixed(2)}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="p-1.5 border border-savora-border hover:bg-savora-card text-savora-text-secondary rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 hover:bg-red-50 text-savora-error rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-savora-border rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-savora-card border-b border-savora-border flex justify-between items-center shrink-0">
              <span className="font-heading font-semibold text-sm text-savora-brown">
                {isEdit ? 'Modify Product Entry' : 'Create Product Entry'}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-savora-border text-savora-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-savora-error font-medium">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Product Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. 101"
                    required
                    disabled={isEdit}
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Fudge, pastry name..."
                    required
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Category Bind</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Product Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="₹0.00"
                    required
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="0.00%"
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">GST (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    placeholder="0.00%"
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">Description / Ingredient detail</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the bakery treat..."
                  rows={2}
                  className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Catalog Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-savora-text-primary mb-1">Product Visual Image</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 border border-savora-border hover:bg-savora-card text-savora-brown font-semibold rounded-xl cursor-pointer flex items-center gap-1">
                      <Upload size={14} /> Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imageFile && <span className="text-[10px] text-savora-text-secondary truncate max-w-[100px]">{imageFile.name}</span>}
                    {!imageFile && imagePath && <span className="text-[10px] text-green-600 font-semibold">Image Saved</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-savora-border flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-savora-border rounded-xl font-semibold bg-white hover:bg-savora-card text-savora-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Products;

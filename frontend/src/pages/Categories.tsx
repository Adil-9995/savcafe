import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tag, Plus, Edit2, Trash2, X, Cookie, IceCream, Coffee, Pizza, Sparkles } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  icon: string;
  created_at?: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Cookie');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEdit(false);
    setEditId(null);
    setName('');
    setIcon('Cookie');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setIsEdit(true);
    setEditId(cat.id);
    setName(cat.name);
    setIcon(cat.icon || 'Cookie');
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    try {
      if (isEdit && editId) {
        await api.updateCategory(editId, { name: name.trim(), icon });
      } else {
        await api.addCategory({ name: name.trim(), icon });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setModalError(err.message || 'Category modification failed. Name might exist.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Deleting this category will unassign it from all associated products. Continue?')) {
      try {
        await api.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert('Failed to delete category.');
      }
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Cookie':
        return <Cookie size={20} />;
      case 'IceCream':
        return <IceCream size={20} />;
      case 'Coffee':
        return <Coffee size={20} />;
      case 'Pizza':
        return <Pizza size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white border border-savora-border rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-heading font-semibold text-savora-brown uppercase tracking-wider">
            Menu Categories
          </h2>
          <p className="text-xs text-savora-text-secondary mt-0.5">Organize bakery and ice cream catalogs.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white text-xs font-bold shadow-md shadow-savora-brown/10 flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        // Grid loader skeletons
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-white border border-savora-border rounded-2xl animate-shimmer"></div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-savora-border rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-savora-card border border-savora-border flex items-center justify-center text-savora-beige mb-4">
            <Tag size={32} />
          </div>
          <h3 className="font-heading font-semibold text-base text-savora-brown">No categories found</h3>
          <p className="text-xs text-savora-text-secondary mt-1 max-w-xs">
            Start by adding categories (e.g. Bakery, Ice Creams, Beverages) to organize menu treats.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-savora-brown text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-savora-taupe"
          >
            Create Category Entry
          </button>
        </div>
      ) : (
        /* Grid Categories list */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-savora-border rounded-2xl p-5 flex flex-col justify-between items-start shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {/* Soft overlay bubble */}
              <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-savora-peach/10 rounded-full group-hover:scale-125 transition-transform duration-300"></div>

              <div className="space-y-3">
                <span className="p-2.5 rounded-xl bg-savora-peach/40 text-savora-brown inline-block">
                  {getIconComponent(cat.icon)}
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-savora-text-primary text-sm tracking-wide">
                    {cat.name}
                  </h3>
                  <span className="text-[9px] text-savora-text-secondary font-medium tracking-widest uppercase block mt-0.5">
                    Category Tag
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-savora-border/60 w-full flex justify-end gap-1.5 shrink-0 z-10">
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="p-1.5 border border-savora-border text-savora-text-secondary hover:bg-savora-card hover:text-savora-brown rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 size={11} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1.5 hover:bg-red-50 text-savora-error rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-savora-border rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 bg-savora-card border-b border-savora-border flex justify-between items-center">
              <span className="font-heading font-semibold text-sm text-savora-brown">
                {isEdit ? 'Modify Category' : 'Create Category'}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-savora-border text-savora-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-savora-error font-medium">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ice Creams, Bakery, Combos"
                  required
                  className="w-full p-2.5 border border-savora-border rounded-xl bg-savora-card/30 outline-none focus:bg-white focus:ring-1 focus:ring-savora-brown"
                />
              </div>

              <div>
                <label className="block font-semibold text-savora-text-primary mb-1">Visual Icon Representation</label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {[
                    { label: 'Cake/Bakery', val: 'Cookie' },
                    { label: 'Icecream', val: 'IceCream' },
                    { label: 'Drinks', val: 'Coffee' },
                    { label: 'Snacks', val: 'Pizza' },
                    { label: 'Combos', val: 'Sparkles' }
                  ].map((ic) => (
                    <button
                      key={ic.val}
                      type="button"
                      onClick={() => setIcon(ic.val)}
                      className={`p-2 border rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                        icon === ic.val
                          ? 'border-savora-brown bg-savora-peach/30 text-savora-brown'
                          : 'border-savora-border bg-white text-savora-text-secondary hover:bg-savora-card'
                      }`}
                      title={ic.label}
                    >
                      {getIconComponent(ic.val)}
                    </button>
                  ))}
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
                  className="px-4 py-2 rounded-xl bg-savora-brown hover:bg-savora-taupe text-white font-bold cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;

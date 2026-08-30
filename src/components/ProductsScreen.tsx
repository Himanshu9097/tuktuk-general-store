import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Languages,
  Sparkles,
  Leaf
} from 'lucide-react';
import { motion, PanInfo } from 'motion/react';
import { Product, ProductCategory, AppSettings } from '../types';
import { triggerHaptic } from '../lib/storage';
import { transliterateEnglishToHindi } from '../lib/transliteration';

interface SwipeableProductCardProps {
  p: Product;
  isCurrent: boolean;
  onSelectAndCalculate: (p: Product) => void;
  openEditModal: (p: Product, e: React.MouseEvent | Event) => void;
  confirmDelete: (e: React.MouseEvent | Event, p: Product) => void;
}

const SwipeableProductCard: React.FC<SwipeableProductCardProps> = ({
  p,
  isCurrent,
  onSelectAndCalculate,
  openEditModal,
  confirmDelete,
}) => {
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 70;
    if (info.offset.x > threshold) {
      // Swiped right -> Delete
      triggerHaptic();
      confirmDelete(event, p);
    } else if (info.offset.x < -threshold) {
      // Swiped left -> Edit
      triggerHaptic();
      openEditModal(p, event);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-botanical-sm mb-3 bg-[#E6E2DA]">
      {/* Background layer for Swipe Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
        {/* Left Side (Revealed on Right Swipe) -> Delete */}
        <div className="flex items-center gap-2 text-rose-600 font-bold opacity-90">
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-sans tracking-wide">Delete</span>
        </div>
        {/* Right Side (Revealed on Left Swipe) -> Edit */}
        <div className="flex items-center gap-2 text-[#5B6D61] font-bold opacity-90">
          <span className="text-sm font-sans tracking-wide">Edit</span>
          <Edit3 className="w-5 h-5" />
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        id={`product-card-${p.id}`}
        onClick={() => onSelectAndCalculate(p)}
        className={`relative w-full text-left p-4 rounded-3xl border transition-colors duration-200 cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${
          isCurrent
            ? 'bg-[#F2F0EB] border-[#8C9A84] ring-2 ring-[#8C9A84]/30'
            : 'bg-white border-[#E6E2DA]'
        }`}
      >
        <div className="flex-1 min-w-0 pointer-events-none">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif-display font-bold text-base text-[#2D3A31] truncate">
              {p.name}
            </span>
            {p.hindiName && (
              <span className="text-xs text-[#7A8A7E] font-medium bg-[#F9F8F4] px-2 py-0.5 rounded-full border border-[#E6E2DA]">
                {p.hindiName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F9F8F4] text-[#5B6D61] border border-[#E6E2DA]">
              {p.category}
            </span>
            {isCurrent && (
              <span className="text-[10px] font-bold text-[#8C9A84] flex items-center gap-0.5 uppercase tracking-widest">
                <Check className="w-3 h-3" /> Selected
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-none">
          <div className="text-right">
            <span className="text-[10px] text-[#7A8A7E] font-bold uppercase tracking-widest block leading-none">
              Rate / kg
            </span>
            <span className="font-serif text-xl font-bold text-[#2D3A31] tracking-tight">
              ₹{p.pricePerKg}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface ProductsScreenProps {
  products: Product[];
  selectedProduct: Product;
  onSelectAndCalculate: (product: Product) => void;
  onAddProduct: (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProduct: (updated: Product) => void;
  onDeleteProduct: (id: string) => void;
  onResetDefaults: () => void;
  settings: AppSettings;
}

const CATEGORIES: ProductCategory[] = [
  'All',
  'Dal',
  'Rice',
  'Flour',
  'Sugar & Salt',
  'Spices',
  'Oil & Ghee',
  'Dry Goods',
  'Other',
];

export const ProductsScreen: React.FC<ProductsScreenProps> = ({
  products,
  selectedProduct,
  onSelectAndCalculate,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form states for Add / Edit
  const [formName, setFormName] = useState<string>('');
  const [formHindiName, setFormHindiName] = useState<string>('');
  const [isHindiManuallyEdited, setIsHindiManuallyEdited] = useState<boolean>(false);
  const [formPrice, setFormPrice] = useState<string>('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Flour');
  const [formError, setFormError] = useState<string>('');

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.hindiName && p.hindiName.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleEnglishNameChange = (val: string) => {
    setFormName(val);
    if (!isHindiManuallyEdited || !formHindiName.trim()) {
      const autoHindi = transliterateEnglishToHindi(val);
      setFormHindiName(autoHindi);
    }
  };

  const handleHindiNameChange = (val: string) => {
    setFormHindiName(val);
    setIsHindiManuallyEdited(true);
  };

  const handleRegenerateHindi = () => {
    if (settings.hapticFeedback) triggerHaptic();
    const autoHindi = transliterateEnglishToHindi(formName);
    setFormHindiName(autoHindi);
    setIsHindiManuallyEdited(false);
  };

  const openAddModal = () => {
    if (settings.hapticFeedback) triggerHaptic();
    setFormName('');
    setFormHindiName('');
    setIsHindiManuallyEdited(false);
    setFormPrice('');
    setFormCategory('Flour');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product, e: React.MouseEvent | Event) => {
    e.stopPropagation?.();
    if (settings.hapticFeedback) triggerHaptic();
    setEditingProduct(product);
    setFormName(product.name);
    setFormHindiName(product.hindiName || '');
    setIsHindiManuallyEdited(Boolean(product.hindiName));
    setFormPrice(product.pricePerKg.toString());
    setFormCategory(product.category);
    setFormError('');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice);
    if (!formName.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Valid price per kg is required');
      return;
    }

    const finalHindiName = formHindiName.trim() || transliterateEnglishToHindi(formName.trim()) || undefined;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: formName.trim(),
        hindiName: finalHindiName,
        pricePerKg: priceNum,
        category: formCategory,
        updatedAt: new Date().toISOString(),
      });
      setEditingProduct(null);
    } else {
      onAddProduct({
        name: formName.trim(),
        hindiName: finalHindiName,
        pricePerKg: priceNum,
        category: formCategory,
      });
      setIsAddModalOpen(false);
    }
  };

  const confirmDelete = (e: React.MouseEvent | Event, product: Product) => {
    e.stopPropagation?.();
    if (settings.hapticFeedback) triggerHaptic();
    setDeletingProduct(product);
  };

  const executeDelete = () => {
    if (deletingProduct) {
      onDeleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="w-full space-y-4 pb-28">
      {/* 1. TOP ACTIONS & SEARCH */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E6E2DA] shadow-botanical-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-display font-bold text-xl text-[#2D3A31] tracking-tight flex items-center gap-2">
              <Leaf className="w-5 h-5 text-[#8C9A84]" strokeWidth={1.75} />
              Staple Catalog
            </h2>
            <p className="text-xs text-[#7A8A7E] mt-0.5">
              Select any item to calibrate rate and measure instantly.
            </p>
          </div>
          <button
            id="btn-add-new-product"
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-[#2D3A31] hover:bg-[#3E4E43] active:scale-95 text-[#F9F8F4] font-sans font-bold text-xs py-2.5 px-4 rounded-full shadow-botanical-sm transition-all duration-300"
          >
            <Plus className="w-4 h-4 text-[#8C9A84]" />
            <span className="tracking-wide uppercase">New Item</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8A7E]" strokeWidth={1.5} />
          <input
            id="input-search-product"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dal, rice, atta, spices, ghee..."
            className="w-full bg-[#F9F8F4] border border-[#E6E2DA] rounded-full py-2.5 pl-10 pr-9 text-sm text-[#2D3A31] placeholder-[#7A8A7E] focus:outline-none focus:border-[#8C9A84] focus:ring-1 focus:ring-[#8C9A84] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A7E] hover:text-[#2D3A31]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  if (settings.hapticFeedback) triggerHaptic();
                  setSelectedCategory(cat);
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all duration-300 active:scale-95 border ${
                  isSelected
                    ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] font-bold shadow-botanical-sm'
                    : 'bg-[#F2F0EB] text-[#5B6D61] border-[#E6E2DA] hover:bg-[#E6E2DA]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PRODUCT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-3xl p-10 border border-[#E6E2DA] text-center space-y-2 shadow-botanical-sm">
            <p className="font-serif text-lg font-bold text-[#2D3A31]">No botanical staples found</p>
            <p className="text-xs text-[#7A8A7E]">Try searching another item or add a new entry to the catalog.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs text-[#C27B66] hover:underline font-bold mt-2 font-sans tracking-wide uppercase"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <SwipeableProductCard
              key={p.id}
              p={p}
              isCurrent={selectedProduct.id === p.id}
              onSelectAndCalculate={(prod) => {
                onSelectAndCalculate(prod);
              }}
              openEditModal={openEditModal}
              confirmDelete={confirmDelete}
            />
          ))
        )}
      </div>

      {/* 3. MODAL: ADD / EDIT PRODUCT */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-[#2D3A31]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] border border-[#E6E2DA] rounded-3xl w-full max-w-sm p-6 shadow-botanical-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E2DA] pb-3">
              <h3 className="font-serif-display font-bold text-lg text-[#2D3A31]">
                {editingProduct ? 'Edit Grocery Item' : 'New Grocery Item'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 rounded-full text-[#7A8A7E] hover:text-[#2D3A31] hover:bg-[#E6E2DA] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#2D3A31] block mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleEnglishNameChange(e.target.value)}
                  placeholder="e.g. Suji, Basmati Rice, Mustard Oil"
                  className="w-full bg-white border border-[#E6E2DA] rounded-2xl px-3.5 py-2.5 text-[#2D3A31] text-sm focus:outline-none focus:border-[#8C9A84] focus:ring-1 focus:ring-[#8C9A84]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#2D3A31] flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-[#8C9A84]" />
                    Hindi Name (Auto-Generated)
                  </label>
                  {formName && (
                    <button
                      type="button"
                      onClick={handleRegenerateHindi}
                      className="text-[10px] font-bold text-[#C27B66] hover:text-[#b06d59] flex items-center gap-0.5"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Fill
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formHindiName}
                  onChange={(e) => handleHindiNameChange(e.target.value)}
                  placeholder="Auto-generated Hindi script"
                  className="w-full bg-white border border-[#E6E2DA] rounded-2xl px-3.5 py-2.5 text-[#2D3A31] text-sm focus:outline-none focus:border-[#8C9A84] focus:ring-1 focus:ring-[#8C9A84]"
                />
                <p className="text-[10px] text-[#7A8A7E] mt-1">
                  Phonetically translates in real time. Can be adjusted manually.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#2D3A31] block mb-1">
                    Price per KG (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A8A7E] font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="42"
                      className="w-full bg-white border border-[#E6E2DA] rounded-2xl pl-8 pr-3.5 py-2.5 text-[#2D3A31] text-sm font-serif font-bold focus:outline-none focus:border-[#8C9A84] focus:ring-1 focus:ring-[#8C9A84]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2D3A31] block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full bg-white border border-[#E6E2DA] rounded-2xl px-3 py-2.5 text-[#2D3A31] text-sm focus:outline-none focus:border-[#8C9A84] focus:ring-1 focus:ring-[#8C9A84]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3.5 border-t border-[#E6E2DA]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-full bg-[#F2F0EB] text-[#2D3A31] hover:bg-[#E6E2DA] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#2D3A31] hover:bg-[#3E4E43] text-[#F9F8F4] text-xs font-bold shadow-botanical-sm"
                >
                  {editingProduct ? 'Update Item' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: DELETE CONFIRMATION */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-[#2D3A31]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] border border-[#E6E2DA] rounded-3xl w-full max-w-xs p-6 shadow-botanical-xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-base text-[#2D3A31]">Remove Item?</h3>
              <p className="text-xs text-[#7A8A7E] mt-1">
                Are you sure you want to remove <strong className="text-[#2D3A31]">{deletingProduct.name}</strong> (₹{deletingProduct.pricePerKg}/kg)?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                id="btn-cancel-delete"
                onClick={() => setDeletingProduct(null)}
                className="py-2.5 rounded-full bg-[#F2F0EB] hover:bg-[#E6E2DA] text-[#2D3A31] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete"
                onClick={executeDelete}
                className="py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-botanical-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

export const ProductModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || '',
        category: initialData.category || '',
        stock: initialData.stock !== undefined ? initialData.stock : '',
        imageUrl: initialData.imageUrl || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '10',
        imageUrl: '',
      });
    }
    setFieldErrors({});
    setGeneralError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    const result = await onSubmit(formData);
    if (!result.success) {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMap = {};
        result.errors.forEach((err) => {
          if (err.field) {
            errorMap[err.field] = err.message;
          }
        });
        setFieldErrors(errorMap);
      }
      setGeneralError(result.message || 'Failed to save product');
    }
  };

  const categories = ['Electronics', 'Footwear', 'Apparel', 'Accessories', 'Audio', 'Home & Kitchen'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {generalError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Product Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              className={`w-full bg-slate-800/80 border ${
                fieldErrors.title ? 'border-rose-500' : 'border-slate-700'
              } focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.title}</p>
            )}
          </div>

          {/* Price & Stock Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="99.99"
                className={`w-full bg-slate-800/80 border ${
                  fieldErrors.price ? 'border-rose-500' : 'border-slate-700'
                } focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
              />
              {fieldErrors.price && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="25"
                className={`w-full bg-slate-800/80 border ${
                  fieldErrors.stock ? 'border-rose-500' : 'border-slate-700'
                } focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
              />
              {fieldErrors.stock && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.stock}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category *
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    formData.category === cat
                      ? 'bg-purple-600 border-purple-500 text-white font-medium shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Or enter custom category"
              className={`w-full bg-slate-800/80 border ${
                fieldErrors.category ? 'border-rose-500' : 'border-slate-700'
              } focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
            />
            {fieldErrors.category && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.category}</p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className={`w-full bg-slate-800/80 border ${
                fieldErrors.imageUrl ? 'border-rose-500' : 'border-slate-700'
              } focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
            />
            {fieldErrors.imageUrl && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.imageUrl}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description *
            </label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the product features..."
              className={`w-full bg-slate-800/80 border ${
                fieldErrors.description ? 'border-rose-500' : 'border-slate-700'
              } focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all resize-none`}
            ></textarea>
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

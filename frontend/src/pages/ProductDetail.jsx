import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ProductModal } from '../components/ProductModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
  ArrowLeft,
  Tag,
  Clock,
  User,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/products/${id}`);
      setProduct(res.data?.data?.product);
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.put(`/products/${id}`, formData);
      setProduct(res.data.data.product);
      setIsEditOpen(false);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Update failed',
        errors: err.response?.data?.errors || null,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/products/${id}`);
      navigate('/', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">{error || 'Could not find the requested product.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Products</span>
      </Link>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md grid grid-cols-1 lg:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square lg:aspect-auto bg-slate-800 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
            alt={product.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
            }}
            className="w-full h-full object-cover max-h-[500px]"
          />
        </div>

        {/* Product Specs */}
        <div className="p-6 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-purple-500/10 text-purple-400 text-xs px-3 py-1 rounded-full border border-purple-500/20 font-semibold flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                {product.category}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                  product.stock > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {product.stock > 0 ? `${product.stock} Units Available` : 'Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-3">
              {product.title}
            </h1>

            <div className="text-3xl font-bold text-white mb-6">
              {formattedPrice}
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Description
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Meta information */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="block text-slate-500">Created By</span>
                    <span className="text-slate-200 font-medium">
                      {product.createdBy?.name || 'Verified Seller'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="block text-slate-500">Listed Date</span>
                    <span className="text-slate-200 font-medium">
                      {new Date(product.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          {isAuthenticated && (
            <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Product</span>
              </button>

              <button
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 p-3 rounded-xl transition-all"
                title="Delete Product"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <ProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={product}
        isSubmitting={isSubmitting}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        productTitle={product.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};

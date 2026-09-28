import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  SlidersHorizontal,
  PackageOpen,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

export const Products = ({ isCreateModalOpen, setIsCreateModalOpen }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { isAuthenticated } = useAuth();

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Electronics', label: 'Electronics' },
    { id: 'Audio', label: 'Audio' },
    { id: 'Apparel', label: 'Apparel' },
    { id: 'Footwear', label: 'Footwear' },
    { id: 'Accessories', label: 'Accessories' },
    { id: 'Home & Kitchen', label: 'Home & Kitchen' },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (sortBy === 'price_asc') params.sort = 'price_asc';
      if (sortBy === 'price_desc') params.sort = 'price_desc';

      const res = await apiClient.get('/products', { params });
      setProducts(res.data?.data?.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, sortBy]);

  // Handle Create or Update submission
  const handleSaveProduct = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editProduct) {
        // Update product
        const res = await apiClient.put(`/products/${editProduct._id}`, formData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editProduct._id ? res.data.data.product : p))
        );
        setEditProduct(null);
      } else {
        // Create product
        const res = await apiClient.post('/products', formData);
        setProducts((prev) => [res.data.data.product, ...prev]);
        setIsCreateModalOpen(false);
      }
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete product
  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/products/${deleteProduct._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteProduct._id));
      setDeleteProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore Products
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse through our curated collection of latest tech and lifestyle essentials.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/35 active:scale-95 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-8 backdrop-blur-md shadow-lg flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or description..."
            className="w-full bg-slate-800/90 border border-slate-700/80 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Sort & Quick Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-2"
            >
              <option value="newest" className="bg-slate-900">Newest First</option>
              <option value="price_asc" className="bg-slate-900">Price: Low to High</option>
              <option value="price_desc" className="bg-slate-900">Price: High to Low</option>
            </select>
          </div>

          <button
            onClick={fetchProducts}
            title="Refresh list"
            className="p-2 bg-slate-800/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-slate-900/40 rounded-2xl border border-slate-800 p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-[16/10] bg-slate-800 rounded-xl"></div>
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              <div className="h-8 bg-slate-800 rounded-xl mt-4"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={(p) => setEditProduct(p)}
              onDelete={(p) => setDeleteProduct(p)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-800/80 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {search || selectedCategory !== 'all'
              ? 'No products matched your search or category filters.'
              : 'There are currently no products in the catalog.'}
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      )}

      {/* Create Product Modal */}
      <ProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSaveProduct}
        isSubmitting={isSubmitting}
      />

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        onSubmit={handleSaveProduct}
        initialData={editProduct}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDeleteProduct}
        productTitle={deleteProduct?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

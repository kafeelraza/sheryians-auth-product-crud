import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Tag, Layers, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProductCard = ({ product, onEdit, onDelete }) => {
  const { isAuthenticated } = useAuth();
  const canModify = isAuthenticated;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <div className="group bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-slate-900/80 backdrop-blur-md text-purple-300 text-xs px-2.5 py-1 rounded-lg border border-purple-500/30 font-medium flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {product.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-medium backdrop-blur-md border ${
              product.stock > 0
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1">
              {product.title}
            </h3>
            <span className="text-lg font-bold text-white bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700/60 whitespace-nowrap">
              {formattedPrice}
            </span>
          </div>

          <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800/80 mb-4">
            <span className="flex items-center gap-1 truncate">
              <Layers className="w-3 h-3 text-slate-400" />
              Seller: {product.createdBy?.name || 'Authorized Seller'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/products/${product._id}`}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white py-2 px-3 rounded-xl text-xs font-semibold transition-all border border-slate-700/50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Details</span>
            </Link>

            {canModify && (
              <>
                <button
                  onClick={() => onEdit(product)}
                  title="Edit Product"
                  className="p-2 bg-slate-800 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-slate-700/50 hover:border-purple-500/40 rounded-xl transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(product)}
                  title="Delete Product"
                  className="p-2 bg-slate-800 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/40 rounded-xl transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 text-rose-500 mb-4">
          <div className="p-3 bg-rose-500/10 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Delete Product</h3>
            <p className="text-xs text-slate-400">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-white">"{productTitle}"</span> from the catalog?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

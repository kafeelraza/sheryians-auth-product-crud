import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, PlusCircle, LogOut, User, LogIn, UserPlus } from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-xl group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="tracking-tight text-white font-bold text-lg leading-tight">
                Sheryians <span className="text-purple-400">Store</span>
              </span>
            </div>
          </Link>

          {/* Navigation & Action Items */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              className="text-slate-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Catalog
            </Link>

            {isAuthenticated ? (
              <>
                {onOpenCreateModal && (
                  <button
                    onClick={onOpenCreateModal}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-purple-500/20 transition-all hover:shadow-purple-500/30 active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 text-sm font-medium transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.charAt(0) || <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="hidden sm:inline font-medium">{user?.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-slate-800 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-purple-500/20 transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

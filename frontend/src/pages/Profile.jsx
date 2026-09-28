import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  KeyRound,
  LogOut,
} from 'lucide-react';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/30 to-slate-900/60 border border-purple-500/20 rounded-3xl p-8 mb-8 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-xl shadow-purple-500/30">
            {user?.name?.charAt(0) || <User className="w-8 h-8" />}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
            <p className="text-purple-300 text-sm">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Active Authenticated Session
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800/90 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Details & Security Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Info */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            <span>Account Details</span>
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400">Full Name</span>
              <span className="font-semibold text-white">{user?.name}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400">Email Address</span>
              <span className="font-semibold text-white">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400">User ID</span>
              <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                {user?._id || user?.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Member Since</span>
              <span className="text-slate-300 font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Active Today'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Overview */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Security Details</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="font-semibold text-purple-300 block mb-0.5">
                Access Token
              </span>
              <span>
                Short-lived (15 min) JWT stored in browser memory, sent via Authorization header.
              </span>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="font-semibold text-indigo-300 block mb-0.5">
                Refresh Token
              </span>
              <span>
                Long-lived (7 days) JWT persisted in MongoDB and secured in an httpOnly cookie.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

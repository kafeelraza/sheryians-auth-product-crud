import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

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
    setIsSubmitting(true);

    const result = await register(formData);

    if (result.success) {
      setSuccessMessage('Account created successfully! Logging you in...');
      // Automatically log the user in with their credentials
      const loginResult = await login(formData.email, formData.password);
      if (loginResult.success) {
        navigate('/', { replace: true });
      } else {
        navigate('/login');
      }
    } else {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMap = {};
        result.errors.forEach((err) => {
          if (err.field) errorMap[err.field] = err.message;
        });
        setFieldErrors(errorMap);
      }
      setGeneralError(result.message || 'Registration failed. Please correct the errors.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 border border-purple-500/30 rounded-2xl mb-3 text-purple-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the Sheryians Store</p>
        </div>

        {generalError && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full bg-slate-800/80 border ${
                  fieldErrors.name ? 'border-rose-500' : 'border-slate-700'
                } focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full bg-slate-800/80 border ${
                  fieldErrors.email ? 'border-rose-500' : 'border-slate-700'
                } focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-slate-800/80 border ${
                  fieldErrors.password ? 'border-rose-500' : 'border-slate-700'
                } focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
              />
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-slate-800/80 border ${
                  fieldErrors.confirmPassword ? 'border-rose-500' : 'border-slate-700'
                } focus:border-purple-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-400 font-medium">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

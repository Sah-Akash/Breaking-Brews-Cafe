/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Key, AlertCircle, ArrowLeft, Loader2, ShieldAlert, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (token: string, username: string) => void;
  onNavigateBack: () => void;
}

export default function AdminLogin({ onLoginSuccess, onNavigateBack }: AdminLoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [accessKey, setAccessKey] = useState('BB-SAFE-KEY-2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-login on mount
  useEffect(() => {
    handleBypass();
  }, []);

  const handleBypass = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Auto-login failed.');
      }

      onLoginSuccess(data.token, data.username);
    } catch (err: any) {
      setError(err.message || 'Auto-login failed. You can use standard fields below to sign in manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in both username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, accessKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onLoginSuccess(data.token, data.username);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-4">
      
      {/* Return to menu button */}
      <button
        id="back-to-menu-btn"
        onClick={onNavigateBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-all cursor-pointer bg-white border border-stone-200 px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl border border-stone-200 p-8 shadow-[0_10px_30px_rgba(40,30,20,0.04)]"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center text-amber-100 mx-auto mb-4 shadow-sm">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Admin Portal Access</h2>
          <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto">
            Authorized administrator area. Authenticating your secure session now...
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 leading-normal"
          >
            <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            id="bypass-login-btn"
            onClick={handleBypass}
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-amber-50 rounded-2xl py-4 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-75 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-100" />
                Signing into admin dashboard...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Enter Admin Dashboard Directly
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 text-stone-400 text-[10px] uppercase font-bold tracking-widest">or manually verify</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-stone-400 uppercase mb-1.5 pl-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/10 focus:border-stone-800 transition-all text-stone-800 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-stone-400 uppercase mb-1.5 pl-1">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/10 focus:border-stone-800 transition-all text-stone-800 font-medium"
                  required
                />
              </div>
            </div>

            {/* Optional Access Key */}
            <div className="border-t border-dashed border-stone-100 pt-4">
              <div className="flex items-center justify-between mb-1.5 pl-1">
                <label className="block text-[11px] font-bold tracking-wider text-stone-400 uppercase">
                  Admin Access Key
                </label>
                <span className="text-[9px] font-semibold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                  Secondary Layer
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                <input
                  id="login-accesskey"
                  type="text"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Leave blank if disabled"
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/10 focus:border-stone-800 transition-all text-stone-800 font-medium"
                />
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-amber-50 rounded-2xl py-3.5 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-75 cursor-pointer mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-100" />
                  Authenticating Session...
                </>
              ) : (
                'Access Admin Dashboard'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

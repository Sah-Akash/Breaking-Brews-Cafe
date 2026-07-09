/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CustomerMenu from './components/CustomerMenu.js';
import AdminLogin from './components/AdminLogin.js';
import AdminDashboard from './components/AdminDashboard.js';
import { RestaurantSettings, Category, MenuItem } from './types.js';

export default function App() {
  const [view, setView] = useState<'customer' | 'admin'>('customer');
  const [settings, setSettings] = useState<RestaurantSettings>({ restaurantName: 'Loading Menu...' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Synchronize with URL paths on boot
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path.startsWith('/hidden-admin-panel-73af91')) {
      setView('admin');
    } else {
      setView('customer');
    }

    // Load active session from local storage
    const storedToken = localStorage.getItem('qr_menu_admin_token');
    const storedUser = localStorage.getItem('qr_menu_admin_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUsername(storedUser);
    }

    // Fetch initial menu details
    fetchMenuDetails();

    // Listen to browser back/forward button navigations
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/hidden-admin-panel-73af91')) {
        setView('admin');
      } else {
        setView('customer');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchMenuDetails = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setCategories(data.categories);
        setMenuItems(data.menuItems);
      }
    } catch (err) {
      console.error('Failed to fetch menu details:', err);
    }
  };

  const navigateTo = (newView: 'customer' | 'admin') => {
    setView(newView);
    window.history.pushState(null, '', newView === 'admin' ? '/admin' : '/');
  };

  const handleLoginSuccess = (userToken: string, name: string) => {
    setToken(userToken);
    setUsername(name);
    localStorage.setItem('qr_menu_admin_token', userToken);
    localStorage.setItem('qr_menu_admin_user', name);
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('qr_menu_admin_token');
    localStorage.removeItem('qr_menu_admin_user');
    navigateTo('customer');
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <AnimatePresence mode="wait">
        {view === 'customer' ? (
          <motion.div
            key="customer-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CustomerMenu
              settings={settings}
              categories={categories}
              menuItems={menuItems}
              onNavigateToAdmin={() => navigateTo('admin')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="admin-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {token ? (
              <AdminDashboard
                token={token}
                onLogout={handleLogout}
                onRefreshMenu={fetchMenuDetails}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={handleLoginSuccess}
                onNavigateBack={() => navigateTo('customer')}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

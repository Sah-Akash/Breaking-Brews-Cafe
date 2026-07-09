/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { 
  Plus, Edit2, Trash2, Copy, Eye, EyeOff, Sparkles, Settings, ArrowRightLeft, 
  QrCode, LogOut, ChevronRight, Check, AlertCircle, RefreshCw, Upload, 
  Tag, Compass, Image as ImageIcon, Flame, DollarSign, ListFilter, Trash, CheckSquare, Square, Download
} from 'lucide-react';
import { RestaurantSettings, Category, MenuItem, ExtractedCategory, AIExtractionResponse } from '../types.js';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onRefreshMenu: () => void;
}

export default function AdminDashboard({ token, onLogout, onRefreshMenu }: AdminDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'items' | 'ai-ocr' | 'bulk' | 'settings' | 'qrcode'>('overview');

  // Menu States
  const [settings, setSettings] = useState<RestaurantSettings>({ restaurantName: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState({ totalCategories: 0, totalMenuItems: 0, lastUpdated: '' });

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals & Form States
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catFormName, setCatFormName] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isVeg: true,
    isBestseller: false,
    isRecommended: false,
    isAvailable: true
  });

  // AI OCR States
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreview, setOcrPreview] = useState<string>('');
  const [isOcrExtracting, setIsOcrExtracting] = useState(false);
  const [ocrResult, setOcrResult] = useState<AIExtractionResponse | null>(null);
  const [ocrEditData, setOcrEditData] = useState<ExtractedCategory[]>([]);

  // Bulk operation states
  const [bulkPercentage, setBulkPercentage] = useState('10');
  const [bulkCategoryFilter, setBulkCategoryFilter] = useState('all');
  const [selectedBulkItems, setSelectedBulkItems] = useState<string[]>([]);

  // QR Code States
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDownloadUrl, setQrDownloadUrl] = useState('');

  // Fetch full data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setCategories(data.categories);
        setMenuItems(data.menuItems);
        
        // Update stats
        setStats({
          totalCategories: data.categories.length,
          totalMenuItems: data.menuItems.length,
          lastUpdated: new Date().toLocaleTimeString()
        });
      }
    } catch (err: any) {
      setError('Failed to fetch platform metrics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handle Category Add/Edit Submission
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) return;

    setError('');
    setSuccess('');

    try {
      const url = editingCat ? `/api/admin/categories/${editingCat.id}` : '/api/admin/categories';
      const method = editingCat ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: catFormName })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save category');
      }

      setSuccess(`Category successfully ${editingCat ? 'updated' : 'added'}!`);
      setShowCatModal(false);
      setEditingCat(null);
      setCatFormName('');
      fetchData();
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditCatClick = (cat: Category) => {
    setEditingCat(cat);
    setCatFormName(cat.name);
    setShowCatModal(true);
  };

  const handleDeleteCatClick = async (id: string) => {
    if (!confirm('Warning: Deleting this category will delete all items under it. Do you wish to proceed?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete category');
      setSuccess('Category and its items deleted.');
      fetchData();
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle Manual Menu Item Add/Edit
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price || !itemForm.categoryId) {
      setError('Please fill in Name, Price, and Category.');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const url = editingItem ? `/api/admin/menu-items/${editingItem.id}` : '/api/admin/menu-items';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemForm)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save menu item');
      }

      setSuccess(`Dish ${editingItem ? 'updated' : 'added'} successfully!`);
      setShowItemModal(false);
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        imageUrl: '',
        isVeg: true,
        isBestseller: false,
        isRecommended: false,
        isAvailable: true
      });
      fetchData();
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditItemClick = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId,
      imageUrl: item.imageUrl || '',
      isVeg: item.isVeg,
      isBestseller: item.isBestseller,
      isRecommended: item.isRecommended,
      isAvailable: item.isAvailable
    });
    setShowItemModal(true);
  };

  const handleDeleteItemClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/menu-items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete item');
      setSuccess('Item deleted successfully.');
      fetchData();
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDuplicateItemClick = async (id: string) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/menu-items/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to duplicate item');
      setSuccess('Item duplicated successfully!');
      fetchData();
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/admin/menu-items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });

      if (res.ok) {
        fetchData();
        onRefreshMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Base64 manual image compressor & loader
  const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setItemForm(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Settings Update
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error('Failed to update restaurant settings');
      setSuccess('Restaurant settings updated successfully!');
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Drag and drop AI Menu OCR File Picker
  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOcrPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini Menu Extraction
  const handleRunOcrExtraction = async () => {
    if (!ocrPreview) return;
    setError('');
    setSuccess('');
    setIsOcrExtracting(true);

    try {
      const parts = ocrPreview.split(',');
      const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
      const base64Data = parts[1];

      const res = await fetch('/api/admin/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ base64Data, mimeType })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gemini extraction failed.');
      }

      setOcrResult(data);
      setOcrEditData(data.categories || []);
      setSuccess('AI OCR completed successfully! Please review, edit, and publish below.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsOcrExtracting(false);
    }
  };

  // Edit OCR cell
  const handleOcrCellEdit = (catIndex: number, itemIndex: number, field: string, value: any) => {
    const updated = [...ocrEditData];
    updated[catIndex].items[itemIndex] = {
      ...updated[catIndex].items[itemIndex],
      [field]: value
    };
    setOcrEditData(updated);
  };

  // Save Extracted Menu items
  const handleSaveOcrMenu = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/save-extracted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ categories: ocrEditData })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save extracted menu');

      setSuccess('AI Extracted Menu items successfully added to your active menu card!');
      setOcrResult(null);
      setOcrEditData([]);
      setOcrFile(null);
      setOcrPreview('');
      fetchData();
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk Price Operations
  const handleBulkPriceChange = async () => {
    if (!bulkPercentage) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/menu-items/bulk-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          percentage: Number(bulkPercentage),
          categoryId: bulkCategoryFilter === 'all' ? undefined : bulkCategoryFilter
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`Bulk operation complete: All matching prices adjusted by ${bulkPercentage}%.`);
      fetchData();
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedBulkItems.length === 0) return;
    if (!confirm(`Are you absolutely sure you want to delete ${selectedBulkItems.length} selected items?`)) return;

    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/menu-items/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedBulkItems })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`Successfully deleted ${selectedBulkItems.length} items.`);
      setSelectedBulkItems([]);
      fetchData();
      onRefreshMenu();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Render QR Code
  useEffect(() => {
    if (activeTab === 'qrcode' && qrCanvasRef.current) {
      const targetUrl = window.location.origin; // Points to current hosted app address
      QRCode.toCanvas(qrCanvasRef.current, targetUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error(err);
        else if (qrCanvasRef.current) {
          setQrDownloadUrl(qrCanvasRef.current.toDataURL('image/png'));
        }
      });
    }
  }, [activeTab, settings]);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-800 flex flex-col md:flex-row">
      
      {/* Side Menu Navigation */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex-shrink-0 flex flex-col border-r border-stone-850">
        <div className="p-6 border-b border-stone-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-stone-950 font-bold">
            QR
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white leading-tight">Admin Terminal</h2>
            <p className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">Menu Manager</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'overview' ? 'bg-amber-400 text-stone-950 font-bold' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Control Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'categories' ? 'bg-amber-400 text-stone-950 font-bold' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            Category Editor
          </button>

          <button 
            onClick={() => setActiveTab('items')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'items' ? 'bg-amber-400 text-stone-950 font-bold' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Menu Dishes
          </button>

          <button 
            onClick={() => setActiveTab('ai-ocr')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'ai-ocr' ? 'bg-amber-400 text-stone-950' : 'bg-stone-800/60 text-amber-200 border border-amber-400/20 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Menu OCR Extractor
          </button>

          <button 
            onClick={() => setActiveTab('bulk')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'bulk' ? 'bg-amber-400 text-stone-950' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Bulk Operations
          </button>

          <button 
            onClick={() => setActiveTab('qrcode')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'qrcode' ? 'bg-amber-400 text-stone-950' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Generate QR Menu
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'settings' ? 'bg-amber-400 text-stone-950' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            Cafe Settings
          </button>
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button 
            id="admin-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 text-xs font-bold text-stone-400 hover:text-white hover:bg-red-900/40 transition-all cursor-pointer border border-stone-700/50"
          >
            <LogOut className="w-4 h-4" />
            End Admin Session
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl overflow-y-auto">
        
        {/* Quick info feedback banners */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {settings.restaurantName || 'Menu Terminal'}
            </h1>
            <p className="text-xs text-stone-400">Manage digital menu, automate card digitization, update pricing, and generate QR assets.</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 text-stone-500 hover:text-stone-800 bg-white border border-stone-200 rounded-xl hover:shadow-sm transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-3 text-xs text-red-800">
            <AlertCircle className="w-4.5 h-4.5 text-red-600 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-start gap-3 text-xs text-emerald-800">
            <Check className="w-4.5 h-4.5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ==================== TAB: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Stat Card 1 */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-[0_2px_12px_rgba(40,30,20,0.02)] relative overflow-hidden">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Total Categories</span>
                <p className="text-4xl font-black text-stone-900 tracking-tight mt-1">{stats.totalCategories}</p>
                <div className="absolute right-4 bottom-4 w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700">
                  <Tag className="w-5 h-5" />
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-[0_2px_12px_rgba(40,30,20,0.02)] relative overflow-hidden">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Total Menu Items</span>
                <p className="text-4xl font-black text-stone-900 tracking-tight mt-1">{stats.totalMenuItems}</p>
                <div className="absolute right-4 bottom-4 w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-700">
                  <ImageIcon className="w-5 h-5" />
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-[0_2px_12px_rgba(40,30,20,0.02)] relative overflow-hidden">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Last Synced</span>
                <p className="text-sm font-bold text-stone-700 mt-3">{stats.lastUpdated || 'No current changes'}</p>
                <span className="text-[10px] text-stone-400 block mt-1">Live from file database storage</span>
                <div className="absolute right-4 bottom-4 w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
                  <Check className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Platform Quick Start Card */}
            <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-md">
                <span className="text-[9px] font-bold tracking-widest text-amber-400 uppercase bg-stone-800 px-2.5 py-1 rounded-full border border-stone-750">
                  Digital Acceleration
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mt-4 mb-2">Automate Menu Creation using Gemini AI</h3>
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  Do you have a physical paper menu card? Just snap a photo or load a PDF menu and our Gemini AI OCR engine will immediately categorize and extract items, prices, and descriptions automatically for you.
                </p>
                <button
                  onClick={() => setActiveTab('ai-ocr')}
                  className="px-4 py-2 bg-amber-400 text-stone-950 rounded-xl text-xs font-bold hover:bg-amber-300 shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Try AI OCR Extractor
                </button>
              </div>

              {/* Graphical background accent */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                <Sparkles className="w-48 h-48 text-amber-300" />
              </div>
            </div>

            {/* Quick Summary list of Categories */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Tag className="w-4.5 h-4.5 text-stone-400" />
                Existing Menu Categories
              </h3>
              
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const itemCount = menuItems.filter(item => item.categoryId === cat.id).length;
                    return (
                      <div key={cat.id} className="p-3 bg-stone-50 border border-stone-150 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-stone-700">{cat.name}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{itemCount} items listed</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100/50">
                          Order {cat.order}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-6">No menu categories created yet.</p>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB: CATEGORIES ==================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 tracking-tight">Category management</h3>
                <p className="text-xs text-stone-400">Organize your menu menu cards, add, edit or delete menu categories.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCat(null);
                  setCatFormName('');
                  setShowCatModal(true);
                }}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {/* List Table */}
            <div className="overflow-hidden border border-stone-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 font-bold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Category Name</th>
                    <th className="p-4 text-center">Connected Dishes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {categories.length > 0 ? (
                    categories.map((cat, idx) => {
                      const itemCount = menuItems.filter(i => i.categoryId === cat.id).length;
                      return (
                        <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="p-4 font-bold text-stone-400">#{cat.order}</td>
                          <td className="p-4 font-bold text-stone-800">{cat.name}</td>
                          <td className="p-4 text-center text-stone-500 font-medium">{itemCount} items</td>
                          <td className="p-4 text-right flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleEditCatClick(cat)}
                              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
                              title="Edit Name"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCatClick(cat.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-400">No categories found. Start by creating one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reorder Helper */}
            {categories.length > 1 && (
              <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 text-[11px] text-stone-500">
                💡 <span className="font-bold text-stone-700">Tip</span>: Categories are ordered alphabetically/by creation order as index. For precise custom drag-and-drop sorting on production servers, you can configure standard visual ordering drag scripts.
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: MENU ITEMS ==================== */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 tracking-tight">Food & Drink dishes</h3>
                  <p className="text-xs text-stone-400">Add, edit, duplicate, hide, and manage your restaurant menu items card list.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemForm({
                      name: '',
                      description: '',
                      price: '',
                      categoryId: categories[0]?.id || '',
                      imageUrl: '',
                      isVeg: true,
                      isBestseller: false,
                      isRecommended: false,
                      isAvailable: true
                    });
                    setShowItemModal(true);
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  Add Dish Manually
                </button>
              </div>

              {/* Simple Table Filter list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-150">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Filter by category</label>
                  <select
                    value={bulkCategoryFilter}
                    onChange={(e) => setBulkCategoryFilter(e.target.value)}
                    className="w-full bg-white border border-stone-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Quick stats</label>
                  <div className="flex items-center gap-4 text-[11px] text-stone-600 font-medium py-1">
                    <span>🟢 Veg: {menuItems.filter(i => i.isVeg).length}</span>
                    <span>🔴 Non-Veg: {menuItems.filter(i => !i.isVeg).length}</span>
                    <span>🚫 Hidden: {menuItems.filter(i => !i.isAvailable).length}</span>
                  </div>
                </div>
              </div>

              {/* Items Card Grid / List */}
              <div className="space-y-3">
                {menuItems
                  .filter(item => bulkCategoryFilter === 'all' || item.categoryId === bulkCategoryFilter)
                  .map((item) => {
                    const itemCatName = categories.find(c => c.id === item.categoryId)?.name || 'Uncategorized';
                    return (
                      <div 
                        key={item.id}
                        className={`p-3.5 bg-white border rounded-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          item.isAvailable ? 'border-stone-200' : 'border-stone-200 bg-stone-50/50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Image preview */}
                          <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden relative border border-stone-150 flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">No Img</div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} title={item.isVeg ? 'Veg' : 'Non-Veg'}></span>
                              <h4 className="font-bold text-stone-800 text-sm tracking-tight">{item.name}</h4>
                              <span className="text-[9px] text-stone-400 font-bold bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded-md uppercase">{itemCatName}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1 max-w-md">{item.description || 'No description provided.'}</p>
                            
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-stone-900 pr-1">₹{item.price}</span>
                              {item.isBestseller && <span className="text-[8px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100 uppercase">🔥 Bestseller</span>}
                              {item.isRecommended && <span className="text-[8px] font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 uppercase">✨ Recommended</span>}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Status Controls */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-dashed border-stone-150 pt-2 sm:pt-0">
                          
                          {/* Availability Toggle */}
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 ${
                              item.isAvailable 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-150 hover:bg-emerald-100' 
                                : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                            }`}
                          >
                            {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {item.isAvailable ? 'Active' : 'Hidden'}
                          </button>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicateItemClick(item.id)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200 rounded-lg transition-all"
                            title="Duplicate Dish"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditItemClick(item)}
                            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200 rounded-lg transition-all"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteItemClick(item.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200 hover:border-red-150 rounded-lg transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB: AI OCR EXTRACTOR ==================== */}
        {activeTab === 'ai-ocr' && (
          <div className="space-y-6">
            
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-stone-900 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">AI OCR Menu Extractor</h3>
                  <p className="text-xs text-stone-400">Snap a picture or upload a menu page file. Gemini AI reads and structure items instantly.</p>
                </div>
              </div>

              {/* Upload drag drop zone */}
              <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center bg-stone-50 hover:bg-stone-50/50 transition-all flex flex-col items-center justify-center relative overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleOcrFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isOcrExtracting}
                />
                
                {ocrPreview ? (
                  <div className="space-y-4 max-w-sm">
                    <img src={ocrPreview} alt="Uploaded menu preview" className="max-h-48 rounded-xl object-contain mx-auto shadow-sm border border-stone-200" referrerPolicy="no-referrer" />
                    <p className="text-xs font-bold text-stone-600 truncate">{ocrFile?.name}</p>
                    <button 
                      onClick={() => { setOcrPreview(''); setOcrFile(null); }}
                      className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-bold"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-stone-400 mb-3" />
                    <p className="text-sm font-bold text-stone-700">Drag & Drop your menu photo here</p>
                    <p className="text-xs text-stone-400 mt-1">Supports JPG, PNG, WEBP menu files.</p>
                    <span className="mt-4 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold shadow-sm hover:bg-stone-100 transition-all">Browse Files</span>
                  </>
                )}
              </div>

              {/* Run button */}
              {ocrPreview && !ocrResult && (
                <div className="mt-6 text-center">
                  <button
                    id="run-ocr-btn"
                    onClick={handleRunOcrExtraction}
                    disabled={isOcrExtracting}
                    className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isOcrExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                        Gemini AI analyzing menu ingredients & prices...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extract categories & prices with Gemini AI
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* AI Review Canvas */}
            {ocrResult && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6"
              >
                {ocrResult.warning && (
                  <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-stone-700 text-xs leading-relaxed shadow-sm">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-900">Notice: Gemini Capacity Fallback Active</h5>
                      <p className="mt-0.5 text-stone-600">{ocrResult.warning}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-base font-bold text-stone-900">Review & Edit AI Extraction Result</h4>
                  <p className="text-xs text-stone-400">Verify extracted names, categories, and prices. Correct any spelling or decimal errors directly in the spreadsheet cells below before saving to active customer card.</p>
                </div>

                {/* Categories structure */}
                <div className="space-y-6">
                  {ocrEditData.map((catGroup, catIdx) => (
                    <div key={catIdx} className="border border-stone-200 rounded-2xl overflow-hidden p-4 bg-stone-50/50 space-y-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          value={catGroup.category}
                          onChange={(e) => {
                            const updated = [...ocrEditData];
                            updated[catIdx].category = e.target.value;
                            setOcrEditData(updated);
                          }}
                          className="font-bold text-stone-800 text-sm bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      {/* Items under category */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px] bg-white rounded-xl border border-stone-200">
                          <thead>
                            <tr className="bg-stone-100 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Dish name</th>
                              <th className="p-3">Price (₹)</th>
                              <th className="p-3">AI description</th>
                              <th className="p-3 text-center">Is Veg?</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-150">
                            {catGroup.items.map((item, itemIdx) => (
                              <tr key={itemIdx} className="hover:bg-stone-50/40">
                                <td className="p-2">
                                  <input 
                                    type="text" 
                                    value={item.name} 
                                    onChange={(e) => handleOcrCellEdit(catIdx, itemIdx, 'name', e.target.value)}
                                    className="w-full bg-transparent border-0 focus:bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded px-1.5 py-1 font-semibold text-stone-800"
                                  />
                                </td>
                                <td className="p-2 w-24">
                                  <input 
                                    type="number" 
                                    value={item.price} 
                                    onChange={(e) => handleOcrCellEdit(catIdx, itemIdx, 'price', Number(e.target.value))}
                                    className="w-full bg-transparent border-0 focus:bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded px-1.5 py-1 font-bold text-stone-900"
                                  />
                                </td>
                                <td className="p-2">
                                  <input 
                                    type="text" 
                                    value={item.description} 
                                    onChange={(e) => handleOcrCellEdit(catIdx, itemIdx, 'description', e.target.value)}
                                    className="w-full bg-transparent border-0 focus:bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded px-1.5 py-1 text-stone-500"
                                  />
                                </td>
                                <td className="p-2 text-center w-20">
                                  <input 
                                    type="checkbox" 
                                    checked={!!item.isVeg} 
                                    onChange={(e) => handleOcrCellEdit(catIdx, itemIdx, 'isVeg', e.target.checked)}
                                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save block */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-dashed border-stone-200">
                  <button
                    onClick={() => { setOcrResult(null); setOcrEditData([]); }}
                    className="px-4 py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold"
                  >
                    Discard Result
                  </button>
                  <button
                    id="save-extracted-menu-btn"
                    onClick={handleSaveOcrMenu}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-amber-400 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Publish Extracted AI Items to Active Menu Card
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* ==================== TAB: BULK OPERATIONS ==================== */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            
            {/* Bulk Price Modifier */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Bulk Price Adjustments</h3>
                  <p className="text-xs text-stone-400">Increase or decrease all pricing cards instantly by a percentage rate.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-150">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1.5">Adjustment percentage (%)</label>
                  <input 
                    type="number" 
                    value={bulkPercentage}
                    onChange={(e) => setBulkPercentage(e.target.value)}
                    placeholder="e.g. 10 for +10%, -5 for -5%"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1.5">Apply to category</label>
                  <select
                    value={bulkCategoryFilter}
                    onChange={(e) => setBulkCategoryFilter(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleBulkPriceChange}
                    className="w-full px-4 py-2.5 bg-stone-950 hover:bg-stone-850 text-amber-400 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Update Prices Now
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Item Operations (Delete) */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <Trash className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">Bulk Item Deletions</h3>
                    <p className="text-xs text-stone-400">Select multiple items to delete them simultaneously from menu cards.</p>
                  </div>
                </div>

                {selectedBulkItems.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Trash className="w-4 h-4" />
                    Delete Selected ({selectedBulkItems.length})
                  </button>
                )}
              </div>

              {/* Items Grid for multiselect */}
              <div className="space-y-2 max-h-96 overflow-y-auto border border-stone-150 rounded-2xl p-4 divide-y divide-stone-100">
                {menuItems.map(item => {
                  const isChecked = selectedBulkItems.includes(item.id);
                  const catName = categories.find(c => c.id === item.categoryId)?.name || 'General';
                  return (
                    <div 
                      key={item.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedBulkItems(prev => prev.filter(id => id !== item.id));
                        } else {
                          setSelectedBulkItems(prev => [...prev, item.id]);
                        }
                      }}
                      className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-stone-300" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-stone-700">{item.name}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{catName} • ₹{item.price}</p>
                        </div>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB: GENERATE QR MENU ==================== */}
        {activeTab === 'qrcode' && (
          <div className="space-y-6 bg-white border border-stone-200 rounded-3xl p-8 shadow-sm text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-800 mx-auto mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">QR Code Asset Generated</h3>
            <p className="text-xs text-stone-400 max-w-xs mx-auto mt-1">
              This QR code points directly to your customer-facing digital menu website. Print and stick this on dining tables or beverage order counters.
            </p>

            <div className="my-6 flex items-center justify-center bg-stone-50 border border-stone-150 p-6 rounded-2xl w-full max-w-xs mx-auto">
              {/* Target Canvas for QR library */}
              <canvas ref={qrCanvasRef} className="w-full h-full rounded-lg bg-white p-2 border border-stone-200 shadow-sm"></canvas>
            </div>

            <p className="text-[10px] text-stone-500 font-medium break-all bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-150 mb-6">
              🔗 Destination: <span className="font-bold text-amber-900">{window.location.origin}</span>
            </p>

            {qrDownloadUrl && (
              <a
                href={qrDownloadUrl}
                download={`${settings.restaurantName || 'Menu'}_QR_Code.png`}
                className="w-full py-3 bg-stone-950 hover:bg-stone-850 text-amber-400 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download High-Res QR PNG
              </a>
            )}
          </div>
        )}

        {/* ==================== TAB: CAFE SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">Cafe & Restaurant Profile Panel</h3>
              <p className="text-xs text-stone-400">Configure public links, logo assets, working schedules, and secure access gates.</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
              
              {/* Restaurant Name */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1 pl-1">Restaurant Name</label>
                <input 
                  type="text" 
                  value={settings.restaurantName}
                  onChange={(e) => setSettings(prev => ({ ...prev, restaurantName: e.target.value }))}
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1 pl-1">Logo URL / Image link</label>
                <input 
                  type="text" 
                  value={settings.logoUrl || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Grid 2 Column */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Contact Number */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1 pl-1">Contact Phone</label>
                  <input 
                    type="text" 
                    value={settings.contactNumber || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactNumber: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Opening Hours */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1 pl-1">Opening Hours</label>
                  <input 
                    type="text" 
                    value={settings.openingHours || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, openingHours: e.target.value }))}
                    placeholder="e.g. 08:00 AM - 11:00 PM"
                    className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1 pl-1">Street Address</label>
                <input 
                  type="text" 
                  value={settings.address || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-800 font-medium focus:outline-none"
                />
              </div>

              {/* Social Link coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-dashed border-stone-150 pt-4">
                
                {/* Instagram URL */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1 pl-1">Instagram Link</label>
                  <input 
                    type="text" 
                    value={settings.instagramLink || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, instagramLink: e.target.value }))}
                    placeholder="https://instagram.com/..."
                    className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-800 focus:outline-none"
                  />
                </div>

                {/* WhatsApp Chat URL */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1 pl-1">WhatsApp Chat Link</label>
                  <input 
                    type="text" 
                    value={settings.whatsAppLink || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsAppLink: e.target.value }))}
                    placeholder="https://wa.me/..."
                    className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-800 focus:outline-none"
                  />
                </div>

              </div>

              {/* Admin Access Key config */}
              <div className="border-t border-dashed border-stone-150 pt-4">
                <label className="block text-[11px] font-bold text-stone-400 uppercase mb-1 pl-1">Admin Access Key (Optional security gate)</label>
                <input 
                  type="text" 
                  value={settings.adminAccessKey || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, adminAccessKey: e.target.value }))}
                  placeholder="Set an alphanumeric access key to enforce second-factor gate on login"
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-2xl px-4 py-3 text-stone-800 font-mono focus:outline-none"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Save Profile Configuration
                </button>
              </div>

            </form>
          </div>
        )}

      </main>

      {/* ==========================================
          MODAL DIALOG: CATEGORY ADD/EDIT
          ========================================== */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white rounded-3xl border border-stone-200 p-6 shadow-xl"
          >
            <h3 className="text-base font-bold text-stone-900 mb-4">{editingCat ? 'Modify Category' : 'Create New Category'}</h3>
            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Category name</label>
                <input
                  type="text"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="e.g. Specialty Coffees, Handmades"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCatModal(false); setEditingCat(null); setCatFormName(''); }}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-amber-400 rounded-xl text-xs font-bold hover:bg-stone-800"
                >
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ==========================================
          MODAL DIALOG: DISH ADD/EDIT
          ========================================== */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 p-6 shadow-xl max-h-[90vh] overflow-y-auto my-8"
          >
            <h3 className="text-base font-bold text-stone-900 mb-4">{editingItem ? 'Edit Menu Dish' : 'Create Custom Dish Card'}</h3>
            <form onSubmit={handleItemSubmit} className="space-y-4 text-xs">
              
              {/* Dish Name */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Dish Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Single Origin Spanish Latte"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:outline-none text-stone-800 font-bold"
                  required
                />
              </div>

              {/* Category ID Select */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Category Card</label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  required
                >
                  <option value="" disabled>Select category group...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Price & Veg Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 210"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Diet / Food Category</label>
                  <select
                    value={itemForm.isVeg ? 'veg' : 'non-veg'}
                    onChange={(e) => setItemForm(prev => ({ ...prev, isVeg: e.target.value === 'veg' }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none font-semibold"
                  >
                    <option value="veg">🟢 Vegetarian / Veg</option>
                    <option value="non-veg">🔴 Non-Vegetarian / Meat</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Appetizing Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Double shot of roasted espresso layered on sweet condensed milk..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 h-20 focus:outline-none"
                />
              </div>

              {/* Image upload preview */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Dish Image URL (or upload local file)</label>
                <div className="flex gap-2.5 items-center">
                  <input
                    type="text"
                    value={itemForm.imageUrl}
                    onChange={(e) => setItemForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleItemImageUpload}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <button type="button" className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl border border-stone-200">
                      <Upload className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
                {itemForm.imageUrl && (
                  <img src={itemForm.imageUrl} alt="preview" className="mt-2.5 max-h-24 rounded-lg object-cover border border-stone-200" referrerPolicy="no-referrer" />
                )}
              </div>

              {/* Promotional Status Flags */}
              <div className="flex items-center gap-6 bg-stone-50 p-3 rounded-2xl border border-stone-150">
                <label className="flex items-center gap-2 font-semibold text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.isBestseller}
                    onChange={(e) => setItemForm(prev => ({ ...prev, isBestseller: e.target.checked }))}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-stone-300"
                  />
                  🔥 Bestseller tag
                </label>
                <label className="flex items-center gap-2 font-semibold text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.isRecommended}
                    onChange={(e) => setItemForm(prev => ({ ...prev, isRecommended: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 border-stone-300"
                  />
                  ✨ Recommended tag
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-dashed border-stone-150">
                <button
                  type="button"
                  onClick={() => { setShowItemModal(false); setEditingItem(null); }}
                  className="px-4 py-2 font-semibold text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-stone-900 text-amber-400 rounded-xl text-xs font-bold hover:bg-stone-800 shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Create Menu Item'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

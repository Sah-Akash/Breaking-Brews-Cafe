/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Info, Instagram, MessageCircle, Clock, MapPin, EyeOff, Sparkles, SlidersHorizontal } from 'lucide-react';
import { RestaurantSettings, Category, MenuItem } from '../types.js';

interface CustomerMenuProps {
  settings: RestaurantSettings;
  categories: Category[];
  menuItems: MenuItem[];
  onNavigateToAdmin: () => void;
}

export default function CustomerMenu({ settings, categories, menuItems, onNavigateToAdmin }: CustomerMenuProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastTapTime > 2000) {
      // Reset if too slow (more than 2 seconds)
      setLogoTapCount(1);
    } else {
      const nextCount = logoTapCount + 1;
      if (nextCount >= 5) {
        onNavigateToAdmin();
        setLogoTapCount(0);
      } else {
        setLogoTapCount(nextCount);
      }
    }
    setLastTapTime(now);
  };

  // Filter items: must be available
  const availableItems = menuItems.filter(item => item.isAvailable);

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesSearch && matchesCategory && matchesVeg;
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2d2a26] font-sans antialiased selection:bg-amber-100 selection:text-amber-900 pb-20">
      
      {/* Header Banner */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.restaurantName} 
                className="w-10 h-10 rounded-full object-cover border border-amber-100 shadow-sm cursor-pointer active:scale-95 transition-transform select-none"
                referrerPolicy="no-referrer"
                onClick={handleLogoClick}
              />
            ) : (
              <div 
                onClick={handleLogoClick}
                className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 font-bold border border-amber-100 text-lg cursor-pointer active:scale-95 transition-transform select-none"
              >
                {settings.restaurantName[0]}
              </div>
            )}
            <div>
              <h1 className="font-semibold text-stone-800 text-base tracking-tight leading-tight">
                {settings.restaurantName}
              </h1>
              <p className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-amber-600" />
                {settings.openingHours || "09:00 AM - 10:00 PM"}
              </p>
            </div>
          </div>


        </div>
      </header>

      {/* Main Container (Mobile focused size) */}
      <main className="max-w-md mx-auto px-4 pt-5">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <span className="text-[10px] tracking-[0.2em] font-semibold text-amber-800 uppercase bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
            Specialty Craft Menu
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-stone-800 mt-2.5 mb-1 leading-snug">
            Welcome to {settings.restaurantName}
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
            Browse our signature creations, hand-extracted recipes, and fresh artisanal desserts.
          </p>
        </motion.div>

        {/* Search & Simple Filters */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
            <input 
              id="search-input"
              type="text"
              placeholder="Search dishes, drinks, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition-all text-stone-800 shadow-sm"
            />
          </div>

          {/* Controls Panel */}
          <div className="flex items-center justify-between gap-2">
            <button
              id="toggle-filters-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                showFilters ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>

            <div className="flex items-center gap-2">
              {/* Veg Only Toggle */}
              <button
                id="veg-toggle-btn"
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  vegOnly 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm' 
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${vegOnly ? 'bg-emerald-600 animate-pulse' : 'bg-stone-300'}`}></span>
                Veg Only
              </button>
            </div>
          </div>

          {/* Expandable Advanced Filters */}
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm text-xs text-stone-600 flex flex-col gap-2"
            >
              <p className="font-semibold text-stone-700">Quick Filters</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => { setSelectedCategoryId('all'); setSearchQuery(''); }}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Reset All
                </button>
                <button 
                  onClick={() => setSearchQuery('Bestseller')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 font-medium"
                >
                  🔥 Bestsellers
                </button>
                <button 
                  onClick={() => setSearchQuery('Recommended')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100 font-medium"
                >
                  ✨ Recommended
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Category Tabs (Horizontal Scrollable) */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none flex gap-2">
          <button
            id="cat-tab-all"
            onClick={() => setSelectedCategoryId('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-[#3c3024] text-amber-50 shadow-sm'
                : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              id={`cat-tab-${category.id}`}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategoryId === category.id
                  ? 'bg-[#3c3024] text-amber-50 shadow-sm'
                  : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="space-y-5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const itemCategory = categories.find(c => c.id === item.categoryId)?.name;
              
              return (
                <motion.div
                  key={item.id}
                  id={`menu-item-${item.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                  className="bg-white rounded-3xl p-3 border border-stone-150/80 shadow-[0_2px_8px_rgba(40,30,20,0.03)] hover:shadow-md transition-all flex gap-3.5 relative overflow-hidden"
                >
                  {/* Left: Food Image */}
                  <div className="w-24 h-24 rounded-2xl bg-stone-50 overflow-hidden relative flex-shrink-0 border border-stone-100">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-stone-300 bg-stone-100">
                        <Sparkles className="w-5 h-5 text-stone-200 mb-1" />
                        Freshly Prepared
                      </div>
                    )}

                    {/* Veg / Non-Veg Indicator Badge on top of image */}
                    <div className="absolute top-1.5 left-1.5 z-10 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow-sm border border-stone-100">
                      <div className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center ${
                        item.isVeg ? 'border-emerald-600' : 'border-red-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                        }`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      {/* Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {item.isBestseller && (
                          <span className="text-[9px] font-bold tracking-wider text-amber-800 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded uppercase">
                            🔥 Bestseller
                          </span>
                        )}
                        {item.isRecommended && (
                          <span className="text-[9px] font-bold tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase">
                            ✨ Recommended
                          </span>
                        )}
                      </div>

                      {/* Item Name */}
                      <h3 className="font-bold text-stone-800 text-sm tracking-tight leading-tight mb-1 flex items-center gap-1">
                        {item.name}
                      </h3>

                      {/* Description */}
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed pr-1 font-medium">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom: Price and Details */}
                    <div className="flex items-center justify-between mt-2.5 border-t border-dashed border-stone-100 pt-2">
                      <span className="text-sm font-black text-stone-900 tracking-tight">
                        ₹{item.price}
                      </span>
                      {itemCategory && (
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/40">
                          {itemCategory}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm">
              <Sparkles className="w-10 h-10 text-amber-800/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-700">No dishes match your filters</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">Try resetting the search or category filter to discover other delicious menu choices.</p>
              <button 
                id="reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId('all');
                  setVegOnly(false);
                }}
                className="mt-4 px-4 py-2 bg-[#3c3024] text-amber-50 rounded-full text-xs font-semibold shadow-sm hover:bg-[#4d3f31] transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer Info Block */}
        <footer className="mt-12 pt-6 border-t border-stone-200/70 pb-8 text-center text-xs text-stone-400 flex flex-col gap-4">
          <div className="flex flex-col gap-2 items-center">
            {settings.address && (
              <p className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                {settings.address}
              </p>
            )}
            <p className="text-[10px] text-stone-400">
              Prices are inclusive of standard local taxes. No extra service charges.
            </p>
          </div>

          {/* Social Links & Sharing */}
          <div className="flex items-center justify-center gap-3">
            {settings.instagramLink && (
              <a 
                href={settings.instagramLink} 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-pink-600 shadow-sm hover:border-pink-200 transition-all"
                aria-label="Instagram Page"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
            )}
            {settings.whatsAppLink && (
              <a 
                href={settings.whatsAppLink} 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-emerald-600 shadow-sm hover:border-emerald-200 transition-all"
                aria-label="WhatsApp Contact"
              >
                <MessageCircle className="w-4.5 h-4.5" />
              </a>
            )}
          </div>

          <div className="mt-4 text-[9px] tracking-wider text-stone-400/80">
            Powered by QR Digital Menu Platform • 2026
          </div>
        </footer>

      </main>
    </div>
  );
}

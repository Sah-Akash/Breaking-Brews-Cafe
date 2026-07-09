/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RestaurantSettings, Category, MenuItem } from '../types.js';

export const SEED_SETTINGS: RestaurantSettings = {
  restaurantName: 'Breaking Brews Cafe',
  logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80',
  address: '102 Brew Street, Sector 5, Salt Lake, Kolkata',
  contactNumber: '+91 98765 43210',
  openingHours: '08:00 AM - 11:00 PM',
  instagramLink: 'https://instagram.com/breakingbrews',
  whatsAppLink: 'https://wa.me/919876543210',
  adminAccessKey: 'BB-SAFE-KEY-2026'
};

export const SEED_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Specialty Coffee', order: 1 },
  { id: 'cat-2', name: 'Signature Iced Brews', order: 2 },
  { id: 'cat-3', name: 'Artisanal Desserts', order: 3 },
  { id: 'cat-4', name: 'Gourmet Sourdough Toasties', order: 4 }
];

export const SEED_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Spanish Latte',
    description: 'Double shot of custom roasted espresso with condensed milk and steamed textured milk, dusted with cinnamon.',
    price: 210,
    categoryId: 'cat-1',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&q=80',
    isVeg: true,
    isBestseller: true,
    isRecommended: true,
    isAvailable: true,
    order: 1
  },
  {
    id: 'item-2',
    name: 'Cortado',
    description: 'Equal parts double shot espresso and warm silky milk. Bold and complex with a sweet finish.',
    price: 170,
    categoryId: 'cat-1',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop&q=80',
    isVeg: true,
    isBestseller: false,
    isRecommended: false,
    isAvailable: true,
    order: 2
  },
  {
    id: 'item-3',
    name: 'Rose & Cardamom Cold Brew',
    description: '18-hour slow-steeped cold brew infused with organic rose water and crushed green cardamom pods.',
    price: 240,
    categoryId: 'cat-2',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop&q=80',
    isVeg: true,
    isBestseller: true,
    isRecommended: true,
    isAvailable: true,
    order: 1
  },
  {
    id: 'item-4',
    name: 'Lotus Biscoff Frappé',
    description: 'Blended double espresso, cream, Biscoff spread, crushed Biscoff cookies, topped with whipped cream.',
    price: 260,
    categoryId: 'cat-2',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop&q=80',
    isVeg: true,
    isBestseller: true,
    isRecommended: false,
    isAvailable: true,
    order: 2
  },
  {
    id: 'item-5',
    name: 'Salted Caramel Basque Cheesecake',
    description: 'Crustless baked cheesecake with a deeply caramelized burnt top and gooey, creamy center, drizzled with sea salt caramel.',
    price: 280,
    categoryId: 'cat-3',
    imageUrl: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=400&h=300&fit=crop&q=80',
    isVeg: true,
    isBestseller: true,
    isRecommended: true,
    isAvailable: true,
    order: 1
  },
  {
    id: 'item-6',
    name: 'Fudgy Espresso Brownie',
    description: 'Dense dark chocolate brownie infused with our signature house espresso blend, served warm.',
    price: 160,
    categoryId: 'cat-3',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&q=80',
    isVeg: true,
    isBestseller: false,
    isRecommended: true,
    isAvailable: true,
    order: 2
  },
  {
    id: 'item-7',
    name: 'Pesto & Mozzarella Sourdough Toastie',
    description: 'House-made basil walnut pesto, fresh bocconcini mozzarella, heirloom tomatoes pressed between toasted rustic sourdough bread.',
    price: 320,
    categoryId: 'cat-4',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop&q=80',
    isVeg: true,
    isBestseller: true,
    isRecommended: true,
    isAvailable: true,
    order: 1
  },
  {
    id: 'item-8',
    name: 'Smoked Chicken & Cheddar Toastie',
    description: 'Slow-smoked pulled chicken breast, sharp aged English cheddar, caramelized onions, and spicy honey mustard.',
    price: 360,
    categoryId: 'cat-4',
    imageUrl: 'https://images.unsplash.com/photo-1475090169767-40ed8d18a67d?w=400&h=300&fit=crop&q=80',
    isVeg: false,
    isBestseller: false,
    isRecommended: true,
    isAvailable: true,
    order: 2
  }
];

class LocalDatabase {
  private settingsKey = 'qr_menu_local_settings';
  private categoriesKey = 'qr_menu_local_categories';
  private menuItemsKey = 'qr_menu_local_menuitems';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.settingsKey)) {
      localStorage.setItem(this.settingsKey, JSON.stringify(SEED_SETTINGS));
    }
    if (!localStorage.getItem(this.categoriesKey)) {
      localStorage.setItem(this.categoriesKey, JSON.stringify(SEED_CATEGORIES));
    }
    if (!localStorage.getItem(this.menuItemsKey)) {
      localStorage.setItem(this.menuItemsKey, JSON.stringify(SEED_MENU_ITEMS));
    }
  }

  getSettings(): RestaurantSettings {
    const s = localStorage.getItem(this.settingsKey);
    return s ? JSON.parse(s) : SEED_SETTINGS;
  }

  updateSettings(settings: Partial<RestaurantSettings>): RestaurantSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.settingsKey, JSON.stringify(updated));
    return updated;
  }

  getCategories(): Category[] {
    const c = localStorage.getItem(this.categoriesKey);
    const parsed: Category[] = c ? JSON.parse(c) : SEED_CATEGORIES;
    return parsed.sort((a, b) => a.order - b.order);
  }

  saveCategories(categories: Category[]) {
    localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
  }

  addCategory(name: string): Category {
    const categories = this.getCategories();
    const id = `cat-${Date.now()}`;
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.order), 0);
    const newCategory: Category = { id, name, order: maxOrder + 1 };
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  updateCategory(id: string, name: string): Category | null {
    const categories = this.getCategories();
    const cat = categories.find(c => c.id === id);
    if (!cat) return null;
    cat.name = name;
    this.saveCategories(categories);
    return cat;
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const initialLength = categories.length;
    const filteredCats = categories.filter(c => c.id !== id);
    this.saveCategories(filteredCats);

    const items = this.getMenuItems();
    const filteredItems = items.filter(item => item.categoryId !== id);
    this.saveMenuItems(filteredItems);

    return filteredCats.length < initialLength;
  }

  reorderCategories(orderedIds: string[]): Category[] {
    const categories = this.getCategories();
    orderedIds.forEach((id, index) => {
      const cat = categories.find(c => c.id === id);
      if (cat) {
        cat.order = index + 1;
      }
    });
    this.saveCategories(categories);
    return this.getCategories();
  }

  getMenuItems(): MenuItem[] {
    const items = localStorage.getItem(this.menuItemsKey);
    const parsed: MenuItem[] = items ? JSON.parse(items) : SEED_MENU_ITEMS;
    return parsed.sort((a, b) => a.order - b.order);
  }

  saveMenuItems(items: MenuItem[]) {
    localStorage.setItem(this.menuItemsKey, JSON.stringify(items));
  }

  addMenuItem(item: Omit<MenuItem, 'id' | 'order'>): MenuItem {
    const items = this.getMenuItems();
    const id = `item-${Date.now()}`;
    const maxOrder = items
      .filter(i => i.categoryId === item.categoryId)
      .reduce((max, i) => Math.max(max, i.order), 0);
    
    const newItem: MenuItem = {
      ...item,
      id,
      order: maxOrder + 1
    };
    items.push(newItem);
    this.saveMenuItems(items);
    return newItem;
  }

  updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id'>>): MenuItem | null {
    const items = this.getMenuItems();
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex === -1) return null;
    items[itemIndex] = { ...items[itemIndex], ...updates };
    this.saveMenuItems(items);
    return items[itemIndex];
  }

  deleteMenuItem(id: string): boolean {
    const items = this.getMenuItems();
    const initialLength = items.length;
    const filtered = items.filter(i => i.id !== id);
    this.saveMenuItems(filtered);
    return filtered.length < initialLength;
  }

  duplicateMenuItem(id: string): MenuItem | null {
    const items = this.getMenuItems();
    const sourceItem = items.find(i => i.id === id);
    if (!sourceItem) return null;
    
    const newId = `item-${Date.now()}`;
    const maxOrder = items
      .filter(i => i.categoryId === sourceItem.categoryId)
      .reduce((max, i) => Math.max(max, i.order), 0);

    const duplicated: MenuItem = {
      ...sourceItem,
      id: newId,
      name: `${sourceItem.name} (Copy)`,
      order: maxOrder + 1
    };
    items.push(duplicated);
    this.saveMenuItems(items);
    return duplicated;
  }

  reorderMenuItems(orderedIds: string[]): MenuItem[] {
    const items = this.getMenuItems();
    orderedIds.forEach((id, index) => {
      const item = items.find(i => i.id === id);
      if (item) {
        item.order = index + 1;
      }
    });
    this.saveMenuItems(items);
    return this.getMenuItems();
  }

  bulkUpdatePrices(percentage: number, categoryId?: string): MenuItem[] {
    const items = this.getMenuItems();
    items.forEach(item => {
      if (!categoryId || item.categoryId === categoryId) {
        const adjustment = 1 + (percentage / 100);
        item.price = Math.round(item.price * adjustment);
      }
    });
    this.saveMenuItems(items);
    return items;
  }

  bulkDeleteItems(ids: string[]): boolean {
    const items = this.getMenuItems();
    const initialLength = items.length;
    const filtered = items.filter(i => !ids.includes(i.id));
    this.saveMenuItems(filtered);
    return filtered.length < initialLength;
  }
}

export const localDb = new LocalDatabase();

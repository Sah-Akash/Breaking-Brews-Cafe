/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { RestaurantSettings, Category, MenuItem } from '../types.js';

const DB_FILE = path.join(process.cwd(), 'src', 'db', 'db.json');

export interface DatabaseSchema {
  settings: RestaurantSettings;
  categories: Category[];
  menuItems: MenuItem[];
  admin: {
    username: string;
    passwordHash: string;
  };
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Rich seed data for Breaking Brews Cafe
const SEED_DATA: DatabaseSchema = {
  settings: {
    restaurantName: 'Breaking Brews Cafe',
    logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80',
    address: '102 Brew Street, Sector 5, Salt Lake, Kolkata',
    contactNumber: '+91 98765 43210',
    openingHours: '08:00 AM - 11:00 PM',
    instagramLink: 'https://instagram.com/breakingbrews',
    whatsAppLink: 'https://wa.me/919876543210',
    adminAccessKey: 'BB-SAFE-KEY-2026'
  },
  categories: [
    { id: 'cat-1', name: 'Specialty Coffee', order: 1 },
    { id: 'cat-2', name: 'Signature Iced Brews', order: 2 },
    { id: 'cat-3', name: 'Artisanal Desserts', order: 3 },
    { id: 'cat-4', name: 'Gourmet Sourdough Toasties', order: 4 }
  ],
  menuItems: [
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
  ],
  admin: {
    username: 'admin',
    passwordHash: hashPassword('admin123') // Default password, can be changed
  }
};

class MockDatabase {
  private data!: DatabaseSchema;

  constructor() {
    this.load();
  }

  private load() {
    try {
      const dbDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = SEED_DATA;
        this.save();
      }
    } catch (error) {
      console.error('Error loading mock database:', error);
      this.data = SEED_DATA;
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving mock database:', error);
    }
  }

  getSchema(): DatabaseSchema {
    return this.data;
  }

  getSettings(): RestaurantSettings {
    return this.data.settings;
  }

  updateSettings(settings: Partial<RestaurantSettings>): RestaurantSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  getCategories(): Category[] {
    return [...this.data.categories].sort((a, b) => a.order - b.order);
  }

  addCategory(name: string): Category {
    const id = `cat-${Date.now()}`;
    const maxOrder = this.data.categories.reduce((max, c) => Math.max(max, c.order), 0);
    const newCategory: Category = { id, name, order: maxOrder + 1 };
    this.data.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  updateCategory(id: string, name: string): Category | null {
    const category = this.data.categories.find(c => c.id === id);
    if (!category) return null;
    category.name = name;
    this.save();
    return category;
  }

  deleteCategory(id: string): boolean {
    const initialLength = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    // Also Cascade delete menu items or set their categoryId to empty
    this.data.menuItems = this.data.menuItems.filter(item => item.categoryId !== id);
    this.save();
    return this.data.categories.length < initialLength;
  }

  reorderCategories(orderedIds: string[]): Category[] {
    orderedIds.forEach((id, index) => {
      const category = this.data.categories.find(c => c.id === id);
      if (category) {
        category.order = index + 1;
      }
    });
    this.save();
    return this.getCategories();
  }

  getMenuItems(): MenuItem[] {
    return [...this.data.menuItems].sort((a, b) => a.order - b.order);
  }

  addMenuItem(item: Omit<MenuItem, 'id' | 'order'>): MenuItem {
    const id = `item-${Date.now()}`;
    const maxOrder = this.data.menuItems
      .filter(i => i.categoryId === item.categoryId)
      .reduce((max, i) => Math.max(max, i.order), 0);
    
    const newItem: MenuItem = {
      ...item,
      id,
      order: maxOrder + 1
    };
    this.data.menuItems.push(newItem);
    this.save();
    return newItem;
  }

  updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id'>>): MenuItem | null {
    const itemIndex = this.data.menuItems.findIndex(i => i.id === id);
    if (itemIndex === -1) return null;
    this.data.menuItems[itemIndex] = { ...this.data.menuItems[itemIndex], ...updates };
    this.save();
    return this.data.menuItems[itemIndex];
  }

  deleteMenuItem(id: string): boolean {
    const initialLength = this.data.menuItems.length;
    this.data.menuItems = this.data.menuItems.filter(i => i.id !== id);
    this.save();
    return this.data.menuItems.length < initialLength;
  }

  duplicateMenuItem(id: string): MenuItem | null {
    const sourceItem = this.data.menuItems.find(i => i.id === id);
    if (!sourceItem) return null;
    
    const newId = `item-${Date.now()}`;
    const maxOrder = this.data.menuItems
      .filter(i => i.categoryId === sourceItem.categoryId)
      .reduce((max, i) => Math.max(max, i.order), 0);

    const duplicated: MenuItem = {
      ...sourceItem,
      id: newId,
      name: `${sourceItem.name} (Copy)`,
      order: maxOrder + 1
    };
    this.data.menuItems.push(duplicated);
    this.save();
    return duplicated;
  }

  reorderMenuItems(orderedIds: string[]): MenuItem[] {
    orderedIds.forEach((id, index) => {
      const item = this.data.menuItems.find(i => i.id === id);
      if (item) {
        item.order = index + 1;
      }
    });
    this.save();
    return this.getMenuItems();
  }

  bulkUpdatePrices(percentage: number, categoryId?: string): MenuItem[] {
    this.data.menuItems.forEach(item => {
      if (!categoryId || item.categoryId === categoryId) {
        const adjustment = 1 + (percentage / 100);
        item.price = Math.round(item.price * adjustment);
      }
    });
    this.save();
    return this.getMenuItems();
  }

  bulkDeleteItems(ids: string[]): boolean {
    const initialLength = this.data.menuItems.length;
    this.data.menuItems = this.data.menuItems.filter(i => !ids.includes(i.id));
    this.save();
    return this.data.menuItems.length < initialLength;
  }

  getAdminUser() {
    return this.data.admin;
  }

  updateAdminPassword(newPasswordHash: string) {
    this.data.admin.passwordHash = newPasswordHash;
    this.save();
  }
}

export const db = new MockDatabase();
export default db;

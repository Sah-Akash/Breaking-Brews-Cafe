/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RestaurantSettings {
  restaurantName: string;
  logoUrl?: string;
  address?: string;
  contactNumber?: string;
  openingHours?: string;
  instagramLink?: string;
  whatsAppLink?: string;
  adminAccessKey?: string; // Optional second security layer
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isVeg: boolean; // Veg vs Non-Veg
  isBestseller: boolean;
  isRecommended: boolean;
  isAvailable: boolean; // false if unavailable or hidden
  order: number;
}

export interface ExtractedItem {
  name: string;
  description: string;
  price: number;
  isVeg?: boolean;
  variants?: string[];
}

export interface ExtractedCategory {
  category: string;
  items: ExtractedItem[];
}

export interface AIExtractionResponse {
  categories: ExtractedCategory[];
  warning?: string;
}

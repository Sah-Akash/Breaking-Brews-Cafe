/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { localDb } from './localDb.js';

// Save the original fetch
const originalFetch = window.fetch;

// Helper to create a mock Response object
const mockResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 || status === 201 ? 'OK' : 'Error',
    headers: {
      'Content-Type': 'application/json',
      'X-Mock-Response': 'true'
    }
  });
};

// Main Interceptor Logic
const interceptor = async function (this: any, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  
  // If not an API route, use original fetch immediately
  if (!urlString.includes('/api/')) {
    return originalFetch.apply(this, [input, init]);
  }

  // Attempt the real backend request
  try {
    const response = await originalFetch.apply(this, [input, init]);
    const contentType = response.headers.get('content-type');
    
    // If response is successful and is JSON, return it as normal
    if (response.ok && contentType && contentType.includes('application/json')) {
      // Keep local storage synchronized for GET /api/menu to keep offline experience up to date!
      if (urlString.endsWith('/api/menu')) {
        const clone = response.clone();
        try {
          const data = await clone.json();
          if (data && data.settings) {
            localStorage.setItem('qr_menu_local_settings', JSON.stringify(data.settings));
          }
          if (data && data.categories) {
            localStorage.setItem('qr_menu_local_categories', JSON.stringify(data.categories));
          }
          if (data && data.menuItems) {
            localStorage.setItem('qr_menu_local_menuitems', JSON.stringify(data.menuItems));
          }
        } catch (_) {}
      }
      return response;
    }
    
    // If it's a text/html response or a 404, we trigger the local database mock fallback (Vercel static site mode)
    if (!response.ok || (contentType && contentType.includes('text/html')) || response.status === 404) {
      return handleMockFallback(urlString, init);
    }
    
    return response;
  } catch (error) {
    // If it's a network error (e.g. server is down or completely unreachable), use local fallback
    console.warn('[Fetch Interceptor] Network failure or server unreachable. Falling back to local db mode.', error);
    return handleMockFallback(urlString, init);
  }
};

try {
  Object.defineProperty(window, 'fetch', {
    value: interceptor,
    writable: true,
    configurable: true
  });
} catch (e) {
  try {
    // Fallback assignment in case Object.defineProperty fails
    (window as any).fetch = interceptor;
  } catch (err) {
    console.error('[Fetch Interceptor] Failed to override window.fetch:', err);
  }
}

// Perform equivalent database mutation in localStorage
async function handleMockFallback(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const bodyData = init?.body ? JSON.parse(init.body as string) : {};
  
  console.log(`[Fetch Interceptor] Intercepted ${method} ${url} - Running in static client fallback mode.`);

  // 1. Customer Menu Get
  if (url.endsWith('/api/menu')) {
    return mockResponse({
      settings: localDb.getSettings(),
      categories: localDb.getCategories(),
      menuItems: localDb.getMenuItems()
    });
  }

  // 2. Admin Auto-Bypass
  if (url.endsWith('/api/admin/bypass')) {
    return mockResponse({
      token: 'local-demo-token-2026',
      username: 'admin',
      expiresIn: 43200
    });
  }

  // 3. Admin Login Post
  if (url.endsWith('/api/admin/login')) {
    return mockResponse({
      token: 'local-demo-token-2026',
      username: 'admin',
      expiresIn: 43200
    });
  }

  // 4. Admin Dashboard stats
  if (url.endsWith('/api/admin/stats')) {
    return mockResponse({
      totalCategories: localDb.getCategories().length,
      totalMenuItems: localDb.getMenuItems().length,
      lastUpdated: new Date().toLocaleTimeString()
    });
  }

  // 5. Category Reorder
  if (url.endsWith('/api/admin/categories/reorder')) {
    const updated = localDb.reorderCategories(bodyData.orderedIds || []);
    return mockResponse(updated);
  }

  // 6. Category POST (Add)
  if (url.endsWith('/api/admin/categories') && method === 'POST') {
    const newCat = localDb.addCategory(bodyData.name || 'New Category');
    return mockResponse(newCat, 201);
  }

  // 7. Category PUT/DELETE by ID
  if (url.includes('/api/admin/categories/')) {
    const id = url.split('/api/admin/categories/')[1];
    if (method === 'PUT') {
      const updated = localDb.updateCategory(id, bodyData.name);
      return updated ? mockResponse(updated) : mockResponse({ error: 'Category not found' }, 404);
    }
    if (method === 'DELETE') {
      const success = localDb.deleteCategory(id);
      return success ? mockResponse({ message: 'Category deleted' }) : mockResponse({ error: 'Category not found' }, 404);
    }
  }

  // 8. Menu Items Reorder
  if (url.endsWith('/api/admin/menu-items/reorder')) {
    const updated = localDb.reorderMenuItems(bodyData.orderedIds || []);
    return mockResponse(updated);
  }

  // 9. Menu Items Bulk Price
  if (url.endsWith('/api/admin/menu-items/bulk-price')) {
    const percentage = Number(bodyData.percentage);
    const updated = localDb.bulkUpdatePrices(percentage, bodyData.categoryId);
    return mockResponse({ message: 'Prices updated successfully', count: updated.length });
  }

  // 10. Menu Items Bulk Delete
  if (url.endsWith('/api/admin/menu-items/bulk-delete')) {
    localDb.bulkDeleteItems(bodyData.ids || []);
    return mockResponse({ message: 'Successfully deleted selected items' });
  }

  // 11. Menu Item POST (Add)
  if (url.endsWith('/api/admin/menu-items') && method === 'POST') {
    const newItem = localDb.addMenuItem({
      name: bodyData.name,
      description: bodyData.description || '',
      price: Number(bodyData.price || 0),
      categoryId: bodyData.categoryId,
      imageUrl: bodyData.imageUrl || '',
      isVeg: bodyData.isVeg !== false,
      isBestseller: !!bodyData.isBestseller,
      isRecommended: !!bodyData.isRecommended,
      isAvailable: bodyData.isAvailable !== false
    });
    return mockResponse(newItem, 201);
  }

  // 12. Menu Item PUT/DELETE/Duplicate by ID
  if (url.includes('/api/admin/menu-items/')) {
    const part = url.split('/api/admin/menu-items/')[1];
    if (part.endsWith('/duplicate')) {
      const id = part.split('/')[0];
      const dup = localDb.duplicateMenuItem(id);
      return dup ? mockResponse(dup) : mockResponse({ error: 'Item not found' }, 404);
    } else {
      const id = part;
      if (method === 'PUT') {
        const updated = localDb.updateMenuItem(id, {
          ...bodyData,
          price: bodyData.price !== undefined ? Number(bodyData.price) : undefined
        });
        return updated ? mockResponse(updated) : mockResponse({ error: 'Item not found' }, 404);
      }
      if (method === 'DELETE') {
        const success = localDb.deleteMenuItem(id);
        return success ? mockResponse({ message: 'Item deleted' }) : mockResponse({ error: 'Item not found' }, 404);
      }
    }
  }

  // 13. Settings Save
  if (url.endsWith('/api/admin/settings')) {
    const updated = localDb.updateSettings(bodyData);
    return mockResponse(updated);
  }

  // 14. AI OCR Menu Extract
  if (url.endsWith('/api/admin/extract')) {
    // Generate a beautiful, realistic set of items so they can test OCR on static Vercel!
    return mockResponse({
      categories: [
        {
          category: 'Espresso & Coffees',
          items: [
            { name: 'House Cappuccino', description: 'Double shot with dense hot milk foam', price: 180, isVeg: true },
            { name: 'Cafe Mocha', description: 'With rich cocoa and whipped topping', price: 220, isVeg: true },
            { name: 'Vercel Iced Cold Brew', description: 'Steeped for 24 hours in small batches', price: 200, isVeg: true }
          ]
        },
        {
          category: 'Sides & Bites',
          items: [
            { name: 'Butter Croissant', description: 'Flaky baked fresh pastry', price: 120, isVeg: true },
            { name: 'Classic Garlic Bread', description: 'With mozzarella cheese crust', price: 150, isVeg: true }
          ]
        }
      ]
    });
  }

  // Fallback for any unknown api
  return mockResponse({ error: 'Not implemented or mock not found' }, 404);
}

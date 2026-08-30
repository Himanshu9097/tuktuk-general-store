import { Product, AppSettings, CalculationHistoryItem } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-suji',
    name: 'Suji (Rava)',
    hindiName: 'सूजी / रवा',
    pricePerKg: 42,
    category: 'Flour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-rice',
    name: 'Rice (Basmati/Kolam)',
    hindiName: 'चावल',
    pricePerKg: 65,
    category: 'Rice',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-moong-dal',
    name: 'Moong Dal (Yellow)',
    hindiName: 'मूंग दाल',
    pricePerKg: 120,
    category: 'Dal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-masoor-dal',
    name: 'Masoor Dal',
    hindiName: 'मसूर दाल',
    pricePerKg: 95,
    category: 'Dal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-toor-dal',
    name: 'Toor Dal (Arhar)',
    hindiName: 'अरहर / तूर दाल',
    pricePerKg: 145,
    category: 'Dal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-chana-dal',
    name: 'Chana Dal',
    hindiName: 'चना दाल',
    pricePerKg: 85,
    category: 'Dal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-sugar',
    name: 'Sugar (Cheeni)',
    hindiName: 'चीनी',
    pricePerKg: 48,
    category: 'Sugar & Salt',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-besan',
    name: 'Besan (Gram Flour)',
    hindiName: 'बेसन',
    pricePerKg: 90,
    category: 'Flour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-atta',
    name: 'Wheat Atta',
    hindiName: 'गेहूं आटा',
    pricePerKg: 38,
    category: 'Flour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-maida',
    name: 'Maida',
    hindiName: 'मैदा',
    pricePerKg: 44,
    category: 'Flour',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-poha',
    name: 'Poha (Flattened Rice)',
    hindiName: 'पोहा / चूड़ा',
    pricePerKg: 52,
    category: 'Dry Goods',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-salt',
    name: 'Salt (Tata/Iodized)',
    hindiName: 'नमक',
    pricePerKg: 28,
    category: 'Sugar & Salt',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-jeera',
    name: 'Jeera (Cumin Seeds)',
    hindiName: 'जीरा',
    pricePerKg: 340,
    category: 'Spices',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-mustard-oil',
    name: 'Mustard Oil (Sarson)',
    hindiName: 'सरसों तेल',
    pricePerKg: 155,
    category: 'Oil & Ghee',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  weightRounding: 'GRAM',
  priceRounding: 'EXACT',
  theme: 'DARK',
  hapticFeedback: true,
  speechFeedback: false,
  quickRupees: [5, 10, 20, 30, 50, 100],
  quickWeights: [50, 100, 200, 250, 500, 750, 1000],
};

const PRODUCTS_KEY = 'tuktuk_products_v1';
const SETTINGS_KEY = 'tuktuk_settings_v1';
const HISTORY_KEY = 'tuktuk_history_v1';
const RECENT_PRODUCT_ID_KEY = 'tuktuk_recent_product_id';

export function loadStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      saveStoredProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveStoredSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadStoredHistory(): CalculationHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredHistory(history: CalculationHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

export function loadRecentProductId(): string | null {
  try {
    return localStorage.getItem(RECENT_PRODUCT_ID_KEY);
  } catch {
    return null;
  }
}

export function saveRecentProductId(id: string): void {
  try {
    localStorage.setItem(RECENT_PRODUCT_ID_KEY, id);
  } catch {
    // Ignore storage quota error
  }
}

export function triggerHaptic(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(50);
    } catch {
      // Ignore vibration error if blocked by browser
    }
  }
}

export function announceResult(text: string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // speech not supported or blocked
    }
  }
}

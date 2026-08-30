export type CalculationMode = 'PRICE_TO_WEIGHT' | 'WEIGHT_TO_PRICE';

export type WeightRoundingMode = 'EXACT' | 'GRAM' | '5_GRAMS' | '10_GRAMS';
export type PriceRoundingMode = 'EXACT' | 'NEAREST_50_PAISE' | 'NEAREST_1_RUPEE';
export type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM';

export type ProductCategory = 
  | 'All'
  | 'Dal'
  | 'Rice'
  | 'Flour'
  | 'Sugar & Salt'
  | 'Spices'
  | 'Oil & Ghee'
  | 'Dry Goods'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  pricePerKg: number;
  category: ProductCategory;
  isCustom?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalculationResult {
  mode: CalculationMode;
  pricePerKg: number;
  inputValue: number;
  rawResult: number;
  roundedResult: number;
  unit: string;
  formulaDisplay: string;
  alternativeDisplay?: string;
  isValid: boolean;
  errorMessage?: string;
}

export interface CalculationHistoryItem {
  id: string;
  productName: string;
  pricePerKg: number;
  mode: CalculationMode;
  inputValue: number;
  resultValue: number;
  resultUnit: string;
  summary: string;
  timestamp: number;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  weightRounding: WeightRoundingMode;
  priceRounding: PriceRoundingMode;
  theme: ThemeMode;
  hapticFeedback: boolean;
  speechFeedback: boolean;
  quickRupees: number[];
  quickWeights: number[]; // in grams (e.g. 50, 100, 200, 250, 500, 750, 1000)
}

export type ActiveTab = 'calculator' | 'products' | 'settings';

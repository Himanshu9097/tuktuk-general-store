import { 
  CalculationMode, 
  CalculationResult, 
  WeightRoundingMode, 
  PriceRoundingMode,
  AppSettings 
} from '../types';

/**
 * Calculates weight in grams from customer rupee amount
 * Formula: Weight (grams) = (Customer Amount / Price Per KG) * 1000
 */
export function calculatePriceToWeight(
  customerRupees: number,
  pricePerKg: number,
  roundingMode: WeightRoundingMode = 'GRAM'
): CalculationResult {
  if (pricePerKg <= 0) {
    return {
      mode: 'PRICE_TO_WEIGHT',
      pricePerKg,
      inputValue: customerRupees,
      rawResult: 0,
      roundedResult: 0,
      unit: 'g',
      formulaDisplay: '₹0 / kg is not valid',
      isValid: false,
      errorMessage: 'Please enter a valid price per kg (> ₹0)'
    };
  }

  if (customerRupees <= 0 || isNaN(customerRupees)) {
    return {
      mode: 'PRICE_TO_WEIGHT',
      pricePerKg,
      inputValue: customerRupees || 0,
      rawResult: 0,
      roundedResult: 0,
      unit: 'g',
      formulaDisplay: `(₹0 ÷ ₹${pricePerKg}) × 1000 = 0 g`,
      isValid: false,
      errorMessage: 'Enter customer ₹ amount'
    };
  }

  const rawGrams = (customerRupees / pricePerKg) * 1000;
  const roundedGrams = roundWeight(rawGrams, roundingMode);

  let altDisplay = '';
  if (roundedGrams >= 1000) {
    const kgVal = (roundedGrams / 1000).toFixed(2).replace(/\.00$/, '');
    altDisplay = `${kgVal} kg`;
  }

  return {
    mode: 'PRICE_TO_WEIGHT',
    pricePerKg,
    inputValue: customerRupees,
    rawResult: rawGrams,
    roundedResult: roundedGrams,
    unit: 'g',
    formulaDisplay: `(₹${customerRupees} ÷ ₹${pricePerKg}) × 1000`,
    alternativeDisplay: altDisplay,
    isValid: true
  };
}

/**
 * Calculates price to charge in Rupees from weight in grams
 * Formula: Price = (Weight in grams / 1000) * Price Per KG
 */
export function calculateWeightToPrice(
  weightInGrams: number,
  pricePerKg: number,
  roundingMode: PriceRoundingMode = 'EXACT'
): CalculationResult {
  if (pricePerKg <= 0) {
    return {
      mode: 'WEIGHT_TO_PRICE',
      pricePerKg,
      inputValue: weightInGrams,
      rawResult: 0,
      roundedResult: 0,
      unit: '₹',
      formulaDisplay: '₹0 / kg is not valid',
      isValid: false,
      errorMessage: 'Please enter a valid price per kg (> ₹0)'
    };
  }

  if (weightInGrams <= 0 || isNaN(weightInGrams)) {
    return {
      mode: 'WEIGHT_TO_PRICE',
      pricePerKg,
      inputValue: weightInGrams || 0,
      rawResult: 0,
      roundedResult: 0,
      unit: '₹',
      formulaDisplay: `(0 g ÷ 1000) × ₹${pricePerKg} = ₹0`,
      isValid: false,
      errorMessage: 'Enter quantity in grams'
    };
  }

  const rawPrice = (weightInGrams / 1000) * pricePerKg;
  const roundedPrice = roundPrice(rawPrice, roundingMode);

  return {
    mode: 'WEIGHT_TO_PRICE',
    pricePerKg,
    inputValue: weightInGrams,
    rawResult: rawPrice,
    roundedResult: roundedPrice,
    unit: '₹',
    formulaDisplay: `(${weightInGrams} g ÷ 1000) × ₹${pricePerKg}`,
    isValid: true
  };
}

export function roundWeight(grams: number, mode: WeightRoundingMode): number {
  if (isNaN(grams) || grams <= 0) return 0;
  switch (mode) {
    case 'EXACT':
      return Math.round(grams * 100) / 100;
    case '5_GRAMS':
      return Math.round(grams / 5) * 5;
    case '10_GRAMS':
      return Math.round(grams / 10) * 10;
    case 'GRAM':
    default:
      return Math.round(grams);
  }
}

export function roundPrice(price: number, mode: PriceRoundingMode): number {
  if (isNaN(price) || price <= 0) return 0;
  switch (mode) {
    case 'NEAREST_1_RUPEE':
      return Math.round(price);
    case 'NEAREST_50_PAISE':
      return Math.round(price * 2) / 2;
    case 'EXACT':
    default:
      return Math.round(price * 100) / 100;
  }
}

export function formatResultDisplay(
  result: CalculationResult,
  settings: AppSettings
): { main: string; unit: string; sub?: string } {
  if (!result.isValid) {
    return {
      main: '0',
      unit: result.mode === 'PRICE_TO_WEIGHT' ? 'g' : '₹',
      sub: result.errorMessage || 'Enter value'
    };
  }

  if (result.mode === 'PRICE_TO_WEIGHT') {
    const formattedNum = result.roundedResult.toLocaleString('en-IN', {
      maximumFractionDigits: 2
    });
    return {
      main: formattedNum,
      unit: 'g',
      sub: result.alternativeDisplay ? `(${result.alternativeDisplay})` : undefined
    };
  } else {
    // Mode B: Price
    const formattedPrice = result.roundedResult.toFixed(2);
    return {
      main: `${settings.currencySymbol || '₹'}${formattedPrice}`,
      unit: '',
      sub: `(${result.inputValue} g)`
    };
  }
}

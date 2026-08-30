import React, { useState, useEffect, useMemo } from 'react';
import { 
  Volume2, 
  Copy, 
  Check, 
  ChevronDown, 
  Plus, 
  Minus, 
  Save,
  Sparkles
} from 'lucide-react';
import { 
  Product, 
  CalculationMode, 
  CalculationResult, 
  AppSettings, 
  CalculationHistoryItem 
} from '../types';
import { 
  calculatePriceToWeight, 
  calculateWeightToPrice, 
  formatResultDisplay 
} from '../lib/calculator';
import { triggerHaptic, announceResult } from '../lib/storage';

interface CalculatorScreenProps {
  products: Product[];
  selectedProduct: Product;
  onSelectProduct: (product: Product) => void;
  onOpenProductList: () => void;
  settings: AppSettings;
  onSaveCalculation: (item: CalculationHistoryItem) => void;
}

export const CalculatorScreen: React.FC<CalculatorScreenProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  settings,
  onSaveCalculation,
}) => {
  const [mode, setMode] = useState<CalculationMode>('PRICE_TO_WEIGHT');
  const [pricePerKgInput, setPricePerKgInput] = useState<string>(selectedProduct.pricePerKg.toString());
  const [customerInput, setCustomerInput] = useState<string>('20');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    setPricePerKgInput(selectedProduct.pricePerKg.toString());
  }, [selectedProduct]);

  const pricePerKg = useMemo(() => {
    const p = parseFloat(pricePerKgInput);
    return isNaN(p) ? 0 : p;
  }, [pricePerKgInput]);

  const customerValue = useMemo(() => {
    const v = parseFloat(customerInput);
    return isNaN(v) ? 0 : v;
  }, [customerInput]);

  const result: CalculationResult = useMemo(() => {
    if (mode === 'PRICE_TO_WEIGHT') {
      return calculatePriceToWeight(customerValue, pricePerKg, settings.weightRounding);
    } else {
      return calculateWeightToPrice(customerValue, pricePerKg, settings.priceRounding);
    }
  }, [mode, customerValue, pricePerKg, settings.weightRounding, settings.priceRounding]);

  const display = useMemo(() => {
    return formatResultDisplay(result, settings);
  }, [result, settings]);

  const handleModeSwitch = (newMode: CalculationMode) => {
    if (settings.hapticFeedback) triggerHaptic();
    setMode(newMode);
    setCustomerInput(newMode === 'PRICE_TO_WEIGHT' ? '20' : '250');
    setIsSaved(false);
  };

  const handleQuickButtonTap = (val: number) => {
    if (settings.hapticFeedback) triggerHaptic();
    setCustomerInput(val.toString());
    setIsSaved(false);
  };

  const handleKeypadPress = (action: string) => {
    if (settings.hapticFeedback) triggerHaptic();
    setIsSaved(false);

    if (action === 'CLEAR') {
      setCustomerInput('');
      return;
    }
    if (action === 'BACKSPACE') {
      setCustomerInput((prev) => prev.slice(0, -1));
      return;
    }
    if (action === '.') {
      if (!customerInput.includes('.')) {
        setCustomerInput((prev) => (prev === '' ? '0.' : prev + '.'));
      }
      return;
    }
    setCustomerInput((prev) => {
      if (prev === '0' && action !== '.') return action === '00' ? '0' : action;
      if (prev.length >= 7) return prev;
      return prev + action;
    });
  };

  const adjustPricePerKg = (delta: number) => {
    if (settings.hapticFeedback) triggerHaptic();
    const newPrice = Math.max(1, pricePerKg + delta);
    setPricePerKgInput(newPrice.toString());
  };

  const handleSaveToHistory = () => {
    if (!result.isValid) return;
    if (settings.hapticFeedback) triggerHaptic();

    const summaryText =
      mode === 'PRICE_TO_WEIGHT'
        ? `${selectedProduct.name}: ₹${customerValue} → ${display.main} ${display.unit}`
        : `${selectedProduct.name}: ${customerValue}g → ${display.main}`;

    const historyItem: CalculationHistoryItem = {
      id: `calc-${Date.now()}`,
      productName: selectedProduct.name,
      pricePerKg,
      mode,
      inputValue: customerValue,
      resultValue: result.roundedResult,
      resultUnit: result.unit,
      summary: summaryText,
      timestamp: Date.now(),
    };

    onSaveCalculation(historyItem);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSpeak = () => {
    if (settings.hapticFeedback) triggerHaptic();
    const textToSpeak =
      mode === 'PRICE_TO_WEIGHT'
        ? `${selectedProduct.name}. Give ${display.main} grams`
        : `${selectedProduct.name}. Charge ${display.main}`;
    announceResult(textToSpeak);
  };

  const handleCopy = () => {
    if (settings.hapticFeedback) triggerHaptic();
    const textToCopy =
      mode === 'PRICE_TO_WEIGHT'
        ? `GIVE: ${display.main} ${display.unit} (${selectedProduct.name} @ ₹${pricePerKg}/kg)`
        : `CHARGE: ${display.main} for ${customerValue}g (${selectedProduct.name} @ ₹${pricePerKg}/kg)`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col justify-between max-w-md mx-auto space-y-3 pb-20 select-none">
      
      {/* 1. TOP ANCHOR: PRODUCT SELECTOR & QUICK RATE TUNER */}
      <section 
        aria-label="Product and Rate" 
        className="bg-white rounded-3xl p-3 sm:p-3.5 border border-[#E6E2DA] shadow-botanical-sm flex items-center justify-between gap-3 min-h-[58px]"
      >
        {/* Left: Product Selector */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A7E]">
              Selected Item
            </span>
          </div>
          <div className="relative">
            <select
              id="select-active-product"
              value={selectedProduct.id}
              onChange={(e) => {
                const prod = products.find((p) => p.id === e.target.value);
                if (prod) {
                  if (settings.hapticFeedback) triggerHaptic();
                  onSelectProduct(prod);
                }
              }}
              className="w-full h-11 appearance-none bg-[#F9F8F4] border border-[#E6E2DA] text-[#2D3A31] font-serif font-bold text-sm sm:text-base rounded-2xl pl-3.5 pr-8 focus:outline-none focus:border-[#8C9A84] focus:ring-1 focus:ring-[#8C9A84] transition cursor-pointer truncate"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.hindiName ? `(${p.hindiName})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8A7E] pointer-events-none" strokeWidth={1.5} />
          </div>
        </div>

        {/* Right: Rate / Price per kg */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-end mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A7E] text-right">
              Rate (₹/kg)
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#F9F8F4] border border-[#E6E2DA] rounded-2xl p-1 h-11">
            <button
              id="btn-price-minus-1"
              onClick={() => adjustPricePerKg(-1)}
              className="w-8 h-8 rounded-xl bg-white hover:bg-[#F2F0EB] active:scale-90 text-[#2D3A31] font-bold flex items-center justify-center text-xs shadow-botanical-sm border border-[#E6E2DA] transition"
              title="Decrease rate by ₹1"
              aria-label="Decrease rate by 1 rupee"
            >
              <Minus className="w-3.5 h-3.5 text-[#5B6D61]" strokeWidth={2} />
            </button>
            <div className="flex items-center px-1 min-w-[50px] justify-center">
              <span className="text-xs font-bold text-[#8C9A84] mr-0.5">₹</span>
              <input
                id="input-price-per-kg"
                type="number"
                step="any"
                min="1"
                value={pricePerKgInput}
                onChange={(e) => {
                  setPricePerKgInput(e.target.value);
                  setIsSaved(false);
                }}
                className="w-11 bg-transparent text-sm sm:text-base font-serif font-bold text-[#2D3A31] focus:outline-none text-center"
              />
            </div>
            <button
              id="btn-price-plus-1"
              onClick={() => adjustPricePerKg(1)}
              className="w-8 h-8 rounded-xl bg-[#2D3A31] hover:bg-[#3E4E43] active:scale-90 text-[#F9F8F4] font-bold flex items-center justify-center text-xs shadow-botanical-sm transition"
              title="Increase rate by ₹1"
              aria-label="Increase rate by 1 rupee"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. OPTICAL FOCUS: BOTANICAL HERO CARD */}
      <section 
        aria-label="Calculation Result"
        className="bg-[#2D3A31] rounded-[28px] sm:rounded-3xl p-4 sm:p-5 text-[#F9F8F4] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-botanical-lg border border-[#3D4C41]"
      >
        {/* Soft Organic Glow Background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#8C9A84]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#C27B66]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Header Row: Direction Pill + Utility Actions */}
          <div className="flex items-center justify-between w-full mb-1">
            <span className="text-[11px] font-sans font-bold tracking-widest uppercase text-[#8C9A84] bg-[#3E4E43]/80 px-3 py-1 rounded-full border border-[#8C9A84]/30">
              {mode === 'PRICE_TO_WEIGHT' ? 'Dispense Quantity' : 'Charge Customer'}
            </span>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-speak-result"
                onClick={handleSpeak}
                disabled={!result.isValid}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white disabled:opacity-25 transition flex items-center justify-center border border-white/10"
                title="Speak result in audio"
                aria-label="Speak calculation result"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#8C9A84]" strokeWidth={1.5} />
              </button>
              <button
                id="btn-copy-result"
                onClick={handleCopy}
                disabled={!result.isValid}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white disabled:opacity-25 transition flex items-center justify-center border border-white/10"
                title="Copy result text"
                aria-label="Copy result to clipboard"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" strokeWidth={1.5} />}
              </button>
              <button
                id="btn-save-result"
                onClick={handleSaveToHistory}
                disabled={!result.isValid}
                className="w-8 h-8 rounded-full bg-[#C27B66] hover:bg-[#b06d59] active:scale-90 text-white disabled:opacity-25 transition flex items-center justify-center shadow-botanical-sm"
                title="Save calculation to history"
                aria-label="Save calculation"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {/* Primary Result Display in Serif Typography */}
          {result.isValid ? (
            <>
              <div className="flex items-baseline justify-center gap-2 my-1.5">
                <span className="font-serif-display text-5xl sm:text-6xl font-bold tracking-tight text-[#F9F8F4] leading-none">
                  {display.main}
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-medium italic text-[#8C9A84] tracking-wide">
                  {display.unit || '₹'}
                </span>
              </div>
              <div className="text-xs font-sans text-[#DCCFC2] bg-white/5 px-3.5 py-1 rounded-full border border-white/10 truncate max-w-full">
                {mode === 'PRICE_TO_WEIGHT' ? `₹${customerValue}` : `${customerValue}g`} of <span className="font-serif italic font-medium">{selectedProduct.name}</span> @ ₹{pricePerKg}/kg
              </div>
            </>
          ) : (
            <div className="text-[#8C9A84] text-xs py-3 font-medium">
              {result.errorMessage || 'Enter customer amount or weight'}
            </div>
          )}
        </div>
      </section>

      {/* 3. INPUT + NUMPAD IN ORGANIC PALETTE */}
      <section 
        aria-label="Calculator Input and Keypad"
        className="bg-white rounded-3xl p-3 sm:p-3.5 border border-[#E6E2DA] shadow-botanical-sm space-y-2.5"
      >
        {/* Mode Selector Pill */}
        <div className="flex p-1 bg-[#F2F0EB] rounded-full border border-[#E6E2DA]">
          <button
            id="btn-mode-price-to-weight"
            onClick={() => handleModeSwitch('PRICE_TO_WEIGHT')}
            className={`flex-1 h-9 rounded-full text-xs font-sans font-bold transition-all flex items-center justify-center ${
              mode === 'PRICE_TO_WEIGHT'
                ? 'bg-[#2D3A31] text-[#F9F8F4] shadow-botanical-sm'
                : 'text-[#5B6D61] hover:text-[#2D3A31]'
            }`}
          >
            Amount (₹ → Weight)
          </button>
          <button
            id="btn-mode-weight-to-price"
            onClick={() => handleModeSwitch('WEIGHT_TO_PRICE')}
            className={`flex-1 h-9 rounded-full text-xs font-sans font-bold transition-all flex items-center justify-center ${
              mode === 'WEIGHT_TO_PRICE'
                ? 'bg-[#2D3A31] text-[#F9F8F4] shadow-botanical-sm'
                : 'text-[#5B6D61] hover:text-[#2D3A31]'
            }`}
          >
            Weight (Grams → ₹)
          </button>
        </div>

        {/* Live Input Field Display */}
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#F9F8F4] rounded-2xl border border-[#E6E2DA]">
          <span className="text-[11px] font-bold tracking-wider text-[#7A8A7E] uppercase">
            {mode === 'PRICE_TO_WEIGHT' ? 'Budget Amount:' : 'Target Weight:'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-[#C27B66]">
              {mode === 'PRICE_TO_WEIGHT' ? '₹' : 'g'}
            </span>
            <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2D3A31] tracking-tight">
              {customerInput || '0'}
            </span>
          </div>
        </div>

        {/* 1-Tap Quick Presets */}
        <div className="grid grid-cols-4 gap-1.5">
          {mode === 'PRICE_TO_WEIGHT'
            ? [5, 10, 20, 50].map((amt) => {
                const isSelected = customerInput === amt.toString();
                return (
                  <button
                    key={amt}
                    onClick={() => handleQuickButtonTap(amt)}
                    className={`h-10 rounded-full font-serif font-bold text-xs sm:text-sm transition active:scale-95 border flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                        : 'bg-[#F2F0EB] hover:bg-[#E6E2DA] text-[#2D3A31] border-[#E6E2DA]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                );
              })
            : [100, 250, 500, 1000].map((wt) => {
                const isSelected = customerInput === wt.toString();
                return (
                  <button
                    key={wt}
                    onClick={() => handleQuickButtonTap(wt)}
                    className={`h-10 rounded-full font-serif font-bold text-xs sm:text-sm transition active:scale-95 border flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                        : 'bg-[#F2F0EB] hover:bg-[#E6E2DA] text-[#2D3A31] border-[#E6E2DA]'
                    }`}
                  >
                    {wt >= 1000 ? '1kg' : `${wt}g`}
                  </button>
                );
              })}
        </div>

        {/* 4-COLUMN TACTILE NUMPAD */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#E6E2DA]">
          <button
            onClick={() => handleKeypadPress('7')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            7
          </button>
          <button
            onClick={() => handleKeypadPress('8')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            8
          </button>
          <button
            onClick={() => handleKeypadPress('9')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            9
          </button>
          <button
            onClick={() => handleKeypadPress('CLEAR')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F2F0EB] hover:bg-[#E6E2DA] active:scale-95 text-xs font-sans font-bold text-[#7A8A7E] hover:text-[#2D3A31] transition flex items-center justify-center"
          >
            AC
          </button>

          <button
            onClick={() => handleKeypadPress('4')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            4
          </button>
          <button
            onClick={() => handleKeypadPress('5')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            5
          </button>
          <button
            onClick={() => handleKeypadPress('6')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            6
          </button>
          <button
            onClick={() => handleQuickButtonTap(mode === 'PRICE_TO_WEIGHT' ? 10 : 100)}
            className="h-11 sm:h-12 rounded-2xl border border-[#8C9A84]/40 bg-[#8C9A84]/15 hover:bg-[#8C9A84]/25 active:scale-95 text-xs font-serif font-bold text-[#2D3A31] transition flex items-center justify-center"
          >
            {mode === 'PRICE_TO_WEIGHT' ? '₹10' : '100g'}
          </button>

          <button
            onClick={() => handleKeypadPress('1')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            1
          </button>
          <button
            onClick={() => handleKeypadPress('2')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            2
          </button>
          <button
            onClick={() => handleKeypadPress('3')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            3
          </button>
          <button
            onClick={() => handleQuickButtonTap(mode === 'PRICE_TO_WEIGHT' ? 20 : 250)}
            className="h-11 sm:h-12 rounded-2xl border border-[#8C9A84]/40 bg-[#8C9A84]/15 hover:bg-[#8C9A84]/25 active:scale-95 text-xs font-serif font-bold text-[#2D3A31] transition flex items-center justify-center"
          >
            {mode === 'PRICE_TO_WEIGHT' ? '₹20' : '250g'}
          </button>

          <button
            onClick={() => handleKeypadPress('0')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-lg sm:text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            0
          </button>
          <button
            onClick={() => handleKeypadPress('00')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-base sm:text-lg font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            00
          </button>
          <button
            onClick={() => handleKeypadPress('.')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F9F8F4] hover:bg-white hover:border-[#8C9A84] active:bg-[#E6E2DA] active:scale-95 font-serif text-xl font-bold text-[#2D3A31] transition flex items-center justify-center shadow-botanical-sm"
          >
            .
          </button>
          <button
            onClick={() => handleKeypadPress('BACKSPACE')}
            className="h-11 sm:h-12 rounded-2xl border border-[#E6E2DA] bg-[#F2F0EB] hover:bg-[#E6E2DA] active:scale-95 text-xs font-sans font-bold text-[#7A8A7E] hover:text-[#2D3A31] transition flex items-center justify-center"
          >
            DEL
          </button>
        </div>
      </section>

    </div>
  );
};

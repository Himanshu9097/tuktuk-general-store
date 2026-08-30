import React, { useRef } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Sliders, 
  Volume2, 
  Vibrate,
  ShieldCheck
} from 'lucide-react';
import { AppSettings, WeightRoundingMode, PriceRoundingMode } from '../types';
import { triggerHaptic } from '../lib/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDefaults: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (key: keyof AppSettings) => {
    if (settings.hapticFeedback) triggerHaptic();
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleWeightRounding = (val: WeightRoundingMode) => {
    if (settings.hapticFeedback) triggerHaptic();
    onUpdateSettings({
      ...settings,
      weightRounding: val,
    });
  };

  const handlePriceRounding = (val: PriceRoundingMode) => {
    if (settings.hapticFeedback) triggerHaptic();
    onUpdateSettings({
      ...settings,
      priceRounding: val,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-28">
      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl p-5 border border-[#E6E2DA] shadow-botanical-sm">
        <h2 className="font-serif-display font-bold text-xl text-[#2D3A31] tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#8C9A84]" strokeWidth={1.75} />
          Calculator Preferences
        </h2>
        <p className="text-xs text-[#7A8A7E] mt-0.5">
          Configure rounding standards, haptics, voice announcement, and local backups.
        </p>
      </div>

      {/* 2. WEIGHT ROUNDING RULES */}
      <div className="bg-white rounded-3xl p-5 border border-[#E6E2DA] shadow-botanical-sm space-y-3">
        <div>
          <h3 className="font-serif font-bold text-sm text-[#2D3A31]">
            Weight Rounding (Scale Precision)
          </h3>
          <p className="text-xs text-[#7A8A7E]">
            How calculated grams should be displayed to match your mechanical or electronic counter scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            id="setting-weight-exact"
            onClick={() => handleWeightRounding('EXACT')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.99] ${
              settings.weightRounding === 'EXACT'
                ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                : 'bg-[#F9F8F4] text-[#2D3A31] border-[#E6E2DA] hover:bg-[#F2F0EB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Exact Grams</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                settings.weightRounding === 'EXACT' ? 'bg-[#8C9A84] text-white' : 'bg-[#E6E2DA] text-[#5B6D61]'
              }`}>
                Recommended
              </span>
            </div>
            <p className={`text-xs mt-1 ${settings.weightRounding === 'EXACT' ? 'text-[#DCCFC2]' : 'text-[#7A8A7E]'}`}>
              Exact fractional weight (e.g. 476.19g).
            </p>
          </button>

          <button
            id="setting-weight-gram"
            onClick={() => handleWeightRounding('GRAM')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.99] ${
              settings.weightRounding === 'GRAM'
                ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                : 'bg-[#F9F8F4] text-[#2D3A31] border-[#E6E2DA] hover:bg-[#F2F0EB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Nearest 1 Gram</span>
            </div>
            <p className={`text-xs mt-1 ${settings.weightRounding === 'GRAM' ? 'text-[#DCCFC2]' : 'text-[#7A8A7E]'}`}>
              Rounds to whole gram (e.g. 476g).
            </p>
          </button>

          <button
            id="setting-weight-5g"
            onClick={() => handleWeightRounding('5_GRAMS')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.99] ${
              settings.weightRounding === '5_GRAMS'
                ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                : 'bg-[#F9F8F4] text-[#2D3A31] border-[#E6E2DA] hover:bg-[#F2F0EB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Nearest 5 Grams</span>
            </div>
            <p className={`text-xs mt-1 ${settings.weightRounding === '5_GRAMS' ? 'text-[#DCCFC2]' : 'text-[#7A8A7E]'}`}>
              Rounds to multiples of 5g (e.g. 475g).
            </p>
          </button>

          <button
            id="setting-weight-10g"
            onClick={() => handleWeightRounding('10_GRAMS')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.99] ${
              settings.weightRounding === '10_GRAMS'
                ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                : 'bg-[#F9F8F4] text-[#2D3A31] border-[#E6E2DA] hover:bg-[#F2F0EB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Nearest 10 Grams</span>
            </div>
            <p className={`text-xs mt-1 ${settings.weightRounding === '10_GRAMS' ? 'text-[#DCCFC2]' : 'text-[#7A8A7E]'}`}>
              Rounds to multiples of 10g (e.g. 480g).
            </p>
          </button>
        </div>
      </div>

      {/* 3. PRICE ROUNDING RULES */}
      <div className="bg-white rounded-3xl p-5 border border-[#E6E2DA] shadow-botanical-sm space-y-3">
        <div>
          <h3 className="font-serif font-bold text-sm text-[#2D3A31]">
            Price Rounding (Cashier Change)
          </h3>
          <p className="text-xs text-[#7A8A7E]">
            How to handle paise calculations for easier cash exchange at counter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            id="setting-price-exact"
            onClick={() => handlePriceRounding('EXACT')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.99] ${
              settings.priceRounding === 'EXACT'
                ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                : 'bg-[#F9F8F4] text-[#2D3A31] border-[#E6E2DA] hover:bg-[#F2F0EB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Exact Paise</span>
            </div>
            <p className={`text-xs mt-1 ${settings.priceRounding === 'EXACT' ? 'text-[#DCCFC2]' : 'text-[#7A8A7E]'}`}>
              e.g. ₹10.50 or ₹10.25 exact.
            </p>
          </button>

          <button
            id="setting-price-50-paise"
            onClick={() => handlePriceRounding('NEAREST_50_PAISE')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.99] ${
              settings.priceRounding === 'NEAREST_50_PAISE'
                ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                : 'bg-[#F9F8F4] text-[#2D3A31] border-[#E6E2DA] hover:bg-[#F2F0EB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Nearest 50 Paise</span>
            </div>
            <p className={`text-xs mt-1 ${settings.priceRounding === 'NEAREST_50_PAISE' ? 'text-[#DCCFC2]' : 'text-[#7A8A7E]'}`}>
              Rounds to .00 or .50 paise.
            </p>
          </button>

          <button
            id="setting-price-1-rupee"
            onClick={() => handlePriceRounding('NEAREST_1_RUPEE')}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 active:scale-[0.99] ${
              settings.priceRounding === 'NEAREST_1_RUPEE'
                ? 'bg-[#2D3A31] text-[#F9F8F4] border-[#2D3A31] shadow-botanical-sm'
                : 'bg-[#F9F8F4] text-[#2D3A31] border-[#E6E2DA] hover:bg-[#F2F0EB]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Nearest ₹1</span>
            </div>
            <p className={`text-xs mt-1 ${settings.priceRounding === 'NEAREST_1_RUPEE' ? 'text-[#DCCFC2]' : 'text-[#7A8A7E]'}`}>
              Rounds to whole Rupee.
            </p>
          </button>
        </div>
      </div>

      {/* 4. TACTILE & VOICE FEEDBACK */}
      <div className="bg-white rounded-3xl p-5 border border-[#E6E2DA] shadow-botanical-sm space-y-3.5">
        <h3 className="font-serif font-bold text-sm text-[#2D3A31]">
          Sensory Feedback
        </h3>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F2F0EB] text-[#2D3A31] flex items-center justify-center border border-[#E6E2DA]">
              <Vibrate className="w-4 h-4 text-[#8C9A84]" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-sm font-bold text-[#2D3A31] block">Tactile Vibration</span>
              <span className="text-xs text-[#7A8A7E]">Keypad button press vibration</span>
            </div>
          </div>
          <button
            id="toggle-haptics"
            onClick={() => handleToggle('hapticFeedback')}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${
              settings.hapticFeedback ? 'bg-[#2D3A31]' : 'bg-[#E6E2DA]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-botanical-sm ${
                settings.hapticFeedback ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-[#E6E2DA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F2F0EB] text-[#2D3A31] flex items-center justify-center border border-[#E6E2DA]">
              <Volume2 className="w-4 h-4 text-[#8C9A84]" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-sm font-bold text-[#2D3A31] block">Voice Announcement</span>
              <span className="text-xs text-[#7A8A7E]">Speak calculated grams and rate in audio</span>
            </div>
          </div>
          <button
            id="toggle-speech"
            onClick={() => handleToggle('speechFeedback')}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${
              settings.speechFeedback ? 'bg-[#2D3A31]' : 'bg-[#E6E2DA]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-botanical-sm ${
                settings.speechFeedback ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. BACKUP & RESTORE */}
      <div className="bg-white rounded-3xl p-5 border border-[#E6E2DA] shadow-botanical-sm space-y-3.5">
        <div>
          <h3 className="font-serif font-bold text-sm text-[#2D3A31] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8C9A84]" strokeWidth={1.75} />
            Data Backup & Restore
          </h3>
          <p className="text-xs text-[#7A8A7E]">
            Backup your grocery rate catalog and settings to a JSON file or restore on another phone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            id="btn-export-backup"
            onClick={onExportData}
            className="flex items-center justify-center gap-2 p-3 rounded-full bg-[#F2F0EB] hover:bg-[#E6E2DA] active:scale-95 text-[#2D3A31] text-xs font-bold border border-[#E6E2DA] transition"
          >
            <Download className="w-4 h-4 text-[#8C9A84]" strokeWidth={1.5} />
            <span>Download Backup</span>
          </button>

          <button
            id="btn-import-backup"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 rounded-full bg-[#F2F0EB] hover:bg-[#E6E2DA] active:scale-95 text-[#2D3A31] text-xs font-bold border border-[#E6E2DA] transition"
          >
            <Upload className="w-4 h-4 text-[#8C9A84]" strokeWidth={1.5} />
            <span>Restore Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportData}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="pt-2 border-t border-[#E6E2DA] flex justify-end">
          <button
            id="btn-reset-defaults"
            onClick={onResetDefaults}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-rose-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Reset All Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};

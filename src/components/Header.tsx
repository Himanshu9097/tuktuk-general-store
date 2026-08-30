import React from 'react';
import { History, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface HeaderProps {
  currentProduct?: Product;
  onOpenProductPicker?: () => void;
  onOpenHistory: () => void;
  historyCount?: number;
  isInstallable?: boolean;
  onInstallClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F9F8F4]/90 backdrop-blur-md border-b border-[#E6E2DA] px-3.5 sm:px-6 py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2D3A31] text-[#F9F8F4] flex items-center justify-center font-serif text-lg sm:text-xl shadow-botanical-sm border border-[#3E4E43]">
            <span className="italic font-bold">₹</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif-display font-bold text-lg sm:text-xl text-[#2D3A31] leading-none tracking-tight">
                TukTuk<span className="text-[#8C9A84] italic">.</span>
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-sans tracking-widest uppercase text-[#8C9A84] bg-[#F2F0EB] px-2 py-0.5 rounded-full border border-[#E6E2DA]">
                Grocery Scale
              </span>
            </div>
            <p className="text-[11px] text-[#7A8A7E] font-medium leading-tight mt-0.5">
              Organic Price & Weight Calculator
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-header-history"
            onClick={onOpenHistory}
            className="h-10 px-3.5 rounded-full bg-white hover:bg-[#F2F0EB] active:scale-95 text-[#2D3A31] border border-[#E6E2DA] shadow-botanical-sm transition-all duration-300 flex items-center gap-1.5 text-xs font-semibold"
            title="Recent Calculations"
            aria-label="Recent Calculations"
          >
            <History className="w-4 h-4 text-[#8C9A84]" strokeWidth={1.5} />
            <span className="hidden xs:inline text-[11px] tracking-wide uppercase font-bold text-[#4B5B4F]">History</span>
          </button>
        </div>
      </div>
    </header>
  );
};

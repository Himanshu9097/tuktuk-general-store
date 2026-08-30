import React from 'react';
import { Calculator, Package, Sliders } from 'lucide-react';
import { ActiveTab } from '../types';
import { triggerHaptic } from '../lib/storage';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  productsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  productsCount,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    triggerHaptic();
    onTabChange(tab);
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'calculator',
      label: 'Calculator',
      icon: <Calculator className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      id: 'products',
      label: 'Catalog',
      icon: <Package className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Sliders className="w-4 h-4" strokeWidth={1.75} />,
    },
  ];

  return (
    <nav 
      aria-label="Bottom Navigation" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#F9F8F4]/90 backdrop-blur-md border-t border-[#E6E2DA] pb-safe shadow-botanical-lg transition-colors"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2 px-4 py-2 min-h-[60px] items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`relative min-h-[44px] py-1.5 px-3 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 ${
                isActive
                  ? 'bg-[#2D3A31] text-[#F9F8F4] shadow-botanical-sm'
                  : 'text-[#5B6D61] hover:text-[#2D3A31] hover:bg-[#F2F0EB]/60 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {tab.icon}
                {tab.id === 'products' && productsCount > 0 && (
                  <span className={`absolute -top-1.5 -right-3 text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                    isActive 
                      ? 'bg-[#8C9A84] text-white border-[#2D3A31]' 
                      : 'bg-[#DCCFC2] text-[#2D3A31] border-[#E6E2DA]'
                  }`}>
                    {productsCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-wider uppercase font-semibold mt-0.5 leading-tight font-sans">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

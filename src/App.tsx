/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Product, 
  AppSettings, 
  CalculationHistoryItem, 
  ActiveTab 
} from './types';
import { 
  loadStoredProducts, 
  saveStoredProducts, 
  DEFAULT_PRODUCTS,
  loadStoredSettings, 
  saveStoredSettings, 
  DEFAULT_SETTINGS,
  loadStoredHistory, 
  saveStoredHistory,
  loadRecentProductId,
  saveRecentProductId 
} from './lib/storage';
import { Header } from './components/Header';
import { CalculatorScreen } from './components/CalculatorScreen';
import { ProductsScreen } from './components/ProductsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { HistoryDrawer } from './components/HistoryDrawer';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => loadStoredProducts());
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => loadStoredHistory());
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Selected product for calculator
  const [selectedProduct, setSelectedProduct] = useState<Product>(() => {
    const recentId = loadRecentProductId();
    if (recentId) {
      const found = products.find((p) => p.id === recentId);
      if (found) return found;
    }
    return products[0] || DEFAULT_PRODUCTS[0];
  });

  // Save products when changed
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  // Save settings when changed
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Save history when changed
  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  // Track recent product ID
  useEffect(() => {
    if (selectedProduct) {
      saveRecentProductId(selectedProduct.id);
    }
  }, [selectedProduct]);

  // Product CRUD
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedList = [created, ...products];
    setProducts(updatedList);
    setSelectedProduct(created);
    setActiveTab('calculator');
  };

  const handleUpdateProduct = (updated: Product) => {
    const updatedList = products.map((p) => (p.id === updated.id ? updated : p));
    setProducts(updatedList);
    if (selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
  };

  const handleDeleteProduct = (id: string) => {
    const remaining = products.filter((p) => p.id !== id);
    setProducts(remaining);
    if (selectedProduct.id === id) {
      setSelectedProduct(remaining[0] || DEFAULT_PRODUCTS[0]);
    }
  };

  const handleResetDefaults = () => {
    setProducts(DEFAULT_PRODUCTS);
    setSelectedProduct(DEFAULT_PRODUCTS[0]);
    setSettings(DEFAULT_SETTINGS);
  };

  // Select product from list and immediately go to calculator
  const handleSelectAndCalculate = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('calculator');
  };

  // Save calculation item to history
  const handleSaveCalculation = (item: CalculationHistoryItem) => {
    setHistory((prev) => [item, ...prev.slice(0, 49)]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectHistoryItem = (item: CalculationHistoryItem) => {
    const prod = products.find((p) => p.name === item.productName) || {
      id: `temp-${Date.now()}`,
      name: item.productName,
      pricePerKg: item.pricePerKg,
      category: 'Other',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedProduct(prod);
    setActiveTab('calculator');
  };

  // Export & Import backup JSON
  const handleExportData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      settings,
      history,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tuktuk-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed.products)) {
          setProducts(parsed.products);
          if (parsed.products.length > 0) {
            setSelectedProduct(parsed.products[0]);
          }
        }
        if (parsed.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
        }
        if (Array.isArray(parsed.history)) {
          setHistory(parsed.history);
        }
        alert('Backup restored successfully!');
      } catch (err) {
        alert('Failed to parse backup file. Please select a valid TukTuk JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#F9F8F4] text-[#2D3A31] flex flex-col font-sans antialiased selection:bg-[#C27B66] selection:text-white relative">
      {/* Mandatory Tactile Paper Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3.5 sm:px-6 py-4 max-w-5xl mx-auto w-full relative z-10 overflow-y-auto">
        {activeTab === 'calculator' && (
          <CalculatorScreen
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
            onOpenProductList={() => setActiveTab('products')}
            settings={settings}
            onSaveCalculation={handleSaveCalculation}
          />
        )}

        {activeTab === 'products' && (
          <ProductsScreen
            products={products}
            selectedProduct={selectedProduct}
            onSelectAndCalculate={handleSelectAndCalculate}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetDefaults={handleResetDefaults}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={setSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        productsCount={products.length}
      />
    </div>
  );
}

import React from 'react';
import { History, X, Trash2, ArrowRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { CalculationHistoryItem } from '../types';
import { triggerHaptic } from '../lib/storage';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: CalculationHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
}

interface SwipeableItemProps {
  item: CalculationHistoryItem;
  onSelect: (item: CalculationHistoryItem) => void;
  onDelete: (id: string) => void;
}

const SwipeableHistoryItem: React.FC<SwipeableItemProps> = ({ item, onSelect, onDelete }) => {
  const isPriceToWeight = item.mode === 'PRICE_TO_WEIGHT';
  const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [-120, -50, 0], [1, 0.8, 0]);
  const trashScale = useTransform(x, [-100, -50, 0], [1.1, 0.9, 0.5]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x < -90 || info.velocity.x < -500) {
      triggerHaptic();
      onDelete(item.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl select-none"
    >
      {/* Background Revealed on Swipe */}
      <motion.div 
        style={{ opacity: backgroundOpacity }}
        className="absolute inset-0 bg-[#C27B66] rounded-2xl flex items-center justify-end px-4 text-white font-bold text-xs"
      >
        <motion.div style={{ scale: trashScale }} className="flex items-center gap-1.5 font-sans tracking-wider uppercase">
          <Trash2 className="w-4 h-4" strokeWidth={1.75} />
          <span>Delete</span>
        </motion.div>
      </motion.div>

      {/* Foreground Swipeable Card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={{ left: 0.15, right: 0.05 }}
        onDragEnd={handleDragEnd}
        onClick={() => onSelect(item)}
        className="relative bg-white border border-[#E6E2DA] hover:border-[#8C9A84] p-3.5 rounded-2xl cursor-pointer active:cursor-grabbing shadow-botanical-sm transition-colors flex items-center justify-between gap-3 touch-pan-y"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#2D3A31] truncate">
              {item.productName}
            </span>
            <span className="text-[10px] font-sans font-bold text-[#7A8A7E]">@ ₹{item.pricePerKg}/kg</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            {isPriceToWeight ? (
              <>
                <span className="text-xs font-serif font-bold text-[#C27B66]">
                  ₹{item.inputValue}
                </span>
                <ArrowRight className="w-3 h-3 text-[#7A8A7E]" strokeWidth={1.5} />
                <span className="text-xs font-serif font-bold text-[#2D3A31]">
                  {item.resultValue} {item.resultUnit}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-serif font-bold text-[#C27B66]">
                  {item.inputValue}g
                </span>
                <ArrowRight className="w-3 h-3 text-[#7A8A7E]" strokeWidth={1.5} />
                <span className="text-xs font-serif font-bold text-[#2D3A31]">
                  ₹{item.resultValue.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-[#7A8A7E] font-sans block">{dateStr}</span>
            <span className="text-[10px] font-bold text-[#8C9A84] uppercase tracking-wide">Load</span>
          </div>
          {/* Quick inline delete button for desktop / fallback */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic();
              onDelete(item.id);
            }}
            className="p-1.5 rounded-full text-[#7A8A7E]/50 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete this record"
            aria-label="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistoryItem,
  onDeleteHistoryItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D3A31]/50 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-[#F9F8F4] border border-[#E6E2DA] w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-botanical-xl animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E6E2DA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#2D3A31] text-[#F9F8F4] flex items-center justify-center shadow-botanical-sm">
              <History className="w-4 h-4 text-[#8C9A84]" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-base text-[#2D3A31]">Recent Calculations</h3>
              <p className="text-[11px] text-[#7A8A7E]">
                {history.length > 0 ? 'Swipe left to delete an item' : 'Past calculations log'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-2 rounded-full bg-[#F2F0EB] text-[#7A8A7E] hover:text-rose-600 hover:bg-rose-50 text-xs transition"
                title="Clear All History"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#F2F0EB] text-[#7A8A7E] hover:text-[#2D3A31] hover:bg-[#E6E2DA] transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[60vh]">
          {history.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="font-serif text-sm font-bold text-[#2D3A31]">No calculations saved yet</p>
              <p className="text-xs text-[#7A8A7E]">
                Tap the terracotta save button on any calculation to log it here.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {history.map((item) => (
                <SwipeableHistoryItem
                  key={item.id}
                  item={item}
                  onSelect={(selected) => {
                    onSelectHistoryItem(selected);
                    onClose();
                  }}
                  onDelete={onDeleteHistoryItem}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

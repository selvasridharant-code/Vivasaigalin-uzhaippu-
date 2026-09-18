import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FARMER_PRODUCT_IMAGES } from '../data/initialData';
import { Sprout, ShieldCheck, Sparkles, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface FarmerProductGalleryProps {
  onSelectCategory?: (category: string) => void;
}

export const FarmerProductGallery: React.FC<FarmerProductGalleryProps> = ({ onSelectCategory }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % FARMER_PRODUCT_IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + FARMER_PRODUCT_IMAGES.length) % FARMER_PRODUCT_IMAGES.length);
  };

  const activeItem = FARMER_PRODUCT_IMAGES[currentIndex];

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-[#072412] text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-emerald-700/60 overflow-hidden relative mb-6">
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 -top-12 w-48 h-48 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-emerald-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-800/90 text-amber-300 border border-emerald-600/50 shadow-inner">
            <Sprout className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white font-tamil">
                விவசாயிகளின் உழைப்பு & சரியான இடுபொருள் பயன்பாடு
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3" />
                விவசாய வழிகாட்டி
              </span>
            </div>
            <p className="text-xs text-emerald-200/90">
              பயிர்களுக்கு சரியான நேரத்தில் உரங்கள் மற்றும் மருந்துகளை சிக்கனமாகப் பயன்படுத்தும் உழவர்கள்
            </p>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={prevSlide}
            aria-label="Previous image"
            className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors cursor-pointer border border-emerald-700/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-emerald-300 px-1">
            {currentIndex + 1} / {FARMER_PRODUCT_IMAGES.length}
          </span>
          <button
            onClick={nextSlide}
            aria-label="Next image"
            className="p-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white transition-colors cursor-pointer border border-emerald-700/50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Feature Display */}
      <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Large featured photo with motion */}
        <div className="md:col-span-7 relative group rounded-xl overflow-hidden shadow-lg border border-emerald-700/60 aspect-video max-h-72 bg-emerald-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              <img
                src={activeItem.url}
                alt={activeItem.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-emerald-900/80 px-2 py-0.5 rounded-md inline-block w-fit border border-amber-400/30 mb-1">
                  {activeItem.subtitle}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white font-tamil drop-shadow-sm">
                  {activeItem.title}
                </h3>
                <p className="text-xs text-emerald-100 font-tamil line-clamp-2">
                  {activeItem.caption}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnail Cards Grid */}
        <div className="md:col-span-5 flex flex-col gap-2">
          {FARMER_PRODUCT_IMAGES.map((img, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <motion.button
                key={img.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setCurrentIndex(idx);
                  if (onSelectCategory) onSelectCategory(img.category);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-800/90 border-amber-400/70 shadow-md ring-1 ring-amber-400/40'
                    : 'bg-emerald-900/40 hover:bg-emerald-800/50 border-emerald-800/60'
                }`}
              >
                <div className="w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-emerald-600/50 bg-emerald-950">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white font-tamil truncate">
                      {img.title}
                    </h4>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-emerald-200/80 truncate font-tamil">
                    {img.caption}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

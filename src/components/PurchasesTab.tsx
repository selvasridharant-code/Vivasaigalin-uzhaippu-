import React, { useState } from 'react';
import { PurchaseItem, AgriCategory } from '../types';
import { formatINR } from '../data/initialData';
import { FarmerProductGallery } from './FarmerProductGallery';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  BadgePercent, 
  Package, 
  FlaskConical, 
  Wheat, 
  Layers, 
  Sparkles,
  Smartphone,
  Check
} from 'lucide-react';

interface PurchasesTabProps {
  purchases: PurchaseItem[];
  onOpenAddModal: () => void;
  onDeletePurchase: (id: string) => void;
  onScheduleUsage: (item: PurchaseItem) => void;
  onCheckItemPrice: (item: PurchaseItem) => void;
  onPayWithUpi: (item: PurchaseItem) => void;
}

export const PurchasesTab: React.FC<PurchasesTabProps> = ({
  purchases,
  onOpenAddModal,
  onDeletePurchase,
  onScheduleUsage,
  onCheckItemPrice,
  onPayWithUpi,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Category filter
  const filteredPurchases = purchases.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tamilName && item.tamilName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dealerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Totals calculations
  const totalSpent = purchases.reduce((sum, p) => sum + p.totalCostINR, 0);
  const totalSubsidizedCount = purchases.filter((p) => p.isSubsidized).length;
  const goodDealsCount = purchases.filter((p) => p.priceVerdict === 'Great Deal').length;
  const totalPaidViaUpi = purchases.filter((p) => p.paymentStatus === 'paid').length;

  const getCategoryIcon = (cat: AgriCategory) => {
    switch (cat) {
      case 'fertilizer': return <FlaskConical className="w-4 h-4 text-emerald-600" />;
      case 'pesticide': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'seed': return <Wheat className="w-4 h-4 text-amber-600" />;
      case 'soil': return <Layers className="w-4 h-4 text-stone-600" />;
    }
  };

  const getCategoryLabelTamil = (cat: AgriCategory) => {
    switch (cat) {
      case 'fertilizer': return 'உரங்கள் (Fertilizer)';
      case 'pesticide': return 'பூச்சிக்கொல்லி (Pesticide)';
      case 'seed': return 'விதைகள் (Seed)';
      case 'soil': return 'மண்/இயற்கை உரம் (Soil)';
    }
  };

  const getCategoryBadgeClass = (cat: AgriCategory) => {
    switch (cat) {
      case 'fertilizer': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pesticide': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'seed': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'soil': return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 font-tamil">
      {/* Visual Guide: Farmers using products */}
      <FarmerProductGallery onSelectCategory={(cat) => setSelectedCategory(cat)} />

      {/* Top Stat Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              மொத்த கொள்முதல் செலவு
            </span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-800 font-bold">₹</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-stone-900 font-mono">{formatINR(totalSpent)}</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">பதிவு செய்யப்பட்ட {purchases.length} பொருட்கள்</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              அரசு மானியப் பொருட்கள்
            </span>
            <BadgePercent className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700">{totalSubsidizedCount} பொருட்கள்</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">நேரடி மானிய (DBT/PACS) விலையில்</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              GPay / UPI பரிவர்த்தனை
            </span>
            <Smartphone className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-700">{totalPaidViaUpi} கட்டணங்கள்</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">நேரடியாக வியாபாரிக்கு UPI மூலம் செலுத்தப்பட்டது</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 rounded-2xl p-4 text-white shadow-md flex flex-col justify-between border border-emerald-700/60">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              புதிய கொள்முதல் பதிவு
            </span>
            <p className="text-xs text-emerald-100 mt-1">யூரியா, டிஏபி, விதைகள், வேப்ப எண்ணெய் அல்லது உரம்</p>
          </div>
          <button
            id="purchases-btn-add-primary"
            onClick={onOpenAddModal}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ கொள்முதல் சேர்க்கவும்</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="purchases-search-input"
              type="text"
              placeholder="பொருள் பெயர், நிறுவனம் அல்லது வியாபாரி..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-800 placeholder-stone-400"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs text-stone-400 font-medium flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> பிரிவு:
            </span>
            {[
              { id: 'all', label: 'அனைத்தும் (All)' },
              { id: 'fertilizer', label: 'உரங்கள்' },
              { id: 'pesticide', label: 'பூச்சிக்கொல்லி' },
              { id: 'seed', label: 'விதைகள்' },
              { id: 'soil', label: 'மண் & உரம்' },
            ].map((cat) => (
              <button
                key={cat.id}
                id={`purchases-filter-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-amber-300 font-bold shadow-xs border border-emerald-700'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredPurchases.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-stone-200">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-700">பொருட்கள் எதுவும் கிடைக்கவில்லை</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              தேடல் சொல் அல்லது வகை வடிகட்டியை மாற்றவும் அல்லது புதிய இடுபொருளை சேர்க்கவும்.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> கொள்முதல் சேர்க்க
            </button>
          </div>
        ) : (
          filteredPurchases.map((item) => {
            const isLowStock = item.remainingQuantity <= item.quantity * 0.25;
            const isPaid = item.paymentStatus === 'paid';

            return (
              <div
                key={item.id}
                id={`purchase-item-${item.id}`}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(item.category)}`}>
                      {getCategoryIcon(item.category)}
                      <span>{getCategoryLabelTamil(item.category)}</span>
                    </span>

                    <h4 className="text-base font-extrabold text-stone-900 truncate">
                      {item.tamilName || item.itemName}
                    </h4>

                    {item.isSubsidized && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        அரசு மானியம் (Subsidized)
                      </span>
                    )}

                    {/* Payment Badge */}
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-800 border border-green-300">
                        <Check className="w-3 h-3 text-green-600 stroke-[3]" />
                        {item.paymentMethod || 'UPI'} மூலம் செலுத்தப்பட்டது
                      </span>
                    ) : (
                      <button
                        onClick={() => onPayWithUpi(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors cursor-pointer"
                        title="Click to Pay with GPay / PhonePe / Paytm / BHIM"
                      >
                        <Smartphone className="w-3 h-3 text-blue-600" />
                        <span>GPay / UPI கட்டணம் செலுத்தவும்</span>
                      </button>
                    )}

                    {item.priceVerdict && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          item.priceVerdict === 'Great Deal'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : item.priceVerdict === 'Overpriced'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {item.priceVerdict === 'Great Deal' ? '✓ சிறந்த விலை ' : item.priceVerdict === 'Overpriced' ? '⚠️ கூடுதல் விலை ' : '• நியாயமான விலை '}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                    <span>
                      தயாரிப்பாளர் / Brand: <strong className="text-stone-700 font-medium">{item.brand}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      அங்காடி / Dealer: <strong className="text-stone-700 font-medium">{item.dealerName}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      தேதி: <strong className="text-stone-700 font-medium">{item.date}</strong>
                    </span>
                    {item.invoiceNumber && (
                      <>
                        <span>•</span>
                        <span>ரசீது எண்: <span className="font-mono text-stone-700 font-semibold">{item.invoiceNumber}</span></span>
                      </>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200/60 italic">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Remaining stock indicator */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-stone-500 font-medium">இருப்பு (Stock):</span>
                      <strong className={`font-semibold ${isLowStock ? 'text-amber-700 font-bold' : 'text-stone-700'}`}>
                        {item.remainingQuantity} / {item.quantity} {item.unit}
                      </strong>
                    </div>
                    <div className="w-24 sm:w-36 bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/50">
                      <div
                        className={`h-2 rounded-full ${isLowStock ? 'bg-amber-500' : 'bg-emerald-600'}`}
                        style={{ width: `${Math.min(100, (item.remainingQuantity / item.quantity) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Right financial & actions */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 gap-2 shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-stone-500 font-medium">
                      {item.quantity} {item.unit} × {formatINR(item.unitPriceINR)}
                    </div>
                    <div className="text-xl font-extrabold text-emerald-950 font-mono tracking-tight">
                      {formatINR(item.totalCostINR)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 mt-1">
                    {/* Pay with GPay / UPI button */}
                    <button
                      id={`btn-upi-pay-${item.id}`}
                      onClick={() => onPayWithUpi(item)}
                      title="Pay via GPay, PhonePe, Paytm, BHIM UPI"
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isPaid
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                          : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isPaid ? 'UPI ரசீது' : 'GPay / UPI'}</span>
                    </button>

                    <button
                      id={`btn-schedule-from-purchase-${item.id}`}
                      onClick={() => onScheduleUsage(item)}
                      title="Schedule field application with this item"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>அட்டவணை</span>
                    </button>

                    <button
                      id={`btn-price-check-${item.id}`}
                      onClick={() => onCheckItemPrice(item)}
                      title="விலை ஒப்பீடு (AI Price Check)"
                      className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-delete-purchase-${item.id}`}
                      onClick={() => onDeletePurchase(item.id)}
                      title="நீக்கு (Delete)"
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

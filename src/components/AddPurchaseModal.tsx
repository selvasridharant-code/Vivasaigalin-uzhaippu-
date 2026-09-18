import React, { useState, useEffect } from 'react';
import { AgriCategory, PurchaseItem } from '../types';
import { BENCHMARKS_CATALOG, formatINR } from '../data/initialData';
import { X, IndianRupee, ShieldCheck, AlertCircle, CheckCircle2, Smartphone } from 'lucide-react';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPurchase: (item: Omit<PurchaseItem, 'id' | 'remainingQuantity'>) => void;
  prefillItem?: {
    name: string;
    tamilName?: string;
    category: AgriCategory;
    unit: string;
    price: number;
  } | null;
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
  isOpen,
  onClose,
  onAddPurchase,
  prefillItem,
}) => {
  const [category, setCategory] = useState<AgriCategory>('fertilizer');
  const [itemName, setItemName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [brand, setBrand] = useState('IFFCO (இப்கோ)');
  const [dealerName, setDealerName] = useState('தொடக்க வேளாண்மை கூட்டுறவு சங்கம் (PACS)');
  const [dealerUpiId, setDealerUpiId] = useState('pacs.agri.thanjavur@sbi');
  const [quantity, setQuantity] = useState<number>(2);
  const [unit, setUnit] = useState('45kg bag');
  const [unitPriceINR, setUnitPriceINR] = useState<number>(266.5);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubsidized, setIsSubsidized] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<'GPay' | 'PhonePe' | 'Paytm' | 'BHIM' | 'Cash'>('GPay');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Handle prefill if opened from benchmarks
  useEffect(() => {
    if (prefillItem) {
      setCategory(prefillItem.category);
      setItemName(prefillItem.name);
      if (prefillItem.tamilName) setTamilName(prefillItem.tamilName);
      setUnit(prefillItem.unit);
      setUnitPriceINR(prefillItem.price);
    }
  }, [prefillItem]);

  if (!isOpen) return null;

  const totalCost = Number(quantity || 0) * Number(unitPriceINR || 0);

  // Quick suggestions based on selected category in Tamil
  const getSuggestions = () => {
    switch (category) {
      case 'fertilizer':
        return [
          { name: 'Neem Coated Urea', tamil: 'வேப்பிலை பூசிய யூரியா (Neem Coated Urea)', unit: '45kg bag', price: 266.5, sub: true },
          { name: 'Nano Urea Liquid Bottle', tamil: 'நானோ யூரியா திரவம் (Nano Urea Liquid)', unit: '500ml bottle', price: 225, sub: true },
          { name: 'DAP (18:46:0)', tamil: 'டி.ஏ.பி உரம் (DAP 18:46:0)', unit: '50kg bag', price: 1350, sub: true },
          { name: 'NPK (10:26:26)', tamil: 'என்.பி.கே கலப்பு உரம் (NPK Complex 10:26:26)', unit: '50kg bag', price: 1470, sub: true },
          { name: 'MOP Potash', tamil: 'பொட்டாஷ் உரம் (MOP Potash)', unit: '50kg bag', price: 1700, sub: true },
        ];
      case 'pesticide':
        return [
          { name: 'Neem Oil Bio-Pesticide (10,000 PPM)', tamil: 'வேப்பெண்ணெய் இயற்கை பூச்சிக்கொல்லி (Neem Oil)', unit: '1 litre', price: 450, sub: false },
          { name: 'Chlorpyrifos 20% EC', tamil: 'குளோர்பைரிபாஸ் பூச்சிக்கொல்லி (Chlorpyrifos)', unit: '1 litre', price: 380, sub: false },
          { name: 'Mancozeb 75% WP Fungicide', tamil: 'மேன்கோசெப் பூஞ்சாணக்கொல்லி (Mancozeb)', unit: '500 gm', price: 240, sub: false },
          { name: 'Trichoderma Viride Bio-Agent', tamil: 'டிரைக்கோடெர்மா விரிடி நுண்ணுயிர் (Trichoderma)', unit: '1 kg', price: 140, sub: false },
        ];
      case 'seed':
        return [
          { name: 'Certified Paddy Seed (Basmati/CR-1009)', tamil: 'சான்று பெற்ற நெல் விதை (Certified Paddy CR-1009)', unit: '10kg bag', price: 420, sub: true },
          { name: 'Certified Wheat Seed (HD-3086)', tamil: 'சான்று பெற்ற கோதுமை விதை (Certified Wheat)', unit: '40kg bag', price: 1250, sub: true },
          { name: 'Black Gram VBN-8 Pulse Seed', tamil: 'உளுந்து விதை வி.பி.என்-8 (Black Gram Pulse)', unit: '4kg bag', price: 380, sub: true },
        ];
      case 'soil':
        return [
          { name: 'Gaushala FYM / Desi Cow Manure', tamil: 'மக்கிய தொழு உரம் (Farmyard Manure / FYM)', unit: 'tractor trolley', price: 1900, sub: false },
          { name: 'Organic Vermicompost', tamil: 'மண்புழு உரம் (Organic Vermicompost)', unit: '50kg bag', price: 350, sub: false },
          { name: 'Fertile Red Loam Top Soil', tamil: 'வளமான செம்மண் (Fertile Red Loam Soil)', unit: 'tractor trolley', price: 2500, sub: false },
          { name: 'Agricultural Gypsum', tamil: 'விவசாய ஜிப்சம் உரம் (Agri Gypsum)', unit: '50kg bag', price: 180, sub: true },
        ];
    }
  };

  const handleApplySuggestion = (sug: { name: string; tamil: string; unit: string; price: number; sub: boolean }) => {
    setItemName(sug.name);
    setTamilName(sug.tamil);
    setUnit(sug.unit);
    setUnitPriceINR(sug.price);
    setIsSubsidized(sug.sub);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || quantity <= 0 || unitPriceINR <= 0) return;

    // Check benchmark verdict
    const benchmarks = BENCHMARKS_CATALOG[category] || [];
    const matched = benchmarks.find((b) =>
      b.name.toLowerCase().includes(itemName.toLowerCase().split(' ')[0]) ||
      itemName.toLowerCase().includes(b.name.toLowerCase().split(' ')[0])
    );

    let priceVerdict: 'Great Deal' | 'Fair Price' | 'Overpriced' = 'Fair Price';
    let priceBenchmarkNote = `Standard Indian market rate for ${unit}.`;

    if (matched) {
      if (unitPriceINR > matched.typicalMax) {
        priceVerdict = 'Overpriced';
        priceBenchmarkNote = `Paid above typical MRP (${formatINR(matched.typicalMax)}).`;
      } else if (unitPriceINR < matched.typicalMin * 0.96) {
        priceVerdict = 'Great Deal';
        priceBenchmarkNote = `Procured below average market rate (${formatINR(matched.typicalMin)}).`;
      }
    }

    onAddPurchase({
      date,
      itemName: itemName.trim(),
      tamilName: tamilName.trim() || itemName.trim(),
      category,
      brand: brand.trim() || 'Generic / Local',
      dealerName: dealerName.trim() || 'Local Mandi Trader',
      dealerUpiId: dealerUpiId.trim() || 'pacs.agri.thanjavur@sbi',
      paymentStatus,
      paymentMethod: paymentStatus === 'paid' ? paymentMethod : undefined,
      upiRefId: paymentStatus === 'paid' ? `UPI-${Date.now().toString().slice(-8)}` : undefined,
      quantity: Number(quantity),
      unit,
      unitPriceINR: Number(unitPriceINR),
      totalCostINR: totalCost,
      isSubsidized,
      invoiceNumber: invoiceNumber.trim() || `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes.trim() || undefined,
      priceVerdict,
      priceBenchmarkNote,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto backdrop-blur-xs font-tamil">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border-2 border-emerald-900/20 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                புதிய இடுபொருள் பதிவு (Record Input Purchase)
              </h3>
              <p className="text-xs text-stone-500">உரங்கள், மருந்துகள், விதைகள், மண் - இந்திய ரூபாய் (₹)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Category Tabs */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">இடுபொருள் பிரிவு (Category)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'fertilizer', label: 'உரம் (Fertilizer)' },
                { id: 'pesticide', label: 'பூச்சிக்கொல்லி (Pesticide)' },
                { id: 'seed', label: 'விதை (Seeds)' },
                { id: 'soil', label: 'மண்/உரம் (Soil/Manure)' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as AgriCategory)}
                  className={`py-2 text-center rounded-xl font-bold border transition-all cursor-pointer ${
                    category === c.id
                      ? 'bg-emerald-900 text-amber-300 border-emerald-950 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Suggestions for Less Price / Standard Items in Tamil */}
          <div>
            <span className="block font-bold text-stone-500 mb-1">விரைவுத் தேர்வு (Quick Select Common Input):</span>
            <div className="flex flex-wrap gap-1.5">
              {getSuggestions().map((sug, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleApplySuggestion(sug)}
                  className="px-2.5 py-1 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-200 transition-colors cursor-pointer text-[11px] font-medium"
                >
                  {sug.tamil.split('(')[0]} ({formatINR(sug.price)})
                </button>
              ))}
            </div>
          </div>

          {/* Item Name in Tamil and English */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">பொருள் பெயர் (தமிழில்) *</label>
              <input
                id="modal-purchase-tamilname"
                type="text"
                required
                value={tamilName}
                onChange={(e) => setTamilName(e.target.value)}
                placeholder="எ.கா. வேப்பிலை பூசிய யூரியா, டிஏபி உரம்"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Item Name (English) *</label>
              <input
                id="modal-purchase-name"
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Neem Coated Urea, DAP"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Brand & Dealer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">உற்பத்தியாளர் / Brand</label>
              <input
                id="modal-purchase-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. IFFCO, KRIBHCO, SPIC, Bayer"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">விற்பனை அங்காடி (Dealer / Mandi)</label>
              <input
                id="modal-purchase-dealer"
                type="text"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                placeholder="e.g. தொடக்க கூட்டுறவு சங்கம் (PACS), உழவர் மையம்"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Dealer UPI ID for GPay integration */}
          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-2">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold">
              <Smartphone className="w-4 h-4 text-blue-700" />
              <span>வியாபாரியின் UPI ஐடி & GPay கட்டண அமைப்பு:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  id="modal-purchase-upi"
                  type="text"
                  value={dealerUpiId}
                  onChange={(e) => setDealerUpiId(e.target.value)}
                  placeholder="e.g. pacs.thanjavur@sbi அல்லது dealer@okaxis"
                  className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-stone-800 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'pending' | 'paid')}
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg font-bold text-xs"
                >
                  <option value="paid">செலுத்தப்பட்டது (Paid)</option>
                  <option value="pending">நிலுவை (Pending)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quantity, Unit & Unit Price in INR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">அளவு (Quantity) *</label>
              <input
                id="modal-purchase-qty"
                type="number"
                min="0.1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">அலகு (Unit) *</label>
              <input
                id="modal-purchase-unit"
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 45kg bag, 50kg bag, litre, trolley"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">ஒரு யூனிட் விலை (₹ INR) *</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                <input
                  id="modal-purchase-unitprice"
                  type="number"
                  step="any"
                  required
                  value={unitPriceINR}
                  onChange={(e) => setUnitPriceINR(Number(e.target.value))}
                  className="w-full pl-6 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Total Cost Display Card */}
          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-900 font-bold">கணக்கிடப்பட்ட மொத்தத் தொகை:</span>
              <div className="text-xl font-extrabold text-emerald-950 font-mono">
                {formatINR(totalCost)}
              </div>
            </div>
            <div className="text-right text-xs text-emerald-800 font-medium">
              {quantity} {unit} × {formatINR(unitPriceINR)}
            </div>
          </div>

          {/* Subsidy & Date details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-2 rounded-xl border border-stone-200">
              <input
                id="modal-purchase-issubsidized"
                type="checkbox"
                checked={isSubsidized}
                onChange={(e) => setIsSubsidized(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 cursor-pointer"
              />
              <span className="font-bold text-stone-700">அரசு நேரடி மானியம் (DBT Subsidy)</span>
            </label>

            <div>
              <label className="block font-bold text-stone-700 mb-1">கொள்முதல் தேதி *</label>
              <input
                id="modal-purchase-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">குறிப்புகள் / பயிர் பயன்பாட்டுத் திட்டம்</label>
            <input
              id="modal-purchase-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="எ.கா. சம்பா நெல் நடவு வயலுக்கு; உழவர் கிடங்கில் பாதுகாப்பாக உள்ளது"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
            >
              ரத்து (Cancel)
            </button>
            <button
              id="modal-purchase-submit-btn"
              type="submit"
              className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 rounded-xl font-extrabold shadow-md cursor-pointer transition-all"
            >
              கொள்முதலை சேமிக்கவும் (Save Entry)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

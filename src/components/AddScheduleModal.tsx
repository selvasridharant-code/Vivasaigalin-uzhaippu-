import React, { useState, useEffect } from 'react';
import { AgriCategory, FarmProfile, PurchaseItem, UsageSchedule } from '../types';
import { X, Calendar, MapPin, ShieldAlert, Sparkles, Sprout } from 'lucide-react';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmProfile: FarmProfile;
  purchases: PurchaseItem[];
  onAddSchedule: (schedule: Omit<UsageSchedule, 'id'>) => void;
  prefillFromPurchase?: PurchaseItem | null;
}

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
  farmProfile,
  purchases,
  onAddSchedule,
  prefillFromPurchase,
}) => {
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<AgriCategory>('fertilizer');
  const [selectedPlot, setSelectedPlot] = useState(farmProfile.plots[0]?.name || 'வாய்க்கால் வயல் (Canal Road Field)');
  const [plotSize, setPlotSize] = useState(farmProfile.plots[0]?.sizeAcres || 3.0);
  const [cropName, setCropName] = useState(farmProfile.plots[0]?.currentCrop || 'நெல் (Basmati / Ponni)');
  const [cropStage, setCropStage] = useState('பயிர் வளர்ச்சி (Vegetative - Day 20-30)');
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split('T')[0]);
  const [plannedDosagePerAcre, setPlannedDosagePerAcre] = useState('25 கிலோ / ஏக்கர்');
  const [totalQuantity, setTotalQuantity] = useState<number>(2);
  const [unit, setUnit] = useState('45kg bag');
  const [applicationMethod, setApplicationMethod] = useState<UsageSchedule['applicationMethod']>('Soil Broadcast');
  const [safetyPrecaution, setSafetyPrecaution] = useState('முகக்கவசம் அணிந்து காலை நேரத்தில் தெளிக்கவும்; காற்று அதிகமாக இருக்கும்போது தெளிக்க வேண்டாம்.');
  const [notes, setNotes] = useState('');

  // Update when prefill is provided
  useEffect(() => {
    if (prefillFromPurchase) {
      setSelectedPurchaseId(prefillFromPurchase.id);
      setItemName(prefillFromPurchase.itemName);
      setCategory(prefillFromPurchase.category);
      setUnit(prefillFromPurchase.unit);
      setTotalQuantity(Math.min(prefillFromPurchase.remainingQuantity, 2) || 1);
    }
  }, [prefillFromPurchase]);

  if (!isOpen) return null;

  // Handle plot change
  const handlePlotSelect = (plotName: string) => {
    setSelectedPlot(plotName);
    const found = farmProfile.plots.find((p) => p.name === plotName);
    if (found) {
      setPlotSize(found.sizeAcres);
      setCropName(found.currentCrop);
    }
  };

  // Handle inventory selection
  const handleInventorySelect = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    if (purchaseId === 'custom') {
      return;
    }
    const found = purchases.find((p) => p.id === purchaseId);
    if (found) {
      setItemName(found.itemName);
      setCategory(found.category);
      setUnit(found.unit);
      setTotalQuantity(Math.min(found.remainingQuantity, 1) || 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || totalQuantity <= 0) return;

    // Estimate cost if linked to purchase
    let costINR: number | undefined;
    const linked = purchases.find((p) => p.id === selectedPurchaseId);
    if (linked && linked.unitPriceINR) {
      costINR = linked.unitPriceINR * totalQuantity;
    }

    onAddSchedule({
      purchaseItemId: selectedPurchaseId !== 'custom' ? selectedPurchaseId : undefined,
      itemName: itemName.trim(),
      category,
      plotName: selectedPlot,
      plotSizeAcres: Number(plotSize),
      cropName: cropName.trim() || 'விவசாயப் பயிர்',
      cropStage,
      plannedDate,
      plannedDosagePerAcre,
      totalQuantity: Number(totalQuantity),
      unit,
      applicationMethod,
      status: 'scheduled',
      safetyPrecaution: safetyPrecaution.trim() || undefined,
      notes: notes.trim() || undefined,
      costINR,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto backdrop-blur-xs font-tamil">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border-2 border-emerald-900/15 space-y-4 my-8">
        <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-900 text-amber-300 rounded-2xl shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-emerald-950">வயல் பயன்பாடு திட்டமிடல் (Schedule Application)</h3>
              <p className="text-xs text-stone-500 font-medium">உரம், பூச்சிக்கொல்லி, விதை மற்றும் மண் பயன்பாட்டு அட்டவணை</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Select from Inventory */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">வாங்கிய கையிருப்புப் பொருட்களிலிருந்து தேர்வு செய்க</label>
            <select
              id="modal-schedule-select-stock"
              value={selectedPurchaseId}
              onChange={(e) => handleInventorySelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-emerald-700 focus:bg-white cursor-pointer"
            >
              <option value="">-- வாங்கிய பொருட்களின் பட்டியலிலிருந்து தேர்ந்தெடுக்கவும் --</option>
              {purchases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.itemName} (கையிருப்பு: {p.remainingQuantity} {p.unit}) - {p.category.toUpperCase()}
                </option>
              ))}
              <option value="custom">+ பிற / நேரடி உள்ளீடு (Other Custom)</option>
            </select>
          </div>

          {/* Item Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">பொருளின் பெயர் (Item Name) *</label>
              <input
                id="modal-schedule-item-name"
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="எ.கா: யூரியா, வேப்ப எண்ணெய், நெல் விதை"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">பிரிவு (Category)</label>
              <select
                id="modal-schedule-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as AgriCategory)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="fertilizer">உரங்கள் (Fertilizer)</option>
                <option value="pesticide">பூச்சிக்கொல்லி (Pesticide)</option>
                <option value="seed">விதைகள் (Seeds)</option>
                <option value="soil">மண் & இயற்கை உரம் (Soil / Manure)</option>
              </select>
            </div>
          </div>

          {/* Plot & Crop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">வயல் நிலம் (Plot) *</label>
              <select
                id="modal-schedule-plot"
                value={selectedPlot}
                onChange={(e) => handlePlotSelect(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                {farmProfile.plots.map((plot) => (
                  <option key={plot.id} value={plot.name}>
                    {plot.name} ({plot.sizeAcres} ஏக்)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">பயிர் (Crop)</label>
              <input
                id="modal-schedule-crop"
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="எ.கா: நெல், கரும்பு, மக்காச்சோளம்"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">வளர்ச்சி பருவம் (Stage)</label>
              <select
                id="modal-schedule-stage"
                value={cropStage}
                onChange={(e) => setCropStage(e.target.value)}
                className="w-full px-2 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="நில தயாரிப்பு / அடியுரம்">நில தயாரிப்பு / அடியுரம்</option>
                <option value="விதைப்பு / நாற்று நடுதல்">விதைப்பு / நாற்று நடுதல்</option>
                <option value="பயிர் வளர்ச்சி (Day 20-30)">பயிர் வளர்ச்சி (Day 20-30)</option>
                <option value="தூர்கட்டு பருவம்">தூர்கட்டு பருவம்</option>
                <option value="பூக்கும் பருவம் / கதிர்">பூக்கும் பருவம் / கதிர்</option>
                <option value="பால் மற்றும் தானிய முதிர்வு">தானிய முதிர்வு</option>
                <option value="அறுவடைக்கு பின் மண் வளம்">அறுவடைக்கு பின் மண் வளம்</option>
              </select>
            </div>
          </div>

          {/* Date, Dosage & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-800 mb-1">திட்டமிட்ட தேதி (Date) *</label>
              <input
                id="modal-schedule-date"
                type="date"
                required
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-emerald-700 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-800 mb-1">ஏக்கருக்கு பரிந்துரை அளவு</label>
              <input
                id="modal-schedule-dosage"
                type="text"
                value={plannedDosagePerAcre}
                onChange={(e) => setPlannedDosagePerAcre(e.target.value)}
                placeholder="எ.கா: 25 kg/ஏக்கர் அல்லது 2ml/L"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-bold text-stone-800 mb-1">மொத்த அளவு *</label>
                <input
                  id="modal-schedule-totalqty"
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-black font-mono focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <div className="w-24">
                <label className="block font-bold text-stone-800 mb-1">அலகு</label>
                <input
                  id="modal-schedule-unit"
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Application Method */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">இடும் முறை (Application Method)</label>
            <select
              id="modal-schedule-method"
              value={applicationMethod}
              onChange={(e) => setApplicationMethod(e.target.value as UsageSchedule['applicationMethod'])}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="Soil Broadcast">மேலுரம் தூவுதல் (Soil Broadcast)</option>
              <option value="Foliar Spray">இலைவழித் தெளிப்பு (Foliar Spray - Sprayer / Drone)</option>
              <option value="Drip Fertigation">சொட்டுநீர் பாசனம் (Drip Fertigation)</option>
              <option value="Basal Placement">உழவு அடி உரமிடல் (Basal Placement)</option>
              <option value="Seed Treatment">விதை நேர்த்தி (Seed Treatment)</option>
              <option value="Soil Mixing">மண் கலக்குதல் (Soil Mixing)</option>
            </select>
          </div>

          {/* Safety Precaution & Weather Note */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">பாதுகாப்பு மற்றும் வானிலை குறிப்பு</label>
            <input
              id="modal-schedule-precaution"
              type="text"
              value={safetyPrecaution}
              onChange={(e) => setSafetyPrecaution(e.target.value)}
              placeholder="எ.கா: முகக்கவசம் அணியவும்; அதிகாலையில் தெளிக்கவும்"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-emerald-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer transition-colors"
            >
              ரத்து செய் (Cancel)
            </button>
            <button
              id="modal-schedule-submit-btn"
              type="submit"
              className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 rounded-xl font-black shadow-md cursor-pointer transition-all"
            >
              அட்டவணையைச் சேமிக்க (Save Schedule)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


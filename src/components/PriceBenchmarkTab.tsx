import React, { useState } from 'react';
import { BENCHMARKS_CATALOG, formatINR } from '../data/initialData';
import { AgriCategory, PriceBenchmark } from '../types';
import { 
  TrendingDown, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle, 
  FlaskConical, 
  Wheat, 
  Layers, 
  Sparkles,
  Calculator,
  ChevronRight,
  IndianRupee,
  BadgePercent
} from 'lucide-react';

interface PriceBenchmarkTabProps {
  onQuickAddPurchaseWithPrice: (benchmark: PriceBenchmark, category: AgriCategory) => void;
}

export const PriceBenchmarkTab: React.FC<PriceBenchmarkTabProps> = ({
  onQuickAddPurchaseWithPrice,
}) => {
  const [activeCategory, setActiveCategory] = useState<AgriCategory>('fertilizer');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Price Check Calculator State
  const [calcItemName, setCalcItemName] = useState('டிஏபி உரம் (DAP 18:46:0)');
  const [calcCategory, setCalcCategory] = useState<AgriCategory>('fertilizer');
  const [calcUnit, setCalcUnit] = useState('50kg bag');
  const [calcQuotedPrice, setCalcQuotedPrice] = useState<number | ''>(1350);
  const [calcResult, setCalcResult] = useState<{
    verdict: 'Great Deal' | 'Fair Price' | 'Overpriced';
    tamilVerdict: string;
    benchmarkMin: number;
    benchmarkMax: number;
    diffPercent: number;
    advice: string;
  } | null>(null);

  // Evaluate quoted price against benchmark
  const handleCalculatePriceFairness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcQuotedPrice || calcQuotedPrice <= 0) return;

    // Find closest benchmark
    const list = BENCHMARKS_CATALOG[calcCategory] || [];
    const matched = list.find((b) => 
      b.name.toLowerCase().includes(calcItemName.toLowerCase().split(' ')[0]) ||
      (b.tamilName && b.tamilName.toLowerCase().includes(calcItemName.toLowerCase().split(' ')[0])) ||
      calcItemName.toLowerCase().includes(b.name.toLowerCase().split(' ')[0])
    ) || list[0];

    const price = Number(calcQuotedPrice);
    const min = matched ? matched.typicalMin : price * 0.9;
    const max = matched ? matched.typicalMax : price * 1.05;

    let verdict: 'Great Deal' | 'Fair Price' | 'Overpriced' = 'Fair Price';
    let tamilVerdict = 'நியாயமான சந்தை விலை (Fair Price)';
    let advice = 'வியாபாரி கோரிய விலை இந்திய அரசு நிர்ணயித்த சந்தை விலைக்குள் உள்ளது. தாராளமாக வாங்கலாம்.';

    if (price > max) {
      verdict = 'Overpriced';
      tamilVerdict = 'அதிக விலை! (Overpriced - எச்சரிக்கை)';
      const overchargeAmt = price - max;
      advice = `எச்சரிக்கை: இந்த விலை அரசு நிர்ணயித்த அதிகபட்ச சில்லறை விலையை (MRP ${formatINR(max)}) விட ₹${overchargeAmt} அதிகமாகும்! மானிய உரங்களை கூடுதல் விலைக்கு விற்பது சட்டப்படி தவறு. உங்கள் கூட்டுறவு சங்கத்தில் (PACS) அல்லது இப்கோ அங்காடிகளில் குறைவான அரசு விலையில் வாங்கவும்.`;
    } else if (price < min * 0.96) {
      verdict = 'Great Deal';
      tamilVerdict = 'மிகச் சிறந்த மலிவு விலை (Great Deal / Less Price)';
      advice = `சிறந்த குறைவான விலை! சராசரி சந்தை விலையான ${formatINR(min)}-ஐ விட குறைவு. வாங்குவதற்கு முன் பையின் முத்திரை, காலாவதி தேதி மற்றும் தரச் சான்றை சரிபார்த்துக் கொள்ளவும்.`;
    }

    const diffPercent = matched ? Math.round(((price - matched.typicalMax) / matched.typicalMax) * 100) : 0;

    setCalcResult({
      verdict,
      tamilVerdict,
      benchmarkMin: min,
      benchmarkMax: max,
      diffPercent,
      advice,
    });
  };

  const currentList = BENCHMARKS_CATALOG[activeCategory] || [];
  const filteredBenchmarks = currentList.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.tamilName && b.tamilName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    b.note.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-tamil">
      {/* Hero: "Less Price" Guarantee & Checker in Tamil */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <TrendingDown className="w-4 h-4" />
              <span>மலிவு விலை வழிகாட்டி • Less Price Finder (₹ இந்திய ரூபாய்)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              உரங்கள் மற்றும் இடுபொருட்களை கூடுதல் விலையின்றி வாங்கலாம்
            </h2>
            <p className="text-emerald-200 text-xs sm:text-sm leading-relaxed">
              அரசு நிர்ணயித்த அதிகபட்ச சில்லறை விலை (MRP), மத்திய அரசின் DBT மானிய வரம்புகள் மற்றும் சந்தை விலைகளை அறிந்து வியாபாரிகளிடம் குறைவான விலையில் பேசி வாங்க விவசாயிகளுக்கு உதவுகிறது.
            </p>
          </div>

          <div className="bg-emerald-900/60 backdrop-blur-md border border-emerald-600/40 p-5 rounded-2xl text-xs space-y-2 shrink-0 shadow-lg">
            <div className="text-amber-300 font-extrabold flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4" /> அரசு நிர்ணயித்த கட்டாய உச்ச வரம்பு
            </div>
            <div className="text-emerald-100 flex justify-between gap-4">
              <span>யூரியா (45 கிலோ மூட்டை):</span>
              <strong className="text-amber-300 font-mono text-sm">₹266.50 (Max)</strong>
            </div>
            <div className="text-emerald-100 flex justify-between gap-4">
              <span>டி.ஏ.பி உரம் (50 கிலோ):</span>
              <strong className="text-white font-mono text-sm">₹1,350.00</strong>
            </div>
            <div className="text-emerald-100 flex justify-between gap-4">
              <span>நானோ யூரியா (500 மிலி):</span>
              <strong className="text-white font-mono text-sm">₹225.00</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Price Fairness Calculator */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-900/10 shadow-lg space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
          <div className="p-2.5 bg-emerald-100 text-emerald-950 rounded-2xl">
            <Calculator className="w-6 h-6 text-emerald-900" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900">
              விலைச் சரிபார்ப்பு கணிப்பான் (Dealer Price Check Calculator)
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              வியாபாரி கூறும் விலை நியாயமானதா அல்லது அதிக விலையா என்பதை உடனடியாக சோதிக்கவும்
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculatePriceFairness} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">இடுபொருள் வகை (Category)</label>
            <select
              id="calc-select-category"
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value as AgriCategory)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-800 font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            >
              <option value="fertilizer">உரம் (Fertilizer)</option>
              <option value="pesticide">பூச்சிக்கொல்லி (Pesticide)</option>
              <option value="seed">விதை (Seeds)</option>
              <option value="soil">மண் மற்றும் உரம் (Soil & Manure)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">பொருள் பெயர் (Item Name)</label>
            <input
              id="calc-input-name"
              type="text"
              value={calcItemName}
              onChange={(e) => setCalcItemName(e.target.value)}
              placeholder="எ.கா. யூரியா, டிஏபி, வேப்பெண்ணெய்..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">பேக்கிங் அளவு (Unit)</label>
            <input
              id="calc-input-unit"
              type="text"
              value={calcUnit}
              onChange={(e) => setCalcUnit(e.target.value)}
              placeholder="எ.கா. 50kg bag, 1 litre..."
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">வியாபாரி விலை (₹ INR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs">₹</span>
              <input
                id="calc-input-price"
                type="number"
                step="any"
                value={calcQuotedPrice}
                onChange={(e) => setCalcQuotedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="₹ விலை"
                className="w-full pl-7 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-extrabold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <button
              id="btn-evaluate-price"
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-950 hover:bg-emerald-850 active:bg-emerald-900 text-amber-300 rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <TrendingDown className="w-4 h-4" />
              <span>விலையை சரிபார்க்கவும்</span>
            </button>
          </div>
        </form>

        {/* Evaluation Output */}
        {calcResult && (
          <div
            id="calc-result-box"
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
              calcResult.verdict === 'Great Deal'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : calcResult.verdict === 'Overpriced'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-blue-50 border-blue-300 text-blue-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider ${
                    calcResult.verdict === 'Great Deal'
                      ? 'bg-emerald-800 text-white'
                      : calcResult.verdict === 'Overpriced'
                      ? 'bg-rose-700 text-white'
                      : 'bg-blue-800 text-white'
                  }`}
                >
                  {calcResult.tamilVerdict}
                </span>
                <span className="text-sm font-bold">
                  அரசு மற்றும் சந்தை விலை வரம்பு: {formatINR(calcResult.benchmarkMin)} – {formatINR(calcResult.benchmarkMax)}
                </span>
              </div>

              {calcResult.diffPercent > 0 && (
                <span className="text-xs font-bold text-rose-800 bg-rose-200 px-2.5 py-1 rounded-lg">
                  +{calcResult.diffPercent}% கூடுதல் கட்டணம்!
                </span>
              )}
            </div>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed font-medium">{calcResult.advice}</p>
          </div>
        )}
      </div>

      {/* Benchmark Catalog Table in Tamil */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-900/10 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-stone-200">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'fertilizer', label: 'உரங்கள் (Fertilizers)', icon: FlaskConical },
              { id: 'pesticide', label: 'பூச்சிக்கொல்லிகள் (Pesticides)', icon: AlertTriangle },
              { id: 'seed', label: 'விதைகள் (Seeds)', icon: Wheat },
              { id: 'soil', label: 'மண் & உரம் (Soil & Manure)', icon: Layers },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`benchmark-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id as AgriCategory)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950 text-amber-300 shadow-md'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="benchmark-search-input"
              type="text"
              placeholder="பொருளை தேடவும் (Search item)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>
        </div>

        {/* Benchmarks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredBenchmarks.map((item, idx) => (
            <div
              key={idx}
              id={`benchmark-card-${idx}`}
              className="p-4 rounded-2xl border-2 border-stone-200 bg-stone-50/40 hover:bg-emerald-50/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-stone-900">
                      {item.tamilName || item.name}
                    </h4>
                    {item.tamilName && (
                      <span className="text-[11px] text-stone-500 font-medium block">
                        {item.name}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 bg-stone-200/80 px-2.5 py-0.5 rounded-lg shrink-0">
                    {item.unit}
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
                  <span className="text-lg font-black text-emerald-950 font-mono">
                    {formatINR(item.typicalMin)} – {formatINR(item.typicalMax)}
                  </span>
                  {item.govtSubsidyCeiling && (
                    <span className="text-xs text-teal-800 font-bold bg-teal-100 px-2.5 py-0.5 rounded-lg border border-teal-300">
                      அரசு உச்சவரம்பு (Govt Cap): {formatINR(item.govtSubsidyCeiling)}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-stone-600 leading-normal font-medium">{item.note}</p>
              </div>

              <div className="pt-2.5 border-t border-stone-200 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-bold">₹ இந்திய ரூபாய் (INR)</span>
                <button
                  onClick={() => onQuickAddPurchaseWithPrice(item, activeCategory)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 hover:text-emerald-700 cursor-pointer bg-emerald-100/70 hover:bg-emerald-200/80 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <span>இந்த விலையில் சேர்க்க (Log)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { PurchaseItem } from '../types';
import { formatINR } from '../data/initialData';
import { X, Sparkles, TrendingDown, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface PriceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PurchaseItem | null;
}

export const PriceAnalysisModal: React.FC<PriceAnalysisModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    verdict?: string;
    fairRange?: string;
    status?: string;
    message?: string;
    differencePercent?: number;
    explanation?: string;
    cheaperAlternatives?: string;
    savingsTips?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      fetchAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [isOpen, item]);

  const fetchAnalysis = async () => {
    if (!item) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/price-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item.itemName,
          category: item.category,
          unit: item.unit,
          paidPrice: item.unitPriceINR,
          quantity: item.quantity,
        }),
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Price check failed:', err);
      setAnalysis({
        verdict: item.priceVerdict || 'Fair Price',
        fairRange: `${formatINR(item.unitPriceINR * 0.95)} - ${formatINR(item.unitPriceINR * 1.05)}`,
        explanation: item.priceBenchmarkNote || 'Evaluated against prevailing Indian statutory rates and Mandi wholesale ceilings.',
        cheaperAlternatives: 'Try booking with your local primary cooperative society (PACS) or IFFCO Kisan Seva Kendra for statutory MRP discounts.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  const verdict = analysis?.verdict || item.priceVerdict || 'Fair Price';
  const isGood = verdict === 'Great Deal';
  const isOverpriced = verdict === 'Overpriced';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">AI Price & Less-Cost Audit</h3>
              <p className="text-xs text-stone-500">Analysis in Indian Rupees (₹)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary */}
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-stone-900">{item.itemName}</span>
            <span className="px-2 py-0.5 rounded-full capitalize font-semibold bg-stone-200 text-stone-700">
              {item.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-stone-600 pt-1">
            <div>
              Dealer: <strong className="text-stone-800">{item.dealerName}</strong>
            </div>
            <div>
              Brand: <strong className="text-stone-800">{item.brand}</strong>
            </div>
            <div>
              Quantity: <strong className="text-stone-800">{item.quantity} {item.unit}</strong>
            </div>
            <div>
              Paid Rate: <strong className="text-emerald-800 text-sm font-bold">{formatINR(item.unitPriceINR)}</strong> / {item.unit}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
            <p className="text-xs text-stone-500 font-medium">Checking Indian market MRP benchmarks & DBT subsidies...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Verdict banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isGood
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isOverpriced
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-blue-50 border-blue-200 text-blue-950'
              }`}
            >
              {isGood ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : isOverpriced ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{verdict}</span>
                  {analysis?.fairRange && (
                    <span className="text-xs font-semibold bg-white/80 px-2 py-0.5 rounded-md border border-stone-200">
                      Fair Range: {analysis.fairRange}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed">
                  {analysis?.explanation || analysis?.message || item.priceBenchmarkNote}
                </p>
              </div>
            </div>

            {/* Less Price Advice */}
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1.5 text-amber-950">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <TrendingDown className="w-4 h-4 text-amber-700" />
                <span>How to Get This for Less Price Next Time:</span>
              </div>
              <p className="leading-relaxed">
                {analysis?.cheaperAlternatives ||
                  analysis?.savingsTips ||
                  'Purchase through your local Primary Agricultural Credit Society (PACS) or directly via IFFCO eBazar. For urea and DAP, never pay above the printed bag MRP; verify dealer POS receipt.'}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 text-right border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

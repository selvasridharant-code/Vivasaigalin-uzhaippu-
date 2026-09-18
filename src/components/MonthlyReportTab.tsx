import React, { useState } from 'react';
import { PurchaseItem, UsageSchedule, FarmProfile, AgriCategory } from '../types';
import { formatINR } from '../data/initialData';
import { 
  FileText, 
  Printer, 
  Download, 
  IndianRupee, 
  Calendar, 
  PieChart, 
  TrendingDown, 
  CheckCircle2, 
  ShieldCheck, 
  PackageCheck,
  Sparkles,
  Layers,
  Wheat,
  FlaskConical,
  AlertTriangle,
  Smartphone
} from 'lucide-react';

interface MonthlyReportTabProps {
  purchases: PurchaseItem[];
  schedules: UsageSchedule[];
  farmProfile: FarmProfile;
  onAskAiForSavings: (context: any) => void;
}

export const MonthlyReportTab: React.FC<MonthlyReportTabProps> = ({
  purchases,
  schedules,
  farmProfile,
  onAskAiForSavings,
}) => {
  // Current month default: 2026-09
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  // Filter purchases for selected month
  const monthlyPurchases = purchases.filter((p) => p.date.startsWith(selectedMonth));

  // Filter schedules for selected month
  const monthlySchedules = schedules.filter((s) => s.plannedDate.startsWith(selectedMonth));
  const completedSchedules = monthlySchedules.filter((s) => s.status === 'completed');

  // Expenditure sums by category
  const categoryTotals: Record<AgriCategory, number> = {
    fertilizer: 0,
    pesticide: 0,
    seed: 0,
    soil: 0,
  };

  monthlyPurchases.forEach((p) => {
    categoryTotals[p.category] = (categoryTotals[p.category] || 0) + p.totalCostINR;
  });

  const totalMonthlySpend = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Subsidized count & estimated savings
  const subsidizedPurchases = monthlyPurchases.filter((p) => p.isSubsidized);
  const estimatedSubsidySavings = monthlyPurchases.reduce((sum, p) => {
    if (p.mrpPrintedINR && p.mrpPrintedINR > p.unitPriceINR) {
      return sum + (p.mrpPrintedINR - p.unitPriceINR) * p.quantity;
    }
    // Subsidized fertilizers like Urea have massive govt backing
    if (p.category === 'fertilizer' && p.isSubsidized) {
      return sum + (p.quantity * 250); // benchmark saving vs non-subsidized / black market
    }
    return sum;
  }, 0);

  const costPerAcre = farmProfile.totalLandAcres > 0 ? totalMonthlySpend / farmProfile.totalLandAcres : 0;

  // Format month name (e.g., September 2026 / செப்டம்பர் 2026)
  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('ta-IN', { month: 'long', year: 'numeric' });
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Item Name (Tamil)', 'Brand', 'Dealer', 'Quantity', 'Unit', 'Unit Price (INR)', 'Total Cost (INR)', 'Payment Status', 'Subsidized'];
    const rows = monthlyPurchases.map((p) => [
      p.date,
      p.category,
      `"${p.tamilName || p.itemName}"`,
      `"${p.brand}"`,
      `"${p.dealerName}"`,
      p.quantity,
      p.unit,
      p.unitPriceINR,
      p.totalCostINR,
      p.paymentStatus === 'paid' ? 'Paid (UPI/GPay)' : 'Pending',
      p.isSubsidized ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vivasaigalin_Uzhaippu_Report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-tamil">
      {/* Month Selector and Action Toolbar */}
      <div className="bg-white rounded-3xl p-5 border-2 border-emerald-900/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-900 text-amber-300 rounded-2xl shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900">
              மாதாந்திர விவசாய வரவு-செலவு & பயன்பாட்டு அறிக்கை
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              இந்திய ரூபாய் (₹) மற்றும் உழவர் பயன்பாட்டு அட்டவணை விவரங்கள்
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month picker */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-950">
            <Calendar className="w-4 h-4 text-emerald-800" />
            <label htmlFor="month-select" className="text-stone-600">மாதம்:</label>
            <input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-emerald-950 font-extrabold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold border border-stone-300 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>அச்சிடுக (Print)</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>பதிவிறக்கு (CSV)</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div id="printable-monthly-report" className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-900/10 shadow-xl space-y-6">
        {/* Report Header */}
        <div className="border-b-2 border-emerald-900/10 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black tracking-widest text-emerald-800 uppercase bg-emerald-100/70 px-3 py-1 rounded-full">
                விவசாயிகளின் உழைப்பு • KISAN AGRI-EXPENSE STATEMENT
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight mt-2">
                {formatMonthName(selectedMonth)} மாத அறிக்கை
              </h2>
              <p className="text-xs text-stone-600 mt-1.5 font-medium">
                பண்ணை: <strong className="text-emerald-950 font-bold">{farmProfile.farmName}</strong> | 
                விவசாயி: <strong className="text-emerald-950 font-bold">{farmProfile.farmerName}</strong> | 
                ஊர்: <strong className="text-emerald-950 font-bold">{farmProfile.villageState}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                இம்மாத மொத்தச் செலவு (Total Expenditure)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono mt-0.5">
                {formatINR(totalMonthlySpend)}
              </div>
              <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                அனைத்து தொகைகளும் இந்திய ரூபாயில் (₹ INR)
              </span>
            </div>
          </div>
        </div>

        {/* 4 Key KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs font-bold text-stone-500 block">ஏக்கருக்கு சராசரி செலவு</span>
            <div className="text-xl font-extrabold text-stone-900 font-mono mt-1">{formatINR(costPerAcre)}</div>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">மொத்த நிலம்: {farmProfile.totalLandAcres} ஏக்கர்</p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 block">அரசு மானிய மிச்சம்</span>
            <div className="text-xl font-extrabold text-emerald-950 font-mono mt-1">+{formatINR(estimatedSubsidySavings)}</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">{subsidizedPurchases.length} மானியப் பொருட்கள்</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs font-bold text-stone-500 block">மொத்த கொள்முதல்கள்</span>
            <div className="text-xl font-extrabold text-stone-900 font-mono mt-1">{monthlyPurchases.length} ரசீதுகள்</div>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">{formatMonthName(selectedMonth)} மாதத்தில்</p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs font-bold text-stone-500 block">பயன்பாட்டு அட்டவணை நிறைவு</span>
            <div className="text-xl font-extrabold text-emerald-850 font-mono mt-1">
              {completedSchedules.length} / {monthlySchedules.length}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">
              {monthlySchedules.length > 0 
                ? `${Math.round((completedSchedules.length / monthlySchedules.length) * 100)}% வயலில் இடப்பட்டது`
                : 'அட்டவணை இல்லை'}
            </p>
          </div>
        </div>

        {/* Input Category Breakdown Visualizer */}
        <div className="bg-stone-50/70 rounded-2xl p-5 border border-stone-200 space-y-4">
          <h4 className="text-sm font-extrabold text-stone-800 flex items-center justify-between">
            <span>இடுபொருள் பிரிவு வாரியாக செலவு விவரம்:</span>
            <span className="text-xs text-emerald-850 font-bold font-mono">மொத்தம்: {formatINR(totalMonthlySpend)}</span>
          </h4>

          {/* Progress bar split */}
          {totalMonthlySpend > 0 ? (
            <div className="h-4 w-full bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
              {(['fertilizer', 'soil', 'seed', 'pesticide'] as AgriCategory[]).map((cat) => {
                const amount = categoryTotals[cat];
                if (amount === 0) return null;
                const percent = (amount / totalMonthlySpend) * 100;
                const colors = {
                  fertilizer: 'bg-emerald-700',
                  soil: 'bg-stone-600',
                  seed: 'bg-amber-500',
                  pesticide: 'bg-rose-600'
                };
                return (
                  <div
                    key={cat}
                    style={{ width: `${percent}%` }}
                    className={`${colors[cat]} transition-all`}
                    title={`${cat}: ${formatINR(amount)} (${percent.toFixed(1)}%)`}
                  />
                );
              })}
            </div>
          ) : null}

          {/* Category badges in Tamil */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'fertilizer', name: 'உரங்கள் (Fertilizer)', icon: FlaskConical, color: 'text-emerald-950 bg-emerald-50 border-emerald-300' },
              { id: 'pesticide', name: 'மருந்துகள் (Pesticide)', icon: AlertTriangle, color: 'text-rose-950 bg-rose-50 border-rose-300' },
              { id: 'seed', name: 'விதைகள் (Seeds)', icon: Wheat, color: 'text-amber-950 bg-amber-50 border-amber-300' },
              { id: 'soil', name: 'மண் & எரு (Soil & Manure)', icon: Layers, color: 'text-stone-900 bg-stone-100 border-stone-300' },
            ].map((cat) => {
              const amount = categoryTotals[cat.id as AgriCategory];
              const pct = totalMonthlySpend > 0 ? ((amount / totalMonthlySpend) * 100).toFixed(1) : '0';
              const Icon = cat.icon;
              return (
                <div key={cat.id} className={`p-3.5 rounded-xl border-2 ${cat.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">{cat.name}</div>
                      <div className="text-sm font-extrabold mt-1 font-mono">{formatINR(amount)}</div>
                    </div>
                  </div>
                  <span className="text-xs font-black opacity-80">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table 1: Purchases in this Month with UPI and Tamil names */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-stone-900">
            {formatMonthName(selectedMonth)} மாதத்தில் வாங்கிய இடுபொருட்கள்:
          </h4>
          {monthlyPurchases.length === 0 ? (
            <p className="text-xs text-stone-500 italic p-6 bg-stone-50 rounded-2xl text-center">
              இம்மாதத்தில் பதிவுகள் எதுவும் இல்லை.
            </p>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-100 text-stone-800 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">தேதி</th>
                    <th className="px-4 py-3">பிரிவு</th>
                    <th className="px-4 py-3">பொருள் விபரம்</th>
                    <th className="px-4 py-3">அங்காடி / வியாபாரி</th>
                    <th className="px-4 py-3 text-center">கட்டணம் (UPI)</th>
                    <th className="px-4 py-3 text-right">அளவு</th>
                    <th className="px-4 py-3 text-right">விலை (₹)</th>
                    <th className="px-4 py-3 text-right">மொத்தம் (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {monthlyPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50/40">
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-stone-800 font-mono">{p.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap capitalize">
                        {p.category === 'fertilizer' ? 'உரம்' : p.category === 'pesticide' ? 'மருந்து' : p.category === 'seed' ? 'விதை' : 'மண்'}
                      </td>
                      <td className="px-4 py-3 font-bold text-stone-950">
                        {p.tamilName || p.itemName}
                        {p.isSubsidized && (
                          <span className="ml-1.5 text-[10px] text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded-sm font-bold">
                            அரசு மானியம்
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{p.brand} • {p.dealerName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          <Smartphone className="w-3 h-3" />
                          {p.paymentStatus === 'paid' ? 'Paid (UPI)' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-stone-900">{p.quantity} {p.unit}</td>
                      <td className="px-4 py-3 text-right text-stone-600 font-mono">{formatINR(p.unitPriceINR)}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-stone-950 font-mono">{formatINR(p.totalCostINR)}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50 font-extrabold text-emerald-950 border-t-2 border-emerald-900/20">
                    <td colSpan={7} className="px-4 py-3.5 text-right">இம்மாத மொத்தத் தொகை (Total Spend):</td>
                    <td className="px-4 py-3.5 text-right text-emerald-950 text-sm font-mono">{formatINR(totalMonthlySpend)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table 2: Field Usage & Schedule Log in Tamil */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-stone-900">
            பயன்பாட்டு அட்டவணை & நிலத்தில் இட்ட விபரம் (Usage Schedule Audit):
          </h4>
          {monthlySchedules.length === 0 ? (
            <p className="text-xs text-stone-500 italic p-6 bg-stone-50 rounded-2xl text-center">
              இம்மாதத்தில் பயன்பாட்டு அட்டவணைகள் எதுவும் இல்லை.
            </p>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-100 text-stone-800 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">திட்டமிட்ட தேதி</th>
                    <th className="px-4 py-3">வயல் / பரப்பு</th>
                    <th className="px-4 py-3">பயிர் & பருவம்</th>
                    <th className="px-4 py-3">இடப்பட்ட உரம்/மருந்து</th>
                    <th className="px-4 py-3">அளவு / ஏக்கர்</th>
                    <th className="px-4 py-3">முறை</th>
                    <th className="px-4 py-3 text-center">நிலை</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {monthlySchedules.map((s) => (
                    <tr key={s.id} className="hover:bg-emerald-50/40">
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-stone-900 font-mono">{s.plannedDate}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{s.plotName} ({s.plotSizeAcres} ஏக்)</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-stone-900">{s.cropName}</span>
                        <span className="block text-[11px] text-stone-500 font-medium">{s.cropStage}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-950">{s.itemName}</td>
                      <td className="px-4 py-3 font-bold">{s.plannedDosagePerAcre}</td>
                      <td className="px-4 py-3 text-stone-600">{s.applicationMethod}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                            s.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : s.status === 'skipped'
                              ? 'bg-stone-100 text-stone-600'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {s.status === 'completed' ? 'இடப்பட்டது ✓' : s.status === 'skipped' ? 'தவிர்க்கப்பட்டது' : 'நிலுவை'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Analysis Quick Callout in Tamil */}
        <div className="bg-gradient-to-r from-emerald-900 to-green-950 text-white rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden shadow-lg border border-emerald-500/20">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-400 text-emerald-950 rounded-2xl shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-extrabold text-white">
                விவசாய ஆலோசனையாளர் மூலம் மாதாந்திர செலவை ஆய்வு செய்யுங்கள்
              </h5>
              <p className="text-xs text-emerald-200 mt-0.5">
                அடுத்த மாத செலவில் 25% மிச்சப்படுத்தவும், மாற்று மானிய உரங்கள் பரிந்துரை பெறவும் AI ஆலோசனையைப் பெறுங்கள்.
              </p>
            </div>
          </div>
          <button
            id="btn-ai-audit-report"
            onClick={() =>
              onAskAiForSavings({
                month: selectedMonth,
                totalSpend: totalMonthlySpend,
                categories: categoryTotals,
                purchasesCount: monthlyPurchases.length,
              })
            }
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-emerald-950 text-xs font-black rounded-xl whitespace-nowrap shadow-md transition-all cursor-pointer shrink-0"
          >
            AI ஆலோசகரிடம் கேட்க (Review with AI)
          </button>
        </div>

        {/* Report Signoff Footer */}
        <div className="border-t-2 border-stone-200 pt-6 text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-2 font-medium">
          <span>விவசாயிகளின் உழைப்பு (Vivasaigalin uzhaippu) - இந்திய உழவர் தளம்</span>
          <span>விவசாயி கையொப்பம் / ஒப்புதல்: ______________________</span>
        </div>
      </div>
    </div>
  );
};

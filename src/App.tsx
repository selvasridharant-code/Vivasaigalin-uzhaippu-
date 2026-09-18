import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PurchasesTab } from './components/PurchasesTab';
import { ScheduleTab } from './components/ScheduleTab';
import { MonthlyReportTab } from './components/MonthlyReportTab';
import { PriceBenchmarkTab } from './components/PriceBenchmarkTab';
import { AiAdvisorTab } from './components/AiAdvisorTab';
import { AddPurchaseModal } from './components/AddPurchaseModal';
import { AddScheduleModal } from './components/AddScheduleModal';
import { PriceAnalysisModal } from './components/PriceAnalysisModal';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { DEFAULT_FARM_PROFILE, INITIAL_PURCHASES, INITIAL_SCHEDULES } from './data/initialData';
import { FarmProfile, PurchaseItem, UsageSchedule, AgriCategory, PriceBenchmark } from './types';
import { Check, ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';

export default function App() {
  // Load state from localStorage or initial seed
  const [farmProfile, setFarmProfile] = useState<FarmProfile>(() => {
    try {
      const saved = localStorage.getItem('kisankhata_profile');
      return saved ? JSON.parse(saved) : DEFAULT_FARM_PROFILE;
    } catch {
      return DEFAULT_FARM_PROFILE;
    }
  });

  const [purchases, setPurchases] = useState<PurchaseItem[]>(() => {
    try {
      const saved = localStorage.getItem('kisankhata_purchases');
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
    } catch {
      return INITIAL_PURCHASES;
    }
  });

  const [schedules, setSchedules] = useState<UsageSchedule[]>(() => {
    try {
      const saved = localStorage.getItem('kisankhata_schedules');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
    } catch {
      return INITIAL_SCHEDULES;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('purchases');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [payingItem, setPayingItem] = useState<PurchaseItem | null>(null);
  const [analyzingItem, setAnalyzingItem] = useState<PurchaseItem | null>(null);
  const [prefillPurchaseForSchedule, setPrefillPurchaseForSchedule] = useState<PurchaseItem | null>(null);
  const [prefillBenchmarkForPurchase, setPrefillBenchmarkForPurchase] = useState<{
    name: string;
    tamilName?: string;
    category: AgriCategory;
    unit: string;
    price: number;
  } | null>(null);
  const [advisorInitialQuery, setAdvisorInitialQuery] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kisankhata_profile', JSON.stringify(farmProfile));
      localStorage.setItem('kisankhata_purchases', JSON.stringify(purchases));
      localStorage.setItem('kisankhata_schedules', JSON.stringify(schedules));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }, [farmProfile, purchases, schedules]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers
  const handleAddPurchase = (newItem: Omit<PurchaseItem, 'id' | 'remainingQuantity'>) => {
    const id = `pur-${Date.now()}`;
    const purchase: PurchaseItem = {
      ...newItem,
      id,
      remainingQuantity: newItem.quantity,
    };
    setPurchases((prev) => [purchase, ...prev]);
    showToast(`${purchase.tamilName || purchase.itemName} வெற்றிகரமாக சேர்க்கப்பட்டது!`);
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    showToast('கொள்முதல் பதிவு நீக்கப்பட்டது.');
  };

  const handleOpenUpiModal = (item: PurchaseItem) => {
    setPayingItem(item);
    setIsUpiModalOpen(true);
  };

  const handlePaymentSuccess = (
    itemId: string,
    method: 'GPay' | 'PhonePe' | 'Paytm' | 'BHIM',
    upiTxnId: string
  ) => {
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id === itemId) {
          return {
            ...p,
            paymentStatus: 'paid',
            paymentMethod: method,
            upiRefId: upiTxnId,
          };
        }
        return p;
      })
    );
    showToast(`கட்டணம் வெற்றிகரமாக பதிவு செய்யப்பட்டது! (${method} - ${upiTxnId})`);
  };

  const handleAddSchedule = (newSchedule: Omit<UsageSchedule, 'id'>) => {
    const id = `sch-${Date.now()}`;
    const schedule: UsageSchedule = {
      ...newSchedule,
      id,
    };
    setSchedules((prev) => [schedule, ...prev]);

    // If marked completed right away and linked to inventory, deduct quantity
    if (schedule.status === 'completed' && schedule.purchaseItemId) {
      setPurchases((prev) =>
        prev.map((p) => {
          if (p.id === schedule.purchaseItemId) {
            return {
              ...p,
              remainingQuantity: Math.max(0, p.remainingQuantity - schedule.totalQuantity),
            };
          }
          return p;
        })
      );
    }

    showToast(`${schedule.cropName} பயிருக்கான அட்டவணை சேர்க்கப்பட்டது.`);
  };

  const handleUpdateScheduleStatus = (
    id: string,
    newStatus: 'scheduled' | 'completed' | 'skipped'
  ) => {
    const target = schedules.find((s) => s.id === id);
    if (!target) return;

    // If changing to completed, deduct stock
    if (newStatus === 'completed' && target.status !== 'completed' && target.purchaseItemId) {
      setPurchases((prev) =>
        prev.map((p) => {
          if (p.id === target.purchaseItemId) {
            return {
              ...p,
              remainingQuantity: Math.max(0, p.remainingQuantity - target.totalQuantity),
            };
          }
          return p;
        })
      );
      showToast(`${target.itemName} வயலில் இடப்பட்டது; இருப்பு குறைக்கப்பட்டது.`);
    } else if (newStatus === 'scheduled' && target.status === 'completed' && target.purchaseItemId) {
      // Undo deduction
      setPurchases((prev) =>
        prev.map((p) => {
          if (p.id === target.purchaseItemId) {
            return {
              ...p,
              remainingQuantity: p.remainingQuantity + target.totalQuantity,
            };
          }
          return p;
        })
      );
      showToast(`${target.itemName} மீண்டும் அட்டவணைக்கு மாற்றப்பட்டது.`);
    }

    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return s;
      })
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    showToast('அட்டவணைப் பணி நீக்கப்பட்டது.');
  };

  const handleScheduleFromPurchase = (item: PurchaseItem) => {
    setPrefillPurchaseForSchedule(item);
    setIsAddScheduleOpen(true);
  };

  const handleCheckPrice = (item: PurchaseItem) => {
    setAnalyzingItem(item);
    setIsPriceModalOpen(true);
  };

  const handleQuickAddFromBenchmark = (benchmark: PriceBenchmark, category: AgriCategory) => {
    setPrefillBenchmarkForPurchase({
      name: benchmark.name,
      tamilName: benchmark.tamilName,
      category,
      unit: benchmark.unit,
      price: benchmark.govtSubsidyCeiling || benchmark.typicalMin,
    });
    setIsAddPurchaseOpen(true);
  };

  const handleAskAiForSavings = (context: any) => {
    setAdvisorInitialQuery(
      `Please review my farm expenses for ${context.month} where I spent ₹${context.totalSpend}. How can I reduce my input budget by at least 25% next season using cheaper alternatives, DBT subsidies, and timely application schedules?`
    );
    setActiveTab('advisor');
  };

  return (
    <div className="min-h-screen bg-[#f3f8f4] text-stone-900 font-sans flex flex-col font-tamil">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gradient-to-r from-emerald-950 to-green-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        farmProfile={farmProfile}
        onOpenAddPurchase={() => {
          setPrefillBenchmarkForPurchase(null);
          setIsAddPurchaseOpen(true);
        }}
        onOpenAddSchedule={() => {
          setPrefillPurchaseForSchedule(null);
          setIsAddScheduleOpen(true);
        }}
        onQuickUpiClick={() => {
          // Open UPI payment for first item or pending item
          const target = purchases.find((p) => p.paymentStatus !== 'paid') || purchases[0];
          if (target) {
            handleOpenUpiModal(target);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'purchases' && (
          <PurchasesTab
            purchases={purchases}
            onOpenAddModal={() => {
              setPrefillBenchmarkForPurchase(null);
              setIsAddPurchaseOpen(true);
            }}
            onDeletePurchase={handleDeletePurchase}
            onScheduleUsage={handleScheduleFromPurchase}
            onCheckItemPrice={handleCheckPrice}
            onPayWithUpi={handleOpenUpiModal}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            schedules={schedules}
            onOpenAddModal={() => {
              setPrefillPurchaseForSchedule(null);
              setIsAddScheduleOpen(true);
            }}
            onUpdateStatus={handleUpdateScheduleStatus}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}

        {activeTab === 'report' && (
          <MonthlyReportTab
            purchases={purchases}
            schedules={schedules}
            farmProfile={farmProfile}
            onAskAiForSavings={handleAskAiForSavings}
          />
        )}

        {activeTab === 'pricing' && (
          <PriceBenchmarkTab
            onQuickAddPurchaseWithPrice={handleQuickAddFromBenchmark}
          />
        )}

        {activeTab === 'advisor' && (
          <AiAdvisorTab
            farmProfile={farmProfile}
            initialQuery={advisorInitialQuery}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-900/10 py-5 text-center text-xs text-stone-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-950 font-tamil text-sm">
              Vivasaigalin uzhaippu (விவசாயிகளின் உழைப்பு)
            </span>
            <span className="text-emerald-700 font-medium">
              • உழவர்களுக்கு நியாயமான விலையில் இடுபொருட்கள் & மாதாந்திர அறிக்கை
            </span>
          </div>
          <div className="flex items-center gap-2 text-stone-400 font-medium text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              ₹ இந்திய ரூபாய் (INR)
            </span>
            <span>GPay & UPI உடனடி கட்டணம் ஒருங்கிணைக்கப்பட்டது</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddPurchaseModal
        isOpen={isAddPurchaseOpen}
        onClose={() => {
          setIsAddPurchaseOpen(false);
          setPrefillBenchmarkForPurchase(null);
        }}
        onAddPurchase={handleAddPurchase}
        prefillItem={prefillBenchmarkForPurchase}
      />

      <AddScheduleModal
        isOpen={isAddScheduleOpen}
        onClose={() => {
          setIsAddScheduleOpen(false);
          setPrefillPurchaseForSchedule(null);
        }}
        farmProfile={farmProfile}
        purchases={purchases}
        onAddSchedule={handleAddSchedule}
        prefillFromPurchase={prefillPurchaseForSchedule}
      />

      <PriceAnalysisModal
        isOpen={isPriceModalOpen}
        onClose={() => {
          setIsPriceModalOpen(false);
          setAnalyzingItem(null);
        }}
        item={analyzingItem}
      />

      {/* UPI & GPay Payment Modal */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => {
          setIsUpiModalOpen(false);
          setPayingItem(null);
        }}
        item={payingItem}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

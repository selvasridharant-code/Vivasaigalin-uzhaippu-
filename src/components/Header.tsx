import React from 'react';
import { Sprout, IndianRupee, Calendar, TrendingDown, FileText, Sparkles, Plus, Smartphone } from 'lucide-react';
import { FarmProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  farmProfile: FarmProfile;
  onOpenAddPurchase: () => void;
  onOpenAddSchedule: () => void;
  onQuickUpiClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  farmProfile,
  onOpenAddPurchase,
  onOpenAddSchedule,
  onQuickUpiClick,
}) => {
  const tabs = [
    { id: 'purchases', label: 'பொருட்கள் & இருப்பு (Purchases)', icon: IndianRupee },
    { id: 'schedule', label: 'உர அட்டவணை (Usage Schedule)', icon: Calendar },
    { id: 'report', label: 'மாத அறிக்கை (Monthly Report)', icon: FileText },
    { id: 'pricing', label: 'குறைந்த விலை (Less Price Finder)', icon: TrendingDown },
    { id: 'advisor', label: 'வேளாண் ஆலோசகர் (AI Advisor)', icon: Sparkles },
  ];

  return (
    <header className="bg-gradient-to-r from-[#072412] via-[#0d381e] to-[#072412] text-white shadow-xl border-b border-emerald-800/80 sticky top-0 z-30 font-tamil">
      {/* Top Banner with Farmer & Location info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-800 to-green-600 p-2.5 rounded-2xl text-amber-300 border border-emerald-500/50 shadow-md">
            <Sprout className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Vivasaigalin uzhaippu
                <span className="text-sm sm:text-base font-bold text-amber-300">
                  (விவசாயிகளின் உழைப்பு)
                </span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                தமிழ்நாடு உழவர் தளம்
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 font-medium">
              {farmProfile.farmName} • {farmProfile.farmerName} • {farmProfile.totalLandAcres} ஏக்கர் ({farmProfile.villageState})
            </p>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Integrated GPay / UPI Badge */}
          <div
            onClick={onQuickUpiClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-xs text-emerald-200 cursor-pointer hover:bg-emerald-900 transition-colors shadow-xs"
            title="GPay & UPI Payment System Enabled"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-blue-600 shadow-2xs">
              G
            </div>
            <div className="flex items-center gap-1 font-semibold text-white">
              <span>GPay & UPI</span>
              <span className="text-[10px] text-amber-300 font-bold px-1.5 py-0.2 rounded bg-amber-400/20">
                ₹ INR
              </span>
            </div>
          </div>

          <button
            id="header-btn-add-purchase"
            onClick={onOpenAddPurchase}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-emerald-950 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>புதிய கொள்முதல் (Add Purchase)</span>
          </button>

          <button
            id="header-btn-add-schedule"
            onClick={onOpenAddSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold border border-emerald-500/50 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>அட்டவணை (Add Schedule)</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-800 to-green-800 text-amber-300 shadow-md border border-amber-400/40 ring-1 ring-amber-400/20'
                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

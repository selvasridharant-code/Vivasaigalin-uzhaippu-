import React, { useState } from 'react';
import { UsageSchedule } from '../types';
import { formatINR } from '../data/initialData';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  FlaskConical, 
  Wheat, 
  Layers, 
  ShieldAlert, 
  MapPin, 
  Trash2,
  Check,
  X
} from 'lucide-react';

interface ScheduleTabProps {
  schedules: UsageSchedule[];
  onOpenAddModal: () => void;
  onUpdateStatus: (id: string, newStatus: 'scheduled' | 'completed' | 'skipped') => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  schedules,
  onOpenAddModal,
  onUpdateStatus,
  onDeleteSchedule,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlot, setFilterPlot] = useState<string>('all');

  // Distinct plots
  const plots = Array.from(new Set(schedules.map((s) => s.plotName)));

  const filtered = schedules.filter((s) => {
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchPlot = filterPlot === 'all' || s.plotName === filterPlot;
    return matchStatus && matchPlot;
  });

  const scheduledCount = schedules.filter((s) => s.status === 'scheduled').length;
  const completedCount = schedules.filter((s) => s.status === 'completed').length;
  const skippedCount = schedules.filter((s) => s.status === 'skipped').length;

  // Sort upcoming first by planned date
  const sortedSchedules = [...filtered].sort((a, b) => {
    return new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime();
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fertilizer': return <FlaskConical className="w-4 h-4 text-emerald-800" />;
      case 'pesticide': return <ShieldAlert className="w-4 h-4 text-rose-700" />;
      case 'seed': return <Wheat className="w-4 h-4 text-amber-700" />;
      default: return <Layers className="w-4 h-4 text-stone-700" />;
    }
  };

  const getCategoryTamil = (category: string) => {
    switch (category) {
      case 'fertilizer': return 'உரம்';
      case 'pesticide': return 'பூச்சிக்கொல்லி';
      case 'seed': return 'விதை';
      default: return 'மண் / எரு';
    }
  };

  return (
    <div className="space-y-6 font-tamil">
      {/* Top metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-900/10 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">திட்டமிட்ட பயன்பாடுகள்</span>
            <div className="text-2xl font-black text-amber-700 font-mono mt-1">{scheduledCount} பணிகள்</div>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">வயலில் இடத் தயாராக உள்ளவை</p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-900/10 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">நிறைவடைந்த பணிகள்</span>
            <div className="text-2xl font-black text-emerald-850 font-mono mt-1">{completedCount} இடப்பட்டது</div>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">மாதாந்திர அறிக்கையில் பதியப்பட்டது</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-900/10 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">தவிர்க்கப்பட்டவை / மாற்றம்</span>
            <div className="text-2xl font-black text-stone-700 font-mono mt-1">{skippedCount} பணிகள்</div>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">மழை அல்லது வானிலை மாற்றம்</p>
          </div>
          <div className="p-3.5 bg-stone-100 text-stone-600 rounded-2xl border border-stone-200">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-emerald-900/10 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filters */}
          <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl">
            {[
              { id: 'all', label: 'அனைத்தும் (All)' },
              { id: 'scheduled', label: 'திட்டம் (Upcoming)' },
              { id: 'completed', label: 'முடிந்தது (Done)' },
              { id: 'skipped', label: 'தவிர்த்தவை (Skipped)' },
            ].map((st) => (
              <button
                key={st.id}
                id={`schedule-filter-${st.id}`}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-emerald-900 text-amber-300 shadow-sm'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Plot filter */}
          {plots.length > 0 && (
            <select
              id="schedule-filter-plot"
              value={filterPlot}
              onChange={(e) => setFilterPlot(e.target.value)}
              className="px-3 py-2 text-xs bg-emerald-50/70 border border-emerald-300 rounded-xl text-stone-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="all">அனைத்து வயல் நிலங்கள்</option>
              {plots.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          id="schedule-btn-add"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>புதிய அட்டவணை சேர்க்க (+ Schedule)</span>
        </button>
      </div>

      {/* Schedule Items Timeline */}
      <div className="space-y-3">
        {sortedSchedules.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-emerald-300">
            <Calendar className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-stone-800">அட்டவணை பணிகள் எதுவும் இல்லை</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mt-1 font-medium">
              உரங்கள் மேலுரமிடுதல், பூச்சி மருந்து தெளிப்பு, விதைப்பு அல்லது நில தயாரிப்பு பணிகளை குறித்த நேரத்தில் திட்டமிடுங்கள்.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-sm font-black rounded-2xl shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> புதிய அட்டவணை உருவாக்க
            </button>
          </div>
        ) : (
          sortedSchedules.map((schedule) => {
            const isDueSoon =
              schedule.status === 'scheduled' &&
              new Date(schedule.plannedDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={schedule.id}
                id={`schedule-item-${schedule.id}`}
                className={`bg-white rounded-3xl p-5 border-2 transition-all ${
                  schedule.status === 'completed'
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : isDueSoon
                    ? 'border-amber-400 shadow-md ring-2 ring-amber-200'
                    : 'border-emerald-900/10 shadow-sm hover:border-emerald-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {getCategoryIcon(schedule.category)}
                        <span>{getCategoryTamil(schedule.category)}</span>
                      </span>

                      <h4 className="text-base font-extrabold text-stone-950">
                        {schedule.itemName}
                      </h4>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          schedule.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : schedule.status === 'skipped'
                            ? 'bg-stone-100 text-stone-600 border-stone-300'
                            : isDueSoon
                            ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {schedule.status === 'completed'
                          ? '✓ இடப்பட்டது'
                          : schedule.status === 'skipped'
                          ? '⊘ தவிர்க்கப்பட்டது'
                          : isDueSoon
                          ? '⚠️ விரைவில்'
                          : '⏱ திட்டமிடப்பட்டது'}
                      </span>

                      <span className="text-xs text-stone-600 font-semibold px-2.5 py-0.5 bg-stone-100 rounded-md">
                        {schedule.applicationMethod}
                      </span>
                    </div>

                    {/* Field & Crop info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 font-medium">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                        நிலம்: <strong className="text-emerald-950 font-bold">{schedule.plotName}</strong> ({schedule.plotSizeAcres} ஏக்கர்)
                      </span>
                      <span>•</span>
                      <span>
                        பயிர்: <strong className="text-emerald-950 font-bold">{schedule.cropName}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        பருவம்: <strong className="text-emerald-800 font-bold">{schedule.cropStage}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        அளவு/ஏக்கர்: <strong className="text-stone-900 font-bold">{schedule.plannedDosagePerAcre}</strong>
                      </span>
                    </div>

                    {/* Safety / notes */}
                    {(schedule.safetyPrecaution || schedule.notes) && (
                      <div className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200 space-y-1">
                        {schedule.safetyPrecaution && (
                          <p className="flex items-center gap-1.5 text-amber-900 font-bold">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            பாதுகாப்பு குறிப்பு: {schedule.safetyPrecaution}
                          </p>
                        )}
                        {schedule.notes && <p className="text-stone-600 italic">குறிப்பு: {schedule.notes}</p>}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Date, Cost, and Actions */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 gap-2 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center sm:justify-end gap-1.5 text-xs text-stone-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                        <span>தேதி: <strong className="text-stone-900 font-mono font-bold">{schedule.plannedDate}</strong></span>
                      </div>
                      <div className="text-sm font-black text-stone-900 mt-0.5">
                        அளவு: {schedule.totalQuantity} {schedule.unit}
                      </div>
                      {schedule.costINR !== undefined && (
                        <div className="text-xs text-emerald-850 font-extrabold font-mono mt-0.5">
                          மதிப்பீடு: {formatINR(schedule.costINR)}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {schedule.status !== 'completed' && (
                        <button
                          id={`btn-complete-schedule-${schedule.id}`}
                          onClick={() => onUpdateStatus(schedule.id, 'completed')}
                          title="Mark applied on field"
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>முடிந்தது</span>
                        </button>
                      )}

                      {schedule.status === 'scheduled' && (
                        <button
                          id={`btn-skip-schedule-${schedule.id}`}
                          onClick={() => onUpdateStatus(schedule.id, 'skipped')}
                          title="Skip this schedule"
                          className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      {schedule.status === 'completed' && (
                        <button
                          id={`btn-reopen-schedule-${schedule.id}`}
                          onClick={() => onUpdateStatus(schedule.id, 'scheduled')}
                          title="Revert to scheduled"
                          className="px-2.5 py-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer font-bold"
                        >
                          மீட்டமை
                        </button>
                      )}

                      <button
                        id={`btn-delete-schedule-${schedule.id}`}
                        onClick={() => onDeleteSchedule(schedule.id)}
                        title="Delete schedule"
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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


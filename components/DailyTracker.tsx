
import React from 'react';
import { DailyProgress } from '../types';

interface Props {
  day: number;
  data: DailyProgress;
  onUpdate: (data: Partial<DailyProgress>) => void;
  onBadgeEarned: (badge: string) => void;
}

const DailyTracker: React.FC<Props> = ({ day, data, onUpdate, onBadgeEarned }) => {
  const togglePrayer = (prayer: keyof DailyProgress['prayers']) => {
    const newPrayers = { ...data.prayers, [prayer]: !data.prayers[prayer] };
    onUpdate({ prayers: newPrayers });

    const count = (Object.values(newPrayers) as boolean[]).filter(Boolean).length;
    if (count === 5) onBadgeEarned('Punctual Prayer');
    if (count === 6) onBadgeEarned('Qiyam Star');
  };

  const setFasted = (status: DailyProgress['fasted']) => {
    onUpdate({ fasted: status });
    if (status === 'full') onBadgeEarned('Fasting Hero');
  };

  return (
    <div id="tracker" className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-amber-100">
      <div className="bg-amber-500 p-6 text-white">
        <h3 className="text-2xl font-bold">Day {day} Progress Log</h3>
      </div>

      <div className="p-6 space-y-8">
        {/* Fasting Section */}
        <section>
          <h4 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
            <span>🥪</span> Fasting Today?
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'full', label: 'Full Fast', icon: '🏆' },
              { id: 'half', label: 'Half Fast', icon: '💪' },
              { id: 'trying', label: 'I Tried!', icon: '🌟' },
              { id: 'none', label: 'Not Today', icon: '🌱' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFasted(opt.id as any)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${data.fasted === opt.id
                    ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md scale-105'
                    : 'border-gray-100 hover:border-amber-200 text-gray-500'
                  }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-xs font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Prayers Section */}
        <section>
          <h4 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
            <span>🤲</span> My Prayers (Salah)
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {Object.entries(data.prayers).map(([name, completed]) => (
              <button
                key={name}
                onClick={() => togglePrayer(name as any)}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${completed
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                    : 'border-gray-100 hover:border-emerald-200 text-gray-500'
                  }`}
              >
                <span className="text-xl capitalize">{name === 'fajr' ? '🌅' : name === 'taraweeh' ? '✨' : '🕌'}</span>
                <span className="text-[10px] font-bold uppercase">{name}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                  {completed && <span className="text-white text-[10px]">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Quran Section */}
        <section className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold text-blue-800 flex items-center gap-2">
              <span>📖</span> Quran Reading
            </h4>
            <span className="text-blue-600 font-bold">{data.quranPages} pages</span>
          </div>
          <input
            type="range"
            min="0" max="20" step="1"
            value={data.quranPages}
            onChange={(e) => onUpdate({ quranPages: parseInt(e.target.value) })}
            className="w-full accent-blue-600 h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
        </section>

        {/* Good Deed Section */}
        <section>
          <h4 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
            <span>❤️</span> My Good Deed Today
          </h4>
          <textarea
            value={data.goodDeed}
            onChange={(e) => onUpdate({ goodDeed: e.target.value })}
            placeholder="Tell us one kind thing you did today..."
            className="w-full p-4 rounded-2xl border-2 border-amber-100 focus:border-amber-400 outline-none min-h-[100px] resize-none transition-all text-amber-900 placeholder:text-amber-200"
          />
        </section>
      </div>
    </div>
  );
};

export default DailyTracker;

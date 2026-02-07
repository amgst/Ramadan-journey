
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailyProgress } from '../types';

interface Props {
  progress: Record<number, DailyProgress>;
}

const ProgressOverview: React.FC<Props> = ({ progress }) => {
  // Fix: Convert Object.values result to explicit DailyProgress array to resolve property access errors on 'unknown' type
  const progressEntries = Object.values(progress) as DailyProgress[];

  const chartData = progressEntries.sort((a, b) => a.dayNumber - b.dayNumber).map(d => ({
    name: `D${d.dayNumber}`,
    quran: d.quranPages,
    prayers: (Object.values(d.prayers) as boolean[]).filter(Boolean).length,
    day: d.dayNumber
  }));

  // Fix: Using typed progressEntries to safely access properties in reduce and filter
  const totalQuran = progressEntries.reduce((acc, curr) => acc + curr.quranPages, 0);
  const totalFastFull = progressEntries.filter(p => p.fasted === 'full').length;

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-100 p-6">
      <h3 className="text-xl font-bold text-amber-800 mb-6 flex items-center gap-2">
        <span>📊</span> My Ramadan Stats
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-amber-50 p-4 rounded-2xl text-center">
          <span className="text-3xl block">🏆</span>
          <span className="text-2xl font-bold text-amber-700 block">{totalFastFull}</span>
          <span className="text-[10px] uppercase font-bold text-amber-600">Full Fasts</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl text-center">
          <span className="text-3xl block">📖</span>
          <span className="text-2xl font-bold text-blue-700 block">{totalQuran}</span>
          <span className="text-[10px] uppercase font-bold text-blue-600">Quran Pages</span>
        </div>
      </div>

      <div className="h-48 w-full">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Daily Prayer Progress</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#fef3c7' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="prayers" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.prayers === 5 ? '#10b981' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressOverview;

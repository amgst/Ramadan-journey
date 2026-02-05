
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyProgress } from '../types';
import { getNoorInspiration, getDailyGoodDeed } from '../services/geminiService';

interface Props {
  user: UserProfile;
  currentProgress: DailyProgress;
}

const RamadanBuddy: React.FC<Props> = ({ user, currentProgress }) => {
  const [inspiration, setInspiration] = useState<string>('Loading my glow...');
  const [goodDeeds, setGoodDeeds] = useState<{ deed: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIGuidance = async () => {
      setLoading(true);
      const msg = await getNoorInspiration(user.name, user.currentDay, currentProgress.fasted === 'full');
      const deeds = await getDailyGoodDeed(user.age);
      setInspiration(msg);
      setGoodDeeds(deeds);
      setLoading(false);
    };

    fetchAIGuidance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.currentDay, user.name]);

  return (
    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
      
      <div className="relative flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center text-5xl animate-bounce shadow-lg border-2 border-white/30">
          🏮
        </div>
        
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold mb-1">Noor says...</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded w-3/4 shimmer mx-auto md:mx-0"></div>
              <div className="h-4 bg-white/20 rounded w-1/2 shimmer mx-auto md:mx-0"></div>
            </div>
          ) : (
            <p className="text-lg italic leading-relaxed opacity-95">"{inspiration}"</p>
          )}
        </div>
      </div>

      {!loading && goodDeeds.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-sm font-bold mb-3 uppercase tracking-wider opacity-90">Today's Kind Idea Challenge:</p>
          <div className="flex flex-wrap gap-2">
            {goodDeeds.map((d, i) => (
              <div key={i} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl flex-grow md:flex-grow-0 transition cursor-help group/tip relative">
                <span className="font-bold text-sm">💡 {d.deed}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-amber-800 text-white text-[10px] rounded shadow-xl hidden group-hover/tip:block z-10">
                    {d.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RamadanBuddy;

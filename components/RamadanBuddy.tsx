import React, { useState, useEffect } from 'react';
import { UserProfile, DailyProgress } from '../types';

interface Props {
  user: UserProfile;
  currentProgress: DailyProgress;
}

const RamadanBuddy: React.FC<Props> = ({ user, currentProgress }) => {
  /* Random Static Data for "Offline" Mode */
  const inspirations = [
    "Ramadan is like a battery recharge for our souls!",
    "Every good deed you do is like a shiny star in your sky.",
    "Smiling at your brother is charity! Keep smiling!",
    "Fasting teaches us patience and gratitude. You are doing great!",
    "You are strong and capable! Allah loves those who try their best.",
    "Bismillah! Let's make today a masterpiece of good deeds.",
    "Hydrate well at Suhoor to stay strong all day!"
  ];

  const deedsCollection = [
    { deed: "Help Parents 🧹", description: "Ask your mom or dad if they need help with anything." },
    { deed: "Share a Smile 😊", description: "Smile at everyone you meet today. It's Sunnah!" },
    { deed: "Dua for Friends 🤲", description: "Make a special dua for your friends and family." },
    { deed: "Give Charity 🪙", description: "Put some coins in your sadaqah box." },
    { deed: "Read Quran 📖", description: "Read at least one surah or ayah today." },
    { deed: "Feed a Bird 🐦", description: "Put out some water or seeds for the birds." },
    { deed: "Say Salam 👋", description: "Be the first to say As-salamu alaykum!" }
  ];

  const [inspiration, setInspiration] = useState<string>('');
  const [goodDeeds, setGoodDeeds] = useState<{ deed: string; description: string }[]>([]);

  useEffect(() => {
    // Randomly select content on mount or when day changes
    const randomInspo = inspirations[Math.floor(Math.random() * inspirations.length)];
    const randomDeed = deedsCollection[Math.floor(Math.random() * deedsCollection.length)];

    setInspiration(randomInspo);
    setGoodDeeds([randomDeed]); // Just show one featured deed for now
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
          <p className="text-lg italic leading-relaxed opacity-95">"{inspiration}"</p>
        </div>
      </div>

      {goodDeeds.length > 0 && (
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

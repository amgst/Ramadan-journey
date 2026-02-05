
import React from 'react';

interface Props {
  earnedBadges: string[];
}

const ALL_BADGES = [
  { id: 'Fasting Hero', icon: '🦁', desc: 'Completed a full fast' },
  { id: 'Punctual Prayer', icon: '⏰', desc: 'Completed all 5 daily prayers' },
  { id: 'Qiyam Star', icon: '✨', desc: 'Prayed Taraweeh tonight' },
  { id: 'Kindness King', icon: '👑', desc: 'Wrote down 5 good deeds' },
  { id: 'Quran Voyager', icon: '🌊', desc: 'Read 10 pages of Quran' },
  { id: 'Ramadan Rookie', icon: '🌱', desc: 'Logged your first day' },
];

const BadgeGallery: React.FC<Props> = ({ earnedBadges }) => {
  return (
    <div id="badges" className="bg-white rounded-3xl shadow-xl border-2 border-amber-100 p-6">
      <h3 className="text-xl font-bold text-amber-800 mb-6 flex items-center gap-2">
        <span>🏅</span> Achievement Gallery
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        {ALL_BADGES.map((badge) => {
          const isEarned = earnedBadges.includes(badge.id);
          return (
            <div 
              key={badge.id} 
              className={`flex flex-col items-center gap-2 transition-all ${!isEarned ? 'opacity-30 grayscale' : 'scale-110'}`}
              title={badge.desc}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 ${isEarned ? 'bg-amber-100 border-amber-400' : 'bg-gray-100 border-gray-200'}`}>
                {badge.icon}
              </div>
              <span className="text-[10px] font-bold text-center text-amber-900 leading-tight">
                {badge.id}
              </span>
            </div>
          );
        })}
      </div>
      
      {earnedBadges.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-6 italic">
          Keep logging to earn your first badge!
        </p>
      )}
    </div>
  );
};

export default BadgeGallery;

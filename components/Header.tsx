
import React from 'react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onDayChange: (day: number) => void;
}

const Header: React.FC<Props> = ({ user, onDayChange }) => {
  return (
    <header className="bg-white border-b border-amber-100 p-6 sticky top-0 z-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 border-amber-300">
            {user.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-800">Assalamu Alaikum, {user.name}!</h2>
            <p className="text-amber-600 font-medium">Keep up the great spirit! 🌟</p>
          </div>
        </div>
        
        <div className="flex items-center bg-amber-50 p-2 rounded-2xl border border-amber-200 overflow-x-auto no-scrollbar max-w-full md:max-w-md">
          {[...Array(30)].map((_, i) => (
            <button
              key={i}
              onClick={() => onDayChange(i + 1)}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                user.currentDay === i + 1 
                ? 'bg-amber-500 text-white shadow-lg scale-110' 
                : 'text-amber-700 hover:bg-amber-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;

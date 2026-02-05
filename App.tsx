
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyProgress, AppState } from './types';
import Header from './components/Header';
import DailyTracker from './components/DailyTracker';
import ProgressOverview from './components/ProgressOverview';
import RamadanBuddy from './components/RamadanBuddy';
import BadgeGallery from './components/BadgeGallery';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('ramadan_progress_app');
    return saved ? JSON.parse(saved) : {
      user: null,
      progress: {},
      badges: []
    };
  });

  useEffect(() => {
    localStorage.setItem('ramadan_progress_app', JSON.stringify(state));
  }, [state]);

  const handleSetup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: UserProfile = {
      name: formData.get('name') as string,
      age: parseInt(formData.get('age') as string) || 7,
      avatar: '🌙',
      currentDay: 1
    };
    setState(prev => ({ ...prev, user: newUser }));
  };

  const updateProgress = (day: number, data: Partial<DailyProgress>) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [day]: {
          ...(prev.progress[day] || {
            dayNumber: day,
            date: new Date().toISOString(),
            fasted: 'none',
            prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, taraweeh: false },
            quranPages: 0,
            goodDeed: '',
            kindnessPoints: 0
          }),
          ...data
        }
      }
    }));
  };

  const addBadge = (badgeId: string) => {
    if (!state.badges.includes(badgeId)) {
      setState(prev => ({ ...prev, badges: [...prev.badges, badgeId] }));
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-4 border-amber-400">
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">🌙</span>
            <h1 className="text-3xl font-bold text-amber-600">Noor's Journey</h1>
            <p className="text-gray-600 mt-2">Ready to track your Ramadan progress?</p>
          </div>
          <form onSubmit={handleSetup} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
              <input 
                name="name" 
                required 
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-400 outline-none transition" 
                placeholder="What's your name?" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Age</label>
              <input 
                name="age" 
                type="number" 
                required 
                className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-400 outline-none transition" 
                placeholder="How old are you?" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              Start My Ramadan Adventure!
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentDayData = state.progress[state.user.currentDay] || {
    dayNumber: state.user.currentDay,
    date: new Date().toISOString(),
    fasted: 'none',
    prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, taraweeh: false },
    quranPages: 0,
    goodDeed: '',
    kindnessPoints: 0
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Header user={state.user} onDayChange={(day) => setState(prev => ({ ...prev, user: { ...prev.user!, currentDay: day } }))} />
      
      <main className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8 space-y-6">
          <RamadanBuddy user={state.user} currentProgress={currentDayData} />
          <DailyTracker 
            day={state.user.currentDay} 
            data={currentDayData} 
            onUpdate={(update) => updateProgress(state.user!.currentDay, update)}
            onBadgeEarned={addBadge}
          />
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <ProgressOverview progress={state.progress} />
          <BadgeGallery earnedBadges={state.badges} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-amber-100 p-4 flex justify-around items-center lg:hidden shadow-2xl">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-2 flex flex-col items-center">
            <span className="text-2xl">🏠</span>
            <span className="text-xs font-bold text-amber-600">Home</span>
        </button>
        <button onClick={() => {
            const el = document.getElementById('tracker');
            el?.scrollIntoView({ behavior: 'smooth' });
        }} className="p-2 flex flex-col items-center">
            <span className="text-2xl">✍️</span>
            <span className="text-xs font-bold text-amber-600">Log</span>
        </button>
        <button onClick={() => {
            const el = document.getElementById('badges');
            el?.scrollIntoView({ behavior: 'smooth' });
        }} className="p-2 flex flex-col items-center">
            <span className="text-2xl">🏅</span>
            <span className="text-xs font-bold text-amber-600">Badges</span>
        </button>
      </div>
    </div>
  );
};

export default App;

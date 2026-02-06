import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DailyProgress, GlobalState, UserData } from './types';
import Header from './components/Header';
import DailyTracker from './components/DailyTracker';
import ProgressOverview from './components/ProgressOverview';
import RamadanBuddy from './components/RamadanBuddy';
import BadgeGallery from './components/BadgeGallery';
import ExportPdf from './components/ExportPdf';
import { FirestoreService } from './services/FirestoreService';

const App: React.FC = () => {
  const [state, setState] = useState<GlobalState>({
    users: {},
    activeUserId: null
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load from Firestore on mount
  useEffect(() => {
    const loadUsers = async () => {
      // First, try loading local storage for immediate UI
      const saved = localStorage.getItem('ramadan_progress_app_v2');
      if (saved) {
        setState(JSON.parse(saved));
        setIsLoading(false); // Show local data immediately
      }

      // Then fetch from Firestore and merge/update
      const firestoreUsers = await FirestoreService.getAllUsers();
      if (Object.keys(firestoreUsers).length > 0) {
        setState(prev => ({
          ...prev,
          // Merge: prefer Firestore data as truth, but keep local activeUserId if valid
          users: firestoreUsers,
          activeUserId: prev.activeUserId && firestoreUsers[prev.activeUserId] ? prev.activeUserId : null
        }));
      }
      setIsLoading(false);
    };

    loadUsers();
  }, []);

  // Save to LocalStorage (backup) and Firestore on change
  useEffect(() => {
    if (Object.keys(state.users).length === 0) return;

    localStorage.setItem('ramadan_progress_app_v2', JSON.stringify(state));

    // Auto-save active user to Firestore
    if (state.activeUserId) {
      const currentUserData = state.users[state.activeUserId];
      FirestoreService.saveUser(currentUserData);
    }
  }, [state]);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const age = parseInt(formData.get('age') as string) || 7;
    const id = Date.now().toString();

    const newUser: UserProfile = {
      id,
      name,
      age,
      avatar: '🌙',
      currentDay: 1
    };

    const newUserData: UserData = {
      profile: newUser,
      progress: {},
      badges: []
    };

    // Update state first
    setState(prev => ({
      ...prev,
      users: { ...prev.users, [id]: newUserData },
      activeUserId: id
    }));

    // Explicitly save new user to Firestore
    await FirestoreService.saveUser(newUserData);
  };

  const handleSelectUser = (id: string) => {
    setState(prev => ({ ...prev, activeUserId: id }));
  };

  const updateProgress = (day: number, data: Partial<DailyProgress>) => {
    if (!state.activeUserId) return;

    setState(prev => {
      const activeUserId = prev.activeUserId!;
      const currentUserData = prev.users[activeUserId];

      return {
        ...prev,
        users: {
          ...prev.users,
          [activeUserId]: {
            ...currentUserData,
            progress: {
              ...currentUserData.progress,
              [day]: {
                ...(currentUserData.progress[day] || {
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
          }
        }
      };
    });
  };

  const addBadge = (badgeId: string) => {
    if (!state.activeUserId) return;

    setState(prev => {
      const activeUserId = prev.activeUserId!;
      const currentUserData = prev.users[activeUserId];
      if (currentUserData.badges.includes(badgeId)) return prev;

      return {
        ...prev,
        users: {
          ...prev.users,
          [activeUserId]: {
            ...currentUserData,
            badges: [...currentUserData.badges, badgeId]
          }
        }
      };
    });
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, activeUserId: null }));
  };

  const updateCurrentDay = (day: number) => {
    if (!state.activeUserId) return;
    setState(prev => {
      const activeUserId = prev.activeUserId!;
      return {
        ...prev,
        users: {
          ...prev.users,
          [activeUserId]: {
            ...prev.users[activeUserId],
            profile: {
              ...prev.users[activeUserId].profile,
              currentDay: day
            }
          }
        }
      };
    });
  };


  // --- VIEW: User Selection / Creation ---
  if (!state.activeUserId) {
    const existingUsers = Object.values(state.users);

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full border-4 border-amber-400">
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">🌙</span>
            <h1 className="text-3xl font-bold text-amber-600">Ramadan Journey</h1>
            <p className="text-gray-600 mt-2">Who is tracking their progress today?</p>
          </div>

          {existingUsers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {existingUsers.map(userData => (
                <button
                  key={userData.profile.id}
                  onClick={() => handleSelectUser(userData.profile.id)}
                  className="p-4 rounded-xl border-2 border-amber-100 hover:border-amber-400 hover:bg-amber-50 transition flex flex-col items-center"
                >
                  <span className="text-4xl mb-2">{userData.profile.avatar}</span>
                  <span className="font-bold text-gray-800">{userData.profile.name}</span>
                  <span className="text-xs text-gray-500">{userData.badges.length} Badges</span>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">
              {existingUsers.length > 0 ? "Or add a new explorer:" : "Start your journey:"}
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-400 outline-none transition"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input
                  name="age"
                  type="number"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-400 outline-none transition"
                  placeholder="Enter age"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-105"
              >
                + Add New User
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: Main App ---
  const activeUser = state.users[state.activeUserId];
  const currentDayData = activeUser.progress[activeUser.profile.currentDay] || {
    dayNumber: activeUser.profile.currentDay,
    date: new Date().toISOString(),
    fasted: 'none',
    prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, taraweeh: false },
    quranPages: 0,
    goodDeed: '',
    kindnessPoints: 0
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Header user={activeUser.profile} onDayChange={updateCurrentDay} />

      <div className="px-4 flex justify-between items-center mt-2">
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-amber-600 underline">
          ← Switch User
        </button>
        <ExportPdf user={activeUser.profile} progress={activeUser.progress} />
      </div>

      <main className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8 space-y-6">
          <RamadanBuddy user={activeUser.profile} currentProgress={currentDayData} />
          <DailyTracker
            day={activeUser.profile.currentDay}
            data={currentDayData}
            onUpdate={(update) => updateProgress(activeUser.profile.currentDay, update)}
            onBadgeEarned={addBadge}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ProgressOverview progress={activeUser.progress} />
          <BadgeGallery earnedBadges={activeUser.badges} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-amber-100 p-4 flex justify-around items-center lg:hidden shadow-2xl z-50">
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

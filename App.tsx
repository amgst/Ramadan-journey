import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DailyProgress, GlobalState, UserData } from './types';
import Header from './components/Header';
import DailyTracker from './components/DailyTracker';
import ProgressOverview from './components/ProgressOverview';
import BadgeGallery from './components/BadgeGallery';
import ExportPdf from './components/ExportPdf';
import { FirestoreService } from './services/FirestoreService';

const App: React.FC = () => {
  const [state, setState] = useState<GlobalState>({
    users: {},
    activeUserId: null,
    isAdminMode: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const SUPER_ADMIN_PASSWORD = "admin786"; // You can change this or move to env

  // Load from Firestore on mount
  useEffect(() => {
    const loadUsers = async () => {
      // First, try loading local storage for immediate UI
      const saved = localStorage.getItem('ramadan_progress_app_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({
          ...parsed,
          isAdminMode: parsed.isAdminMode || false // Ensure it's reset or preserved
        });
        setIsLoading(false);
      }

      // Then fetch from Firestore and merge/update
      const firestoreUsers = await FirestoreService.getAllUsers();
      if (Object.keys(firestoreUsers).length > 0) {
        setState(prev => ({
          ...prev,
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

    localStorage.setItem('ramadan_progress_app_v2', JSON.stringify({
      ...state,
      isAdminMode: state.isAdminMode // Persist admin mode for session if needed
    }));

    // Auto-save active user to Firestore
    if (state.activeUserId) {
      const currentUserData = state.users[state.activeUserId];
      FirestoreService.saveUser(currentUserData);
    }
  }, [state]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === SUPER_ADMIN_PASSWORD) {
      setState(prev => ({ ...prev, isAdminMode: true, activeUserId: null }));
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert("Incorrect Admin Password");
    }
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    const user = state.users[selectedUserId];
    if (user.profile.passcode === passcodeInput) {
      setState(prev => ({ ...prev, activeUserId: selectedUserId, isAdminMode: false }));
      setPasscodeInput('');
      setSelectedUserId(null);
    } else {
      alert("Incorrect Passcode");
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const age = parseInt(formData.get('age') as string) || 7;
    const passcode = formData.get('passcode') as string;
    const id = Date.now().toString();

    const newUser: UserProfile = {
      id,
      name,
      age,
      avatar: '🌙',
      currentDay: 1,
      role: 'user',
      passcode: passcode || '1234'
    };

    const newUserData: UserData = {
      profile: newUser,
      progress: {},
      badges: []
    };

    // Update state first
    setState(prev => ({
      ...prev,
      users: { ...prev.users, [id]: newUserData }
    }));

    // Explicitly save new user to Firestore
    await FirestoreService.saveUser(newUserData);
    e.currentTarget.reset();
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserId(id);
    setPasscodeInput('');
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
    setState(prev => ({ ...prev, activeUserId: null, isAdminMode: false }));
    setSelectedUserId(null);
  };

  const toggleAdminMode = () => {
    if (state.isAdminMode) {
      setState(prev => ({ ...prev, isAdminMode: false }));
    } else {
      setShowAdminLogin(true);
    }
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
    const existingUsers = Object.values(state.users) as UserData[];

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full border-4 border-amber-400 relative">
          {/* Admin Toggle Button */}
          <button
            onClick={toggleAdminMode}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-amber-600 transition"
            title="Admin Mode"
          >
            {state.isAdminMode ? '🔓' : '🔒'}
          </button>

          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">🌙</span>
            <h1 className="text-3xl font-bold text-amber-600">Ramadan Journey</h1>
            <p className="text-gray-600 mt-2">
              {state.isAdminMode ? "Super Admin Dashboard" : "Who is tracking their progress today?"}
            </p>
          </div>

          {/* User Selection List (Only shown if NOT in Admin mode or if Admin is managing) */}
          {!state.isAdminMode && !selectedUserId && (
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

          {/* User Passcode Login */}
          {!state.isAdminMode && selectedUserId && (
            <div className="mb-8 p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
              <h3 className="text-lg font-bold text-amber-800 mb-4 text-center">
                Enter Passcode for {state.users[selectedUserId].profile.name}
              </h3>
              <form onSubmit={handleUserLogin} className="flex flex-col gap-4 max-w-xs mx-auto">
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none text-center text-2xl tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transition"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admin Mode: User Management */}
          {state.isAdminMode && (
            <div className="space-y-8">
              <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-200">
                <h2 className="text-xl font-bold text-amber-800 mb-4 text-center">Add New Explorer</h2>
                <form onSubmit={handleCreateUser} className="space-y-4 max-w-sm mx-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                      <input
                        name="name"
                        required
                        className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-amber-400 outline-none transition"
                        placeholder="Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                      <input
                        name="age"
                        type="number"
                        required
                        className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-amber-400 outline-none transition"
                        placeholder="Age"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Passcode (4 digits)</label>
                    <input
                      name="passcode"
                      required
                      className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-amber-400 outline-none transition"
                      placeholder="e.g. 1234"
                      maxLength={4}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transition"
                  >
                    + Add User
                  </button>
                </form>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="font-bold text-gray-700 mb-4">Current Users:</h3>
                <div className="space-y-2">
                  {existingUsers.map(u => (
                    <div key={u.profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{u.profile.avatar}</span>
                        <div>
                          <p className="font-bold text-gray-800">{u.profile.name}</p>
                          <p className="text-xs text-gray-500">Passcode: {u.profile.passcode}</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          if (confirm(`Delete ${u.profile.name}?`)) {
                            await FirestoreService.deleteUser(u.profile.id);
                            const newUsers = { ...state.users };
                            delete newUsers[u.profile.id];
                            setState(prev => ({ ...prev, users: newUsers }));
                          }
                        }}
                        className="text-red-400 hover:text-red-600 p-2"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setState(prev => ({ ...prev, isAdminMode: false }))}
                  className="w-full mt-6 text-gray-500 hover:text-amber-600 underline font-medium"
                >
                  Exit Admin Mode
                </button>
              </div>
            </div>
          )}

          {/* Admin Login Modal */}
          {showAdminLogin && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
              <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Access</h2>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 focus:border-amber-400 outline-none"
                    placeholder="Enter admin password"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAdminLogin(false)}
                      className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW: Main App ---
  const activeUser = state.activeUserId ? state.users[state.activeUserId] : null;

  if (!activeUser || !state.activeUserId) {
    return <div className="p-8 text-center">Loading user data...</div>;
  }

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

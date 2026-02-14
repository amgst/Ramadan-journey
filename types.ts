
export interface DailyProgress {
  date: string; // ISO format
  dayNumber: number; // 1 to 30
  fasted: 'full' | 'half' | 'trying' | 'none';
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    taraweeh: boolean;
  };
  quranPages: number;
  goodDeed: string;
  kindnessPoints: number;
}


export interface UserProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  currentDay: number;
  role: 'admin' | 'user';
  passcode: string;
}

export interface UserData {
  profile: UserProfile;
  progress: Record<number, DailyProgress>;
  badges: string[];
}

export interface GlobalState {
  users: Record<string, UserData>; // Keyed by User ID
  activeUserId: string | null;
  isAdminMode: boolean;
}

export interface AppState {
    // Legacy interface kept for reference if needed, but we typically use GlobalState now
  user: UserProfile | null;
  progress: Record<number, DailyProgress>;
  badges: string[];
}

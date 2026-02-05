
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
  name: string;
  age: number;
  avatar: string;
  currentDay: number;
}

export interface AppState {
  user: UserProfile | null;
  progress: Record<number, DailyProgress>;
  badges: string[];
}

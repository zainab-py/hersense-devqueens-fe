import { create } from 'zustand';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type Mood = 'calm' | 'happy' | 'anxious' | 'tired' | 'energetic' | 'irritable';

// Update this to your Render URL after deployment
const API_BASE = "http://localhost:8000"; 

interface HerSenseState {
  isAuthenticated: boolean;
  userName: string;
  cyclePhase: CyclePhase;
  cycleDay: number;
  stress: number; 
  energy: number; 
  mood: Mood;
  hydration: number; 
  sleep: number; 
  symptoms: string[];
  sosActive: boolean;

  // Actions
  login: (name: string) => void;
  logout: () => void;
  fetchSync: () => Promise<void>; // New: Pull from Backend
  setCyclePhase: (phase: CyclePhase) => void;
  setCycleDay: (day: number) => void;
  setStress: (val: number) => void;
  setEnergy: (val: number) => void;
  setMood: (mood: Mood) => void;
  setHydration: (val: number) => void;
  setSleep: (val: number) => void;
  toggleSymptom: (symptom: string) => void;
  setSosActive: (active: boolean) => void;
  addWater: () => void;
}

export const useHerSenseStore = create<HerSenseState>((set, get) => ({
  isAuthenticated: false,
  userName: '',
  cyclePhase: 'follicular',
  cycleDay: 8,
  stress: 35,
  energy: 72,
  mood: 'calm',
  hydration: 45,
  sleep: 7.2,
  symptoms: [],
  sosActive: false,

  // --- AUTH & SYNC ---
  login: (name) => set({ isAuthenticated: true, userName: name }),
  
  logout: () => {
    import('@/integrations/supabase/client').then(({ supabase }) => supabase.auth.signOut());
    set({ isAuthenticated: false, userName: '' });
  },

  fetchSync: async () => {
    try {
      const response = await fetch(`${API_BASE}/engine/status`);
      if (!response.ok) throw new Error("Backend offline");
      const data = await response.json();
      
      // Map Backend JSON to Frontend State
      set({
        stress: data.gauges?.stress ?? 35,
        hydration: data.gauges?.hydration ?? 45,
        energy: data.gauges?.energy ?? 72,
        userName: data.user_info?.name ?? get().userName
      });
    } catch (error) {
      console.warn("Using local state: Backend sync unavailable.");
    }
  },

  // --- SETTERS ---
  setCyclePhase: (phase) => set({ cyclePhase: phase }),
  setCycleDay: (day) => set({ cycleDay: day }),
  
  setStress: (val) => {
    const newStress = Math.min(100, Math.max(0, val));
    set({ stress: newStress });
    // Push to backend (Fire and forget for speed)
    fetch(`${API_BASE}/engine/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stress: newStress })
    }).catch(() => {});
  },

  setEnergy: (val) => set({ energy: Math.min(100, Math.max(0, val)) }),
  setMood: (mood) => set({ mood }),
  
  setHydration: (val) => {
    const newVal = Math.min(100, Math.max(0, val));
    set({ hydration: newVal });
  },

  setSleep: (val) => set({ sleep: val }),

  toggleSymptom: (symptom) =>
    set((state) => ({
      symptoms: state.symptoms.includes(symptom)
        ? state.symptoms.filter((s) => s !== symptom)
        : [...state.symptoms, symptom],
    })),

  setSosActive: (active) => set({ sosActive: active }),

  addWater: () => {
    set((state) => {
      const nextHydration = Math.min(100, state.hydration + 12);
      // Optional: Log water intake to backend
      fetch(`${API_BASE}/engine/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hydration: nextHydration })
      }).catch(() => {});
      
      return { hydration: nextHydration };
    });
  },
}));

// --- HELPERS ---
export const phaseThemeClass = (phase: CyclePhase) => `phase-${phase}`;
export const phaseLabel = (phase: CyclePhase) => ({
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
}[phase]);
export const phaseEmoji = (phase: CyclePhase) => ({
  menstrual: '🌹',
  follicular: '🌿',
  ovulation: '✨',
  luteal: '🌙',
}[phase]);
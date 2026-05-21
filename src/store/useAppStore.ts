import { create } from 'zustand';
import type { LangMode, BuildInput } from '../engine/regexEngine';
import { defaultInput } from '../engine/regexEngine';

interface Profile {
  id: string; name: string; input: Partial<BuildInput>; createdAt: number;
}

interface AppStore {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  // Regex Forge
  regexInput: Partial<BuildInput>;
  setRegexInput: (v: Partial<BuildInput>) => void;
  resetRegexInput: () => void;

  // Profiles
  profiles: Profile[];
  saveProfile: (name: string) => void;
  deleteProfile: (id: string) => void;
  loadProfile: (id: string) => void;
}

const loadProfiles = (): Profile[] => {
  try { return JSON.parse(localStorage.getItem('pw-profiles') || '[]'); } catch { return []; }
};
const saveProfiles = (p: Profile[]) => localStorage.setItem('pw-profiles', JSON.stringify(p));

export const useAppStore = create<AppStore>((set, get) => ({
  theme: (() => {
    const s = localStorage.getItem('pw-theme');
    return s === 'light' ? 'light' : 'dark';
  })(),
  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('pw-theme', next);
    return { theme: next };
  }),

  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  regexInput: defaultInput(),
  setRegexInput: (v) => set((s) => ({ regexInput: { ...s.regexInput, ...v } })),
  resetRegexInput: () => set({ regexInput: defaultInput() }),

  profiles: loadProfiles(),
  saveProfile: (name) => {
    const p: Profile = {
      id: Date.now().toString(36),
      name: name || `配置 ${get().profiles.length + 1}`,
      input: { ...get().regexInput },
      createdAt: Date.now(),
    };
    const next = [...get().profiles, p];
    saveProfiles(next);
    set({ profiles: next });
  },
  deleteProfile: (id) => {
    const next = get().profiles.filter((p) => p.id !== id);
    saveProfiles(next);
    set({ profiles: next });
  },
  loadProfile: (id) => {
    const p = get().profiles.find((p) => p.id === id);
    if (p) set({ regexInput: { ...p.input } });
  },
}));

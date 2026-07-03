// ============================================================
// BenchLog — Weight Store
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightEntry } from '../types';
import { startOfDay, format } from 'date-fns';

interface WeightState {
  entries: WeightEntry[];
  addWeightEntry: (weight: number, notes?: string) => void;
  removeWeightEntry: (id: string) => void;
  clearWeightHistory: () => void;
}

const zustandStorage: StateStorage = {
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, value);
  },
  getItem: async (name) => {
    const value = await AsyncStorage.getItem(name);
    return value ?? null;
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

export const useWeightStore = create<WeightState>()(
  persist(
    (set) => ({
      entries: [],
      addWeightEntry: (weight, notes) =>
        set((state) => {
          const todayStr = format(new Date(), 'yyyy-MM-dd');
          
          // Filter out any existing entry for today (only one entry per calendar day)
          const filteredEntries = state.entries.filter(
            (e) => e.date !== todayStr
          );

          const newEntry: WeightEntry = {
            id: `weight_${Date.now()}`,
            date: todayStr,
            weight: Math.round(weight * 10) / 10,
            notes,
            createdAt: new Date().toISOString(),
          };

          const newEntries = [newEntry, ...filteredEntries].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          return { entries: newEntries };
        }),
      removeWeightEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
      clearWeightHistory: () => set({ entries: [] }),
    }),
    {
      name: 'benchlog-weight-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

// ============================================================
// BenchLog — Bench Progression Store
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BenchProgression, BenchProgressionEntry } from '../types';
import { INITIAL_BENCH_PROGRESSION } from '../constants/workouts';

interface ProgressionState {
  progression: BenchProgression;
  updatePushWeight: (weight: number, reason: string) => void;
  updateUpperWeight: (weight: number, reason: string) => void;
  addProgressionEntry: (entry: BenchProgressionEntry) => void;
  resetProgression: () => void;
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

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set) => ({
      progression: INITIAL_BENCH_PROGRESSION,
      updatePushWeight: (weight, reason) =>
        set((state) => {
          const newEntry: BenchProgressionEntry = {
            date: new Date().toISOString(),
            pushWeight: weight,
            upperWeight: state.progression.currentUpperWeight,
            reason,
          };
          return {
            progression: {
              ...state.progression,
              currentPushWeight: weight,
              history: [newEntry, ...state.progression.history],
            },
          };
        }),
      updateUpperWeight: (weight, reason) =>
        set((state) => {
          const newEntry: BenchProgressionEntry = {
            date: new Date().toISOString(),
            pushWeight: state.progression.currentPushWeight,
            upperWeight: weight,
            reason,
          };
          return {
            progression: {
              ...state.progression,
              currentUpperWeight: weight,
              history: [newEntry, ...state.progression.history],
            },
          };
        }),
      addProgressionEntry: (entry) =>
        set((state) => ({
          progression: {
            ...state.progression,
            history: [entry, ...state.progression.history],
          },
        })),
      resetProgression: () =>
        set({
          progression: INITIAL_BENCH_PROGRESSION,
        }),
    }),
    {
      name: 'benchlog-progression-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

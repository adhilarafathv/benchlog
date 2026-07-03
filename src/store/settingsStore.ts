// ============================================================
// BenchLog — Settings Store
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, WeightUnit } from '../types';

interface SettingsState {
  settings: AppSettings;
  setWeightUnit: (unit: WeightUnit) => void;
  setNotifications: (enabled: boolean) => void;
  setGoalWeight: (weight: number | null) => void;
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

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        weightUnit: WeightUnit.KG,
        notifications: true,
        goalWeight: null,
      },
      setWeightUnit: (unit) =>
        set((state) => ({
          settings: { ...state.settings, weightUnit: unit },
        })),
      setNotifications: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, notifications: enabled },
        })),
      setGoalWeight: (weight) =>
        set((state) => ({
          settings: { ...state.settings, goalWeight: weight },
        })),
    }),
    {
      name: 'benchlog-settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

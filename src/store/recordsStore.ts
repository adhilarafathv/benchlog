// ============================================================
// BenchLog — Personal Records Store
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalRecord } from '../types';

interface RecordsState {
  records: PersonalRecord[];
  setRecords: (records: PersonalRecord[]) => void;
  clearRecords: () => void;
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

export const useRecordsStore = create<RecordsState>()(
  persist(
    (set) => ({
      records: [],
      setRecords: (records) => set({ records }),
      clearRecords: () => set({ records: [] }),
    }),
    {
      name: 'benchlog-records-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

// ============================================================
// BenchLog — Workout Store
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  WorkoutSession, 
  WorkoutCategory, 
  ActiveWorkout, 
  ExerciseLog, 
  ExerciseSet,
  WeightUnit
} from '../types';
import { WORKOUT_TEMPLATES } from '../constants/workouts';
import { useProgressionStore } from './progressionStore';
import { useRecordsStore } from './recordsStore';
import { useWeightStore } from './weightStore';
import { evaluatePushProgression, calculateUpperWeight, getMaxBenchReps } from '../utils/progression';
import { detectPersonalRecords } from '../utils/records';
import * as uuid from 'uuid'; // Fallback uuid generation if needed, or simple custom generator if uuid issue on RN

const customId = () => `id_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;

interface WorkoutState {
  history: WorkoutSession[];
  activeWorkout: ActiveWorkout | null;
  startWorkout: (templateId: WorkoutCategory) => void;
  updateSet: (exerciseIndex: number, setIndex: number, reps: number | null, weight: number | null, completed: boolean) => void;
  updateExerciseNotes: (exerciseIndex: number, notes: string) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  cancelWorkout: () => void;
  finishWorkout: () => void;
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

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      history: [],
      activeWorkout: null,

      startWorkout: (templateId) => {
        const template = WORKOUT_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return;

        // Get current push/upper weights from progression store
        const { currentPushWeight, currentUpperWeight } = useProgressionStore.getState().progression;

        const exercises: ExerciseLog[] = template.exercises.map((ex) => {
          // Determine starting weight for the exercise
          let startingWeight: number | null = null;
          if (ex.isBenchPress) {
            startingWeight = templateId === WorkoutCategory.PUSH ? currentPushWeight : currentUpperWeight;
          } else if (ex.weight !== undefined) {
            startingWeight = ex.weight;
          }

          const targetReps = typeof ex.reps === 'number' ? ex.reps : parseInt(ex.reps, 10) || 10;

          const sets: ExerciseSet[] = Array.from({ length: ex.sets }, (_, i) => ({
            setNumber: i + 1,
            targetReps,
            actualReps: null,
            weight: startingWeight,
            completed: false,
          }));

          return {
            exerciseId: ex.id,
            exerciseName: ex.name,
            sets,
            notes: ex.notes || '',
            isBenchPress: !!ex.isBenchPress,
          };
        });

        const newSession: WorkoutSession = {
          id: customId(),
          templateId,
          templateName: template.name,
          startedAt: new Date().toISOString(),
          completedAt: null,
          duration: 0,
          exercises,
          completed: false,
        };

        set({
          activeWorkout: {
            session: newSession,
            currentExerciseIndex: 0,
            isRestTimerActive: false,
            restTimeRemaining: 0,
          },
        });
      },

      updateSet: (exerciseIndex, setIndex, reps, weight, completed) => {
        set((state) => {
          if (!state.activeWorkout) return {};
          
          const session = { ...state.activeWorkout.session };
          const exercises = [...session.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const sets = [...exercise.sets];
          
          sets[setIndex] = {
            ...sets[setIndex],
            actualReps: reps,
            weight: weight,
            completed,
          };
          
          exercise.sets = sets;
          exercises[exerciseIndex] = exercise;
          session.exercises = exercises;
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              session,
            },
          };
        });
      },

      updateExerciseNotes: (exerciseIndex, notes) => {
        set((state) => {
          if (!state.activeWorkout) return {};
          
          const session = { ...state.activeWorkout.session };
          const exercises = [...session.exercises];
          exercises[exerciseIndex] = {
            ...exercises[exerciseIndex],
            notes,
          };
          session.exercises = exercises;
          
          return {
            activeWorkout: {
              ...state.activeWorkout,
              session,
            },
          };
        });
      },

      addSet: (exerciseIndex) => {
        set((state) => {
          if (!state.activeWorkout) return {};

          const session = { ...state.activeWorkout.session };
          const exercises = [...session.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const sets = [...exercise.sets];

          const lastSet = sets[sets.length - 1];
          const newSet: ExerciseSet = {
            setNumber: sets.length + 1,
            targetReps: lastSet ? lastSet.targetReps : 10,
            actualReps: lastSet ? lastSet.actualReps : null,
            weight: lastSet ? lastSet.weight : null,
            completed: false,
          };

          sets.push(newSet);
          exercise.sets = sets;
          exercises[exerciseIndex] = exercise;
          session.exercises = exercises;

          return {
            activeWorkout: {
              ...state.activeWorkout,
              session,
            },
          };
        });
      },

      removeSet: (exerciseIndex, setIndex) => {
        set((state) => {
          if (!state.activeWorkout) return {};

          const session = { ...state.activeWorkout.session };
          const exercises = [...session.exercises];
          const exercise = { ...exercises[exerciseIndex] };
          const sets = [...exercise.sets];

          if (sets.length <= 1) return {}; // Keep at least one set

          sets.splice(setIndex, 1);
          // Re-index set numbers
          const reindexedSets = sets.map((s, idx) => ({
            ...s,
            setNumber: idx + 1,
          }));

          exercise.sets = reindexedSets;
          exercises[exerciseIndex] = exercise;
          session.exercises = exercises;

          return {
            activeWorkout: {
              ...state.activeWorkout,
              session,
            },
          };
        });
      },

      cancelWorkout: () => {
        set({ activeWorkout: null });
      },

      finishWorkout: () => {
        const { activeWorkout, history } = get();
        if (!activeWorkout) return;

        const session = { ...activeWorkout.session };
        const completedAt = new Date().toISOString();
        
        // Calculate final duration
        const startedTime = new Date(session.startedAt).getTime();
        const completedTime = new Date(completedAt).getTime();
        const duration = Math.round((completedTime - startedTime) / 1000);

        session.completedAt = completedAt;
        session.duration = duration;
        session.completed = true;

        // Save to history
        const newHistory = [session, ...history];

        // Evaluate Bench progression if it's Push Day or Upper Day
        if (session.templateId === WorkoutCategory.PUSH) {
          const benchLog = session.exercises.find((e) => e.isBenchPress);
          if (benchLog) {
            const { currentPushWeight } = useProgressionStore.getState().progression;
            
            // 1. Evaluate push day progression
            const evalResult = evaluatePushProgression(benchLog, currentPushWeight);
            
            // 2. Evaluate upper day calculation based on push day max reps
            const maxReps = getMaxBenchReps(benchLog);
            const calculatedUpper = calculateUpperWeight(evalResult.newWeight, maxReps);

            // Update progression store
            if (evalResult.progressed) {
              useProgressionStore.getState().updatePushWeight(evalResult.newWeight, evalResult.reason);
            }
            useProgressionStore.getState().updateUpperWeight(calculatedUpper, `Calculated from Push Day session: max reps ${maxReps}`);
          }
        }

        // Sync weight entries if any bodyweight entries exist to run records detection
        const weightEntries = useWeightStore.getState().entries;
        const newPRs = detectPersonalRecords(newHistory, weightEntries);
        useRecordsStore.getState().setRecords(newPRs);

        set({
          history: newHistory,
          activeWorkout: null,
        });
      },
    }),
    {
      name: 'benchlog-workout-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

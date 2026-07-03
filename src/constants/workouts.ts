// ============================================================
// BenchLog — Workout Templates
// ============================================================

import { WorkoutCategory, WorkoutTemplate } from '../types';
import { colors } from './theme';

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: WorkoutCategory.PUSH,
    name: 'Push Day',
    icon: '🏋️',
    color: colors.push,
    estimatedMinutes: 45,
    exercises: [
      {
        id: 'bench_press_push',
        name: 'Bench Press',
        sets: 2,
        reps: 20,
        weight: 60,
        restSeconds: 240,
        notes: 'Goal: 20 reps per set. Start at 12-15 reps range.',
        isBenchPress: true,
      },
      {
        id: 'incline_db_press',
        name: 'Incline Dumbbell Press',
        sets: 3,
        reps: 15,
        weight: 20,
        restSeconds: 180,
      },
      {
        id: 'lateral_raises_push',
        name: 'Lateral Raises',
        sets: 3,
        reps: 20,
        restSeconds: 120,
      },
      {
        id: 'db_tricep_extension',
        name: 'Dumbbell Triceps Extension',
        sets: 3,
        reps: 15,
        restSeconds: 180,
      },
    ],
  },
  {
    id: WorkoutCategory.LEGS,
    name: 'Leg Day',
    icon: '🦵',
    color: colors.legs,
    estimatedMinutes: 50,
    exercises: [
      {
        id: 'squats',
        name: 'Squats',
        sets: 6,
        reps: 4,
        restSeconds: 180,
      },
      {
        id: 'romanian_deadlift',
        name: 'Romanian Deadlift',
        sets: 3,
        reps: 10,
        restSeconds: 180,
      },
      {
        id: 'standing_calf_raises',
        name: 'Standing Calf Raises',
        sets: 1,
        reps: 100,
        restSeconds: 0,
        notes: 'Complete 100 total reps, break as needed.',
      },
      {
        id: 'lateral_raises_legs',
        name: 'Lateral Raises',
        sets: 3,
        reps: 20,
        restSeconds: 120,
      },
    ],
  },
  {
    id: WorkoutCategory.BACK_BICEPS,
    name: 'Back & Biceps',
    icon: '💪',
    color: colors.backBiceps,
    estimatedMinutes: 50,
    exercises: [
      {
        id: 'pull_ups_bb',
        name: 'Pull Ups',
        sets: 4,
        reps: 15,
        restSeconds: 240,
      },
      {
        id: 'single_arm_rows',
        name: 'Single Arm Rows',
        sets: 3,
        reps: 12,
        restSeconds: 180,
      },
      {
        id: 'hyperextensions',
        name: 'Hyperextensions',
        sets: 3,
        reps: 30,
        restSeconds: 180,
      },
      {
        id: 'hammer_curls_bb',
        name: 'Hammer Curls',
        sets: 3,
        reps: 15,
        restSeconds: 180,
      },
    ],
  },
  {
    id: WorkoutCategory.UPPER,
    name: 'Upper Day',
    icon: '🔥',
    color: colors.upper,
    estimatedMinutes: 45,
    exercises: [
      {
        id: 'bench_press_upper',
        name: 'Bench Press',
        sets: 4,
        reps: 6,
        restSeconds: 240,
        isBenchPress: true,
      },
      {
        id: 'pull_ups_upper',
        name: 'Pull Ups',
        sets: 3,
        reps: 15,
        restSeconds: 180,
      },
      {
        id: 'triceps_pushdown',
        name: 'Triceps Pushdown',
        sets: 3,
        reps: 20,
        restSeconds: 180,
      },
      {
        id: 'hammer_curls_upper',
        name: 'Hammer Curls',
        sets: 3,
        reps: 20,
        restSeconds: 180,
      },
    ],
  },
];

export const DEFAULT_PUSH_WEIGHT = 60; // kg
export const PUSH_WEIGHT_INCREMENT = 2.5; // kg
export const PUSH_GOAL_REPS = 20;
export const PUSH_GOAL_SETS = 2;

/** Starting bench weight for Push Day */
export const INITIAL_BENCH_PROGRESSION = {
  currentPushWeight: DEFAULT_PUSH_WEIGHT,
  currentUpperWeight: DEFAULT_PUSH_WEIGHT + 2.5, // default fallback
  history: [],
};

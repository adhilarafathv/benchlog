// ============================================================
// BenchLog — Personal Records Detection
// ============================================================

import {
  PersonalRecord,
  PersonalRecordType,
  WorkoutSession,
  WeightEntry,
  WorkoutCategory,
} from '../types';
import { calculateEstimated1RM } from './progression';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * Detect all personal records from workout history and weight data.
 */
export function detectPersonalRecords(
  workoutHistory: WorkoutSession[],
  weightEntries: WeightEntry[],
): PersonalRecord[] {
  const records: PersonalRecord[] = [];
  const completedWorkouts = workoutHistory.filter((w) => w.completed);

  // --- Highest Bench Weight ---
  let highestBenchWeight = 0;
  let highestBenchDate = '';
  let highestBenchSessionId = '';

  completedWorkouts.forEach((session) => {
    session.exercises.forEach((exercise) => {
      if (exercise.isBenchPress) {
        exercise.sets.forEach((set) => {
          if (set.completed && (set.weight ?? 0) > highestBenchWeight) {
            highestBenchWeight = set.weight ?? 0;
            highestBenchDate = session.completedAt ?? session.startedAt;
            highestBenchSessionId = session.id;
          }
        });
      }
    });
  });

  if (highestBenchWeight > 0) {
    records.push({
      type: PersonalRecordType.HIGHEST_BENCH_WEIGHT,
      value: highestBenchWeight,
      date: highestBenchDate,
      workoutSessionId: highestBenchSessionId,
      label: 'Highest Bench Weight',
      unit: 'kg',
    });
  }

  // --- Highest Estimated 1RM ---
  let highest1RM = 0;
  let highest1RMDate = '';
  let highest1RMSessionId = '';

  completedWorkouts.forEach((session) => {
    session.exercises.forEach((exercise) => {
      if (exercise.isBenchPress) {
        exercise.sets.forEach((set) => {
          if (set.completed && set.weight && set.actualReps) {
            const estimated = calculateEstimated1RM(set.weight, set.actualReps);
            if (estimated > highest1RM) {
              highest1RM = estimated;
              highest1RMDate = session.completedAt ?? session.startedAt;
              highest1RMSessionId = session.id;
            }
          }
        });
      }
    });
  });

  if (highest1RM > 0) {
    records.push({
      type: PersonalRecordType.HIGHEST_1RM,
      value: highest1RM,
      date: highest1RMDate,
      workoutSessionId: highest1RMSessionId,
      label: 'Highest Estimated 1RM',
      unit: 'kg',
    });
  }

  // --- Most Bench Reps (in a single set) ---
  let mostReps = 0;
  let mostRepsDate = '';
  let mostRepsSessionId = '';

  completedWorkouts.forEach((session) => {
    session.exercises.forEach((exercise) => {
      if (exercise.isBenchPress) {
        exercise.sets.forEach((set) => {
          if (set.completed && (set.actualReps ?? 0) > mostReps) {
            mostReps = set.actualReps ?? 0;
            mostRepsDate = session.completedAt ?? session.startedAt;
            mostRepsSessionId = session.id;
          }
        });
      }
    });
  });

  if (mostReps > 0) {
    records.push({
      type: PersonalRecordType.MOST_BENCH_REPS,
      value: mostReps,
      date: mostRepsDate,
      workoutSessionId: mostRepsSessionId,
      label: 'Most Bench Reps (Single Set)',
      unit: 'reps',
    });
  }

  // --- Highest Bodyweight ---
  if (weightEntries.length > 0) {
    const sorted = [...weightEntries].sort((a, b) => b.weight - a.weight);
    records.push({
      type: PersonalRecordType.HIGHEST_BODYWEIGHT,
      value: sorted[0].weight,
      date: sorted[0].date,
      label: 'Highest Bodyweight',
      unit: 'kg',
    });

    // --- Lowest Bodyweight ---
    const sortedAsc = [...weightEntries].sort((a, b) => a.weight - b.weight);
    records.push({
      type: PersonalRecordType.LOWEST_BODYWEIGHT,
      value: sortedAsc[0].weight,
      date: sortedAsc[0].date,
      label: 'Lowest Bodyweight',
      unit: 'kg',
    });
  }

  // --- Longest Workout Streak ---
  if (completedWorkouts.length > 0) {
    const sortedDates = completedWorkouts
      .map((w) => w.completedAt ?? w.startedAt)
      .sort((a, b) => parseISO(a).getTime() - parseISO(b).getTime());

    let currentStreak = 1;
    let maxStreak = 1;
    let streakEndDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const daysDiff = differenceInDays(
        parseISO(sortedDates[i]),
        parseISO(sortedDates[i - 1]),
      );
      // Allow max 2 days gap (rest day) for streak continuity
      if (daysDiff <= 2) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          streakEndDate = sortedDates[i];
        }
      } else {
        currentStreak = 1;
      }
    }

    records.push({
      type: PersonalRecordType.LONGEST_STREAK,
      value: maxStreak,
      date: streakEndDate,
      label: 'Longest Workout Streak',
      unit: 'sessions',
    });
  }

  // --- Largest Monthly Weight Gain/Loss ---
  if (weightEntries.length >= 14) {
    const sorted = [...weightEntries].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime(),
    );

    let maxGain = 0;
    let maxGainDate = '';
    let maxLoss = 0;
    let maxLossDate = '';

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const daysDiff = differenceInDays(
          parseISO(sorted[j].date),
          parseISO(sorted[i].date),
        );
        if (daysDiff >= 25 && daysDiff <= 35) {
          const change = sorted[j].weight - sorted[i].weight;
          if (change > maxGain) {
            maxGain = change;
            maxGainDate = sorted[j].date;
          }
          if (change < maxLoss) {
            maxLoss = change;
            maxLossDate = sorted[j].date;
          }
        }
      }
    }

    if (maxGain > 0) {
      records.push({
        type: PersonalRecordType.LARGEST_MONTHLY_GAIN,
        value: Math.round(maxGain * 10) / 10,
        date: maxGainDate,
        label: 'Largest Monthly Gain',
        unit: 'kg',
      });
    }

    if (maxLoss < 0) {
      records.push({
        type: PersonalRecordType.LARGEST_MONTHLY_LOSS,
        value: Math.round(Math.abs(maxLoss) * 10) / 10,
        date: maxLossDate,
        label: 'Largest Monthly Loss',
        unit: 'kg',
      });
    }
  }

  return records;
}

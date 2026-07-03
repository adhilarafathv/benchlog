// ============================================================
// BenchLog — Bench Progression Engine
// ============================================================

import {
  PUSH_WEIGHT_INCREMENT,
  PUSH_GOAL_REPS,
  PUSH_GOAL_SETS,
} from '../constants/workouts';
import {
  ExerciseLog,
  BenchProgressionEntry,
  WorkoutSession,
  ActiveWorkout,
  WorkoutCategory,
} from '../types';

export interface PushProgressStatus {
  nextTargetWeight: number;
  goalReps: number;
  goalSets: number;
  /** Reps on the weakest logged set (capped at goal) */
  bottleneckReps: number;
  remainingReps: number;
  progressPercent: number;
  setsAtGoal: number;
  statusMessage: string;
  isComplete: boolean;
  isLive: boolean;
}

/**
 * Calculate Estimated 1 Rep Max using the Epley formula.
 * 1RM = weight × (1 + reps / 30)
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Evaluate Push Day bench progression.
 *
 * Rule: If BOTH sets reach the goal reps (20),
 * increase Push Weight by 2.5 kg.
 *
 * @returns New push weight (unchanged if criteria not met)
 */
export function evaluatePushProgression(
  benchLog: ExerciseLog,
  currentPushWeight: number,
): { newWeight: number; progressed: boolean; reason: string } {
  const benchSets = benchLog.sets.filter((s) => s.completed);

  if (benchSets.length < PUSH_GOAL_SETS) {
    return {
      newWeight: currentPushWeight,
      progressed: false,
      reason: `Only ${benchSets.length}/${PUSH_GOAL_SETS} sets completed`,
    };
  }

  // Check if the required number of sets all hit the goal reps
  const qualifyingSets = benchSets.filter(
    (s) => (s.actualReps ?? 0) >= PUSH_GOAL_REPS,
  );

  if (qualifyingSets.length >= PUSH_GOAL_SETS) {
    const newWeight = currentPushWeight + PUSH_WEIGHT_INCREMENT;
    return {
      newWeight,
      progressed: true,
      reason: `Both sets hit ${PUSH_GOAL_REPS} reps → weight increased to ${newWeight} kg`,
    };
  }

  return {
    newWeight: currentPushWeight,
    progressed: false,
    reason: `${qualifyingSets.length}/${PUSH_GOAL_SETS} sets hit ${PUSH_GOAL_REPS} reps`,
  };
}

/**
 * Calculate Upper Day bench weight based on Push Day performance.
 *
 * Rules:
 * - If Push reps ≥ 20 → pushWeight + 7.5 kg
 * - If Push reps ≥ 15 → pushWeight + 5 kg
 * - Else → pushWeight + 2.5 kg
 */
export function calculateUpperWeight(
  pushWeight: number,
  lastPushMaxReps: number,
): number {
  if (lastPushMaxReps >= 20) {
    return pushWeight + 7.5;
  } else if (lastPushMaxReps >= 15) {
    return pushWeight + 5;
  } else {
    return pushWeight + 2.5;
  }
}

/**
 * Get the maximum reps achieved across bench sets in a Push Day session.
 */
export function getMaxBenchReps(benchLog: ExerciseLog): number {
  return benchLog.sets.reduce((max, set) => {
    const reps = set.actualReps ?? 0;
    return reps > max ? reps : max;
  }, 0);
}

/**
 * Get total bench reps across all sets.
 */
export function getTotalBenchReps(benchLog: ExerciseLog): number {
  return benchLog.sets.reduce((total, set) => {
    return total + (set.actualReps ?? 0);
  }, 0);
}

/**
 * Calculate bench-to-bodyweight ratio.
 */
export function benchToBodyweightRatio(
  benchWeight: number,
  bodyweight: number,
): number {
  if (bodyweight <= 0) return 0;
  return Math.round((benchWeight / bodyweight) * 100) / 100;
}

/**
 * Resolve the bench exercise log used for dashboard progression display.
 * Prefers an in-progress Push Day session over the last completed one.
 */
export function getBenchLogForProgress(
  history: WorkoutSession[],
  activeWorkout: ActiveWorkout | null,
): { benchLog: ExerciseLog | null; isLive: boolean } {
  if (activeWorkout?.session.templateId === WorkoutCategory.PUSH) {
    const benchLog = activeWorkout.session.exercises.find((e) => e.isBenchPress);
    if (benchLog) return { benchLog, isLive: true };
  }

  const lastPush = history.find(
    (s) => s.completed && s.templateId === WorkoutCategory.PUSH,
  );
  const benchLog =
    lastPush?.exercises.find((e) => e.isBenchPress) ?? null;

  return { benchLog, isLive: false };
}

/**
 * Compute push-day progression status for dashboard and summary views.
 */
export function getPushProgressStatus(
  benchLog: ExerciseLog | null,
  currentPushWeight: number,
  isLive = false,
): PushProgressStatus {
  const nextTargetWeight = currentPushWeight + PUSH_WEIGHT_INCREMENT;

  if (!benchLog) {
    return {
      nextTargetWeight,
      goalReps: PUSH_GOAL_REPS,
      goalSets: PUSH_GOAL_SETS,
      bottleneckReps: 0,
      remainingReps: PUSH_GOAL_REPS,
      progressPercent: 0,
      setsAtGoal: 0,
      statusMessage: 'Start a Push Day to track your progression.',
      isComplete: false,
      isLive,
    };
  }

  const setsWithReps = benchLog.sets.filter(
    (s) => s.actualReps !== null && s.actualReps > 0,
  );
  const completedSets = benchLog.sets.filter(
    (s) => s.completed && s.actualReps !== null,
  );
  const setsAtGoal = completedSets.filter(
    (s) => (s.actualReps ?? 0) >= PUSH_GOAL_REPS,
  ).length;

  const bottleneckReps =
    setsWithReps.length > 0
      ? Math.min(
          ...setsWithReps.map((s) => s.actualReps!),
          PUSH_GOAL_REPS,
        )
      : 0;

  const isComplete = setsAtGoal >= PUSH_GOAL_SETS;
  const remainingReps = isComplete
    ? 0
    : Math.max(0, PUSH_GOAL_REPS - bottleneckReps);

  const setsProgress = (setsAtGoal / PUSH_GOAL_SETS) * 100;
  const repsProgress = (bottleneckReps / PUSH_GOAL_REPS) * 100;
  const progressPercent = Math.min(
    Math.round(Math.max(setsProgress, repsProgress)),
    100,
  );

  let statusMessage: string;
  if (isComplete) {
    statusMessage = isLive
      ? 'Both sets hit 20 reps — finish the workout to apply +2.5 kg!'
      : 'Both sets hit 20 reps on your last Push Day.';
  } else if (setsAtGoal === 1) {
    statusMessage = `${remainingReps} reps remaining on your next set for progression.`;
  } else if (bottleneckReps > 0) {
    statusMessage = `${remainingReps} rep${remainingReps === 1 ? '' : 's'} remaining until your next weight increase.`;
  } else {
    statusMessage = `Goal: ${PUSH_GOAL_SETS} sets of ${PUSH_GOAL_REPS} reps for +${PUSH_WEIGHT_INCREMENT} kg.`;
  }

  return {
    nextTargetWeight,
    goalReps: PUSH_GOAL_REPS,
    goalSets: PUSH_GOAL_SETS,
    bottleneckReps,
    remainingReps,
    progressPercent,
    setsAtGoal,
    statusMessage,
    isComplete,
    isLive,
  };
}

/**
 * Create a progression history entry.
 */
export function createProgressionEntry(
  pushWeight: number,
  upperWeight: number,
  reason: string,
): BenchProgressionEntry {
  return {
    date: new Date().toISOString(),
    pushWeight,
    upperWeight,
    reason,
  };
}

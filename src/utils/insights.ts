// ============================================================
// BenchLog — Smart Insights Generator
// ============================================================

import { Insight, WorkoutSession, WeightEntry, WorkoutCategory } from '../types';
import {
  calculateWeeklyChange,
  determineTrend,
  getCurrentWeight,
} from './weightAnalytics';
import { differenceInDays, parseISO } from 'date-fns';

let insightCounter = 0;

function createInsight(
  message: string,
  type: Insight['type'],
  emoji: string,
  priority: number,
): Insight {
  return {
    id: `insight_${++insightCounter}`,
    message,
    type,
    emoji,
    priority,
  };
}

/**
 * Generate contextual insights based on recent workout and weight data.
 * Returns the highest-priority insight.
 */
export function generateInsight(
  weightEntries: WeightEntry[],
  workoutHistory: WorkoutSession[],
  currentPushWeight: number,
): Insight {
  const insights: Insight[] = [];

  // --- Weight insights ---
  const weeklyChange = calculateWeeklyChange(weightEntries);
  if (weeklyChange !== null) {
    if (weeklyChange > 0) {
      insights.push(
        createInsight(
          `You gained ${Math.abs(weeklyChange)} kg this week.`,
          'weight',
          '📈',
          10,
        ),
      );
    } else if (weeklyChange < 0) {
      insights.push(
        createInsight(
          `You lost ${Math.abs(weeklyChange)} kg this week.`,
          'weight',
          '📉',
          10,
        ),
      );
    } else {
      insights.push(
        createInsight(
          'Weight has been stable this week.',
          'weight',
          '⚖️',
          5,
        ),
      );
    }
  }

  // --- Trend plateau detection ---
  const trend = determineTrend(weightEntries);
  if (trend === null && weightEntries.length >= 7) {
    insights.push(
      createInsight(
        'Weight has plateaued. Consider adjusting your nutrition.',
        'plateau',
        '🔄',
        8,
      ),
    );
  }

  // --- Bench progress insights ---
  const completedWorkouts = workoutHistory.filter((w) => w.completed);
  const pushSessions = completedWorkouts.filter(
    (w) => w.templateId === WorkoutCategory.PUSH,
  );

  if (pushSessions.length >= 2) {
    const latest = pushSessions[pushSessions.length - 1];
    const previous = pushSessions[pushSessions.length - 2];
    const latestBench = latest.exercises.find((e) => e.isBenchPress);
    const prevBench = previous.exercises.find((e) => e.isBenchPress);

    if (latestBench && prevBench) {
      const latestTotalReps = latestBench.sets.reduce(
        (sum, s) => sum + (s.actualReps ?? 0),
        0,
      );
      const prevTotalReps = prevBench.sets.reduce(
        (sum, s) => sum + (s.actualReps ?? 0),
        0,
      );
      const repDiff = latestTotalReps - prevTotalReps;

      if (repDiff > 0) {
        insights.push(
          createInsight(
            `Bench improved by ${repDiff} reps since last session.`,
            'bench',
            '💪',
            9,
          ),
        );
      } else if (repDiff < 0) {
        insights.push(
          createInsight(
            `Bench decreased by ${Math.abs(repDiff)} reps. Recovery day?`,
            'bench',
            '🔻',
            7,
          ),
        );
      }
    }
  }

  // --- Streak insight ---
  if (completedWorkouts.length > 0) {
    const sortedWorkouts = [...completedWorkouts].sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime(),
    );
    const lastWorkout = sortedWorkouts[0];
    const daysSince = differenceInDays(
      new Date(),
      parseISO(lastWorkout.completedAt!),
    );

    if (daysSince === 0) {
      insights.push(
        createInsight(
          'Great workout today! Keep the momentum going.',
          'streak',
          '🔥',
          6,
        ),
      );
    } else if (daysSince >= 3) {
      insights.push(
        createInsight(
          `${daysSince} days since your last workout. Time to train!`,
          'streak',
          '⏰',
          8,
        ),
      );
    }
  }

  // --- Bench weight milestone ---
  if (currentPushWeight > 60 && currentPushWeight % 10 === 0) {
    insights.push(
      createInsight(
        `Bench press is at ${currentPushWeight} kg! New milestone! 🎉`,
        'bench',
        '🏆',
        9,
      ),
    );
  }

  // --- Fallback ---
  if (insights.length === 0) {
    if (completedWorkouts.length === 0 && weightEntries.length === 0) {
      return createInsight(
        'Welcome to BenchLog! Start by logging your first workout.',
        'general',
        '👋',
        1,
      );
    }
    return createInsight(
      'Consistency is key. Keep showing up!',
      'general',
      '💯',
      1,
    );
  }

  // Return highest priority insight
  insights.sort((a, b) => b.priority - a.priority);
  return insights[0];
}

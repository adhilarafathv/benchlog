// ============================================================
// BenchLog — Weight Analytics Utilities
// ============================================================

import { TrendDirection, WeightEntry } from '../types';
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  subMonths,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns';

/**
 * Get the most recent weight entry.
 */
export function getCurrentWeight(entries: WeightEntry[]): number | null {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return sorted[0].weight;
}

/**
 * Calculate average weight for a given set of entries.
 */
function averageWeight(entries: WeightEntry[]): number | null {
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => acc + e.weight, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}

/**
 * Get entries within a date interval.
 */
function entriesInRange(
  entries: WeightEntry[],
  start: Date,
  end: Date,
): WeightEntry[] {
  return entries.filter((e) => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: startOfDay(start), end });
  });
}

/**
 * Calculate the weekly average bodyweight.
 * Uses entries from the current week (Mon-Sun).
 */
export function calculateWeeklyAverage(
  entries: WeightEntry[],
): number | null {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekEntries = entriesInRange(entries, weekStart, weekEnd);
  return averageWeight(weekEntries);
}

/**
 * Calculate the previous week's average for comparison.
 */
export function calculatePreviousWeekAverage(
  entries: WeightEntry[],
): number | null {
  const now = new Date();
  const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const weekEntries = entriesInRange(entries, prevWeekStart, prevWeekEnd);
  return averageWeight(weekEntries);
}

/**
 * Calculate monthly average bodyweight.
 * Uses entries from the last 30 days.
 */
export function calculateMonthlyAverage(
  entries: WeightEntry[],
): number | null {
  const now = new Date();
  const monthAgo = subMonths(now, 1);
  const monthEntries = entriesInRange(entries, monthAgo, now);
  return averageWeight(monthEntries);
}

/**
 * Calculate the weekly change in bodyweight.
 * Compares current week's average to previous week's average.
 */
export function calculateWeeklyChange(
  entries: WeightEntry[],
): number | null {
  const currentAvg = calculateWeeklyAverage(entries);
  const prevAvg = calculatePreviousWeekAverage(entries);

  if (currentAvg === null || prevAvg === null) return null;
  return Math.round((currentAvg - prevAvg) * 10) / 10;
}

/**
 * Determine the weight trend based on weekly averages.
 *
 * Gaining: weekly change > +0.1 kg
 * Losing: weekly change < -0.1 kg
 * Maintaining: within ±0.1 kg
 */
export function determineTrend(
  entries: WeightEntry[],
): TrendDirection | null {
  const change = calculateWeeklyChange(entries);
  if (change === null) return null;

  if (change > 0.1) return TrendDirection.GAINING;
  if (change < -0.1) return TrendDirection.LOSING;
  return TrendDirection.MAINTAINING;
}

/**
 * Get the trend emoji for display.
 */
export function getTrendEmoji(trend: TrendDirection | null): string {
  switch (trend) {
    case TrendDirection.GAINING:
      return '📈';
    case TrendDirection.LOSING:
      return '📉';
    case TrendDirection.MAINTAINING:
      return '➡️';
    default:
      return '—';
  }
}

/**
 * Get the trend label for display.
 */
export function getTrendLabel(trend: TrendDirection | null): string {
  switch (trend) {
    case TrendDirection.GAINING:
      return 'Gaining';
    case TrendDirection.LOSING:
      return 'Losing';
    case TrendDirection.MAINTAINING:
      return 'Maintaining';
    default:
      return 'No data';
  }
}

/**
 * Recent weight entries for sparkline charts (oldest → newest).
 */
export function getRecentWeightTrend(
  entries: WeightEntry[],
  count = 7,
): { date: string; weight: number }[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return sorted.slice(-count).map((e) => ({
    date: e.date,
    weight: e.weight,
  }));
}

/**
 * Calculate progress percentage toward goal weight.
 */
export function calculateGoalProgress(
  startWeight: number | null,
  currentWeight: number | null,
  goalWeight: number | null,
): number {
  if (!startWeight || !currentWeight || !goalWeight) return 0;
  const totalDiff = goalWeight - startWeight;
  if (totalDiff === 0) return 100;
  const currentDiff = currentWeight - startWeight;
  const progress = (currentDiff / totalDiff) * 100;
  return Math.min(Math.max(Math.round(progress), 0), 100);
}

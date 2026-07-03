// ============================================================
// BenchLog — Unit Conversion Utilities
// ============================================================

import { WeightUnit } from '../types';

const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;

/**
 * Convert weight from kg to the target unit.
 */
export function convertFromKg(weightKg: number, unit: WeightUnit): number {
  if (unit === WeightUnit.LB) {
    return Math.round(weightKg * KG_TO_LB * 10) / 10;
  }
  return Math.round(weightKg * 10) / 10;
}

/**
 * Convert weight from the given unit to kg for storage.
 */
export function convertToKg(weight: number, unit: WeightUnit): number {
  if (unit === WeightUnit.LB) {
    return Math.round(weight * LB_TO_KG * 10) / 10;
  }
  return weight;
}

/**
 * Get the display label for the current unit.
 */
export function getUnitLabel(unit: WeightUnit): string {
  return unit === WeightUnit.KG ? 'kg' : 'lb';
}

/**
 * Format weight for display with unit.
 */
export function formatWeight(weightKg: number, unit: WeightUnit): string {
  const converted = convertFromKg(weightKg, unit);
  return `${converted} ${getUnitLabel(unit)}`;
}

/**
 * Format duration in seconds to a readable string (e.g. "45 min", "1h 12m").
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

/**
 * Format rest time in seconds to a display string (e.g. "4:00").
 */
export function formatRestTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

import { formatDistanceToNow, isYesterday, isToday, parseISO } from 'date-fns';

/**
 * Format ISO date to a friendly relative date string
 */
export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return formatDistanceToNow(date, { addSuffix: true });
}


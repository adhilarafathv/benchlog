import React from 'react';
import { View, Text } from 'react-native';
import { useWeightStore } from '../../store/weightStore';
import { useSettingsStore } from '../../store/settingsStore';
import {
  getCurrentWeight,
  calculateWeeklyAverage,
  calculateMonthlyAverage,
  calculateWeeklyChange,
} from '../../utils/weightAnalytics';
import { formatWeight } from '../../utils/conversions';

export const WeightStatsRow: React.FC = () => {
  const { entries } = useWeightStore();
  const { settings } = useSettingsStore();
  const { weightUnit } = settings;

  const current = getCurrentWeight(entries);
  const weeklyAvg = calculateWeeklyAverage(entries);
  const monthlyAvg = calculateMonthlyAverage(entries);
  const weeklyChange = calculateWeeklyChange(entries);

  const stats = [
    {
      label: 'Current Weight',
      value: current !== null ? formatWeight(current, weightUnit) : '—',
    },
    {
      label: 'Weekly Average',
      value: weeklyAvg !== null ? formatWeight(weeklyAvg, weightUnit) : '—',
    },
    {
      label: 'Monthly Average',
      value: monthlyAvg !== null ? formatWeight(monthlyAvg, weightUnit) : '—',
    },
    {
      label: 'Weekly Change',
      value: weeklyChange !== null
        ? `${weeklyChange > 0 ? '+' : ''}${formatWeight(weeklyChange, weightUnit)}`
        : '—',
      color: weeklyChange !== null
        ? weeklyChange > 0
          ? 'text-accent'
          : weeklyChange < 0
          ? 'text-success'
          : 'text-textSecondary'
        : 'text-textTertiary',
    },
  ];

  return (
    <View className="flex-row flex-wrap justify-between mb-4">
      {stats.map((s, idx) => (
        <View
          key={idx}
          className="w-[48%] bg-card border border-cardBorder rounded-2xl p-4 mb-3 justify-center"
        >
          <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-1">
            {s.label}
          </Text>
          <Text className={`text-white text-lg font-extrabold tracking-tight ${s.color || ''}`}>
            {s.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

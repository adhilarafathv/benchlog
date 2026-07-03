import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../shared/Card';
import { useWeightStore } from '../../store/weightStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getCurrentWeight, calculateGoalProgress } from '../../utils/weightAnalytics';
import { formatWeight } from '../../utils/conversions';

export const ProgressBar: React.FC = () => {
  const { entries } = useWeightStore();
  const { settings } = useSettingsStore();
  const { weightUnit, goalWeight } = settings;

  const current = getCurrentWeight(entries);
  
  // Start weight is the oldest logged weight entry
  const startWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;

  if (!goalWeight) {
    return (
      <Card className="mb-4 bg-cardElevated border border-cardBorder p-4">
        <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider mb-1">
          Goal Progress
        </Text>
        <Text className="text-white text-sm font-semibold mt-2">
          No goal weight set
        </Text>
        <Text className="text-textTertiary text-xs mt-1">
          Set a goal weight in settings to track your progress.
        </Text>
      </Card>
    );
  }

  const progress = calculateGoalProgress(startWeight, current, goalWeight);

  return (
    <Card className="mb-4 bg-cardElevated border border-accent/15 p-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-textSecondary text-xs font-bold uppercase tracking-wider">
          Goal Progress
        </Text>
        <Text className="text-accent text-sm font-black">{progress}%</Text>
      </View>

      <View className="w-full h-2.5 bg-card rounded-full overflow-hidden mb-3">
        <View 
          style={{ width: `${progress}%` }} 
          className="h-full bg-accent rounded-full"
        />
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-textTertiary text-[10px] uppercase font-semibold">Start</Text>
          <Text className="text-white text-xs font-bold mt-0.5">
            {startWeight !== null ? formatWeight(startWeight, weightUnit) : '—'}
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-textTertiary text-[10px] uppercase font-semibold">Current</Text>
          <Text className="text-accent text-xs font-bold mt-0.5">
            {current !== null ? formatWeight(current, weightUnit) : '—'}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-textTertiary text-[10px] uppercase font-semibold">Goal</Text>
          <Text className="text-white text-xs font-bold mt-0.5">
            {formatWeight(goalWeight, weightUnit)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

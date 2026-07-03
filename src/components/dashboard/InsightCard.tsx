import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../shared/Card';
import { useWeightStore } from '../../store/weightStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { useProgressionStore } from '../../store/progressionStore';
import { generateInsight } from '../../utils/insights';

export const InsightCard: React.FC = () => {
  const { entries } = useWeightStore();
  const { history } = useWorkoutStore();
  const { progression } = useProgressionStore();
  const currentPushWeight = progression.currentPushWeight;

  const insight = generateInsight(entries, history, currentPushWeight);

  return (
    <Card variant="elevated" className="border-l-4 border-l-accent border-r border-t border-b border-cardBorder">
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">{insight.emoji}</Text>
        <View className="flex-1">
          <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-0.5">
            Smart Insight
          </Text>
          <Text className="text-white text-sm font-semibold leading-5">
            {insight.message}
          </Text>
        </View>
      </View>
    </Card>
  );
};

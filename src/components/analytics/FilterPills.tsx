import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AnalyticsFilter } from '../../types';
import * as Haptics from 'expo-haptics';

interface FilterPillsProps {
  selectedFilter: AnalyticsFilter;
  onChange: (filter: AnalyticsFilter) => void;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  selectedFilter,
  onChange,
}) => {
  const options = [
    { label: '30D', value: AnalyticsFilter.THIRTY_DAYS },
    { label: '3M', value: AnalyticsFilter.THREE_MONTHS },
    { label: '6M', value: AnalyticsFilter.SIX_MONTHS },
    { label: '1Y', value: AnalyticsFilter.ONE_YEAR },
    { label: 'All', value: AnalyticsFilter.ALL_TIME },
  ];

  const handlePress = (value: AnalyticsFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(value);
  };

  return (
    <View className="flex-row justify-between bg-card border border-cardBorder p-1 rounded-xl mb-4">
      {options.map((opt) => {
        const isSelected = selectedFilter === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => handlePress(opt.value)}
            className={`flex-1 py-2 items-center justify-center rounded-lg ${
              isSelected ? 'bg-accent shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-2xs font-extrabold tracking-wider ${
                isSelected ? 'text-white' : 'text-textSecondary'
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

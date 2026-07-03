import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useWeightStore } from '../../store/weightStore';
import { useSettingsStore } from '../../store/settingsStore';
import { formatWeight } from '../../utils/conversions';
import { parseISO, format as dateFormat } from 'date-fns';
import * as Haptics from 'expo-haptics';

export const WeightHistory: React.FC = () => {
  const { entries, removeWeightEntry } = useWeightStore();
  const { settings } = useSettingsStore();
  const { weightUnit } = settings;

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeWeightEntry(id);
  };

  if (entries.length === 0) {
    return (
      <View className="py-10 items-center">
        <Text className="text-textSecondary text-sm font-medium">No history logged yet.</Text>
      </View>
    );
  }

  return (
    <View className="space-y-3">
      {entries.map((entry) => {
        const dateObj = parseISO(entry.date);
        const dayName = dateFormat(dateObj, 'EEEE');
        const formattedDate = dateFormat(dateObj, 'MMM d, yyyy');

        return (
          <View
            key={entry.id}
            className="flex-col bg-card border border-cardBorder rounded-2xl p-4 mb-3"
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white text-sm font-bold">{dayName}</Text>
                <Text className="text-textSecondary text-2xs mt-0.5">{formattedDate}</Text>
              </View>

              <View className="flex-row items-center space-x-3">
                <Text className="text-white text-base font-black">
                  {formatWeight(entry.weight, weightUnit)}
                </Text>
                
                <Pressable
                  onPress={() => handleDelete(entry.id)}
                  className="w-8 h-8 items-center justify-center rounded-lg bg-cardElevated active:opacity-60"
                >
                  <Text className="text-error text-xs font-bold">🗑️</Text>
                </Pressable>
              </View>
            </View>

            {entry.notes && (
              <View className="mt-3 pt-2.5 border-t border-cardBorder">
                <Text className="text-textSecondary text-xs italic leading-4">
                  "{entry.notes}"
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

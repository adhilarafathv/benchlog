import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../../store/workoutStore';
import { WorkoutCategory } from '../../types';
import { colors } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

export const QuickStartGrid: React.FC = () => {
  const router = useRouter();
  const startWorkout = useWorkoutStore((state) => state.startWorkout);

  const workouts = [
    {
      id: WorkoutCategory.PUSH,
      name: 'Push Day',
      emoji: '🏋️',
      color: colors.push,
      bgColor: 'bg-push/10',
      borderColor: 'border-push/20',
    },
    {
      id: WorkoutCategory.BACK_BICEPS,
      name: 'Back & Biceps',
      emoji: '💪',
      color: colors.backBiceps,
      bgColor: 'bg-backBiceps/10',
      borderColor: 'border-backBiceps/20',
    },
    {
      id: WorkoutCategory.LEGS,
      name: 'Leg Day',
      emoji: '🦵',
      color: colors.legs,
      bgColor: 'bg-legs/10',
      borderColor: 'border-legs/20',
    },
    {
      id: WorkoutCategory.UPPER,
      name: 'Upper Day',
      emoji: '🔥',
      color: colors.upper,
      bgColor: 'bg-upper/10',
      borderColor: 'border-upper/20',
    },
  ];

  const handleStart = (category: WorkoutCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startWorkout(category);
    
    // Retrieve the active workout session ID
    const activeWorkout = useWorkoutStore.getState().activeWorkout;
    if (activeWorkout) {
      router.push(`/workout/${activeWorkout.session.id}`);
    }
  };

  return (
    <View className="flex-row flex-wrap justify-between">
      {workouts.map((w) => (
        <Pressable
          key={w.id}
          onPress={() => handleStart(w.id)}
          style={({ pressed }) => pressed && { transform: [{ scale: 0.96 }] }}
          className={`w-[48%] h-24 mb-4 rounded-2xl border ${w.borderColor} ${w.bgColor} p-4 justify-between active:opacity-90`}
        >
          <Text className="text-2xl">{w.emoji}</Text>
          <Text className="text-white font-bold text-sm tracking-tight">{w.name}</Text>
        </Pressable>
      ))}
    </View>
  );
};

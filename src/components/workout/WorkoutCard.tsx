import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { WorkoutTemplate, WorkoutSession } from '../../types';
import { useWorkoutStore } from '../../store/workoutStore';
import { formatRelativeDate } from '../../utils/conversions';
import * as Haptics from 'expo-haptics';

interface WorkoutCardProps {
  template: WorkoutTemplate;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ template }) => {
  const router = useRouter();
  const history = useWorkoutStore((state) => state.history);
  const startWorkout = useWorkoutStore((state) => state.startWorkout);

  // Find the last completed session of this template
  const lastSession = history
    .filter((s) => s.templateId === template.id && s.completed && s.completedAt)
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    )[0];

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startWorkout(template.id);
    
    // Retrieve the active workout session ID
    const activeWorkout = useWorkoutStore.getState().activeWorkout;
    if (activeWorkout) {
      router.push(`/workout/${activeWorkout.session.id}`);
    }
  };

  return (
    <Card className="mb-4 flex-col justify-between">
      <View className="flex-row items-center mb-3">
        <Text className="text-3xl mr-3">{template.icon}</Text>
        <View>
          <Text className="text-white text-lg font-bold tracking-tight uppercase">
            {template.name}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-textSecondary text-xs mr-2">
              {template.exercises.length} Exercises
            </Text>
            <Text className="text-textTertiary text-xs">•</Text>
            <Text className="text-textSecondary text-xs ml-2">
              ~{template.estimatedMinutes} min
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-textTertiary text-xs uppercase font-bold tracking-wider">
          Last Completed
        </Text>
        <Text className="text-white text-sm font-medium mt-1">
          {lastSession && lastSession.completedAt
            ? formatRelativeDate(lastSession.completedAt)
            : 'Never'}
        </Text>
      </View>

      <Button
        title="Start Workout"
        onPress={handleStart}
        variant="primary"
        className="w-full"
      />
    </Card>
  );
};

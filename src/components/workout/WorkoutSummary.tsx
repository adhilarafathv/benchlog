import React from 'react';
import { View, Text, Modal, SafeAreaView, ScrollView } from 'react-native';
import { Button } from '../shared/Button';
import { WorkoutSession, PersonalRecord } from '../../types';
import { formatDuration } from '../../utils/conversions';
import { colors } from '../../constants/theme';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

interface WorkoutSummaryProps {
  visible: boolean;
  session: WorkoutSession | null;
  onClose: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  visible,
  session,
  onClose,
}) => {
  if (!session) return null;

  // Gather stats
  const exerciseCount = session.exercises.length;
  const completedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  // Find if they worked out Bench Press and what the max weight was
  const benchExercise = session.exercises.find((e) => e.isBenchPress);
  const benchMaxWeight = benchExercise
    ? benchExercise.sets.reduce((max, s) => {
        if (s.completed && s.weight && s.weight > max) return s.weight;
        return max;
      }, 0)
    : null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-background/95 justify-center items-center px-4 z-50">
        <SafeAreaView className="w-full max-w-md bg-card border border-cardBorder rounded-3xl overflow-hidden shadow-2xl">
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Animated.View entering={SlideInUp.duration(400)}>
              <Text className="text-center text-4xl mb-3">🏆</Text>
              <Text className="text-white text-2xl font-extrabold text-center tracking-tight">
                Workout Complete!
              </Text>
              <Text className="text-accent text-center text-sm font-semibold mt-1 uppercase tracking-wider">
                {session.templateName}
              </Text>

              {/* Stats Box */}
              <View className="flex-row justify-between bg-cardElevated border border-cardBorder p-4 rounded-2xl my-6">
                <View className="items-center flex-1">
                  <Text className="text-textTertiary text-2xs uppercase font-bold">Duration</Text>
                  <Text className="text-white text-base font-extrabold mt-1">
                    {formatDuration(session.duration)}
                  </Text>
                </View>
                
                <View className="w-[1px] h-10 bg-cardBorder self-center" />

                <View className="items-center flex-1">
                  <Text className="text-textTertiary text-2xs uppercase font-bold">Exercises</Text>
                  <Text className="text-white text-base font-extrabold mt-1">
                    {exerciseCount}
                  </Text>
                </View>

                <View className="w-[1px] h-10 bg-cardBorder self-center" />

                <View className="items-center flex-1">
                  <Text className="text-textTertiary text-2xs uppercase font-bold">Sets Done</Text>
                  <Text className="text-white text-base font-extrabold mt-1">
                    {completedSets}
                  </Text>
                </View>
              </View>

              {/* Bench press highlight */}
              {benchMaxWeight !== null && benchMaxWeight > 0 && (
                <View className="bg-accent/5 border border-accent/20 p-4 rounded-2xl mb-6">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-accent text-2xs uppercase font-bold tracking-wider">Bench Press Performance</Text>
                      <Text className="text-white text-sm font-semibold mt-0.5">Top Set Weight</Text>
                    </View>
                    <Text className="text-white text-lg font-black">{benchMaxWeight} kg</Text>
                  </View>
                </View>
              )}

              <Text className="text-textSecondary text-xs text-center leading-5 mb-6">
                Your session stats have been recorded. If progression goals were met, your bench target weight has been updated automatically.
              </Text>

              <Button
                title="Finish"
                onPress={onClose}
                variant="primary"
                className="w-full py-3.5"
              />
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { AnimatedScreen } from '../../src/components/shared/AnimatedScreen';
import { WorkoutCard } from '../../src/components/workout/WorkoutCard';
import { SectionHeader } from '../../src/components/shared/SectionHeader';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { WORKOUT_TEMPLATES } from '../../src/constants/workouts';
import { formatDuration, formatRelativeDate } from '../../src/utils/conversions';
import { Card } from '../../src/components/shared/Card';

export default function WorkoutsScreen() {
  const { history } = useWorkoutStore();

  const completedWorkouts = history.filter((w) => w.completed);

  return (
    <AnimatedScreen className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Workout Templates Header */}
        <SectionHeader title="Workout Playlists" />
        <Text className="text-textSecondary text-xs mb-4 leading-4">
          Choose any workout to perform. There are no schedules or calendars — you decide what to train today.
        </Text>

        {/* Templates List */}
        <View className="mb-8">
          {WORKOUT_TEMPLATES.map((tmpl) => (
            <WorkoutCard key={tmpl.id} template={tmpl} />
          ))}
        </View>

        {/* Workout History Header */}
        <SectionHeader title="Workout History" />
        
        {completedWorkouts.length === 0 ? (
          <Card className="items-center py-8">
            <Text className="text-3xl mb-2">⏱️</Text>
            <Text className="text-white text-sm font-semibold">No workouts completed yet</Text>
            <Text className="text-textSecondary text-xs mt-1 text-center">
              Your logged sessions will appear here. Choose a playlist above to start!
            </Text>
          </Card>
        ) : (
          <View className="space-y-4">
            {completedWorkouts.map((session) => {
              const dateText = session.completedAt ? formatRelativeDate(session.completedAt) : 'Unknown date';
              return (
                <Card key={session.id} className="mb-3 border border-cardBorder">
                  <View className="flex-row justify-between items-center mb-2">
                    <View>
                      <Text className="text-accent text-xs font-bold uppercase tracking-wider">
                        ✓ {session.templateName}
                      </Text>
                      <Text className="text-textSecondary text-2xs mt-0.5">
                        {dateText}
                      </Text>
                    </View>
                    <Text className="text-white text-xs font-semibold">
                      {formatDuration(session.duration)}
                    </Text>
                  </View>

                  <View className="border-t border-cardBorder pt-2.5 mt-2">
                    {session.exercises.map((ex, idx) => {
                      const completedSets = ex.sets.filter((s) => s.completed);
                      if (completedSets.length === 0) return null;
                      
                      const setsText = completedSets
                        .map((s) => `${s.weight ? `${s.weight}kg x ` : ''}${s.actualReps}`)
                        .join(', ');

                      return (
                        <View key={ex.exerciseId} className="flex-row justify-between py-1">
                          <Text className="text-white text-xs font-medium flex-1 mr-2">
                            {ex.exerciseName}
                          </Text>
                          <Text className="text-textSecondary text-xs text-right">
                            {completedSets.length} sets ({setsText})
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </AnimatedScreen>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, SafeAreaView, BackHandler, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AnimatedScreen } from '../../src/components/shared/AnimatedScreen';
import { Button } from '../../src/components/shared/Button';
import { ExerciseLogger } from '../../src/components/workout/ExerciseLogger';
import { BenchPremiumLogger } from '../../src/components/workout/BenchPremiumLogger';
import { RestTimer } from '../../src/components/workout/RestTimer';
import { WorkoutSummary } from '../../src/components/workout/WorkoutSummary';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { WORKOUT_TEMPLATES } from '../../src/constants/workouts';
import * as Haptics from 'expo-haptics';

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h > 0 ? h.toString() : null,
    m.toString().padStart(h > 0 ? 2 : 1, '0'),
    s.toString().padStart(2, '0'),
  ].filter(Boolean).join(':');
}

export default function WorkoutLoggerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { activeWorkout, history, finishWorkout, cancelWorkout } = useWorkoutStore();

  const [duration, setDuration] = useState(0);
  const [restDuration, setRestDuration] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [completedSession, setCompletedSession] = useState<any>(null);

  // Active workout duration ticking
  useEffect(() => {
    if (!activeWorkout) return;
    const start = new Date(activeWorkout.session.startedAt).getTime();
    const interval = setInterval(() => {
      setDuration(Math.round((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.session.startedAt]);

  // Handle hardware back button on Android
  useEffect(() => {
    const handleBackButton = () => {
      if (activeWorkout) {
        confirmCancel();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => subscription.remove();
  }, [activeWorkout]);

  if (!activeWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
        <Text className="text-white text-lg font-bold text-center mb-4">
          No active workout session found.
        </Text>
        <Button title="Go Back" onPress={() => router.replace('/')} variant="primary" />
      </SafeAreaView>
    );
  }

  const { session } = activeWorkout;

  const confirmCancel = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to end this session? All logged sets will be lost.',
      [
        { text: 'Keep Lifting', style: 'cancel' },
        {
          text: 'Cancel Session',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            cancelWorkout();
            router.back();
          },
        },
      ]
    );
  };

  const handleFinish = () => {
    // Check if any sets were logged
    const totalCompletedSets = session.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );

    if (totalCompletedSets === 0) {
      Alert.alert(
        'Empty Session',
        'You haven\'t marked any sets as completed. Mark at least one set done to finish.',
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Store reference to show in summary modal
    const sessionToComplete = {
      ...session,
      duration,
    };
    setCompletedSession(sessionToComplete);
    
    // Save to store
    finishWorkout();
    setSummaryVisible(true);
  };

  const handleSetCompleted = (seconds: number) => {
    setRestDuration(seconds);
    setShowRestTimer(true);
  };

  const handleCloseSummary = () => {
    setSummaryVisible(false);
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AnimatedScreen className="flex-1">
        {/* Header Bar */}
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-cardBorder bg-card">
          <View>
            <Text className="text-white text-base font-extrabold uppercase tracking-tight">
              {session.templateName}
            </Text>
            <Text className="text-accent text-xs font-bold mt-0.5">
              ⏱️ {formatTimer(duration)}
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <Pressable
              onPress={confirmCancel}
              className="px-3.5 py-2 bg-cardElevated rounded-lg border border-cardBorder active:opacity-60"
            >
              <Text className="text-error text-xs font-bold">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleFinish}
              className="px-4 py-2 bg-accent rounded-lg active:opacity-60"
            >
              <Text className="text-white text-xs font-black uppercase">Finish</Text>
            </Pressable>
          </View>
        </View>

        {/* Exercises Scroll */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {session.exercises.map((exercise, index) => {
            // Find default template rest time to trigger on check
            const template = WORKOUT_TEMPLATES.find((t) => t.id === session.templateId);
            const templateEx = template?.exercises.find((e) => e.id === exercise.exerciseId);
            const restSeconds = templateEx?.restSeconds || 0;

            if (exercise.isBenchPress) {
              return (
                <BenchPremiumLogger
                  key={exercise.exerciseId}
                  exercise={exercise}
                  exerciseIndex={index}
                  templateId={session.templateId}
                  history={history}
                  onSetCompleted={handleSetCompleted}
                  restSeconds={restSeconds}
                />
              );
            }

            return (
              <ExerciseLogger
                key={exercise.exerciseId}
                exercise={exercise}
                exerciseIndex={index}
                history={history}
                onSetCompleted={handleSetCompleted}
                restSeconds={restSeconds}
              />
            );
          })}
        </ScrollView>

        {/* Rest Timer overlay */}
        {showRestTimer && (
          <RestTimer
            durationSeconds={restDuration}
            onClose={() => setShowRestTimer(false)}
            onSkip={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowRestTimer(false);
            }}
          />
        )}

        {/* Success summary Modal */}
        <WorkoutSummary
          visible={summaryVisible}
          session={completedSession}
          onClose={handleCloseSummary}
        />
      </AnimatedScreen>
    </SafeAreaView>
  );
}

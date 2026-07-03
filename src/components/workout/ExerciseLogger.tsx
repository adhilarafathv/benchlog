import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Card } from '../shared/Card';
import { ExerciseLog, ExerciseSet, WorkoutSession } from '../../types';
import { useWorkoutStore } from '../../store/workoutStore';
import { formatRestTime } from '../../utils/conversions';
import * as Haptics from 'expo-haptics';

interface ExerciseLoggerProps {
  exercise: ExerciseLog;
  exerciseIndex: number;
  history: WorkoutSession[];
  onSetCompleted: (restSeconds: number) => void;
  restSeconds: number;
}

export const ExerciseLogger: React.FC<ExerciseLoggerProps> = ({
  exercise,
  exerciseIndex,
  history,
  onSetCompleted,
  restSeconds,
}) => {
  const updateSet = useWorkoutStore((state) => state.updateSet);
  const addSet = useWorkoutStore((state) => state.addSet);
  const removeSet = useWorkoutStore((state) => state.removeSet);
  const updateExerciseNotes = useWorkoutStore((state) => state.updateExerciseNotes);

  // Find previous session's stats for this exercise
  const prevExerciseLog = history
    .filter((s) => s.completed)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .map((s) => s.exercises.find((e) => e.exerciseId === exercise.exerciseId))
    .find((e) => e !== undefined);

  const handleToggleComplete = (setIndex: number, currentSet: ExerciseSet) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCompleted = !currentSet.completed;
    
    // Use default weight/reps if blank
    const reps = currentSet.actualReps !== null ? currentSet.actualReps : currentSet.targetReps;
    const weight = currentSet.weight !== null ? currentSet.weight : 0;

    updateSet(exerciseIndex, setIndex, reps, weight, newCompleted);

    // If checked completed, start rest timer
    if (newCompleted && restSeconds > 0) {
      onSetCompleted(restSeconds);
    }
  };

  const handleWeightChange = (setIndex: number, text: string, currentSet: ExerciseSet) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const weight = cleanText === '' ? null : parseFloat(cleanText);
    updateSet(exerciseIndex, setIndex, currentSet.actualReps, weight, currentSet.completed);
  };

  const handleRepsChange = (setIndex: number, text: string, currentSet: ExerciseSet) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const reps = cleanText === '' ? null : parseInt(cleanText, 10);
    updateSet(exerciseIndex, setIndex, reps, currentSet.weight, currentSet.completed);
  };

  return (
    <Card className="mb-4">
      {/* Exercise Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-white text-base font-bold tracking-tight">
            {exercise.exerciseName}
          </Text>
          {restSeconds > 0 && (
            <Text className="text-accent text-[11px] font-semibold mt-0.5">
              ⏱️ Rest: {formatRestTime(restSeconds)}
            </Text>
          )}
        </View>
      </View>

      {/* Exercise Notes input */}
      <TextInput
        placeholder="Add notes..."
        placeholderTextColor="#616161"
        value={exercise.notes}
        onChangeText={(text) => updateExerciseNotes(exerciseIndex, text)}
        className="text-textSecondary text-xs py-1 border-b border-cardBorder mb-4"
      />

      {/* Sets Column Headers */}
      <View className="flex-row mb-2 px-1">
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[12%] text-center">Set</Text>
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[28%] text-center">Previous</Text>
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[25%] text-center">Weight</Text>
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[20%] text-center">Reps</Text>
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[15%] text-center">Done</Text>
      </View>

      {/* Sets Rows */}
      {exercise.sets.map((set, setIndex) => {
        // Find previous set of the same index
        const prevSet = prevExerciseLog?.sets[setIndex];
        const prevText = prevSet && prevSet.completed && prevSet.weight !== null && prevSet.actualReps !== null
          ? `${prevSet.weight}kg x ${prevSet.actualReps}`
          : '—';

        return (
          <View
            key={set.setNumber}
            className={`flex-row items-center py-1.5 px-1 rounded-lg mb-1 ${
              set.completed ? 'bg-accent/5' : ''
            }`}
          >
            {/* Set index */}
            <Text className={`text-sm text-center font-bold w-[12%] ${set.completed ? 'text-accent' : 'text-textSecondary'}`}>
              {set.setNumber}
            </Text>

            {/* Previous Session Stats */}
            <Text className="text-textSecondary text-xs text-center w-[28%]">
              {prevText}
            </Text>

            {/* Weight Input */}
            <View className="w-[25%] px-1 justify-center">
              <TextInput
                value={set.weight !== null ? set.weight.toString() : ''}
                onChangeText={(text) => handleWeightChange(setIndex, text, set)}
                placeholder={set.weight !== null ? set.weight.toString() : '0'}
                placeholderTextColor="#4A4A4A"
                keyboardType="numeric"
                className="bg-cardElevated border border-cardBorder text-white text-center text-sm py-1 rounded-lg font-medium"
              />
            </View>

            {/* Reps Input */}
            <View className="w-[20%] px-1 justify-center">
              <TextInput
                value={set.actualReps !== null ? set.actualReps.toString() : ''}
                onChangeText={(text) => handleRepsChange(setIndex, text, set)}
                placeholder={set.targetReps.toString()}
                placeholderTextColor="#4A4A4A"
                keyboardType="number-pad"
                className="bg-cardElevated border border-cardBorder text-white text-center text-sm py-1 rounded-lg font-medium"
              />
            </View>

            {/* Checkbox */}
            <View className="w-[15%] items-center justify-center">
              <Pressable
                onPress={() => handleToggleComplete(setIndex, set)}
                className={`w-6 h-6 rounded-md items-center justify-center border ${
                  set.completed
                    ? 'bg-accent border-accent'
                    : 'bg-cardElevated border-cardBorder'
                }`}
              >
                {set.completed && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </Pressable>
            </View>
          </View>
        );
      })}

      {/* Add / Remove Set buttons */}
      <View className="flex-row justify-end mt-3 space-x-2">
        {exercise.sets.length > 1 && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              removeSet(exerciseIndex, exercise.sets.length - 1);
            }}
            className="px-3 py-1.5 bg-card border border-cardBorder rounded-lg active:opacity-60"
          >
            <Text className="text-error text-xs font-bold">- Delete Set</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            addSet(exerciseIndex);
          }}
          className="px-3 py-1.5 bg-cardElevated border border-cardBorder rounded-lg active:opacity-60"
        >
          <Text className="text-white text-xs font-bold">+ Add Set</Text>
        </Pressable>
      </View>
    </Card>
  );
};

import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Card } from '../shared/Card';
import { ExerciseLog, ExerciseSet, WorkoutSession, WorkoutCategory } from '../../types';
import { useWorkoutStore } from '../../store/workoutStore';
import { calculateEstimated1RM, getMaxBenchReps } from '../../utils/progression';
import { formatRestTime } from '../../utils/conversions';
import * as Haptics from 'expo-haptics';

interface BenchPremiumLoggerProps {
  exercise: ExerciseLog;
  exerciseIndex: number;
  templateId: WorkoutCategory;
  history: WorkoutSession[];
  onSetCompleted: (restSeconds: number) => void;
  restSeconds: number;
}

export const BenchPremiumLogger: React.FC<BenchPremiumLoggerProps> = ({
  exercise,
  exerciseIndex,
  templateId,
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

  // Live 1RM calculation: get max estimated 1RM from current active sets
  const activeSets = exercise.sets.filter((s) => s.completed && s.weight && s.actualReps);
  const active1RMs = activeSets.map((s) => calculateEstimated1RM(s.weight!, s.actualReps!));
  const currentMax1RM = active1RMs.length > 0 ? Math.max(...active1RMs) : null;

  const handleToggleComplete = (setIndex: number, currentSet: ExerciseSet) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCompleted = !currentSet.completed;

    // Use default weight/reps if blank
    const reps = currentSet.actualReps !== null ? currentSet.actualReps : currentSet.targetReps;
    const weight = currentSet.weight !== null ? currentSet.weight : 60;

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

  // Progression logic progress calculations (only for Push Day: 2 sets of 20 reps)
  const isPushDay = templateId === WorkoutCategory.PUSH;
  let progressionProgress = 0; // percentage
  let progressionStatusText = '';

  if (isPushDay) {
    const completedSetsWithGoal = exercise.sets.filter(
      (s) => s.completed && (s.actualReps ?? 0) >= 20
    ).length;
    progressionProgress = Math.min((completedSetsWithGoal / 2) * 100, 100);
    
    if (progressionProgress === 100) {
      progressionStatusText = '⚡ Progression criteria met! +2.5kg Next Push Day!';
    } else if (progressionProgress === 50) {
      progressionStatusText = '🔥 1/2 sets achieved 20 reps. One more to progress!';
    } else {
      progressionStatusText = '🎯 Goal: 2 sets of 20 reps for weight increase (+2.5 kg).';
    }
  } else {
    // Upper Day goal displays
    const completedSets = exercise.sets.filter((s) => s.completed).length;
    progressionProgress = Math.min((completedSets / exercise.sets.length) * 100, 100);
    progressionStatusText = `🎯 Goal: ${exercise.sets.length} sets of 6 reps. (${completedSets}/${exercise.sets.length} completed)`;
  }

  return (
    <Card variant="glow" className="mb-4 border border-accent/20">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-extrabold tracking-tight mr-2">
              {exercise.exerciseName}
            </Text>
            <View className="bg-accent/15 border border-accent/30 px-2 py-0.5 rounded-full">
              <Text className="text-accent text-[9px] font-bold uppercase tracking-wider">Premium Bench Logger</Text>
            </View>
          </View>
          {restSeconds > 0 && (
            <Text className="text-accent text-[11px] font-semibold mt-1">
              ⏱️ Rest: {formatRestTime(restSeconds)}
            </Text>
          )}
        </View>
      </View>

      {/* Bench Notes */}
      <TextInput
        placeholder="Bench press notes..."
        placeholderTextColor="#616161"
        value={exercise.notes}
        onChangeText={(text) => updateExerciseNotes(exerciseIndex, text)}
        className="text-textSecondary text-xs py-1 border-b border-cardBorder mb-4"
      />

      {/* Progression Progress Bar */}
      <View className="mb-4 bg-card p-3 rounded-xl border border-cardBorder">
        <View className="flex-row justify-between items-center mb-1.5">
          <Text className="text-textSecondary text-2xs uppercase font-bold tracking-wider">Progression Progress</Text>
          <Text className="text-white text-2xs font-extrabold">{progressionProgress}%</Text>
        </View>
        <View className="w-full h-1.5 bg-cardElevated rounded-full overflow-hidden mb-2">
          <View 
            style={{ width: `${progressionProgress}%` }}
            className={`h-full rounded-full ${progressionProgress === 100 ? 'bg-success' : 'bg-accent'}`}
          />
        </View>
        <Text className={`text-[10px] font-medium ${progressionProgress === 100 ? 'text-success' : 'text-textSecondary'}`}>
          {progressionStatusText}
        </Text>
      </View>

      {/* Premium Columns stats */}
      <View className="flex-row mb-3 justify-between">
        <View className="bg-card px-3 py-2 rounded-lg items-center w-[48%] border border-cardBorder">
          <Text className="text-textTertiary text-[9px] uppercase font-bold">Estimated 1RM</Text>
          <Text className="text-white text-base font-extrabold mt-0.5">
            {currentMax1RM ? `${currentMax1RM} kg` : '—'}
          </Text>
        </View>
        <View className="bg-card px-3 py-2 rounded-lg items-center w-[48%] border border-cardBorder">
          <Text className="text-textTertiary text-[9px] uppercase font-bold">Target Weight</Text>
          <Text className="text-accent text-base font-extrabold mt-0.5">
            {exercise.sets[0]?.weight ? `${exercise.sets[0].weight} kg` : '—'}
          </Text>
        </View>
      </View>

      {/* Table Headers */}
      <View className="flex-row mb-2 px-1">
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[12%] text-center">Set</Text>
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[28%] text-center">Previous</Text>
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[25%] text-center">Weight</Text>
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[20%] text-center">Reps</Text>
        <Text className="text-textTertiary text-2xs uppercase font-bold w-[15%] text-center">Done</Text>
      </View>

      {/* Table Sets */}
      {exercise.sets.map((set, setIndex) => {
        const prevSet = prevExerciseLog?.sets[setIndex];
        const prevText = prevSet && prevSet.completed && prevSet.weight !== null && prevSet.actualReps !== null
          ? `${prevSet.weight}kg x ${prevSet.actualReps}`
          : '—';

        return (
          <View
            key={set.setNumber}
            className={`flex-row items-center py-2 px-1 rounded-lg mb-1.5 ${
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
                placeholder={set.weight !== null ? set.weight.toString() : '60'}
                placeholderTextColor="#4A4A4A"
                keyboardType="numeric"
                className="bg-cardElevated border border-cardBorder text-white text-center text-sm py-1 rounded-lg font-bold"
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
                className="bg-cardElevated border border-cardBorder text-white text-center text-sm py-1 rounded-lg font-bold"
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

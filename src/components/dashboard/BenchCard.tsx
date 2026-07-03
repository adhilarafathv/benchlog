import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../shared/Card';
import { useProgressionStore } from '../../store/progressionStore';
import { useWeightStore } from '../../store/weightStore';
import { useRecordsStore } from '../../store/recordsStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { getCurrentWeight } from '../../utils/weightAnalytics';
import {
  benchToBodyweightRatio,
  getBenchLogForProgress,
  getPushProgressStatus,
} from '../../utils/progression';
import { formatWeight } from '../../utils/conversions';
import { PersonalRecordType } from '../../types';

export const BenchCard: React.FC = () => {
  const { progression } = useProgressionStore();
  const { entries } = useWeightStore();
  const { records } = useRecordsStore();
  const { settings } = useSettingsStore();
  const { history, activeWorkout } = useWorkoutStore();
  const { weightUnit } = settings;

  const currentWeight = getCurrentWeight(entries);
  const pushWeight = progression.currentPushWeight;
  const upperWeight = progression.currentUpperWeight;

  const { benchLog, isLive } = getBenchLogForProgress(history, activeWorkout);
  const progress = getPushProgressStatus(benchLog, pushWeight, isLive);

  const oneRMRecord = records.find(
    (r) => r.type === PersonalRecordType.HIGHEST_1RM,
  );
  const est1RM = oneRMRecord ? oneRMRecord.value : null;
  const ratio = currentWeight
    ? benchToBodyweightRatio(pushWeight, currentWeight)
    : null;

  return (
    <Card variant="glow">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-textSecondary text-xs uppercase font-bold tracking-wider">
          Bench Progress
        </Text>
        {isLive && (
          <View className="bg-accent/15 border border-accent/30 px-2 py-0.5 rounded-full">
            <Text className="text-accent text-[10px] font-bold uppercase tracking-wider">
              Live
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-textSecondary text-xs mb-0.5">
            Current Push Weight
          </Text>
          <Text className="text-accent text-2xl font-extrabold tracking-tight">
            {formatWeight(pushWeight, weightUnit)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-textSecondary text-xs mb-0.5">Next Target</Text>
          <Text className="text-white text-2xl font-extrabold tracking-tight">
            {formatWeight(progress.nextTargetWeight, weightUnit)}
          </Text>
        </View>
      </View>

      <View className="bg-card p-3 rounded-xl border border-cardBorder mb-4">
        <View className="flex-row justify-between items-end mb-2">
          <View>
            <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-0.5">
              Progress
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-xl font-extrabold">
                {progress.bottleneckReps}
              </Text>
              <Text className="text-textSecondary text-sm font-semibold">
                {' '}
                / {progress.goalReps} reps
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-0.5">
              Remaining
            </Text>
            <Text
              className={`text-lg font-extrabold ${
                progress.isComplete ? 'text-success' : 'text-accent'
              }`}
            >
              {progress.isComplete
                ? 'Done'
                : `${progress.remainingReps} rep${progress.remainingReps === 1 ? '' : 's'}`}
            </Text>
          </View>
        </View>

        <View className="w-full h-2 bg-cardElevated rounded-full overflow-hidden mb-2">
          <View
            style={{ width: `${progress.progressPercent}%` }}
            className={`h-full rounded-full ${
              progress.isComplete ? 'bg-success' : 'bg-accent'
            }`}
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text
            className={`text-[11px] font-medium flex-1 mr-2 ${
              progress.isComplete ? 'text-success' : 'text-textSecondary'
            }`}
          >
            {progress.statusMessage}
          </Text>
          <Text className="text-textTertiary text-[10px] font-semibold">
            {progress.setsAtGoal}/{progress.goalSets} sets
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-textSecondary text-xs mb-0.5">
            Upper Day Weight
          </Text>
          <Text className="text-white text-lg font-bold">
            {formatWeight(upperWeight, weightUnit)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-textSecondary text-xs mb-0.5">
            Estimated 1RM
          </Text>
          <Text className="text-white text-lg font-bold">
            {est1RM !== null ? formatWeight(est1RM, weightUnit) : '—'}
          </Text>
        </View>
      </View>

      <View className="border-t border-cardBorder pt-3 flex-row justify-between items-center">
        <Text className="text-textTertiary text-xs">Bench-to-Bodyweight</Text>
        <Text className="text-white text-sm font-semibold">
          {ratio !== null ? `${ratio}x` : '—'}
        </Text>
      </View>
    </Card>
  );
};

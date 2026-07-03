import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AnimatedScreen } from '../../src/components/shared/AnimatedScreen';
import { FilterPills } from '../../src/components/analytics/FilterPills';
import { AnimatedLineChart } from '../../src/components/analytics/AnimatedLineChart';
import { SectionHeader } from '../../src/components/shared/SectionHeader';
import { Card } from '../../src/components/shared/Card';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { useWeightStore } from '../../src/store/weightStore';
import { useRecordsStore } from '../../src/store/recordsStore';
import { AnalyticsFilter, PersonalRecordType } from '../../src/types';
import { calculateEstimated1RM, benchToBodyweightRatio } from '../../src/utils/progression';
import { subDays, parseISO, isAfter, format as dateFormat } from 'date-fns';
import { formatWeight } from '../../src/utils/conversions';
import { useSettingsStore } from '../../src/store/settingsStore';
import * as Haptics from 'expo-haptics';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { history } = useWorkoutStore();
  const { entries } = useWeightStore();
  const { records } = useRecordsStore();
  const { settings } = useSettingsStore();
  const { weightUnit } = settings;

  const [filter, setFilter] = useState<AnalyticsFilter>(AnalyticsFilter.THIRTY_DAYS);

  const completedSessions = [...history]
    .filter((w) => w.completed && w.completedAt)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

  // Filter helper
  const filterByDate = (dateString: string) => {
    if (filter === AnalyticsFilter.ALL_TIME) return true;
    const now = new Date();
    let days = 30;
    if (filter === AnalyticsFilter.THREE_MONTHS) days = 90;
    else if (filter === AnalyticsFilter.SIX_MONTHS) days = 180;
    else if (filter === AnalyticsFilter.ONE_YEAR) days = 365;

    const cutoff = subDays(now, days);
    return isAfter(parseISO(dateString), cutoff);
  };

  // 1. Bench Weight Progress Data
  const benchProgressData = completedSessions
    .filter((s) => filterByDate(s.completedAt!))
    .map((session) => {
      const benchEx = session.exercises.find((e) => e.isBenchPress);
      if (!benchEx) return null;
      const maxWeight = benchEx.sets.reduce((max, s) => {
        if (s.completed && s.weight && s.weight > max) return s.weight;
        return max;
      }, 0);
      return maxWeight > 0
        ? {
            x: new Date(session.completedAt!).getTime(),
            y: maxWeight,
            label: dateFormat(parseISO(session.completedAt!), 'MM/dd'),
          }
        : null;
    })
    .filter((d): d is { x: number; y: number; label: string } => d !== null);

  // 2. Estimated 1RM Data
  const est1RMData = completedSessions
    .filter((s) => filterByDate(s.completedAt!))
    .map((session) => {
      const benchEx = session.exercises.find((e) => e.isBenchPress);
      if (!benchEx) return null;
      const max1RM = benchEx.sets.reduce((max, s) => {
        if (s.completed && s.weight && s.actualReps) {
          const est = calculateEstimated1RM(s.weight, s.actualReps);
          if (est > max) return est;
        }
        return max;
      }, 0);
      return max1RM > 0
        ? {
            x: new Date(session.completedAt!).getTime(),
            y: max1RM,
            label: dateFormat(parseISO(session.completedAt!), 'MM/dd'),
          }
        : null;
    })
    .filter((d): d is { x: number; y: number; label: string } => d !== null);

  // 3. Bodyweight Progress Data
  const sortedWeightEntries = [...entries]
    .filter((e) => filterByDate(e.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      x: new Date(entry.date).getTime(),
      y: entry.weight,
      label: dateFormat(parseISO(entry.date), 'MM/dd'),
    }));

  // 4. Bench-to-Bodyweight Ratio
  const ratioData = completedSessions
    .filter((s) => filterByDate(s.completedAt!))
    .map((session) => {
      const benchEx = session.exercises.find((e) => e.isBenchPress);
      if (!benchEx) return null;
      const maxWeight = benchEx.sets.reduce((max, s) => {
        if (s.completed && s.weight && s.weight > max) return s.weight;
        return max;
      }, 0);
      
      if (maxWeight === 0) return null;

      // Find closest bodyweight logged before or on this session's date
      const sessionDate = parseISO(session.completedAt!);
      const matchingWeightEntry = [...entries]
        .filter((e) => new Date(e.date).getTime() <= sessionDate.getTime())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (!matchingWeightEntry) return null;
      const ratio = benchToBodyweightRatio(maxWeight, matchingWeightEntry.weight);

      return {
        x: new Date(session.completedAt!).getTime(),
        y: ratio,
        label: dateFormat(parseISO(session.completedAt!), 'MM/dd'),
      };
    })
    .filter((d): d is { x: number; y: number; label: string } => d !== null);

  const handleGoToPRs = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/records');
  };

  return (
    <AnimatedScreen className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Records Banner Card */}
        <Pressable
          onPress={handleGoToPRs}
          style={({ pressed }) => pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }}
          className="bg-accent/10 border border-accent/25 rounded-2xl p-4 flex-row items-center justify-between mb-5 active:opacity-90"
        >
          <View className="flex-row items-center">
            <Text className="text-3xl mr-3">🏆</Text>
            <View>
              <Text className="text-white text-base font-extrabold tracking-tight">Personal Records</Text>
              <Text className="text-textSecondary text-xs mt-0.5">
                {records.length} records detected in {history.length} sessions
              </Text>
            </View>
          </View>
          <Text className="text-accent text-lg font-bold">→</Text>
        </Pressable>

        {/* Filters */}
        <FilterPills selectedFilter={filter} onChange={setFilter} />

        {/* Charts */}
        <View className="space-y-6 mt-2">
          {/* Bench Weight progress */}
          <View className="mb-4">
            <SectionHeader title="Bench Weight Progress" />
            <AnimatedLineChart data={benchProgressData} color="#E53935" yUnit="kg" />
          </View>

          {/* Estimated 1RM */}
          <View className="mb-4">
            <SectionHeader title="Estimated 1RM Trend" />
            <AnimatedLineChart data={est1RMData} color="#FF9800" yUnit="kg" />
          </View>

          {/* Bodyweight Progress */}
          <View className="mb-4">
            <SectionHeader title="Bodyweight Progress" />
            <AnimatedLineChart data={sortedWeightEntries} color="#00BCD4" yUnit="kg" />
          </View>

          {/* Bench-to-Bodyweight Ratio */}
          <View className="mb-4">
            <SectionHeader title="Bench-to-Bodyweight Ratio" />
            <AnimatedLineChart data={ratioData} color="#7C4DFF" yUnit="x" />
          </View>
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

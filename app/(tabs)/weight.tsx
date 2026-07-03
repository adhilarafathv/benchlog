import React from 'react';
import { ScrollView, View } from 'react-native';
import { AnimatedScreen } from '../../src/components/shared/AnimatedScreen';
import { WeightInputCard } from '../../src/components/weight/WeightInputCard';
import { WeightStatsRow } from '../../src/components/weight/WeightStatsRow';
import { ProgressBar } from '../../src/components/weight/ProgressBar';
import { WeightHistory } from '../../src/components/weight/WeightHistory';
import { SectionHeader } from '../../src/components/shared/SectionHeader';

export default function WeightScreen() {
  return (
    <AnimatedScreen className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Card */}
        <WeightInputCard />

        {/* Stats Row */}
        <WeightStatsRow />

        {/* Progress Bar toward goal */}
        <ProgressBar />

        {/* History Section */}
        <View className="mt-2">
          <SectionHeader title="Weight History" />
          <WeightHistory />
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

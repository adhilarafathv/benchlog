import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedScreen } from '../../src/components/shared/AnimatedScreen';
import { BodyweightCard } from '../../src/components/dashboard/BodyweightCard';
import { BenchCard } from '../../src/components/dashboard/BenchCard';
import { QuickStartGrid } from '../../src/components/dashboard/QuickStartGrid';
import { InsightCard } from '../../src/components/dashboard/InsightCard';
import { SectionHeader } from '../../src/components/shared/SectionHeader';

export default function DashboardScreen() {
  return (
    <AnimatedScreen className="bg-background">
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View className="mb-6">
          <Text className="text-textSecondary text-xs font-semibold tracking-wide uppercase">
            Welcome back
          </Text>
          <Text className="text-white text-3xl font-black tracking-tight mt-0.5">
            Keep Pushing.
          </Text>
        </View>

        {/* Smart Insight Card */}
        <View className="mb-6">
          <InsightCard />
        </View>

        {/* Bench Progress Card */}
        <View className="mb-6">
          <BenchCard />
        </View>

        {/* Bodyweight Progress Card */}
        <View className="mb-6">
          <BodyweightCard />
        </View>

        {/* Quick Start Grid */}
        <View className="mb-4">
          <SectionHeader title="Quick Start" />
          <QuickStartGrid />
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

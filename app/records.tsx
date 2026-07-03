import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { AnimatedScreen } from '../src/components/shared/AnimatedScreen';
import { PRCard } from '../src/components/analytics/PRCard';
import { useRecordsStore } from '../src/store/recordsStore';
import { Card } from '../src/components/shared/Card';

export default function RecordsScreen() {
  const { records } = useRecordsStore();

  return (
    <AnimatedScreen className="bg-background">
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Personal Records',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-textSecondary text-xs mb-4 leading-4">
          BenchLog automatically tracks your top achievements from your logs. Go train and break some records!
        </Text>

        {records.length === 0 ? (
          <Card className="items-center py-10">
            <Text className="text-4xl mb-3 text-center">🏆</Text>
            <Text className="text-white text-base font-bold text-center">No personal records yet</Text>
            <Text className="text-textSecondary text-xs mt-1 text-center">
              Complete your first workout or log your weight to see your milestones here.
            </Text>
          </Card>
        ) : (
          <View className="space-y-3">
            {records.map((record, index) => (
              <PRCard key={`${record.type}_${index}`} record={record} />
            ))}
          </View>
        )}
      </ScrollView>
    </AnimatedScreen>
  );
}

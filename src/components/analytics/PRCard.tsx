import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../shared/Card';
import { PersonalRecord } from '../../types';
import { parseISO, format as dateFormat } from 'date-fns';

interface PRCardProps {
  record: PersonalRecord;
}

export const PRCard: React.FC<PRCardProps> = ({ record }) => {
  const dateStr = record.date ? dateFormat(parseISO(record.date), 'MMM d, yyyy') : '—';

  return (
    <Card variant="elevated" className="flex-row items-center border border-cardBorder p-4 mb-3">
      <View className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 items-center justify-center mr-3">
        <Text className="text-xl">🏆</Text>
      </View>
      <View className="flex-1">
        <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-0.5">
          {record.label}
        </Text>
        <Text className="text-white text-base font-extrabold tracking-tight">
          {record.value} {record.unit}
        </Text>
        <Text className="text-textTertiary text-2xs mt-0.5">
          Achieved: {dateStr}
        </Text>
      </View>
    </Card>
  );
};

import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onActionPress,
  className = '',
}) => {
  return (
    <View className={`flex-row items-center justify-between py-2 mb-2 ${className}`}>
      <Text className="text-white text-lg font-bold tracking-tight">{title}</Text>
      {actionLabel && onActionPress && (
        <Pressable onPress={onActionPress} className="active:opacity-60">
          <Text className="text-accent text-sm font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <View className={`flex-1 items-center justify-center py-10 px-6 ${className}`}>
      <Text className="text-4xl mb-3 text-center">{icon}</Text>
      <Text className="text-white text-lg font-bold text-center mb-1">{title}</Text>
      <Text className="text-textSecondary text-sm text-center mb-6 leading-5">
        {description}
      </Text>
      {children}
    </View>
  );
};

import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  className = '',
}) => {
  const baseStyle = "px-2 py-1 rounded-full items-center justify-center self-start";
  
  const variantStyles = {
    default: "bg-cardBorder border border-cardBorder text-textSecondary",
    success: "bg-successLight border border-success/20 text-success",
    warning: "bg-warningLight border border-warning/20 text-warning",
    error: "bg-errorLight border border-error/20 text-error",
    accent: "bg-accent/15 border border-accent/20 text-accent",
    info: "bg-infoLight border border-info/20 text-info",
  };

  const textColors = {
    default: "text-textSecondary",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    accent: "text-accent",
    info: "text-info",
  };

  return (
    <View className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      <Text className={`text-xs font-semibold uppercase tracking-wider ${textColors[variant]}`}>
        {label}
      </Text>
    </View>
  );
};

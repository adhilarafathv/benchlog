import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'glow';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onPress,
  variant = 'default',
  style,
}) => {
  const baseStyle = "bg-card rounded-2xl border border-cardBorder p-4 overflow-hidden";
  
  const variantStyles = {
    default: "",
    elevated: "bg-cardElevated shadow-lg border-cardBorder",
    glow: "border-accent/30 shadow-[0_0_15px_rgba(229,57,53,0.15)]",
  };

  const combinedClass = `${baseStyle} ${variantStyles[variant]} ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          style,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
        className={combinedClass}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={style} className={combinedClass}>
      {children}
    </View>
  );
};

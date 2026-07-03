import React from 'react';
import { Text, Pressable, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const baseStyles = "flex-row items-center justify-center rounded-xl overflow-hidden active:opacity-90";
  
  const variantStyles = {
    primary: "bg-accent",
    secondary: "bg-cardBorder border border-cardBorder",
    outline: "bg-transparent border border-cardBorder",
    ghost: "bg-transparent",
  };

  const textVariantStyles = {
    primary: "text-white font-semibold",
    secondary: "text-white font-medium",
    outline: "text-textSecondary font-medium",
    ghost: "text-accent font-medium",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  const disabledStyles = disabled ? "opacity-40" : "";

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${textVariantStyles[variant]} ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

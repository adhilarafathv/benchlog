import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

interface NumberInputProps {
  value: number | null;
  onChange: (val: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  placeholder?: string;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  suffix = '',
  placeholder = '0',
  className = '',
}) => {
  const increment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = value ?? 0;
    const nextValue = Math.min(current + step, max);
    // Round to 1 decimal place to prevent floating point inaccuracies
    onChange(Math.round(nextValue * 10) / 10);
  };

  const decrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = value ?? 0;
    const nextValue = Math.max(current - step, min);
    onChange(Math.round(nextValue * 10) / 10);
  };

  const handleTextChange = (text: string) => {
    if (text === '') {
      onChange(null);
      return;
    }
    const cleanText = text.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanText);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  return (
    <View className={`flex-row items-center bg-cardElevated rounded-xl border border-cardBorder p-1 ${className}`}>
      <Pressable
        onPress={decrement}
        className="w-10 h-10 items-center justify-center bg-cardBorder rounded-lg active:opacity-70"
      >
        <Text className="text-white text-xl font-bold">-</Text>
      </Pressable>
      
      <View className="flex-1 flex-row items-center justify-center px-2">
        <TextInput
          value={value !== null ? value.toString() : ''}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor="#616161"
          className="text-white font-semibold text-center text-lg min-w-[50px] p-0"
        />
        {suffix && value !== null && (
          <Text className="text-textSecondary text-xs ml-1 font-medium">{suffix}</Text>
        )}
      </View>

      <Pressable
        onPress={increment}
        className="w-10 h-10 items-center justify-center bg-accent rounded-lg active:opacity-70"
      >
        <Text className="text-white text-xl font-bold">+</Text>
      </Pressable>
    </View>
  );
};

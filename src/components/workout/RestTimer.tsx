import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { formatRestTime } from '../../utils/conversions';
import * as Haptics from 'expo-haptics';

interface RestTimerProps {
  durationSeconds: number;
  onClose: () => void;
  onSkip: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  durationSeconds,
  onClose,
  onSkip,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    setIsActive(true);
  }, [durationSeconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onClose();
            return 0;
          }
          // Tick haptic on last 3 seconds
          if (prev <= 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const addTime = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeLeft((prev) => prev + 30);
  };

  const toggleActive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(!isActive);
  };

  const progress = timeLeft / durationSeconds;

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(200)}
      className="absolute bottom-4 left-4 right-4 bg-cardElevated border border-accent/20 rounded-2xl p-4 shadow-2xl flex-row items-center justify-between z-50"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-full border border-cardBorder items-center justify-center mr-3 bg-card overflow-hidden">
          {/* Simple progress fill */}
          <View 
            style={{ height: `${progress * 100}%` }} 
            className="absolute bottom-0 left-0 right-0 bg-accent/20"
          />
          <Text className="text-white text-base font-bold">⏱️</Text>
        </View>
        
        <View>
          <Text className="text-textSecondary text-[10px] uppercase font-semibold tracking-wider">
            Rest Timer {isActive ? '' : '(Paused)'}
          </Text>
          <Text className="text-white text-xl font-extrabold tracking-tight">
            {formatRestTime(timeLeft)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-2">
        <Pressable
          onPress={addTime}
          className="px-3 py-2 bg-card border border-cardBorder rounded-xl active:opacity-60"
        >
          <Text className="text-white text-xs font-semibold">+30s</Text>
        </Pressable>

        <Pressable
          onPress={toggleActive}
          className={`px-3 py-2 rounded-xl active:opacity-60 ${isActive ? 'bg-accent/10 border border-accent/20' : 'bg-success/15 border border-success/20'}`}
        >
          <Text className={`text-xs font-semibold ${isActive ? 'text-accent' : 'text-success'}`}>
            {isActive ? 'Pause' : 'Resume'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onSkip}
          className="px-3 py-2 bg-accent rounded-xl active:opacity-60"
        >
          <Text className="text-white text-xs font-bold">Skip</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

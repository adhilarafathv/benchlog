import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AnimatedScreenProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export const AnimatedScreen: React.FC<AnimatedScreenProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={style}
      className={`flex-1 ${className}`}
    >
      {children}
    </Animated.View>
  );
};

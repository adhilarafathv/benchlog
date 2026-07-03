import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

// Keep the splash screen visible while loading assets
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Standard system/Material fonts will be used, we can also load custom ones if needed
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Premium dark theme configuration matching BenchLog tokens
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#0D0D0D',
      card: '#1A1A1A',
      text: '#FFFFFF',
      border: '#2A2A2A',
      primary: '#E53935',
    },
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <ThemeProvider value={customDarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="workout/[id]" 
            options={{ 
              presentation: 'modal', 
              animation: 'slide_from_bottom',
            }} 
          />
          <Stack.Screen 
            name="records" 
            options={{ 
              headerShown: true, 
              title: 'Personal Records',
              headerStyle: { backgroundColor: '#1A1A1A' },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: 'bold' },
            }} 
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

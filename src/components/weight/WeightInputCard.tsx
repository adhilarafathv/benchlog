import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { useWeightStore } from '../../store/weightStore';
import { useSettingsStore } from '../../store/settingsStore';
import { convertToKg, convertFromKg, getUnitLabel } from '../../utils/conversions';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

export const WeightInputCard: React.FC = () => {
  const addWeightEntry = useWeightStore((state) => state.addWeightEntry);
  const entries = useWeightStore((state) => state.entries);
  const { settings } = useSettingsStore();
  const { weightUnit } = settings;

  const [weightText, setWeightText] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoggedToday, setIsLoggedToday] = useState(false);

  useEffect(() => {
    // Check if user already logged weight today
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = entries.find((e) => e.date === todayStr);
    
    if (todayEntry) {
      setIsLoggedToday(true);
      // Pre-fill with today's logged weight in user's preferred unit
      const displayWeight = convertFromKg(todayEntry.weight, weightUnit);
      setWeightText(displayWeight.toString());
      setNotes(todayEntry.notes || '');
    } else {
      setIsLoggedToday(false);
      // Pre-fill with last logged weight to make it fast
      if (entries.length > 0) {
        const lastWeight = convertFromKg(entries[0].weight, weightUnit);
        setWeightText(lastWeight.toString());
      } else {
        setWeightText('');
      }
      setNotes('');
    }
  }, [entries, weightUnit]);

  const handleSave = () => {
    const parsed = parseFloat(weightText);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid positive number for weight.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Convert from display unit to internal storage unit (kg)
    const weightKg = convertToKg(parsed, weightUnit);
    addWeightEntry(weightKg, notes || undefined);

    Alert.alert(
      isLoggedToday ? 'Weight Updated' : 'Weight Saved',
      `Your weight of ${parsed} ${getUnitLabel(weightUnit)} has been recorded.`
    );
  };

  return (
    <Card variant="elevated" className="mb-4 border border-cardBorder">
      <Text className="text-white text-base font-bold tracking-tight mb-4">
        {isLoggedToday ? '✏️ Update Today\'s Weight' : '⚖️ Log Daily Weight'}
      </Text>

      <View className="flex-row items-center mb-4 bg-card rounded-xl border border-cardBorder px-4 py-2">
        <TextInput
          placeholder="0.0"
          placeholderTextColor="#616161"
          keyboardType="numeric"
          value={weightText}
          onChangeText={setWeightText}
          className="text-white text-3xl font-black flex-1 p-0"
        />
        <Text className="text-accent text-xl font-bold ml-2">
          {getUnitLabel(weightUnit)}
        </Text>
      </View>

      <TextInput
        placeholder="Add optional notes..."
        placeholderTextColor="#616161"
        value={notes}
        onChangeText={setNotes}
        className="text-white text-sm bg-card rounded-xl border border-cardBorder px-4 py-3 mb-4"
        multiline
        numberOfLines={2}
      />

      <Button
        title={isLoggedToday ? 'Update Entry' : 'Save Entry'}
        onPress={handleSave}
        variant="primary"
        className="w-full"
      />
    </Card>
  );
};

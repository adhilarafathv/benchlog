import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TextInput, Alert, Pressable } from 'react-native';
import { AnimatedScreen } from '../../src/components/shared/AnimatedScreen';
import { Card } from '../../src/components/shared/Card';
import { Button } from '../../src/components/shared/Button';
import { useSettingsStore } from '../../src/store/settingsStore';
import { useWorkoutStore } from '../../src/store/workoutStore';
import { useWeightStore } from '../../src/store/weightStore';
import { useProgressionStore } from '../../src/store/progressionStore';
import { useRecordsStore } from '../../src/store/recordsStore';
import { WeightUnit } from '../../src/types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { settings, setWeightUnit, setNotifications, setGoalWeight } = useSettingsStore();

  const [goalInput, setGoalInput] = useState(
    settings.goalWeight !== null ? settings.goalWeight.toString() : ''
  );

  const handleUnitToggle = (unit: WeightUnit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWeightUnit(unit);
    
    // Auto-convert goal input value if already entered
    if (goalInput !== '') {
      const parsed = parseFloat(goalInput);
      if (!isNaN(parsed)) {
        if (unit === WeightUnit.LB) {
          // kg to lb conversion
          setGoalInput((Math.round(parsed * 2.20462 * 10) / 10).toString());
        } else {
          // lb to kg conversion
          setGoalInput((Math.round(parsed * 0.453592 * 10) / 10).toString());
        }
      }
    }
  };

  const handleSaveGoal = () => {
    if (goalInput === '') {
      setGoalWeight(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Goal weight removed.');
      return;
    }

    const parsed = parseFloat(goalInput);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid positive number.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGoalWeight(parsed);
    Alert.alert('Success', `Goal weight set to ${parsed} ${settings.weightUnit}.`);
  };

  const handleExport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const backupData = {
        workouts: useWorkoutStore.getState().history,
        weights: useWeightStore.getState().entries,
        progression: useProgressionStore.getState().progression,
        settings: useSettingsStore.getState().settings,
        records: useRecordsStore.getState().records,
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const fileUri = FileSystem.documentDirectory + 'benchlog_backup.json';
      
      await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Not Supported', 'Sharing is not available on this device.');
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'An error occurred during export.');
    }
  };

  const handleImport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileAsset = result.assets[0];
      const fileContent = await FileSystem.readAsStringAsync(fileAsset.uri);
      const backupData = JSON.parse(fileContent);

      // Validate import data shapes
      if (!backupData.workouts || !backupData.weights || !backupData.progression) {
        throw new Error('Invalid backup file structure.');
      }

      Alert.alert(
        'Confirm Import',
        'Importing this file will overwrite all your current workout history, weight logs, and settings. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import & Overwrite',
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              // Hydrate stores
              useWorkoutStore.setState({ history: backupData.workouts });
              useWeightStore.setState({ entries: backupData.weights });
              useProgressionStore.setState({ progression: backupData.progression });
              useSettingsStore.setState({ settings: backupData.settings });
              useRecordsStore.setState({ records: backupData.records || [] });

              // Sync goal input text field
              if (backupData.settings?.goalWeight) {
                setGoalInput(backupData.settings.goalWeight.toString());
              } else {
                setGoalInput('');
              }

              Alert.alert('Success', 'Backup imported successfully.');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Import Failed', 'Please select a valid BenchLog backup file.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'Are you absolutely sure you want to delete all workouts, weights, settings, and progression history? This action is permanent.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            useWorkoutStore.getState().cancelWorkout();
            useWorkoutStore.setState({ history: [] });
            useWeightStore.setState({ entries: [] });
            useProgressionStore.getState().resetProgression();
            useRecordsStore.getState().clearRecords();
            setGoalWeight(null);
            setGoalInput('');
            Alert.alert('Data Reset', 'All local data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <AnimatedScreen className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Units Configuration */}
        <Text className="text-textSecondary text-2xs uppercase font-bold tracking-wider mb-2 ml-1">
          Preferences
        </Text>
        <Card className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-sm font-semibold">Weight Units</Text>
            <View className="flex-row bg-cardElevated border border-cardBorder rounded-lg p-0.5 w-32">
              <Pressable
                onPress={() => handleUnitToggle(WeightUnit.KG)}
                className={`flex-1 py-1.5 items-center justify-center rounded-md ${
                  settings.weightUnit === WeightUnit.KG ? 'bg-accent' : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    settings.weightUnit === WeightUnit.KG ? 'text-white' : 'text-textSecondary'
                  }`}
                >
                  KG
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleUnitToggle(WeightUnit.LB)}
                className={`flex-1 py-1.5 items-center justify-center rounded-md ${
                  settings.weightUnit === WeightUnit.LB ? 'bg-accent' : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    settings.weightUnit === WeightUnit.LB ? 'text-white' : 'text-textSecondary'
                  }`}
                >
                  LB
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Goal weight input */}
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-sm font-semibold">Goal Weight</Text>
            <View className="flex-row items-center space-x-2">
              <View className="flex-row items-center bg-cardElevated border border-cardBorder rounded-lg px-3 py-1.5 w-24">
                <TextInput
                  value={goalInput}
                  onChangeText={setGoalInput}
                  keyboardType="numeric"
                  placeholder="None"
                  placeholderTextColor="#616161"
                  className="text-white text-xs font-bold flex-1 p-0 text-center"
                />
                <Text className="text-textSecondary text-2xs ml-1 font-bold">
                  {settings.weightUnit}
                </Text>
              </View>
              <Pressable
                onPress={handleSaveGoal}
                className="bg-accent px-3 py-2 rounded-lg active:opacity-75"
              >
                <Text className="text-white text-2xs font-extrabold uppercase">Save</Text>
              </Pressable>
            </View>
          </View>
        </Card>

        {/* Notifications */}
        <Text className="text-textSecondary text-2xs uppercase font-bold tracking-wider mb-2 ml-1">
          System
        </Text>
        <Card className="mb-6">
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-sm font-semibold">Rest Timer Sound</Text>
            <Switch
              value={settings.notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#2A2A2A', true: '#E53935' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Data Sync & Supabase Placeholder */}
        <Text className="text-textSecondary text-2xs uppercase font-bold tracking-wider mb-2 ml-1">
          Cloud Sync
        </Text>
        <Card className="mb-6 border border-dashed border-cardBorder">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-3">
              <Text className="text-white text-sm font-bold">Cloud Backup & Sync</Text>
              <Text className="text-textSecondary text-2xs mt-0.5 leading-4">
                Sync weight logs and workout history across devices. Powered by Supabase.
              </Text>
            </View>
            <View className="bg-cardElevated px-2.5 py-1 rounded-full border border-cardBorder">
              <Text className="text-accent text-[9px] font-black uppercase tracking-wider">Coming Soon</Text>
            </View>
          </View>
        </Card>

        {/* Backup export/import */}
        <Text className="text-textSecondary text-2xs uppercase font-bold tracking-wider mb-2 ml-1">
          Data Management
        </Text>
        <Card className="mb-6">
          <View className="flex-row justify-between space-x-3">
            <Button
              title="📥 Export Backup"
              onPress={handleExport}
              variant="secondary"
              className="flex-1 py-3"
            />
            <Button
              title="📤 Import Backup"
              onPress={handleImport}
              variant="secondary"
              className="flex-1 py-3"
            />
          </View>

          <Button
            title="⚠️ Reset All App Data"
            onPress={handleReset}
            variant="outline"
            className="w-full mt-4 border-error/30 py-3"
          />
        </Card>

        {/* About App */}
        <View className="items-center py-6 mt-2">
          <Text className="text-white text-lg font-black tracking-tight uppercase">BenchLog</Text>
          <Text className="text-textSecondary text-2xs mt-1 font-bold">Version 1.0.0</Text>
          <Text className="text-textTertiary text-3xs mt-2 text-center leading-4 max-w-xs">
            A premium progression app designed for tracking bench press weight increments and bodyweight trends.
          </Text>
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

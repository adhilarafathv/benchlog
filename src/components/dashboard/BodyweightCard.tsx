import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Card } from '../shared/Card';
import { Sparkline } from '../shared/Sparkline';
import { useWeightStore } from '../../store/weightStore';
import { useSettingsStore } from '../../store/settingsStore';
import {
  getCurrentWeight,
  calculateWeeklyAverage,
  calculateWeeklyChange,
  determineTrend,
  getTrendEmoji,
  getTrendLabel,
  getRecentWeightTrend,
} from '../../utils/weightAnalytics';
import { convertFromKg, formatWeight } from '../../utils/conversions';
import { colors } from '../../constants/theme';

export const BodyweightCard: React.FC = () => {
  const { entries } = useWeightStore();
  const { settings } = useSettingsStore();
  const { weightUnit } = settings;
  const { width: screenWidth } = useWindowDimensions();

  const current = getCurrentWeight(entries);
  const avg = calculateWeeklyAverage(entries);
  const change = calculateWeeklyChange(entries);
  const trend = determineTrend(entries);
  const recentTrend = getRecentWeightTrend(entries, 7);

  const sparklineData = recentTrend.map((point) =>
    convertFromKg(point.weight, weightUnit),
  );
  const sparklineWidth = screenWidth - 64;

  if (entries.length === 0) {
    return (
      <Card variant="default">
        <Text className="text-textSecondary text-xs uppercase font-bold tracking-wider mb-1">
          Bodyweight
        </Text>
        <Text className="text-white text-base font-semibold mt-2">
          No bodyweight logs yet
        </Text>
        <Text className="text-textTertiary text-xs mt-1">
          Go to the Weight tab to log your weight.
        </Text>
      </Card>
    );
  }

  const changeText =
    change !== null
      ? `${change > 0 ? '+' : ''}${formatWeight(change, weightUnit)}`
      : '—';

  const changeColor =
    change !== null
      ? change > 0
        ? 'text-accent'
        : change < 0
          ? 'text-success'
          : 'text-textSecondary'
      : 'text-textTertiary';

  const changePeriodLabel =
    change !== null
      ? `${changeText} this week`
      : 'Log more entries for weekly change';

  const sparklineColor =
    trend && change !== null && change < 0
      ? colors.success
      : colors.accent;

  return (
    <Card variant="default">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-textSecondary text-xs uppercase font-bold tracking-wider">
          Bodyweight
        </Text>
        {trend && (
          <View className="bg-cardElevated border border-cardBorder px-2.5 py-0.5 rounded-full flex-row items-center">
            <Text className="text-xs mr-1">{getTrendEmoji(trend)}</Text>
            <Text className="text-white text-xs font-medium">
              {getTrendLabel(trend)}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-between items-start mb-1">
        <View className="flex-1">
          <Text className="text-white text-3xl font-extrabold tracking-tight">
            {current !== null ? formatWeight(current, weightUnit) : '—'}
          </Text>
          {avg !== null && (
            <Text className="text-textTertiary text-xs mt-1">
              Weekly avg {formatWeight(avg, weightUnit)}
            </Text>
          )}
        </View>

        {sparklineData.length >= 2 && (
          <View className="mt-1">
            <Sparkline
              data={sparklineData}
              width={Math.min(sparklineWidth * 0.45, 140)}
              height={48}
              color={sparklineColor}
            />
          </View>
        )}
      </View>

      <View className="border-t border-cardBorder pt-3 mt-2 flex-row justify-between items-center">
        <Text className="text-textSecondary text-xs">Weekly Change</Text>
        <Text className={`text-sm font-bold ${changeColor}`}>
          {changePeriodLabel}
        </Text>
      </View>
    </Card>
  );
};

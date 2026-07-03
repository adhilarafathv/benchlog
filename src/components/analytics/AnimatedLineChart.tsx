import React from 'react';
import { View, Text } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

interface AnimatedLineChartProps {
  data: { x: number; y: number; label: string }[];
  color?: string;
  yUnit?: string;
}

export const AnimatedLineChart: React.FC<AnimatedLineChartProps> = ({
  data,
  color = '#E53935',
  yUnit = '',
}) => {
  if (data.length < 2) {
    return (
      <View className="h-48 justify-center items-center bg-card border border-cardBorder rounded-2xl p-4">
        <Text className="text-textTertiary text-3xl mb-2">📊</Text>
        <Text className="text-white text-sm font-semibold">Not enough data points yet</Text>
        <Text className="text-textSecondary text-xs mt-1 text-center">
          Log at least 2 sessions to see your progress chart.
        </Text>
      </View>
    );
  }

  // To prevent Victory Native crashes on null values or bad shapes, we clean the data
  const chartData = data.map((d, index) => ({
    index,
    value: d.y,
    label: d.label,
  }));

  return (
    <View className="bg-card border border-cardBorder rounded-2xl p-4 mb-4">
      <View className="h-48 w-full mt-2">
        <CartesianChart
          data={chartData}
          xKey="index"
          yKeys={["value"]}
          axisOptions={{
            labelColor: '#9E9E9E',
            lineColor: '#2A2A2A',
          }}
        >
          {({ points }) => (
            <Line
              points={points.value}
              color={color}
              strokeWidth={3}
              animate={{ type: "timing", duration: 300 }}
            />
          )}
        </CartesianChart>
      </View>
      <View className="flex-row justify-between mt-2 px-2">
        <Text className="text-textSecondary text-[10px]">{data[0]?.label}</Text>
        <Text className="text-textSecondary text-[10px]">{data[data.length - 1]?.label}</Text>
      </View>
    </View>
  );
};

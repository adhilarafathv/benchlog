import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showFill?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 280,
  height = 56,
  color = colors.accent,
  showFill = true,
}) => {
  const { linePoints, fillPath } = useMemo(() => {
    if (data.length < 2) {
      return { linePoints: '', fillPath: '' };
    }

    const padding = 4;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const coords = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth;
      const y =
        padding + innerHeight - ((value - min) / range) * innerHeight;
      return { x, y };
    });

    const linePoints = coords.map((p) => `${p.x},${p.y}`).join(' ');

    const first = coords[0];
    const last = coords[coords.length - 1];
    const fillPath = [
      `M ${first.x} ${height}`,
      ...coords.map((p) => `L ${p.x} ${p.y}`),
      `L ${last.x} ${height}`,
      'Z',
    ].join(' ');

    return { linePoints, fillPath };
  }, [data, width, height]);

  if (data.length < 2) {
    return <View style={{ width, height }} />;
  }

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {showFill && (
          <>
            <Defs>
              <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity="0.25" />
                <Stop offset="1" stopColor={color} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path d={fillPath} fill="url(#sparkFill)" />
          </>
        )}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

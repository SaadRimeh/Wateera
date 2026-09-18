import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface BarData {
  label: string;
  value: number; // e.g. hours or count
}

interface MiniBarChartProps {
  data: BarData[];
  barColor?: string;
  maxVal?: number;
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data,
  barColor = COLORS.cyan,
  maxVal,
}) => {
  const values = data.map((d) => d.value);
  const highest = maxVal || Math.max(...values, 1);

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {data.map((item, index) => {
          const heightPercent = Math.min(100, Math.max(8, (item.value / highest) * 100));
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 75,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 55,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  barTrack: {
    width: 8,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/theme';
import { GlassCard } from '../common/GlassCard';

export interface PieSlice {
  key: string;
  label: string;
  amount: number;
  color: string;
}

interface FinancePieChartProps {
  data: PieSlice[];
  totalAmount: number;
}

export const FinancePieChart: React.FC<FinancePieChartProps> = ({ data, totalAmount }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(data[0]?.key || null);

  const SIZE = 180;
  const RADIUS = 75;
  const CENTER = SIZE / 2;

  // Compute angles for each slice
  let currentAngle = -Math.PI / 2;

  const validData = data.filter((d) => d.amount > 0);
  const total = totalAmount > 0 ? totalAmount : validData.reduce((acc, d) => acc + d.amount, 0);

  const slices = validData.map((slice) => {
    const sliceAngle = total > 0 ? (slice.amount / total) * 2 * Math.PI : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    // SVG arc path
    const x1 = CENTER + RADIUS * Math.cos(startAngle);
    const y1 = CENTER + RADIUS * Math.sin(startAngle);
    const x2 = CENTER + RADIUS * Math.cos(endAngle);
    const y2 = CENTER + RADIUS * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      ...slice,
      pathData,
      percentage: total > 0 ? Math.round((slice.amount / total) * 100) : 0,
    };
  });

  const activeSlice = slices.find((s) => s.key === selectedKey) || slices[0];

  return (
    <GlassCard style={styles.card}>
      <Text style={styles.chartTitle}>Expense Category Distribution</Text>

      <View style={styles.chartRow}>
        <View style={styles.svgWrapper}>
          <Svg width={SIZE} height={SIZE}>
            <G>
              {slices.map((slice) => (
                <Path
                  key={slice.key}
                  d={slice.pathData}
                  fill={slice.color}
                  opacity={selectedKey === slice.key ? 1 : 0.75}
                  stroke={COLORS.bgDark}
                  strokeWidth={2}
                  onPress={() => setSelectedKey(slice.key)}
                />
              ))}

              {/* Donut inner hole */}
              <Circle cx={CENTER} cy={CENTER} r={46} fill="rgba(13, 19, 33, 0.95)" />
            </G>
          </Svg>

          {/* Donut Center text */}
          <View style={styles.centerBadge}>
            <Text style={styles.centerAmount}>${total}</Text>
            <Text style={styles.centerSub}>Total Spent</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          {slices.map((slice) => {
            const isSelected = selectedKey === slice.key;
            return (
              <TouchableOpacity
                key={slice.key}
                style={[styles.legendItem, isSelected && styles.legendItemActive]}
                onPress={() => setSelectedKey(slice.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.dot, { backgroundColor: slice.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendLabel}>
                    {slice.label}
                  </Text>
                  <Text style={styles.legendValue}>
                    ${slice.amount} ({slice.percentage}%)
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  svgWrapper: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  centerSub: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 14,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  legendItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  legendValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, G } from 'react-native-svg';
import { COLORS } from '../../constants/theme';
import { GlassCard } from '../common/GlassCard';

interface DataPoint {
  day: string;
  amount: number;
}

interface FinanceLineChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FinanceLineChart: React.FC<FinanceLineChartProps> = ({
  data,
  title = 'Income & Cash Flow Trend',
  subtitle = 'Cumulative Cash Flow Progression',
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(data.length - 1);

  const chartWidth = Math.min(340, SCREEN_WIDTH - 64);
  const chartHeight = 130;
  const paddingHorizontal = 18;
  const paddingTop = 20;
  const paddingBottom = 24;

  const innerWidth = chartWidth - paddingHorizontal * 2;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const amounts = data.map((d) => d.amount);
  const maxAmount = Math.max(...amounts, 1);
  const minAmount = Math.min(...amounts, 0);

  const getX = (index: number) => {
    return paddingHorizontal + (index / (data.length - 1 || 1)) * innerWidth;
  };

  const getY = (amount: number) => {
    const range = maxAmount - minAmount || 1;
    const normalized = (amount - minAmount) / range;
    return paddingTop + innerHeight - normalized * innerHeight;
  };

  // Build SVG Path
  let pathD = '';
  let areaD = '';

  data.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.amount);
    if (i === 0) {
      pathD += `M ${x} ${y}`;
      areaD += `M ${x} ${paddingTop + innerHeight} L ${x} ${y}`;
    } else {
      const prevX = getX(i - 1);
      const prevY = getY(data[i - 1].amount);
      const cpX1 = prevX + (x - prevX) / 2;
      const cpY1 = prevY;
      const cpX2 = prevX + (x - prevX) / 2;
      const cpY2 = y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
      areaD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
    }
  });

  const lastX = getX(data.length - 1);
  areaD += ` L ${lastX} ${paddingTop + innerHeight} Z`;

  const selectedPoint = data[selectedIndex] || data[data.length - 1];

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedAmount}>${selectedPoint.amount}</Text>
          <Text style={styles.selectedDay}>{selectedPoint.day}</Text>
        </View>
      </View>

      <View style={styles.svgContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="incomeAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={COLORS.amber} stopOpacity="0.35" />
              <Stop offset="100%" stopColor={COLORS.amber} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Horizontal Grid lines */}
          <Line
            x1={paddingHorizontal}
            y1={paddingTop + innerHeight / 2}
            x2={chartWidth - paddingHorizontal}
            y2={paddingTop + innerHeight / 2}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4,4"
          />

          {/* Area fill */}
          <Path d={areaD} fill="url(#incomeAreaGrad)" />

          {/* Stroke line */}
          <Path
            d={pathD}
            fill="none"
            stroke={COLORS.amber}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.amount);
            const isSelected = i === selectedIndex;
            return (
              <G key={i}>
                <Circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? COLORS.textPrimary : COLORS.amber}
                  stroke={COLORS.bgDark}
                  strokeWidth={2}
                  onPress={() => setSelectedIndex(i)}
                />
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Day labels row */}
      <View style={[styles.daysRow, { width: chartWidth, paddingHorizontal }]}>
        {data.map((d, i) => {
          const isSelected = i === selectedIndex;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedIndex(i)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                {d.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  selectedBadge: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  selectedAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.amber,
  },
  selectedDay: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  dayTextActive: {
    color: COLORS.amber,
    fontWeight: '800',
  },
});

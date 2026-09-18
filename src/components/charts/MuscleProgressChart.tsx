import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { MuscleGroup } from '../../types';

export interface MuscleDataPoint {
  date: string;
  displayDate: string;
  maxWeight: number;
  totalReps: number;
  totalVolume: number;
  exerciseName: string;
}

interface MuscleProgressChartProps {
  muscle: MuscleGroup;
  data: MuscleDataPoint[];
}

export const MuscleProgressChart: React.FC<MuscleProgressChartProps> = ({ muscle, data }) => {
  const [metric, setMetric] = useState<'WEIGHT' | 'VOLUME'>('WEIGHT');

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Workout History Yet for {muscle}</Text>
        <Text style={styles.emptySubtitle}>Log your sets in today's routine to start generating progression curves.</Text>
      </View>
    );
  }

  const values = data.map((d) => (metric === 'WEIGHT' ? d.maxWeight : d.totalVolume));
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);

  const latestVal = values[values.length - 1];
  const firstVal = values[0];
  const diff = latestVal - firstVal;
  const growthPercent = firstVal > 0 ? Math.round((diff / firstVal) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Metric Toggle Buttons */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.muscleBadge}>{muscle} PROGRESSION</Text>
          <Text style={styles.latestValueText}>
            {metric === 'WEIGHT' ? `${latestVal} kg` : `${latestVal.toLocaleString()} kg·vol`}
            {growthPercent !== 0 && (
              <Text style={[styles.growthBadge, { color: growthPercent >= 0 ? COLORS.emerald : COLORS.rose }]}>
                {' '}
                {growthPercent >= 0 ? `+${growthPercent}%` : `${growthPercent}%`}
              </Text>
            )}
          </Text>
        </View>

        <View style={styles.togglePill}>
          <TouchableOpacity
            style={[styles.toggleBtn, metric === 'WEIGHT' && styles.toggleBtnActive]}
            onPress={() => setMetric('WEIGHT')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, metric === 'WEIGHT' && styles.toggleBtnTextActive]}>Max Weight</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, metric === 'VOLUME' && styles.toggleBtnActive]}
            onPress={() => setMetric('VOLUME')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, metric === 'VOLUME' && styles.toggleBtnTextActive]}>Volume</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Visual Chart Bars */}
      <View style={styles.chartArea}>
        <View style={styles.barsRow}>
          {data.map((item, idx) => {
            const val = metric === 'WEIGHT' ? item.maxWeight : item.totalVolume;
            const heightPct = Math.min(100, Math.max(16, (val / maxVal) * 100));
            const isLatest = idx === data.length - 1;

            return (
              <View key={idx} style={styles.barCol}>
                <Text style={[styles.barValText, isLatest && { color: COLORS.emerald, fontWeight: '800' }]}>
                  {metric === 'WEIGHT' ? `${val}k` : `${Math.round(val / 1000)}k`}
                </Text>

                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        height: `${heightPct}%`,
                        backgroundColor: isLatest ? COLORS.emerald : 'rgba(16, 185, 129, 0.45)',
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.dateText, isLatest && { color: COLORS.textPrimary, fontWeight: '700' }]}>
                  {item.displayDate}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Stats Footer Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Top Exercise</Text>
          <Text style={styles.statValue}>
            {data.length > 0 ? (data[data.length - 1]?.exerciseName || 'None') : 'None'}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Reps Logged</Text>
          <Text style={styles.statValue}>
            {data.reduce((acc, curr) => acc + curr.totalReps, 0)} reps
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Logged Sessions</Text>
          <Text style={styles.statValue}>{data.length} workouts</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(21, 29, 45, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  muscleBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  latestValueText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  growthBadge: {
    fontSize: 14,
    fontWeight: '800',
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.emerald,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: COLORS.bgDark,
  },
  chartArea: {
    height: 140,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  barValText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  track: {
    width: 22,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyContainer: {
    backgroundColor: 'rgba(21, 29, 45, 0.6)',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

interface FocusRingProps {
  progress: number; // 0 to 1
  timeLeftFormatted: string;
  totalDurationSeconds: number;
  isRunning: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIZE = Math.min(280, SCREEN_WIDTH * 0.72);
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const FocusRing: React.FC<FocusRingProps> = ({
  progress,
  timeLeftFormatted,
  totalDurationSeconds,
  isRunning,
}) => {
  // progress goes from 1 down to 0
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = CIRCUMFERENCE * (1 - clampedProgress);

  return (
    <View style={styles.container}>
      {/* Outer ambient glow */}
      <View
        style={[
          styles.glowCircle,
          {
            width: SIZE + 20,
            height: SIZE + 20,
            borderRadius: (SIZE + 20) / 2,
          },
          isRunning && styles.glowActive,
        ]}
      />

      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4ADE80" />
            <Stop offset="50%" stopColor="#22C55E" />
            <Stop offset="100%" stopColor="#10B981" />
          </LinearGradient>
        </Defs>

        {/* Background track circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />

        {/* Animated vibrant green progress circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="url(#focusGrad)"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      {/* Center Typography */}
      <View style={styles.centerContent}>
        <Text style={styles.stateLabel}>
          {isRunning ? 'DEEP FLOW SPRINT' : 'READY TO FOCUS'}
        </Text>
        <Text style={styles.timerDisplay}>{timeLeftFormatted}</Text>
        <Text style={styles.durationSubtext}>5-Minute Sprint</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  svg: {
    transform: [{ rotateZ: '0deg' }],
  },
  glowCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  glowActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.25)',
    shadowColor: COLORS.focusGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: COLORS.focusGreen,
    marginBottom: 6,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  durationSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

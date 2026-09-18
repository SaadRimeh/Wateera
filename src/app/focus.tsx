import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useWateeraStore, store } from '../store';
import { AppHeader } from '../components/navigation/AnimatedDrawer';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { GlassCard } from '../components/common/GlassCard';
import { FocusRing } from '../components/focus/FocusRing';
import { NotificationService } from '../services/notifications';

export default function FocusScreen() {
  const [totalSeconds, setTotalSeconds] = useState(300); // 5 minutes default
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const scheduledNotificationId = useRef<string | null>(null);

  const focusSessions = useWateeraStore((s) => s.focusSessions);

  const cancelScheduledNotification = async () => {
    if (scheduledNotificationId.current) {
      await NotificationService.cancelNotification(scheduledNotificationId.current);
      scheduledNotificationId.current = null;
    }
  };

  const scheduleCompletion = async (secs: number) => {
    await cancelScheduledNotification();
    const id = await NotificationService.scheduleFocusCompletion(secs);
    scheduledNotificationId.current = id;
  };

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            cancelScheduledNotification();
            store.completeFocusSession(totalSeconds);
            NotificationService.sendImmediateNotification(
              'Focus Sprint Completed! 🎯',
              `Superb! You completed your ${Math.round(totalSeconds / 60)}-minute focus session.`,
              { type: 'FOCUS_FINISHED' },
              'focus'
            );
            setCompletedCycles((c) => c + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, totalSeconds]);

  const toggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(totalSeconds);
      setIsRunning(true);
      scheduleCompletion(totalSeconds);
      NotificationService.notifyTaskStarted(`${Math.round(totalSeconds / 60)}m Focus Block`, 'Focus Timer');
    } else if (!isRunning) {
      setIsRunning(true);
      scheduleCompletion(secondsLeft);
      NotificationService.notifyTaskStarted(`${Math.round(totalSeconds / 60)}m Focus Block`, 'Focus Timer');
    } else {
      setIsRunning(false);
      cancelScheduledNotification();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    cancelScheduledNotification();
    setSecondsLeft(totalSeconds);
  };

  const setPreset = (mins: number) => {
    setIsRunning(false);
    cancelScheduledNotification();
    const secs = mins * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  // Format MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return (
    <View style={styles.container}>
      <AppHeader
        title="FOCUS TIMER"
        subtitle="5-Minute Deep Flow Circular Sprint"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Preset Selector */}
        <View style={styles.presetsRow}>
          {[
            { label: '5 Min Sprint', mins: 5 },
            { label: '15 Min Flow', mins: 15 },
            { label: '25 Min Pomodoro', mins: 25 },
          ].map((preset) => {
            const isSelected = totalSeconds === preset.mins * 60;
            return (
              <TouchableOpacity
                key={preset.mins}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
                onPress={() => setPreset(preset.mins)}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Circular SVG Timer */}
        <FocusRing
          timeLeftFormatted={formattedTime}
          progress={progress}
          totalDurationSeconds={totalSeconds}
          isRunning={isRunning}
        />

        {/* Action Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.playBtn, isRunning && styles.playBtnActive]}
            activeOpacity={0.8}
            onPress={toggleTimer}
          >
            <Text style={styles.playIcon}>{isRunning ? '⏸' : '▶'}</Text>
            <Text style={styles.playText}>{isRunning ? 'Pause' : 'Start Focus'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.7}
            onPress={resetTimer}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Focus Stats Card */}
        <GlassCard style={styles.statsCard} borderColor="rgba(34, 197, 94, 0.3)">
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Cycles Done</Text>
              <Text style={styles.statVal}>{completedCycles}</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Focused</Text>
              <Text style={styles.statVal}>
                {Math.round(
                  focusSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60
                )}
                m
              </Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Global Task Sync</Text>
              <Text style={[styles.statVal, { color: COLORS.focusGreen }]}>Active</Text>
            </View>
          </View>
        </GlassCard>

        {/* Tips banner */}
        <GlassCard style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Neuro-Focus Principle</Text>
          <Text style={styles.tipBody}>
            Short 5-minute sprints eliminate cognitive resistance and trigger deep dopamine momentum without mental fatigue.
          </Text>
        </GlassCard>
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  presetChipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderColor: COLORS.focusGreen,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: COLORS.focusGreen,
  },
  controlsContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.focusGreen,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...SHADOWS.glowGreen,
  },
  playBtnActive: {
    backgroundColor: '#15803D',
  },
  playIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  playText: {
    color: '#070B14',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resetText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  statsCard: {
    width: '100%',
    padding: 16,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statSep: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderGlass,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 3,
  },
  tipCard: {
    width: '100%',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.focusGreen,
    marginBottom: 4,
  },
  tipBody: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { GlassCard } from '../common/GlassCard';
import { NotificationService } from '../../services/notifications';

interface RestTimerProps {
  initialSeconds?: number;
  onFinish?: () => void;
  onClose?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  onFinish,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const notifIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Schedule background notification
    NotificationService.scheduleGymRestEnd(timeLeft).then((id) => {
      notifIdRef.current = id;
    });

    return () => {
      if (notifIdRef.current) {
        NotificationService.cancelNotification(notifIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            NotificationService.sendImmediateNotification(
              'Rest Period Over! ⏱️',
              'Ready for your next set! Push through.',
              { type: 'REST_COMPLETE' },
              'gym'
            );
            if (onFinish) onFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const addTime = (delta: number) => {
    setTimeLeft((prev) => Math.max(0, prev + delta));
  };

  const progress = timeLeft / initialSeconds;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <GlassCard style={styles.card} borderColor={COLORS.emerald} glow glowColor={COLORS.emerald}>
      <View style={styles.contentRow}>
        <View style={styles.timerInfo}>
          <Text style={styles.badge}>INTER-SET REST TIMER</Text>
          <Text style={styles.timeDigits}>{formattedTime}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => addTime(-15)}
            activeOpacity={0.7}
          >
            <Text style={styles.adjustBtnText}>-15s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => addTime(15)}
            activeOpacity={0.7}
          >
            <Text style={styles.adjustBtnText}>+15s</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setIsRunning(!isRunning)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleBtnText}>{isRunning ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mini Progress Line */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: 'rgba(13, 19, 33, 0.95)',
    borderRadius: 16,
    marginVertical: 12,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerInfo: {
    flex: 1,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
  },
  timeDigits: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adjustBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  adjustBtnText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  toggleBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.emerald,
  },
  toggleBtnText: {
    fontSize: 14,
  },
  closeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeBtnText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.emerald,
  },
});

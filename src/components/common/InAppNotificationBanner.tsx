import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import { NotificationService, InAppNotification } from '../../services/notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const InAppNotificationBanner: React.FC = () => {
  const [currentNotif, setCurrentNotif] = useState<InAppNotification | null>(null);
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-150);
  const hideTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = NotificationService.subscribeInApp((notif) => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      setCurrentNotif(notif);
      translateY.value = withSpring(0, { damping: 16, stiffness: 180 });

      // Auto dismiss after 4 seconds
      hideTimeoutRef.current = setTimeout(() => {
        dismiss();
      }, 4000);
    });

    return () => {
      unsubscribe();
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const dismiss = () => {
    translateY.value = withTiming(-150, { duration: 250 }, () => {
      // Done animating
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (Platform.OS !== 'android' || !currentNotif) return null;

  const getIcon = () => {
    if (currentNotif.type === 'TASK_STARTED') return '🚀';
    if (currentNotif.type === 'TASK_STARTING') return '⚡';
    if (currentNotif.type === 'FOCUS_FINISHED') return '🎯';
    if (currentNotif.type === 'GYM_REST_FINISHED' || currentNotif.type === 'REST_COMPLETE') return '⏱️';
    return '📋';
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: Math.max(insets.top, Platform.OS === 'android' ? 24 : 16) },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.banner}
        activeOpacity={0.9}
        onPress={dismiss}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
        <Animated.View style={styles.textContainer}>
          <Text style={styles.title}>
            {currentNotif.title}
          </Text>
          <Text style={styles.body}>
            {currentNotif.body}
          </Text>
        </Animated.View>
        <TouchableOpacity style={styles.closeBtn} onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999999,
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.emerald,
    ...SHADOWS.glowGreen,
  },
  icon: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
    flexWrap: 'wrap',
  },
  body: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 17,
    flexWrap: 'wrap',
  },
  closeBtn: {
    padding: 4,
    marginTop: 2,
  },
  closeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
});

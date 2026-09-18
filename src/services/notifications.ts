import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isRunningInExpoGo } from 'expo';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type?: string;
  timestamp: number;
}

type InAppListener = (notif: InAppNotification) => void;

let NotificationsModule: any = null;
let isChecked = false;

function getNativeNotifications() {
  if (isChecked) return NotificationsModule;
  isChecked = true;

  // In Expo Go on Android, expo-notifications crashes at require time due to push token removal in SDK 53+
  if (Platform.OS === 'android' && isRunningInExpoGo()) {
    console.log(
      '[NotificationService] Running in Expo Go on Android. Native notifications are disabled in Expo Go; using in-app notification engine.'
    );
    NotificationsModule = null;
    return null;
  }

  try {
    NotificationsModule = require('expo-notifications');
    NotificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.warn('[NotificationService] expo-notifications unavailable, using in-app fallback:', e);
    NotificationsModule = null;
  }

  return NotificationsModule;
}

export class NotificationService {
  private static listeners: Set<InAppListener> = new Set();
  private static scheduledTimers: Map<string, any> = new Map();

  /**
   * Subscribe to in-app notification banners
   */
  static subscribeInApp(listener: InAppListener): () => void {
    NotificationService.listeners.add(listener);
    return () => {
      NotificationService.listeners.delete(listener);
    };
  }

  private static emit(notif: InAppNotification) {
    NotificationService.listeners.forEach((listener) => {
      try {
        listener(notif);
      } catch (err) {
        console.error('[NotificationService] Error in notification listener:', err);
      }
    });
  }

  /**
   * Request notification permissions and create default Android channels
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const native = getNativeNotifications();
      if (!native) return true;

      const { status: existingStatus } = await native.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await native.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      if (Platform.OS === 'android') {
        await native.setNotificationChannelAsync('default', {
          name: 'Wateera System Alerts',
          importance: native.AndroidImportance?.MAX ?? 5,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
          sound: 'default',
        });

        await native.setNotificationChannelAsync('focus', {
          name: 'Focus & Productivity',
          importance: native.AndroidImportance?.HIGH ?? 4,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#22C55E',
          sound: 'default',
        });

        await native.setNotificationChannelAsync('gym', {
          name: 'Workout & Rest Timers',
          importance: native.AndroidImportance?.HIGH ?? 4,
          vibrationPattern: [0, 300, 150, 300],
          lightColor: '#10B981',
          sound: 'default',
        });
      }

      return true;
    } catch (err) {
      console.warn('[NotificationService] Error setting up notifications:', err);
      return false;
    }
  }

  /**
   * Fire an immediate pop notification (Android only, 100% offline)
   */
  static async sendImmediateNotification(
    title: string,
    body: string,
    data: Record<string, any> = {},
    channelId: 'default' | 'focus' | 'gym' = 'default'
  ): Promise<string> {
    // Only pop notifications on Android
    if (Platform.OS !== 'android') return '';

    const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    // Trigger haptic vibration
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    // Emit in-app pop banner
    NotificationService.emit({
      id,
      title,
      body,
      type: data?.type,
      timestamp: Date.now(),
    });

    // Also trigger Android native heads-up system notification if available
    const native = getNativeNotifications();
    if (native) {
      try {
        await native.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
            sound: true,
          },
          trigger: { channelId },
        });
      } catch (err) {
        console.warn('[NotificationService] Native notification dispatch error:', err);
      }
    }

    return id;
  }

  /**
   * Schedule a pop notification after N seconds (Android only, 100% offline)
   */
  static async scheduleNotification(
    title: string,
    body: string,
    seconds: number,
    data: Record<string, any> = {},
    channelId: 'default' | 'focus' | 'gym' = 'default'
  ): Promise<string> {
    // Only pop notifications on Android
    if (Platform.OS !== 'android') return '';

    if (seconds <= 0) {
      return await NotificationService.sendImmediateNotification(title, body, data, channelId);
    }

    const id = 'sched-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    // In-memory timer for reliable offline triggering
    const timer = setTimeout(() => {
      NotificationService.scheduledTimers.delete(id);
      NotificationService.sendImmediateNotification(title, body, data, channelId);
    }, seconds * 1000);

    NotificationService.scheduledTimers.set(id, timer);

    // Also schedule with Android native scheduler if available
    const native = getNativeNotifications();
    if (native) {
      try {
        await native.scheduleNotificationAsync({
          identifier: id,
          content: {
            title,
            body,
            data,
            sound: true,
          },
          trigger: {
            type: native.SchedulableTriggerInputTypes?.TIME_INTERVAL ?? 'timeInterval',
            seconds,
            channelId,
          },
        });
      } catch (err) {
        console.warn('[NotificationService] Native scheduler error:', err);
      }
    }

    return id;
  }

  /**
   * Fire a pop notification when a task starts (Android only, 100% offline)
   */
  static async notifyTaskStarted(
    taskTitle: string,
    moduleName: string = 'Task'
  ): Promise<string> {
    if (Platform.OS !== 'android') return '';

    return await NotificationService.sendImmediateNotification(
      `Task Started: ${taskTitle} 🚀`,
      `Now in progress (${moduleName}). Stay focused and get it done!`,
      { type: 'TASK_STARTED', taskTitle },
      'focus'
    );
  }

  /**
   * Schedule a pop notification when a task is scheduled to start (Android only, 100% offline)
   */
  static async scheduleTaskStart(
    taskTitle: string,
    secondsUntilStart: number,
    moduleName: string = 'Task'
  ): Promise<string> {
    if (Platform.OS !== 'android' || secondsUntilStart <= 0) return '';

    return await NotificationService.scheduleNotification(
      `Task Starting Now: ${taskTitle} ⚡`,
      `Your scheduled ${moduleName} task begins right now. Let's make progress!`,
      secondsUntilStart,
      { type: 'TASK_STARTING', taskTitle },
      'focus'
    );
  }

  /**
   * Schedule notification when Focus sprint finishes
   */
  static async scheduleFocusCompletion(durationSeconds: number): Promise<string> {
    const mins = Math.round(durationSeconds / 60);
    return await NotificationService.scheduleNotification(
      'Focus Sprint Completed! 🎯',
      `Great job! Your ${mins}-minute focus block is complete. Take a quick breather.`,
      durationSeconds,
      { type: 'FOCUS_FINISHED' },
      'focus'
    );
  }

  /**
   * Schedule Gym Rest Timer notification
   */
  static async scheduleGymRestEnd(restSeconds: number): Promise<string> {
    return await NotificationService.scheduleNotification(
      'Rest Timer Complete ⏱️',
      'Time to hit your next set! Keep the intensity up.',
      restSeconds,
      { type: 'GYM_REST_FINISHED' },
      'gym'
    );
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    // Cancel in-memory timer
    const timer = NotificationService.scheduledTimers.get(notificationId);
    if (timer) {
      clearTimeout(timer);
      NotificationService.scheduledTimers.delete(notificationId);
    }

    // Cancel native OS scheduled notification if available
    const native = getNativeNotifications();
    if (native) {
      try {
        await native.cancelScheduledNotificationAsync(notificationId);
      } catch (err) {
        console.warn('[NotificationService] Cancel native notification error:', err);
      }
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAll(): Promise<void> {
    NotificationService.scheduledTimers.forEach((timer) => clearTimeout(timer));
    NotificationService.scheduledTimers.clear();

    const native = getNativeNotifications();
    if (native) {
      try {
        await native.cancelAllScheduledNotificationsAsync();
      } catch (err) {
        console.warn('[NotificationService] Cancel all native notifications error:', err);
      }
    }
  }
}

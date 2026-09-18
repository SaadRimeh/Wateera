import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerProvider } from '../components/navigation/AnimatedDrawer';
import { AuthGuard } from '../components/auth/AuthGuard';
import { StatusBar } from 'expo-status-bar';
import { NotificationService } from '../services/notifications';
import { InAppNotificationBanner } from '../components/common/InAppNotificationBanner';

export default function RootLayout() {
  useEffect(() => {
    NotificationService.requestPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <InAppNotificationBanner />
      <AuthGuard>
        <DrawerProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#070B14' },
              animation: 'fade',
            }}
          />
        </DrawerProvider>
      </AuthGuard>
    </GestureHandlerRootView>
  );
}

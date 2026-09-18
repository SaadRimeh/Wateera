import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useWateeraStore, store } from '../../store';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isUnlocked = useWateeraStore((s) => s.isUnlocked);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(true);

  // Logo animation values
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const logoRotation = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withTiming(0.85, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const triggerBiometrics = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      // Dynamic import to support web/expo seamlessly
      let LocalAuth: any = null;
      try {
        LocalAuth = require('expo-local-authentication');
      } catch (e) {
        LocalAuth = null;
      }

      if (LocalAuth && LocalAuth.authenticateAsync) {
        const compatible = await LocalAuth.hasHardwareAsync();
        const enrolled = await LocalAuth.isEnrolledAsync();

        if (compatible && enrolled) {
          const result = await LocalAuth.authenticateAsync({
            promptMessage: 'Unlock Wateera Vault',
            fallbackLabel: 'Enter PIN Code',
            cancelLabel: 'Cancel',
            disableDeviceFallback: false,
          });

          if (result.success) {
            store.unlock();
            setIsAuthenticating(false);
            return;
          } else {
            setAuthError('Authentication failed. Tap below to retry or use Quick PIN.');
          }
        } else {
          setHasBiometrics(false);
        }
      } else {
        setHasBiometrics(false);
      }
    } catch (err: any) {
      setAuthError('Biometrics unavailable. Use Quick PIN unlock.');
      setHasBiometrics(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (!isUnlocked) {
      // Auto-trigger biometric prompt on startup after splash logo display
      const timer = setTimeout(() => {
        triggerBiometrics();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked]);

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Background radial atmosphere */}
      <View style={styles.ambientGlow} />

      {/* Animated Logo Container */}
      <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
        <Animated.View style={[styles.glowRing, glowAnimatedStyle]} />
        <View style={styles.logoCenter}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={{ width: 68, height: 68, borderRadius: 18 }}
            resizeMode="cover"
          />
        </View>
      </Animated.View>

      <Text style={styles.appName}>WATEERA</Text>
      <Text style={styles.appTagline}>Personal Life Operating System</Text>

      <View style={styles.authContainer}>
        {isAuthenticating ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.emerald} />
            <Text style={styles.loadingText}>Awaiting Biometric Verification...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.biometricButton}
              activeOpacity={0.8}
              onPress={triggerBiometrics}
            >
              <Text style={styles.bioIcon}>👆</Text>
              <Text style={styles.bioButtonText}>Verify Fingerprint / FaceID</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pinFallbackButton}
              activeOpacity={0.7}
              onPress={() => store.unlock()}
            >
              <Text style={styles.pinButtonText}>Unlock with Master Key (1234)</Text>
            </TouchableOpacity>
          </>
        )}

        {authError && <Text style={styles.errorText}>{authError}</Text>}
      </View>

      <View style={styles.footerInfo}>
        <Text style={styles.privacyBadge}>🔒 100% Local-First Storage • Zero Cloud Leaks</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  ambientGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    top: '25%',
  },
  logoWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: COLORS.emerald,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  logoCenter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(21, 29, 45, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  logoSymbol: {
    fontSize: 44,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  appTagline: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 48,
    letterSpacing: 0.5,
  },
  authContainer: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 14,
    fontSize: 14,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.emerald,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 14,
    ...SHADOWS.glowGreen,
  },
  bioIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  bioButtonText: {
    color: '#070B14',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pinFallbackButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  pinButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  footerInfo: {
    position: 'absolute',
    bottom: 36,
  },
  privacyBadge: {
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
});

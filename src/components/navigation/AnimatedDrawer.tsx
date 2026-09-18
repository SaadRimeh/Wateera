import React, { createContext, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useWateeraStore, store } from '../../store';
import { NotificationService } from '../../services/notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

interface DrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType>({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

interface NavItem {
  route: string;
  name: string;
  desc: string;
  icon: string;
  accent: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: '/', name: 'Dashboard', desc: 'System Overview & Matrix', icon: '⚡', accent: COLORS.emerald },
  { route: '/gym', name: 'Gym & Workouts', desc: 'Weekly Routine & 3-Sets Logger', icon: '🏋️', accent: COLORS.emerald },
  { route: '/supplements', name: 'Supplements & Meds', desc: 'Intake & Fitness Integration', icon: '💊', accent: COLORS.cyan },
  { route: '/tasks', name: 'Global Tasks', desc: 'Cross-Module Action Items', icon: '📋', accent: COLORS.blue },
  { route: '/finances', name: 'Finances & Debts', desc: 'Ledger & Receivables', icon: '💰', accent: COLORS.amber },
  { route: '/focus', name: 'Focus Sprint', desc: '5-Minute Focus Timer', icon: '⏱️', accent: COLORS.focusGreen },
  { route: '/study', name: 'Study Planner', desc: 'Academic Time Blocks', icon: '📚', accent: COLORS.cyan },
  { route: '/work', name: 'Work Engine', desc: 'Deployment & Client Tasks', icon: '💼', accent: COLORS.violet },
];

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);
  const router = useRouter();
  const pathname = usePathname();

  const pendingTasksCount = useWateeraStore(
    (s) => s.tasks.filter((t) => t.status !== 'COMPLETED').length
  );
  const activeGym = useWateeraStore((s) => s.activeSession);

  const openDrawer = () => {
    setIsOpen(true);
    translateX.value = withSpring(0, { damping: 20, stiffness: 180 });
    backdropOpacity.value = withTiming(1, { duration: 250 });
  };

  const closeDrawer = () => {
    translateX.value = withSpring(-DRAWER_WIDTH, { damping: 20, stiffness: 180 });
    backdropOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => setIsOpen(false), 220);
  };

  const toggleDrawer = () => {
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleNavigate = (route: string) => {
    closeDrawer();
    if (pathname !== route) {
      router.push(route as any);
    }
  };

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer, toggleDrawer }}>
      <View style={{ flex: 1, backgroundColor: COLORS.bgDark }}>
        {children}

        {/* Backdrop */}
        {isOpen && (
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
          </Animated.View>
        )}

        {/* Slide-out Drawer */}
        <Animated.View style={[styles.drawerContainer, drawerStyle]}>
          {/* Header Brand in Drawer with Logo */}
          <View style={styles.drawerHeader}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.drawerLogo}
              resizeMode="cover"
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.brandTitle}>WATEERA</Text>
              <Text style={styles.brandSubtitle}>Personal Life Operating System</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Nav List */}
          <View style={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.navItem,
                    isActive && { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: item.accent },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleNavigate(item.route)}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.accent + '22' }]}>
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.navItemText, isActive && { color: COLORS.textPrimary, fontWeight: '700' }]}>
                      {item.name}
                    </Text>
                    <Text style={styles.navItemDesc}>{item.desc}</Text>
                  </View>

                  {/* Badges */}
                  {item.route === '/tasks' && pendingTasksCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: COLORS.blue }]}>
                      <Text style={styles.badgeText}>{pendingTasksCount}</Text>
                    </View>
                  )}
                  {item.route === '/gym' && activeGym && (
                    <View style={[styles.badge, { backgroundColor: COLORS.emerald }]}>
                      <Text style={styles.badgeText}>LIVE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer actions */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.lockButton}
              activeOpacity={0.7}
              onPress={() => {
                closeDrawer();
                store.lock();
              }}
            >
              <Text style={{ fontSize: 15, marginRight: 8 }}>🔒</Text>
              <Text style={styles.lockButtonText}>Lock Vault</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
};

// 3-Line Animated Hamburger Button
export const HamburgerButton: React.FC = () => {
  const { toggleDrawer, isOpen } = useDrawer();

  return (
    <TouchableOpacity
      style={styles.hamburgerTouch}
      activeOpacity={0.7}
      onPress={toggleDrawer}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <View style={[styles.hamburgerLine, isOpen && styles.line1Open]} />
      <View style={[styles.hamburgerLine, styles.lineMiddle, isOpen && styles.line2Open]} />
      <View style={[styles.hamburgerLine, isOpen && styles.line3Open]} />
    </TouchableOpacity>
  );
};

// Custom App Header with Hamburger & Title
export const AppHeader: React.FC<{
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}> = ({ title, subtitle, rightAction }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + 8, 46) }]}>
      <HamburgerButton />
      <View style={styles.headerTitles}>
        <View style={styles.titleWithLogoRow}>
          <Text style={styles.headerTitleText}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.headerSubtitleText}>{subtitle}</Text> : null}
      </View>
      <View style={styles.headerRightBox}>
        {rightAction ? (
          rightAction
        ) : (
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.headerLogoThumb}
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 90,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: 'rgba(11, 16, 28, 0.98)',
    borderRightWidth: 1,
    borderRightColor: COLORS.borderGlass,
    zIndex: 100,
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.emerald,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.textPrimary,
  },
  brandSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderGlass,
    marginVertical: 12,
  },
  navList: {
    flex: 1,
    paddingTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  navItemDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#070B14',
    fontSize: 10,
    fontWeight: '800',
  },
  drawerFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGlass,
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  lockButtonText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  hamburgerTouch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  hamburgerLine: {
    width: 19,
    height: 2.2,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 2,
  },
  lineMiddle: {
    marginVertical: 4,
  },
  line1Open: {
    transform: [{ translateY: 6.2 }, { rotate: '45deg' }],
  },
  line2Open: {
    opacity: 0,
  },
  line3Open: {
    transform: [{ translateY: -6.2 }, { rotate: '-45deg' }],
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: 'rgba(7, 11, 20, 0.94)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitles: {
    flex: 1,
    marginLeft: 12,
  },
  titleWithLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  headerSubtitleText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  headerRightBox: {
    minWidth: 38,
    alignItems: 'flex-end',
  },
  headerLogoThumb: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
});

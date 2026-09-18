import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

interface TabItem {
  route: string;
  name: string;
  icon: string;
  accent: string;
}

const TABS: TabItem[] = [
  { route: '/', name: 'Home', icon: '⚡', accent: COLORS.emerald },
  { route: '/gym', name: 'Gym', icon: '🏋️', accent: COLORS.emerald },
  { route: '/supplements', name: 'Supps', icon: '💊', accent: COLORS.cyan },
  { route: '/tasks', name: 'Tasks', icon: '📋', accent: COLORS.blue },
  { route: '/finances', name: 'Finance', icon: '💰', accent: COLORS.amber },
];

export const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const handlePress = (route: string) => {
    if (pathname !== route) {
      router.replace(route as any);
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.route || (tab.route !== '/' && pathname.startsWith(tab.route));

          return (
            <TouchableOpacity
              key={tab.route}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => handlePress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isActive && { backgroundColor: `${tab.accent}20` }]}>
                <Text style={styles.icon}>{tab.icon}</Text>
              </View>
              <Text style={[styles.label, isActive && { color: tab.accent, fontWeight: '800' }]}>
                {tab.name}
              </Text>
              {isActive && <View style={[styles.activeDot, { backgroundColor: tab.accent }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(13, 19, 33, 0.92)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 18,
  },
  tabBtnActive: {},
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

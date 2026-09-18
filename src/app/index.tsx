import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SHADOWS } from '../constants/theme';
import { useWateeraStore } from '../store';
import { AppHeader } from '../components/navigation/AnimatedDrawer';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { GlassCard } from '../components/common/GlassCard';
import { MiniBarChart } from '../components/charts/MiniBarChart';

export default function HomeDashboard() {
  const router = useRouter();

  // Reactive state
  const tasks = useWateeraStore((s) => s.tasks);
  const activeSession = useWateeraStore((s) => s.activeSession);
  const sessionsHistory = useWateeraStore((s) => s.sessionsHistory);
  const timeBlocks = useWateeraStore((s) => s.timeBlocks);
  const transactions = useWateeraStore((s) => s.transactions);
  const debts = useWateeraStore((s) => s.debts);
  const supplements = useWateeraStore((s) => s.supplements);

  // Derived Analytics
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOwedByOthers = debts
    .filter((d) => d.status !== 'SETTLED')
    .reduce((acc, curr) => acc + curr.remainingAmount, 0);

  // Real Study hours aggregation
  const todayDate = new Date().toISOString().split('T')[0];
  const todayStudyBlocks = timeBlocks.filter((b) => b.type === 'STUDY' && b.date === todayDate);
  const studyHoursToday = todayStudyBlocks.reduce((acc, curr) => {
    try {
      const [sh, sm] = curr.startTime.split(':').map(Number);
      const [eh, em] = curr.endTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      return acc + Math.max(0, Math.round((diff / 60) * 10) / 10);
    } catch {
      return acc;
    }
  }, 0);

  const daysList = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const studyBarData = daysList.map((label) => ({ label, value: 0 }));
  const taskBarData = daysList.map((label) => ({ label, value: 0 }));

  return (
    <View style={styles.container}>
      <AppHeader
        title="WATEERA"
        subtitle="Central Command & Daily Ecosystem"
        rightAction={
          <TouchableOpacity
            style={styles.quickFocusBtn}
            onPress={() => router.push('/focus')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16 }}>⏱️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Greeting Banner */}
        <View style={styles.greetingBox}>
          <View>
            <Text style={styles.greetingDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.greetingTitle}>Welcome Back</Text>
            <Text style={styles.greetingSub}>Your personal daily ecosystem is synchronized and running.</Text>
          </View>
        </View>

        {/* Live Gym Workout Banner if active */}
        {activeSession ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/gym')}
          >
            <GlassCard
              style={styles.activeGymBanner}
              borderColor={COLORS.emerald}
              glow
              glowColor={COLORS.emerald}
            >
              <View style={styles.bannerRow}>
                <View style={styles.bannerIconBox}>
                  <Text style={{ fontSize: 24 }}>🏋️</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.bannerBadge}>ACTIVE WORKOUT IN PROGRESS</Text>
                  <Text style={styles.bannerTitle}>{activeSession.routineName}</Text>
                  <Text style={styles.bannerTime}>
                    {activeSession.setLogs.length} sets logged • Started {activeSession.checkInTime}
                  </Text>
                </View>
                <View style={styles.bannerAction}>
                  <Text style={styles.bannerActionText}>Resume →</Text>
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        ) : null}

        {/* Card 1: Gym Today & Routines */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/gym')}
        >
          <GlassCard style={styles.mainCard} borderColor="rgba(16, 185, 129, 0.35)">
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTag}>FITNESS & WORKOUT</Text>
                <Text style={styles.cardTitle}>Weekly Routine & 3-Sets Tracker</Text>
              </View>
              <View style={styles.badgeBox}>
                <Text style={styles.badgeBoxText}>Gym Engine</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>
              Full weekly schedule, set logging for weights and reps, plus progression curves.
            </Text>
          </GlassCard>
        </TouchableOpacity>

        {/* Card 2: Global Tasks & Productivity */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/tasks')}
        >
          <GlassCard style={styles.mainCard} borderColor="rgba(59, 130, 246, 0.35)">
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTag, { color: COLORS.blue }]}>CROSS-MODULE TASKS</Text>
                <Text style={styles.cardTitle}>Unified Execution Matrix</Text>
              </View>
              <View style={[styles.badgeBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: COLORS.blue }]}>
                <Text style={[styles.badgeBoxText, { color: COLORS.blue }]}>{taskCompletionRate}% Done</Text>
              </View>
            </View>
            <View style={styles.chartWrapper}>
              <MiniBarChart data={taskBarData} barColor={COLORS.blue} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Card 3: Finances Summary (Air-Gapped) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/finances')}
        >
          <GlassCard style={styles.financeCard} borderColor="rgba(245, 158, 11, 0.35)">
            <View style={styles.financeCardHeader}>
              <View>
                <Text style={styles.financeCardTag}>FINANCIAL OVERVIEW</Text>
                <Text style={styles.financeCardTitle}>Local Ledger & Receivables</Text>
              </View>
              <View style={styles.financePill}>
                <Text style={styles.financePillText}>Air-Gapped 🛡️</Text>
              </View>
            </View>

            <View style={styles.financeMetricsRow}>
              <View style={styles.financeMetricBox}>
                <Text style={styles.finLabel}>Daily Expense</Text>
                <Text style={[styles.finVal, { color: COLORS.rose }]}>${todayExpense}</Text>
              </View>
              <View style={styles.verticalSep} />
              <View style={styles.financeMetricBox}>
                <Text style={styles.finLabel}>Total Income</Text>
                <Text style={[styles.finVal, { color: COLORS.emerald }]}>+${todayIncome}</Text>
              </View>
              <View style={styles.verticalSep} />
              <View style={styles.financeMetricBox}>
                <Text style={styles.finLabel}>Owed by Others</Text>
                <Text style={[styles.finVal, { color: COLORS.amber }]}>${totalOwedByOthers}</Text>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Quick Launchpad Buttons */}
        <Text style={styles.sectionTitle}>Quick Modules Launchpad</Text>
        <View style={styles.launchpadGrid}>
          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => router.push('/gym')}
            activeOpacity={0.7}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={{ fontSize: 22 }}>🏋️</Text>
            </View>
            <Text style={styles.launchTitle}>Gym & Sets</Text>
            <Text style={styles.launchSub}>Routine & Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => router.push('/supplements')}
            activeOpacity={0.7}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Text style={{ fontSize: 22 }}>💊</Text>
            </View>
            <Text style={styles.launchTitle}>Supplements</Text>
            <Text style={styles.launchSub}>Intake & Meds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => router.push('/focus')}
            activeOpacity={0.7}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Text style={{ fontSize: 22 }}>⏱️</Text>
            </View>
            <Text style={styles.launchTitle}>Focus Ring</Text>
            <Text style={styles.launchSub}>5-Min Sprint</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => router.push('/tasks')}
            activeOpacity={0.7}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Text style={{ fontSize: 22 }}>📋</Text>
            </View>
            <Text style={styles.launchTitle}>Tasks</Text>
            <Text style={styles.launchSub}>Action Matrix</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => router.push('/finances')}
            activeOpacity={0.7}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={{ fontSize: 22 }}>💰</Text>
            </View>
            <Text style={styles.launchTitle}>Finances</Text>
            <Text style={styles.launchSub}>Debts & Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => router.push('/study')}
            activeOpacity={0.7}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <Text style={{ fontSize: 22 }}>📚</Text>
            </View>
            <Text style={styles.launchTitle}>Study Blocks</Text>
            <Text style={styles.launchSub}>Time Blocking</Text>
          </TouchableOpacity>
        </View>

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
  },
  quickFocusBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingBox: {
    marginVertical: 18,
  },
  greetingDate: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  greetingSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  activeGymBanner: {
    marginBottom: 18,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 0.8,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  bannerTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bannerAction: {
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bannerActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#070B14',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
  },
  metricCard: {
    padding: 14,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 18,
  },
  metricTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  metricBigValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  metricSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 4,
  },
  mainCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  badgeBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.emerald,
  },
  badgeBoxText: {
    fontSize: 11,
    color: COLORS.emerald,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  chartWrapper: {
    marginTop: 8,
  },
  financeCard: {
    padding: 16,
    marginBottom: 22,
  },
  financeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  financeCardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.amber,
    letterSpacing: 1,
  },
  financeCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  financePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  financePillText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  financeMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  financeMetricBox: {
    flex: 1,
    alignItems: 'center',
  },
  verticalSep: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.borderGlass,
  },
  finLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  finVal: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  launchpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  launchCard: {
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    padding: 14,
  },
  launchIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  launchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  launchSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

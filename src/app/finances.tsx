import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useWateeraStore, store } from '../store';
import { AppHeader } from '../components/navigation/AnimatedDrawer';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { GlassCard } from '../components/common/GlassCard';
import { FinancePieChart } from '../components/charts/FinancePieChart';
import { FinanceLineChart } from '../components/charts/FinanceLineChart';
import { TransactionType } from '../types';

export default function FinancesScreen() {
  const transactions = useWateeraStore((s) => s.transactions);
  const debts = useWateeraStore((s) => s.debts);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isPartialModalOpen, setIsPartialModalOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [partialAmountInput, setPartialAmountInput] = useState('');

  // Transaction form state
  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');
  const [txNote, setTxNote] = useState('');

  // Debt form state
  const [debtorName, setDebtorName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtNote, setDebtNote] = useState('');

  // Aggregations
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const totalOwedByOthers = debts
    .filter((d) => d.status !== 'SETTLED')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  // Group expenses for Pie Chart
  const expenseByCategory: { [cat: string]: number } = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      expenseByCategory[t.categoryName] = (expenseByCategory[t.categoryName] || 0) + t.amount;
    });

  const pieColors = [COLORS.rose, COLORS.amber, COLORS.violet, COLORS.cyan, COLORS.blue];
  const pieData = Object.keys(expenseByCategory).map((catName, idx) => ({
    key: `cat-${idx}-${catName}`,
    label: catName,
    amount: expenseByCategory[catName],
    color: pieColors[idx % pieColors.length],
  }));

  // Line chart data for Income trends (clean 0s when no transactions)
  const lineData = [
    { day: 'W1', amount: 0 },
    { day: 'W2', amount: 0 },
    { day: 'W3', amount: 0 },
    { day: 'W4', amount: 0 },
    { day: 'Today', amount: Math.max(0, netBalance) },
  ];

  const handleCreateTransaction = () => {
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0 || !txCategory.trim()) return;

    store.addTransaction({
      type: txType,
      categoryId: 'cat-' + Date.now(),
      categoryName: txCategory.trim(),
      amount: amt,
      date: new Date().toISOString(),
      note: txNote.trim() || undefined,
    });

    setTxAmount('');
    setTxCategory('');
    setTxNote('');
    setIsTxModalOpen(false);
  };

  const handleCreateDebt = () => {
    const amt = parseFloat(debtAmount);
    if (isNaN(amt) || amt <= 0 || !debtorName.trim()) return;

    store.addDebt({
      debtorName: debtorName.trim(),
      totalAmount: amt,
      initialDate: new Date().toISOString(),
      notes: debtNote.trim() || undefined,
    });

    setDebtorName('');
    setDebtAmount('');
    setDebtNote('');
    setIsDebtModalOpen(false);
  };

  const handleOpenPartialModal = (debtId: string) => {
    setSelectedDebtId(debtId);
    setPartialAmountInput('');
    setIsPartialModalOpen(true);
  };

  const handleConfirmPartialPayment = () => {
    if (!selectedDebtId) return;
    const amt = parseFloat(partialAmountInput);
    if (isNaN(amt) || amt <= 0) return;

    store.payDebtPartial(selectedDebtId, amt);
    setIsPartialModalOpen(false);
    setSelectedDebtId(null);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="FINANCES & DEBTS"
        subtitle="Local Isolated Ledger & Receivables"
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => setIsTxModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.headerAddBtnText}>+ Transact</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Balance Summary Cards */}
        <GlassCard style={styles.balanceCard} borderColor={COLORS.amber} glow glowColor={COLORS.amber}>
          <Text style={styles.balanceLabel}>NET LOCAL BALANCE</Text>
          <Text style={[styles.balanceValue, netBalance < 0 && { color: COLORS.rose }]}>
            ${netBalance.toLocaleString()}
          </Text>

          <View style={styles.balanceMetricsRow}>
            <View style={styles.balanceMetric}>
              <Text style={styles.metricLabel}>Total Inflow</Text>
              <Text style={[styles.metricVal, { color: COLORS.emerald }]}>+${totalIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.balanceMetric}>
              <Text style={styles.metricLabel}>Total Outflow</Text>
              <Text style={[styles.metricVal, { color: COLORS.rose }]}>-${totalExpense.toLocaleString()}</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.balanceMetric}>
              <Text style={styles.metricLabel}>Owed to You</Text>
              <Text style={[styles.metricVal, { color: COLORS.amber }]}>${totalOwedByOthers.toLocaleString()}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Charts Section */}
        {pieData.length > 0 && (
          <FinancePieChart data={pieData} totalAmount={totalExpense} />
        )}

        <FinanceLineChart data={lineData} />

        {/* ========================================================= */}
        {/* Debt & Receivables Manager ("Money owed by others")       */}
        {/* ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Money Owed by Others</Text>
            <Text style={styles.sectionSub}>Manage receivables with instant settlement actions.</Text>
          </View>
          <TouchableOpacity
            style={styles.addDebtBtn}
            onPress={() => setIsDebtModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addDebtBtnText}>+ Add Debt</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.debtsList}>
          {debts.length === 0 ? (
            <View style={styles.emptyCardBox}>
              <Text style={{ fontSize: 28, marginBottom: 6 }}>🤝</Text>
              <Text style={styles.emptyCardTitle}>No Receivables Recorded</Text>
              <Text style={styles.emptyCardSub}>Tap '+ Add Debt' above to log money owed by others.</Text>
            </View>
          ) : (
            debts.map((debt) => {
              const isSettled = debt.status === 'SETTLED';
              const percentPaid = Math.round((debt.paidAmount / (debt.totalAmount || 1)) * 100);

              return (
                <GlassCard
                  key={debt.id}
                  style={[styles.debtCard, isSettled && styles.debtCardSettled]}
                  borderColor={isSettled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)'}
                >
                  <View style={styles.debtTopRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.debtorName}>{debt.debtorName}</Text>
                      {debt.notes ? <Text style={styles.debtNotes}>{debt.notes}</Text> : null}
                    </View>
                    <View style={[styles.statusBadge, isSettled ? styles.statusSettled : styles.statusPending]}>
                      <Text style={[styles.statusText, isSettled ? { color: COLORS.emerald } : { color: COLORS.amber }]}>
                        {debt.status}
                      </Text>
                    </View>
                  </View>

                  {/* Amounts Breakdown */}
                  <View style={styles.debtAmountsRow}>
                    <View>
                      <Text style={styles.amountLabel}>Remaining</Text>
                      <Text style={styles.remainingAmount}>${debt.remainingAmount}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
                      <Text style={styles.amountLabel}>Total / Paid</Text>
                      <Text style={styles.totalPaidText}>
                        ${debt.totalAmount} (${debt.paidAmount} paid • {percentPaid}%)
                      </Text>
                    </View>
                  </View>

                  {/* Debt Progress Bar */}
                  <View style={styles.debtProgressTrack}>
                    <View style={[styles.debtProgressFill, { width: `${percentPaid}%` }]} />
                  </View>

                  {/* Two Action Buttons: Paid in Full & Partial Payment */}
                  {!isSettled && (
                    <View style={styles.debtActionsRow}>
                      <TouchableOpacity
                        style={styles.paidInFullBtn}
                        onPress={() => store.payDebtFull(debt.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.paidInFullText}>⚡ Paid in Full</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.partialPayBtn}
                        onPress={() => handleOpenPartialModal(debt.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.partialPayText}>Partial Payment</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </GlassCard>
              );
            })
          )}
        </View>

        {/* Recent Transactions Feed */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Transaction History</Text>
        <View style={styles.txList}>
          {transactions.length === 0 ? (
            <View style={styles.emptyCardBox}>
              <Text style={{ fontSize: 28, marginBottom: 6 }}>💳</Text>
              <Text style={styles.emptyCardTitle}>No Transactions Yet</Text>
              <Text style={styles.emptyCardSub}>Tap '+ Transact' in the top right to record your first inflow or expense.</Text>
            </View>
          ) : (
            transactions.slice(0, 8).map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <GlassCard key={tx.id} style={styles.txCard}>
                  <View style={styles.txRow}>
                    <View style={[styles.txIconBox, { backgroundColor: isIncome ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)' }]}>
                      <Text style={{ fontSize: 16 }}>{isIncome ? '↙️' : '↗️'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.txCat}>{tx.categoryName}</Text>
                      {tx.note ? <Text style={styles.txNote}>{tx.note}</Text> : null}
                    </View>
                    <Text style={[styles.txAmount, { color: isIncome ? COLORS.emerald : COLORS.rose }]}>
                      {isIncome ? '+' : '-'}${tx.amount}
                    </Text>
                  </View>
                </GlassCard>
              );
            })
          )}
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNavBar />

      {/* Partial Payment Modal */}
      <Modal visible={isPartialModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard} borderColor={COLORS.amber}>
            <Text style={styles.modalTitle}>Partial Payment</Text>
            <Text style={styles.modalSub}>
              Enter amount received. It will be deducted from the debt and added directly to your Income.
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="e.g. 250"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={partialAmountInput}
              onChangeText={setPartialAmountInput}
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsPartialModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: COLORS.amber }]}
                onPress={handleConfirmPartialPayment}
              >
                <Text style={styles.modalSubmitText}>Apply Payment</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={isTxModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard} borderColor={COLORS.emerald}>
            <Text style={styles.modalTitle}>New Transaction</Text>

            {/* Type switch */}
            <View style={styles.typeSwitchRow}>
              <TouchableOpacity
                style={[styles.typeBtn, txType === 'EXPENSE' && styles.typeBtnActiveExpense]}
                onPress={() => setTxType('EXPENSE')}
              >
                <Text style={[styles.typeBtnText, txType === 'EXPENSE' && { color: '#FFF' }]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, txType === 'INCOME' && styles.typeBtnActiveIncome]}
                onPress={() => setTxType('INCOME')}
              >
                <Text style={[styles.typeBtnText, txType === 'INCOME' && { color: '#070B14' }]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Amount ($)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={txAmount}
              onChangeText={setTxAmount}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Category (e.g. Food, Internet, Rent)"
              placeholderTextColor={COLORS.textMuted}
              value={txCategory}
              onChangeText={setTxCategory}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Note (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={txNote}
              onChangeText={setTxNote}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsTxModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: COLORS.emerald }]}
                onPress={handleCreateTransaction}
              >
                <Text style={styles.modalSubmitText}>Save Transaction</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Add Debt Modal */}
      <Modal visible={isDebtModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard} borderColor={COLORS.amber}>
            <Text style={styles.modalTitle}>Record Money Owed</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Debtor Name"
              placeholderTextColor={COLORS.textMuted}
              value={debtorName}
              onChangeText={setDebtorName}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Total Amount ($)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={debtAmount}
              onChangeText={setDebtAmount}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Reason / Notes (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={debtNote}
              onChangeText={setDebtNote}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsDebtModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: COLORS.amber }]}
                onPress={handleCreateDebt}
              >
                <Text style={styles.modalSubmitText}>Save Debt</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
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
  },
  headerAddBtn: {
    backgroundColor: COLORS.amber,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  headerAddBtnText: {
    color: '#070B14',
    fontSize: 12,
    fontWeight: '800',
  },
  balanceCard: {
    padding: 18,
    marginBottom: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.amber,
    letterSpacing: 1.2,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  balanceMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 16,
  },
  balanceMetric: {
    flex: 1,
    alignItems: 'center',
  },
  metricSep: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderGlass,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addDebtBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  addDebtBtnText: {
    color: COLORS.amber,
    fontSize: 11,
    fontWeight: '700',
  },
  debtsList: {
    gap: 12,
  },
  debtCard: {
    padding: 16,
  },
  debtCardSettled: {
    opacity: 0.7,
  },
  debtTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  debtorName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  debtNotes: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusSettled: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  debtAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  remainingAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.amber,
    marginTop: 2,
  },
  totalPaidText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  debtProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginVertical: 12,
    overflow: 'hidden',
  },
  debtProgressFill: {
    height: '100%',
    backgroundColor: COLORS.amber,
  },
  debtActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  paidInFullBtn: {
    flex: 1,
    backgroundColor: COLORS.amber,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidInFullText: {
    color: '#070B14',
    fontSize: 12,
    fontWeight: '800',
  },
  partialPayBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  partialPayText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  txList: {
    gap: 10,
    marginTop: 12,
  },
  txCard: {
    padding: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txCat: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  txNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    backgroundColor: '#0D1321',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: 12,
  },
  typeSwitchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  typeBtnActiveExpense: {
    backgroundColor: COLORS.rose,
    borderColor: COLORS.rose,
  },
  typeBtnActiveIncome: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalSubmitText: {
    color: '#070B14',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyCardBox: {
    padding: 24,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyCardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});

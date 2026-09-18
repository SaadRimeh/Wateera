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
import { SupplementCategory, SupplementItem } from '../types';

export default function SupplementsScreen() {
  const supplements = useWateeraStore((s) => s.supplements);
  const [filter, setFilter] = useState<'ALL' | 'GYM' | 'MEDS'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplementCategory>('SUPPLEMENT');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState('Morning');
  const [isGymRelated, setIsGymRelated] = useState(true);
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const filteredItems = supplements.filter((item) => {
    if (filter === 'GYM') return item.isGymRelated;
    if (filter === 'MEDS') return item.category === 'MEDICATION';
    return true;
  });

  const takenCount = supplements.filter((s) => s.takenDates.includes(today)).length;
  const gymLinkedCount = supplements.filter((s) => s.isGymRelated).length;
  const totalCount = supplements.length;
  const progressPct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleSaveSupplement = () => {
    if (!name.trim()) return;

    store.addSupplement({
      name: name.trim(),
      category,
      dosage: dosage.trim() || '1 serving',
      timing: timing.trim() || 'Daily',
      isGymRelated,
      notes: notes.trim() || undefined,
      daysSchedule: [0, 1, 2, 3, 4, 5, 6],
    });

    setName('');
    setDosage('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="SUPPLEMENTS & MEDS"
        subtitle="Nutrition, Fitness Supplements & Daily Meds"
        rightAction={
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addHeaderBtnText}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Compliance Hero Card */}
        <GlassCard style={styles.heroCard} borderColor={COLORS.cyan} glow glowColor={COLORS.cyan}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroBadge}>DAILY INTAKE TRACKER</Text>
              <Text style={styles.heroTitle}>
                {takenCount} of {totalCount} Taken Today
              </Text>
              <Text style={styles.heroSubtitle}>
                {gymLinkedCount} items tagged as Fitness & Workout linked
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{progressPct}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
        </GlassCard>

        {/* Filter Pills */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
            onPress={() => setFilter('ALL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
              All ({totalCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'GYM' && styles.filterPillActiveGym]}
            onPress={() => setFilter('GYM')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === 'GYM' && styles.filterTextActiveGym]}>
              🏋️ Gym Linked ({gymLinkedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'MEDS' && styles.filterPillActive]}
            onPress={() => setFilter('MEDS')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === 'MEDS' && styles.filterTextActive]}>
              💊 Medications
            </Text>
          </TouchableOpacity>
        </View>

        {/* Supplements List */}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>💊</Text>
            <Text style={styles.emptyTitle}>No Items in this Category</Text>
            <Text style={styles.emptySub}>Tap '+ Add' above to record your supplements or medications.</Text>
          </View>
        ) : (
          filteredItems.map((item) => {
            const isTaken = item.takenDates.includes(today);

            return (
              <GlassCard
                key={item.id}
                style={styles.itemCard}
                borderColor={isTaken ? COLORS.emerald : item.isGymRelated ? 'rgba(16, 185, 129, 0.4)' : undefined}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.isGymRelated && (
                        <View style={styles.gymLinkedBadge}>
                          <Text style={styles.gymLinkedBadgeText}>🏋️ GYM LINKED</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.dosageText}>
                      {item.dosage} • <Text style={{ color: COLORS.textSecondary }}>{item.timing}</Text>
                    </Text>

                    {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                  </View>

                  <TouchableOpacity
                    style={[styles.checkBtn, isTaken && styles.checkBtnTaken]}
                    onPress={() => store.toggleSupplementTakenToday(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.checkBtnText, isTaken && styles.checkBtnTextTaken]}>
                      {isTaken ? '✓ Taken' : 'Mark Taken'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Footer details & delete */}
                <View style={styles.cardFooter}>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>
                      {item.category === 'SUPPLEMENT' ? 'SUPPLEMENT' : 'PRESCRIPTION / MED'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => store.deleteSupplement(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNavBar />

      {/* Add Item Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Supplement / Medicine</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[styles.typeBtn, category === 'SUPPLEMENT' && styles.typeBtnActive]}
                onPress={() => {
                  setCategory('SUPPLEMENT');
                  setIsGymRelated(true);
                }}
              >
                <Text style={[styles.typeBtnText, category === 'SUPPLEMENT' && styles.typeBtnTextActive]}>
                  Supplement (e.g. Creatine)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeBtn, category === 'MEDICATION' && styles.typeBtnActive]}
                onPress={() => {
                  setCategory('MEDICATION');
                  setIsGymRelated(false);
                }}
              >
                <Text style={[styles.typeBtnText, category === 'MEDICATION' && styles.typeBtnTextActive]}>
                  Medication / Vitamin
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <Text style={styles.inputLabel}>NAME</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Creatine Monohydrate, Whey, Omega-3"
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.inputRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>DOSAGE / SERVING</Text>
                <TextInput
                  style={styles.textInput}
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="e.g. 5g, 1 scoop, 1 tab"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>TIMING</Text>
                <TextInput
                  style={styles.textInput}
                  value={timing}
                  onChangeText={setTiming}
                  placeholder="e.g. Post-Workout, Morning"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            {/* Gym Linked Toggle */}
            <TouchableOpacity
              style={[styles.gymToggleCard, isGymRelated && styles.gymToggleCardActive]}
              onPress={() => setIsGymRelated(!isGymRelated)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.gymToggleTitle, isGymRelated && { color: COLORS.emerald }]}>
                  🏋️ Linked to Workout / Gym
                </Text>
                <Text style={styles.gymToggleSub}>
                  Flag whether this supplement aids gym performance, recovery or muscle growth (e.g., Creatine, Protein, BCAA).
                </Text>
              </View>
              <View style={[styles.toggleSwitch, isGymRelated && styles.toggleSwitchActive]}>
                <View style={[styles.switchThumb, isGymRelated && styles.switchThumbActive]} />
              </View>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>NOTES / BENEFIT</Text>
            <TextInput
              style={[styles.textInput, { height: 60 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Aids muscle recovery, drink with 500ml water"
              placeholderTextColor={COLORS.textMuted}
              multiline
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSupplement} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save Supplement</Text>
            </TouchableOpacity>
          </View>
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
    padding: 16,
  },
  addHeaderBtn: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addHeaderBtnText: {
    color: '#070B14',
    fontSize: 12,
    fontWeight: '800',
  },
  heroCard: {
    marginBottom: 16,
    padding: 18,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyan,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 2,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.cyan,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.cyan,
    borderRadius: 4,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: COLORS.cyan,
  },
  filterPillActiveGym: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.emerald,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.cyan,
    fontWeight: '800',
  },
  filterTextActiveGym: {
    color: COLORS.emerald,
    fontWeight: '800',
  },
  itemCard: {
    marginBottom: 10,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  gymLinkedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  gymLinkedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  dosageText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.cyan,
    marginTop: 4,
  },
  itemNotes: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  checkBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  checkBtnTaken: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  checkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  checkBtnTextTaken: {
    color: '#070B14',
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  remindText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cyan,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.danger,
  },
  emptyCard: {
    backgroundColor: 'rgba(21, 29, 45, 0.6)',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0E1422',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: COLORS.cyan,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  typeBtnTextActive: {
    color: COLORS.cyan,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
  },
  gymToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  gymToggleCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  gymToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  gymToggleSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.emerald,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  saveBtn: {
    backgroundColor: COLORS.emerald,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '800',
  },
});

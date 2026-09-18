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
import { NotificationService } from '../services/notifications';

export default function StudyScreen() {
  const timeBlocks = useWateeraStore((s) => s.timeBlocks);
  const studyBlocks = timeBlocks.filter((b) => b.type === 'STUDY');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBlockForSubTask, setActiveBlockForSubTask] = useState<string | null>(null);
  const [subTaskInput, setSubTaskInput] = useState('');

  // New Block Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('15:00');
  const [notes, setNotes] = useState('');

  const handleCreateBlock = () => {
    if (!title.trim()) return;
    store.addTimeBlock({
      type: 'STUDY',
      title: title.trim(),
      category: category.trim(),
      startTime,
      endTime,
      date: new Date().toISOString().split('T')[0],
      isCompleted: false,
      color: COLORS.cyan,
      notes: notes.trim() || undefined,
      subTasks: [],
    });

    setTitle('');
    setNotes('');
    setIsModalOpen(false);
  };

  const handleAddSubTask = (blockId: string) => {
    if (!subTaskInput.trim()) return;
    store.addSubTask(blockId, subTaskInput.trim());
    setSubTaskInput('');
    setActiveBlockForSubTask(null);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="STUDY PLANNER"
        subtitle="Academic Time Blocks & Nested Task Matrix"
        rightAction={
          <TouchableOpacity
            style={styles.addBlockBtn}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBlockText}>+ Session</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            🔄 Dual-Sync Engine: Sub-tasks created here automatically appear and sync status with the Global Tasks system.
          </Text>
        </View>

        {studyBlocks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 36 }}>📚</Text>
            <Text style={styles.emptyTitle}>No study blocks scheduled</Text>
            <Text style={styles.emptySub}>Create your first study time-block to organize sub-tasks.</Text>
          </View>
        ) : (
          studyBlocks.map((block) => {
            const completedCount = block.subTasks.filter((s) => s.isCompleted).length;
            const totalCount = block.subTasks.length;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <GlassCard key={block.id} style={styles.blockCard} borderColor="rgba(6, 182, 212, 0.35)">
                {/* Block Header */}
                <View style={styles.blockHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.timeTagRow}>
                      <View style={styles.timePill}>
                        <Text style={styles.timePillText}>
                          ⏰ {block.startTime} — {block.endTime}
                        </Text>
                      </View>
                      <Text style={styles.categoryText}>{block.category}</Text>
                    </View>
                    <Text style={styles.blockTitle}>{block.title}</Text>
                    {block.notes ? <Text style={styles.blockNotes}>{block.notes}</Text> : null}
                  </View>

                  <TouchableOpacity
                    style={styles.startSessionBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      NotificationService.notifyTaskStarted(block.title, `Study: ${block.category}`);
                    }}
                  >
                    <Text style={styles.startSessionBtnText}>▶ Start</Text>
                  </TouchableOpacity>
                </View>

                {/* Progress bar */}
                {totalCount > 0 && (
                  <View style={styles.blockProgressSection}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressLabel}>Sub-tasks Progress</Text>
                      <Text style={styles.progressVal}>
                        {completedCount}/{totalCount} ({percent}%)
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${percent}%` }]} />
                    </View>
                  </View>
                )}

                {/* Nested Sub-tasks (To-Do Lists) */}
                <View style={styles.subtasksContainer}>
                  <Text style={styles.subtasksTitle}>
                    Nested Checklist ({totalCount})
                  </Text>

                  {block.subTasks.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={[styles.subtaskRow, sub.isCompleted && styles.subtaskRowDone]}
                      onPress={() => store.toggleSubTask(block.id, sub.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.subCheckbox,
                          sub.isCompleted && { backgroundColor: COLORS.cyan, borderColor: COLORS.cyan },
                        ]}
                      >
                        {sub.isCompleted && <Text style={styles.subCheckText}>✓</Text>}
                      </View>
                      <Text style={[styles.subtaskText, sub.isCompleted && styles.subtaskTextDone]}>
                        {sub.title}
                      </Text>
                      <View style={styles.syncBadge}>
                        <Text style={styles.syncBadgeText}>Global Sync</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Inline Add Sub-task */}
                  {activeBlockForSubTask === block.id ? (
                    <View style={styles.addSubRow}>
                      <TextInput
                        style={styles.subInput}
                        placeholder="e.g. Study recursion patterns"
                        placeholderTextColor={COLORS.textMuted}
                        value={subTaskInput}
                        onChangeText={setSubTaskInput}
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.subAddConfirmBtn}
                        onPress={() => handleAddSubTask(block.id)}
                      >
                        <Text style={styles.subAddConfirmText}>Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.subCancelBtn}
                        onPress={() => setActiveBlockForSubTask(null)}
                      >
                        <Text style={styles.subCancelText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addSubPromptBtn}
                      onPress={() => {
                        setActiveBlockForSubTask(block.id);
                        setSubTaskInput('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addSubPromptText}>+ Add Nested Sub-task</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlassCard>
            );
          })
        )}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNavBar />

      {/* Add Study Block Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard} borderColor={COLORS.cyan}>
            <Text style={styles.modalTitle}>New Study Block</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Session Title (e.g. Advanced Data Structures)"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Category (e.g. Algorithms)"
              placeholderTextColor={COLORS.textMuted}
              value={category}
              onChangeText={setCategory}
            />

            <View style={styles.timeInputsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputSubLabel}>Start Time (HH:MM)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="13:00"
                  placeholderTextColor={COLORS.textMuted}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.inputSubLabel}>End Time (HH:MM)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="15:00"
                  placeholderTextColor={COLORS.textMuted}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Notes & Objectives (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: COLORS.cyan }]}
                onPress={handleCreateBlock}
              >
                <Text style={styles.modalSubmitText}>Create Block</Text>
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
  addBlockBtn: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addBlockText: {
    color: '#070B14',
    fontSize: 12,
    fontWeight: '800',
  },
  infoBanner: {
    padding: 10,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 11,
    color: COLORS.cyan,
    lineHeight: 16,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  blockCard: {
    padding: 16,
    marginBottom: 16,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  startSessionBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
    marginTop: 2,
  },
  startSessionBtnText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800',
  },
  timeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  timePill: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.cyan,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  blockTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  blockNotes: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  blockProgressSection: {
    marginTop: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  progressVal: {
    fontSize: 10,
    color: COLORS.cyan,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.cyan,
  },
  subtasksContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  subtasksTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginBottom: 6,
  },
  subtaskRowDone: {
    opacity: 0.5,
  },
  subCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  subCheckText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#070B14',
  },
  subtaskText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  subtaskTextDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  syncBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncBadgeText: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  addSubPromptBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  addSubPromptText: {
    fontSize: 12,
    color: COLORS.cyan,
    fontWeight: '700',
  },
  addSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  subInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    color: COLORS.textPrimary,
    fontSize: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  subAddConfirmBtn: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  subAddConfirmText: {
    color: '#070B14',
    fontSize: 11,
    fontWeight: '800',
  },
  subCancelBtn: {
    padding: 6,
  },
  subCancelText: {
    color: COLORS.textMuted,
    fontSize: 12,
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
    marginBottom: 14,
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
  timeInputsRow: {
    flexDirection: 'row',
  },
  inputSubLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
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
});

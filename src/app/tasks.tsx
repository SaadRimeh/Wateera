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
import { TaskModuleSource, TaskPriority } from '../types';
import { NotificationService } from '../services/notifications';

export default function TasksScreen() {
  const tasks = useWateeraStore((s) => s.tasks);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');
  const [newModule, setNewModule] = useState<TaskModuleSource>('NONE');
  const [startTiming, setStartTiming] = useState<'NOW' | 'PENDING' | '5M' | '15M'>('NOW');

  const filteredTasks = tasks.filter((t) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'COMPLETED') return t.status === 'COMPLETED';
    if (selectedFilter === 'PENDING') return t.status !== 'COMPLETED';
    return t.sourceModule === selectedFilter;
  });

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    const isNow = startTiming === 'NOW';
    const newTask = store.addTask({
      title: newTitle.trim(),
      status: isNow ? 'IN_PROGRESS' : 'PENDING',
      priority: newPriority,
      sourceModule: newModule,
    });

    const moduleLabel = newTask.sourceModule !== 'NONE' ? newTask.sourceModule : 'Global Task';

    if (isNow) {
      // Trigger offline Android pop notification immediately
      NotificationService.notifyTaskStarted(newTask.title, moduleLabel);
    } else if (startTiming === '5M') {
      // Schedule offline Android pop notification in 5 minutes
      NotificationService.scheduleTaskStart(newTask.title, 5 * 60, moduleLabel);
    } else if (startTiming === '15M') {
      // Schedule offline Android pop notification in 15 minutes
      NotificationService.scheduleTaskStart(newTask.title, 15 * 60, moduleLabel);
    }

    setNewTitle('');
    setNewPriority('MEDIUM');
    setNewModule('NONE');
    setStartTiming('NOW');
    setIsModalOpen(false);
  };

  const getSourceColor = (source: TaskModuleSource) => {
    switch (source) {
      case 'GYM':
        return COLORS.emerald;
      case 'STUDY':
        return COLORS.cyan;
      case 'WORK':
        return COLORS.violet;
      case 'FOCUS':
        return COLORS.focusGreen;
      default:
        return COLORS.blue;
    }
  };

  const getSourceIcon = (source: TaskModuleSource) => {
    switch (source) {
      case 'GYM':
        return '🏋️';
      case 'STUDY':
        return '📚';
      case 'WORK':
        return '💼';
      case 'FOCUS':
        return '⏱️';
      default:
        return '📋';
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="GLOBAL TASKS"
        subtitle="Unified Cross-Module Execution Engine"
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs Scroll */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'PENDING', 'COMPLETED', 'STUDY', 'WORK', 'GYM', 'FOCUS'].map((tab) => {
            const isActive = selectedFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedFilter(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Air-gap note */}
      <View style={styles.airGapBanner}>
        <Text style={styles.airGapText}>
          🛡️ Cross-Engine Linked: Syncs with Gym, Study, Work & Focus. (Finances strictly isolated).
        </Text>
      </View>

      {/* Tasks List */}
      <ScrollView contentContainerStyle={styles.taskListContent} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 36 }}>✨</Text>
            <Text style={styles.emptyTitle}>No tasks found in this section</Text>
            <Text style={styles.emptySub}>Add a new task or create one via Study/Gym modules.</Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isInProgress = task.status === 'IN_PROGRESS';
            const isPending = !isCompleted && !isInProgress;
            const moduleColor = getSourceColor(task.sourceModule);
            const moduleIcon = getSourceIcon(task.sourceModule);

            return (
              <GlassCard
                key={task.id}
                style={[
                  styles.taskCard,
                  isCompleted && styles.taskCardCompleted,
                  isInProgress && styles.taskCardInProgress,
                ]}
                borderColor={
                  isCompleted
                    ? 'rgba(255,255,255,0.04)'
                    : isInProgress
                    ? COLORS.emerald
                    : COLORS.borderGlass
                }
              >
                <View style={styles.taskRow}>
                  {/* Interactive Checkbox */}
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      isCompleted && { backgroundColor: COLORS.emerald, borderColor: COLORS.emerald },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => store.toggleTask(task.id)}
                  >
                    {isCompleted && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>

                  {/* Task Content */}
                  <View style={styles.taskBody}>
                    <Text
                      style={[styles.taskTitle, isCompleted && styles.taskTitleDone]}
                    >
                      {task.title}
                    </Text>

                    <View style={styles.taskMetaRow}>
                      <View style={[styles.moduleBadge, { backgroundColor: moduleColor + '20', borderColor: moduleColor + '50' }]}>
                        <Text style={{ fontSize: 10 }}>{moduleIcon}</Text>
                        <Text style={[styles.moduleBadgeText, { color: moduleColor }]}>
                          {task.sourceModule}
                        </Text>
                      </View>

                      {isInProgress ? (
                        <View style={styles.inProgressBadge}>
                          <Text style={styles.inProgressText}>⚡ IN PROGRESS</Text>
                        </View>
                      ) : (
                        <View style={styles.priorityBadge}>
                          <Text style={[styles.priorityText, task.priority === 'HIGH' || task.priority === 'URGENT' ? { color: COLORS.rose } : { color: COLORS.textSecondary }]}>
                            {task.priority}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Start Task Button (triggers offline Android pop notification) */}
                  {isPending && (
                    <TouchableOpacity
                      style={styles.startActionBtn}
                      activeOpacity={0.7}
                      onPress={() => store.startTask(task.id)}
                    >
                      <Text style={styles.startActionBtnText}>▶ Start</Text>
                    </TouchableOpacity>
                  )}

                  {/* Delete button */}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => store.deleteTask(task.id)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          })
        )}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNavBar />

      {/* Add Task Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard} borderColor={COLORS.blue}>
            <Text style={styles.modalTitle}>Add Global Task</Text>

            <TextInput
              style={styles.textInput}
              placeholder="What needs to be accomplished?"
              placeholderTextColor={COLORS.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            {/* When to Start / Pop Notification timing */}
            <Text style={styles.inputLabel}>When to Start (Android Notification):</Text>
            <View style={styles.startTimingRow}>
              {[
                { label: '▶ Start Now', val: 'NOW' },
                { label: '⏱ In 5 min', val: '5M' },
                { label: '⏱ In 15 min', val: '15M' },
                { label: '📌 Pending', val: 'PENDING' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.val}
                  style={[
                    styles.timingOption,
                    startTiming === opt.val && styles.timingOptionActive,
                  ]}
                  onPress={() => setStartTiming(opt.val as any)}
                >
                  <Text
                    style={[
                      styles.timingOptionText,
                      startTiming === opt.val && styles.timingOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Linked Module Selector (Notice: NO Finances option!) */}
            <Text style={styles.inputLabel}>Link to Module:</Text>
            <View style={styles.moduleSelectRow}>
              {[
                { label: 'None', val: 'NONE' },
                { label: '🏋️ Gym', val: 'GYM' },
                { label: '📚 Study', val: 'STUDY' },
                { label: '💼 Work', val: 'WORK' },
                { label: '⏱️ Focus', val: 'FOCUS' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.val}
                  style={[styles.moduleOption, newModule === m.val && styles.moduleOptionActive]}
                  onPress={() => setNewModule(m.val as TaskModuleSource)}
                >
                  <Text style={[styles.moduleOptionText, newModule === m.val && { color: COLORS.textPrimary, fontWeight: '700' }]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Selector */}
            <Text style={styles.inputLabel}>Priority Level:</Text>
            <View style={styles.prioritySelectRow}>
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityOption, newPriority === p && styles.priorityOptionActive]}
                  onPress={() => setNewPriority(p)}
                >
                  <Text style={[styles.priorityOptionText, newPriority === p && { color: COLORS.emerald, fontWeight: '800' }]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleCreateTask}
              >
                <Text style={styles.modalSubmitText}>Save Task</Text>
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
  addBtn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#070B14',
    fontSize: 12,
    fontWeight: '800',
  },
  filterContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  filterChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: COLORS.blue,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.textPrimary,
  },
  airGapBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  airGapText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  taskListContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
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
    textAlign: 'center',
  },
  taskCard: {
    marginBottom: 10,
    padding: 14,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070B14',
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  taskMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  moduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 8,
  },
  deleteBtnText: {
    color: COLORS.textMuted,
    fontSize: 14,
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
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  moduleSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  moduleOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  moduleOptionActive: {
    borderColor: COLORS.blue,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  moduleOptionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  prioritySelectRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  priorityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  priorityOptionActive: {
    borderColor: COLORS.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  priorityOptionText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  taskCardInProgress: {
    borderWidth: 1.5,
    borderColor: COLORS.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  inProgressBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.emerald,
  },
  inProgressText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.emerald,
    letterSpacing: 0.5,
  },
  startActionBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: COLORS.emerald,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 6,
  },
  startActionBtnText: {
    color: COLORS.emerald,
    fontSize: 11,
    fontWeight: '800',
  },
  startTimingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  timingOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  timingOptionActive: {
    borderColor: COLORS.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  timingOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  timingOptionTextActive: {
    color: COLORS.emerald,
    fontWeight: '800',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
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
    backgroundColor: COLORS.blue,
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

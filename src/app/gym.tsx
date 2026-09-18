import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { useWateeraStore, store } from '../store';
import { AppHeader } from '../components/navigation/AnimatedDrawer';
import { BottomNavBar } from '../components/navigation/BottomNavBar';
import { GlassCard } from '../components/common/GlassCard';
import { MuscleProgressChart } from '../components/charts/MuscleProgressChart';
import { MuscleGroup, WorkoutRoutine } from '../types';

const DAYS_OF_WEEK = [
  { dayIndex: 0, label: 'Sun', full: 'Sunday' },
  { dayIndex: 1, label: 'Mon', full: 'Monday' },
  { dayIndex: 2, label: 'Tue', full: 'Tuesday' },
  { dayIndex: 3, label: 'Wed', full: 'Wednesday' },
  { dayIndex: 4, label: 'Thu', full: 'Thursday' },
  { dayIndex: 5, label: 'Fri', full: 'Friday' },
  { dayIndex: 6, label: 'Sat', full: 'Saturday' },
];

const ALL_MUSCLES: MuscleGroup[] = [
  'LEGS',
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'ABS',
  'CALVES',
];

interface ExerciseState {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  sets: { weightKg: number; reps: number; completed: boolean }[];
}

export default function GymScreen() {
  const routines = useWateeraStore((s) => s.routines);
  const currentDayOfWeek = new Date().getDay(); // 0 = Sunday

  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek);
  const [selectedChartMuscle, setSelectedChartMuscle] = useState<MuscleGroup>('LEGS');
  const [activeTab, setActiveTab] = useState<'WORKOUT' | 'CHARTS'>('WORKOUT');

  // Edit Routine Modal
  const [isEditRoutineModalOpen, setIsEditRoutineModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('LEGS');

  // Get routine for selected day
  const currentRoutine =
    routines.find((r) => r.dayOfWeek === selectedDay) ||
    routines[0] || {
      id: 'routine-fallback',
      name: 'Custom Workout',
      dayOfWeek: selectedDay as any,
      targetMuscles: ['LEGS'],
      exercises: [],
      createdAt: new Date().toISOString(),
    };

  // State for the 3 sets per exercise in today's active session
  const [workoutData, setWorkoutData] = useState<Record<string, { weightKg: string; reps: string; completed: boolean }[]>>({});
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  // Initialize or get exercise sets (default 3 sets per exercise)
  const getExerciseSets = (exId: string) => {
    if (workoutData[exId]) {
      return workoutData[exId];
    }
    return [
      { weightKg: '60', reps: '10', completed: false },
      { weightKg: '65', reps: '8', completed: false },
      { weightKg: '70', reps: '6', completed: false },
    ];
  };

  const handleUpdateSet = (
    exId: string,
    setIndex: number,
    field: 'weightKg' | 'reps' | 'completed',
    value: string | boolean
  ) => {
    const currentSets = getExerciseSets(exId);
    const updated = [...currentSets];
    updated[setIndex] = {
      ...updated[setIndex],
      [field]: value,
    };
    setWorkoutData((prev) => ({
      ...prev,
      [exId]: updated,
    }));
  };

  const adjustValue = (exId: string, setIndex: number, field: 'weightKg' | 'reps', delta: number) => {
    const currentSets = getExerciseSets(exId);
    const currVal = parseFloat(currentSets[setIndex][field]) || 0;
    const nextVal = Math.max(0, currVal + delta);
    handleUpdateSet(exId, setIndex, field, nextVal.toString());
  };

  const handleSaveWorkout = () => {
    const exercisePayload = currentRoutine.exercises.map((ex) => {
      const sets = getExerciseSets(ex.id).map((s) => ({
        weightKg: parseFloat(s.weightKg) || 0,
        reps: parseInt(s.reps, 10) || 0,
        completed: s.completed,
      }));
      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetMuscle: ex.targetMuscle,
        sets,
      };
    });

    store.saveFullWorkoutSession(currentRoutine.id, currentRoutine.name, exercisePayload);

    setSavedBanner(`✓ Workout Saved! Logged 3 sets per exercise to history.`);
    setTimeout(() => setSavedBanner(null), 4000);
  };

  const handleAddExerciseToRoutine = () => {
    if (!newExName.trim()) return;
    store.addExerciseToRoutine(currentRoutine.id, newExName.trim(), newExMuscle, 3);
    setNewExName('');
  };

  const handleRemoveExercise = (exerciseId: string) => {
    store.removeExerciseFromRoutine(currentRoutine.id, exerciseId);
  };

  // Get muscle progress data for charts
  const muscleProgress = store.getMuscleProgress(selectedChartMuscle);

  return (
    <View style={styles.container}>
      <AppHeader
        title="GYM & WORKOUTS"
        subtitle="Weekly Program, 3-Sets Logger & Muscle Charts"
        rightAction={
          <TouchableOpacity
            style={styles.routineEditBtn}
            onPress={() => setIsEditRoutineModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.routineEditBtnText}>⚙ Edit Plan</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Weekly Day Selector (Sun - Sat) */}
        <View style={styles.weeklyHeaderRow}>
          <Text style={styles.sectionHeading}>WEEKLY SCHEDULE</Text>
          <Text style={styles.todayPill}>
            Today is {DAYS_OF_WEEK.find((d) => d.dayIndex === currentDayOfWeek)?.full}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
          {DAYS_OF_WEEK.map((d) => {
            const isSelected = selectedDay === d.dayIndex;
            const isToday = currentDayOfWeek === d.dayIndex;
            const routineForDay = routines.find((r) => r.dayOfWeek === d.dayIndex);
            const mainMuscle = routineForDay?.targetMuscles[0] || 'Rest';

            return (
              <TouchableOpacity
                key={d.dayIndex}
                style={[
                  styles.dayCard,
                  isSelected && styles.dayCardSelected,
                  isToday && !isSelected && styles.dayCardToday,
                ]}
                onPress={() => setSelectedDay(d.dayIndex)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{d.label}</Text>
                <Text style={[styles.dayMuscleText, isSelected && { color: COLORS.bgDark }]}>
                  {mainMuscle}
                </Text>
                {isToday && <View style={[styles.todayIndicator, isSelected && { backgroundColor: COLORS.bgDark }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Success Banner */}
        {savedBanner && (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{savedBanner}</Text>
          </View>
        )}

        {/* View Mode Toggle: Workout Logger vs Muscle Progress Charts */}
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeBtn, activeTab === 'WORKOUT' && styles.viewModeBtnActive]}
            onPress={() => setActiveTab('WORKOUT')}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewModeText, activeTab === 'WORKOUT' && styles.viewModeTextActive]}>
              🏋️ Today's Workout ({currentRoutine.name})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeBtn, activeTab === 'CHARTS' && styles.viewModeBtnActive]}
            onPress={() => setActiveTab('CHARTS')}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewModeText, activeTab === 'CHARTS' && styles.viewModeTextActive]}>
              📊 Muscle Charts
            </Text>
          </TouchableOpacity>
        </View>

        {/* ----------------- TAB 1: WORKOUT & 3-SETS LOGGER ----------------- */}
        {activeTab === 'WORKOUT' && (
          <View>
            {/* Day Routine Summary Card */}
            <GlassCard style={styles.routineCard} borderColor={COLORS.emerald} glow glowColor={COLORS.emerald}>
              <View style={styles.routineHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routineBadge}>
                    {DAYS_OF_WEEK.find((d) => d.dayIndex === selectedDay)?.full.toUpperCase()} PROGRAM
                  </Text>
                  <Text style={styles.routineTitle}>{currentRoutine.name}</Text>
                  <View style={styles.targetMusclesRow}>
                    {currentRoutine.targetMuscles.map((m) => (
                      <View key={m} style={styles.muscleChip}>
                        <Text style={styles.muscleChipText}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.saveWorkoutBtn}
                  onPress={handleSaveWorkout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveWorkoutBtnText}>Save Workout</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* Exercises List with 3-Set Table */}
            {currentRoutine.exercises.length === 0 ? (
              <View style={styles.emptyRoutineBox}>
                <Text style={{ fontSize: 30, marginBottom: 6 }}>🏋️</Text>
                <Text style={styles.emptyRoutineTitle}>No Exercises Scheduled for {DAYS_OF_WEEK.find((d) => d.dayIndex === selectedDay)?.full}</Text>
                <Text style={styles.emptyRoutineSub}>Tap 'Edit Plan' above to add exercises and target muscles.</Text>
              </View>
            ) : (
              currentRoutine.exercises.map((exercise, exIndex) => {
                const sets = getExerciseSets(exercise.id);

                return (
                  <GlassCard key={exercise.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.exTitleRow}>
                          <Text style={styles.exerciseIndex}>#{exIndex + 1}</Text>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          <View style={styles.exMuscleBadge}>
                            <Text style={styles.exMuscleBadgeText}>{exercise.targetMuscle}</Text>
                          </View>
                        </View>
                        <Text style={styles.setsHelpText}>Record 3 sets: Weight (kg) and Reps</Text>
                      </View>
                    </View>

                    {/* 3-Sets Table */}
                    <View style={styles.setsTable}>
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.thText, { width: 50 }]}>SET</Text>
                        <Text style={[styles.thText, { flex: 1 }]}>WEIGHT (KG)</Text>
                        <Text style={[styles.thText, { flex: 1 }]}>REPS</Text>
                        <Text style={[styles.thText, { width: 44, textAlign: 'center' }]}>DONE</Text>
                      </View>

                      {sets.map((s, sIndex) => (
                        <View key={sIndex} style={[styles.setRow, s.completed && styles.setRowCompleted]}>
                          {/* Set number badge */}
                          <View style={styles.setNumCol}>
                            <Text style={styles.setNumText}>Set {sIndex + 1}</Text>
                          </View>

                          {/* Weight input & quick steppers */}
                          <View style={styles.inputCol}>
                            <View style={styles.inputWithStepper}>
                              <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => adjustValue(exercise.id, sIndex, 'weightKg', -2.5)}
                              >
                                <Text style={styles.stepperBtnText}>-</Text>
                              </TouchableOpacity>

                              <TextInput
                                style={styles.numInput}
                                value={s.weightKg}
                                onChangeText={(val) => handleUpdateSet(exercise.id, sIndex, 'weightKg', val)}
                                keyboardType="numeric"
                              />

                              <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => adjustValue(exercise.id, sIndex, 'weightKg', +2.5)}
                              >
                                <Text style={styles.stepperBtnText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Reps input & quick steppers */}
                          <View style={styles.inputCol}>
                            <View style={styles.inputWithStepper}>
                              <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => adjustValue(exercise.id, sIndex, 'reps', -1)}
                              >
                                <Text style={styles.stepperBtnText}>-</Text>
                              </TouchableOpacity>

                              <TextInput
                                style={styles.numInput}
                                value={s.reps}
                                onChangeText={(val) => handleUpdateSet(exercise.id, sIndex, 'reps', val)}
                                keyboardType="numeric"
                              />

                              <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => adjustValue(exercise.id, sIndex, 'reps', +1)}
                              >
                                <Text style={styles.stepperBtnText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Done toggle checkbox */}
                          <TouchableOpacity
                            style={[styles.doneCheckbox, s.completed && styles.doneCheckboxActive]}
                            onPress={() => handleUpdateSet(exercise.id, sIndex, 'completed', !s.completed)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.doneCheckmark}>{s.completed ? '✓' : ''}</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </GlassCard>
                );
              })
            )}

            {/* Bottom Floating Save Button */}
            {currentRoutine.exercises.length > 0 && (
              <TouchableOpacity
                style={styles.bottomSaveActionBtn}
                onPress={handleSaveWorkout}
                activeOpacity={0.8}
              >
                <Text style={styles.bottomSaveActionBtnText}>💾 Save Workout & Update Progression</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ----------------- TAB 2: MUSCLE PROGRESS CHARTS ----------------- */}
        {activeTab === 'CHARTS' && (
          <View>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionHeading}>MUSCLE GROUP ANALYTICS</Text>
              <Text style={styles.chartSubheading}>
                Historical weight progression and rep volume across workouts
              </Text>
            </View>

            {/* Muscle Select Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.musclesScroll}>
              {ALL_MUSCLES.map((muscle) => {
                const isSelected = selectedChartMuscle === muscle;
                return (
                  <TouchableOpacity
                    key={muscle}
                    style={[styles.muscleSelectChip, isSelected && styles.muscleSelectChipActive]}
                    onPress={() => setSelectedChartMuscle(muscle)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.muscleSelectText, isSelected && styles.muscleSelectTextActive]}>
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Main Progress Chart */}
            <MuscleProgressChart muscle={selectedChartMuscle} data={muscleProgress} />

            {/* Recent History Table for this muscle */}
            <View style={styles.historyCard}>
              <Text style={styles.historyCardTitle}>Workout Logs for {selectedChartMuscle}</Text>
              {muscleProgress.length === 0 ? (
                <Text style={styles.emptyHistoryText}>No logged sessions for {selectedChartMuscle} yet.</Text>
              ) : (
                muscleProgress.map((pt, idx) => (
                  <View key={idx} style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyExName}>{pt.exerciseName}</Text>
                      <Text style={styles.historyDate}>{new Date(pt.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.historyWeight}>{pt.maxWeight} kg Max</Text>
                      <Text style={styles.historyReps}>{pt.totalReps} total reps</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNavBar />

      {/* Edit Routine Modal */}
      <Modal visible={isEditRoutineModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Edit {DAYS_OF_WEEK.find((d) => d.dayIndex === selectedDay)?.full} Routine
                </Text>
                <Text style={styles.modalSubtitle}>{currentRoutine.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditRoutineModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Current Exercises list in modal */}
            <Text style={styles.modalSectionLabel}>CURRENT EXERCISES</Text>
            <ScrollView style={{ maxHeight: 180, marginBottom: 16 }}>
              {currentRoutine.exercises.map((ex) => (
                <View key={ex.id} style={styles.modalExRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalExName}>{ex.name}</Text>
                    <Text style={styles.modalExMuscle}>{ex.targetMuscle} • 3 sets</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalDeleteExBtn}
                    onPress={() => handleRemoveExercise(ex.id)}
                  >
                    <Text style={styles.modalDeleteExText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Add Exercise form */}
            <Text style={styles.modalSectionLabel}>ADD NEW EXERCISE</Text>
            <TextInput
              style={styles.modalInput}
              value={newExName}
              onChangeText={setNewExName}
              placeholder="e.g. Incline Bench Press, Hack Squat"
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={styles.modalSectionLabel}>TARGET MUSCLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {ALL_MUSCLES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modalMuscleChip, newExMuscle === m && styles.modalMuscleChipActive]}
                  onPress={() => setNewExMuscle(m)}
                >
                  <Text style={[styles.modalMuscleText, newExMuscle === m && styles.modalMuscleTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalAddBtn}
              onPress={handleAddExerciseToRoutine}
              activeOpacity={0.8}
            >
              <Text style={styles.modalAddBtnText}>+ Add to {DAYS_OF_WEEK.find((d) => d.dayIndex === selectedDay)?.label} Routine</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setIsEditRoutineModalOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
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
  routineEditBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  routineEditBtnText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  weeklyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  todayPill: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  daysScroll: {
    paddingVertical: 6,
    marginBottom: 12,
  },
  dayCard: {
    width: 68,
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    padding: 4,
  },
  dayCardSelected: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  dayCardToday: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dayLabelSelected: {
    color: COLORS.bgDark,
  },
  dayMuscleText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  todayIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.emerald,
    marginTop: 4,
  },
  successBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.emerald,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  successBannerText: {
    color: COLORS.emerald,
    fontSize: 13,
    fontWeight: '800',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
  },
  viewModeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  viewModeBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  viewModeTextActive: {
    color: COLORS.textPrimary,
  },
  routineCard: {
    marginBottom: 14,
    padding: 16,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.emerald,
    letterSpacing: 1,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  targetMusclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  muscleChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  muscleChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  saveWorkoutBtn: {
    backgroundColor: COLORS.emerald,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  saveWorkoutBtnText: {
    color: '#070B14',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyRoutineBox: {
    backgroundColor: 'rgba(21, 29, 45, 0.6)',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  emptyRoutineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyRoutineSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  exerciseCard: {
    marginBottom: 12,
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  exerciseIndex: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emerald,
    marginRight: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  exMuscleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  exMuscleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  setsHelpText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  setsTable: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  thText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  setRowCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  setNumCol: {
    width: 50,
  },
  setNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  inputCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputWithStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 26,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  numInput: {
    flex: 1,
    height: 32,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    padding: 0,
  },
  doneCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  doneCheckboxActive: {
    backgroundColor: COLORS.emerald,
    borderColor: COLORS.emerald,
  },
  doneCheckmark: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '900',
  },
  bottomSaveActionBtn: {
    backgroundColor: COLORS.emerald,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 14,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  bottomSaveActionBtnText: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  // Charts tab
  chartHeader: {
    marginBottom: 10,
  },
  chartSubheading: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  musclesScroll: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  muscleSelectChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  muscleSelectChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.emerald,
  },
  muscleSelectText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  muscleSelectTextActive: {
    color: COLORS.emerald,
    fontWeight: '800',
  },
  historyCard: {
    backgroundColor: 'rgba(21, 29, 45, 0.7)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 10,
  },
  historyCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  historyExName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  historyDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyWeight: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  historyReps: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.emerald,
    marginTop: 2,
    fontWeight: '700',
  },
  modalCloseText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalExRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  modalExName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalExMuscle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalDeleteExBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
  },
  modalDeleteExText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: 12,
  },
  modalMuscleChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalMuscleChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.emerald,
  },
  modalMuscleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  modalMuscleTextActive: {
    color: COLORS.emerald,
  },
  modalAddBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.emerald,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalAddBtnText: {
    color: COLORS.emerald,
    fontSize: 13,
    fontWeight: '800',
  },
  modalDoneBtn: {
    backgroundColor: COLORS.emerald,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '800',
  },
});

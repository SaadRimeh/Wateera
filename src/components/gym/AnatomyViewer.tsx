import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MuscleGroup } from '../../types';
import { COLORS } from '../../constants/theme';
import { GlassCard } from '../common/GlassCard';

interface AnatomyViewerProps {
  selectedMuscle: MuscleGroup | null;
  onSelectMuscle: (muscle: MuscleGroup) => void;
}

const MUSCLE_DATA: { group: MuscleGroup; label: string; icon: string }[] = [
  { group: 'CHEST', label: 'Chest (Pectorals)', icon: '🛡️' },
  { group: 'BACK', label: 'Back (Lats & Traps)', icon: '🦅' },
  { group: 'SHOULDERS', label: 'Shoulders (Deltoids)', icon: '⚡' },
  { group: 'BICEPS', label: 'Biceps', icon: '💪' },
  { group: 'TRICEPS', label: 'Triceps', icon: '🏹' },
  { group: 'LEGS', label: 'Quads & Hamstrings', icon: '🦵' },
  { group: 'ABS', label: 'Core / Abs', icon: '🎯' },
  { group: 'CALVES', label: 'Calves', icon: '👟' },
];

export const AnatomyViewer: React.FC<AnatomyViewerProps> = ({
  selectedMuscle,
  onSelectMuscle,
}) => {
  const [viewAngle, setViewAngle] = useState<'ANTERIOR' | 'POSTERIOR'>('ANTERIOR');

  return (
    <GlassCard style={styles.card} borderColor={COLORS.borderGlass}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Muscle Anatomy Reference</Text>
          <Text style={styles.subtitle}>Target Muscle Group Visualizer</Text>
        </View>

        {/* View Perspective Switcher */}
        <View style={styles.perspectiveToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewAngle === 'ANTERIOR' && styles.toggleActive]}
            onPress={() => setViewAngle('ANTERIOR')}
          >
            <Text style={[styles.toggleText, viewAngle === 'ANTERIOR' && styles.toggleTextActive]}>
              Front
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewAngle === 'POSTERIOR' && styles.toggleActive]}
            onPress={() => setViewAngle('POSTERIOR')}
          >
            <Text style={[styles.toggleText, viewAngle === 'POSTERIOR' && styles.toggleTextActive]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Central 3D Visual Mesh Simulation */}
      <View style={styles.modelContainer}>
        {/* Glow ambient layer */}
        <View
          style={[
            styles.modelGlow,
            selectedMuscle && {
              backgroundColor: 'rgba(16, 185, 129, 0.18)',
              borderColor: COLORS.emerald,
            },
          ]}
        />

        {/* Dynamic Holographic Wireframe Avatar representation */}
        <View style={styles.hologramAvatar}>
          <Text style={styles.hologramHead}>◯</Text>
          <View style={styles.upperBodyRow}>
            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.shoulderLeft,
                selectedMuscle === 'SHOULDERS' && styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle('SHOULDERS')}
            >
              <Text style={styles.segmentText}>DELT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.torsoSegment,
                viewAngle === 'ANTERIOR'
                  ? selectedMuscle === 'CHEST' && styles.highlightedMuscle
                  : selectedMuscle === 'BACK' && styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle(viewAngle === 'ANTERIOR' ? 'CHEST' : 'BACK')}
            >
              <Text style={styles.segmentText}>
                {viewAngle === 'ANTERIOR' ? 'CHEST' : 'BACK'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.shoulderRight,
                selectedMuscle === 'SHOULDERS' && styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle('SHOULDERS')}
            >
              <Text style={styles.segmentText}>DELT</Text>
            </TouchableOpacity>
          </View>

          {/* Arms & Abs */}
          <View style={styles.midBodyRow}>
            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.armSegment,
                selectedMuscle === (viewAngle === 'ANTERIOR' ? 'BICEPS' : 'TRICEPS') &&
                  styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle(viewAngle === 'ANTERIOR' ? 'BICEPS' : 'TRICEPS')}
            >
              <Text style={styles.segmentText}>
                {viewAngle === 'ANTERIOR' ? 'BIC' : 'TRI'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.absSegment,
                selectedMuscle === 'ABS' && styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle('ABS')}
            >
              <Text style={styles.segmentText}>CORE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.armSegment,
                selectedMuscle === (viewAngle === 'ANTERIOR' ? 'BICEPS' : 'TRICEPS') &&
                  styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle(viewAngle === 'ANTERIOR' ? 'BICEPS' : 'TRICEPS')}
            >
              <Text style={styles.segmentText}>
                {viewAngle === 'ANTERIOR' ? 'BIC' : 'TRI'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lower Body (Legs & Calves) */}
          <View style={styles.lowerBodyRow}>
            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.legSegment,
                selectedMuscle === 'LEGS' && styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle('LEGS')}
            >
              <Text style={styles.segmentText}>QUAD</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.legSegment,
                selectedMuscle === 'LEGS' && styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle('LEGS')}
            >
              <Text style={styles.segmentText}>QUAD</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calvesRow}>
            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.calfSegment,
                selectedMuscle === 'CALVES' && styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle('CALVES')}
            >
              <Text style={styles.segmentText}>CALF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.muscleSegment,
                styles.calfSegment,
                selectedMuscle === 'CALVES' && styles.highlightedMuscle,
              ]}
              onPress={() => onSelectMuscle('CALVES')}
            >
              <Text style={styles.segmentText}>CALF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Muscle Indicator pill */}
        <View style={styles.selectedPill}>
          <Text style={styles.selectedPillText}>
            Target:{' '}
            <Text style={{ color: COLORS.emerald, fontWeight: '800' }}>
              {selectedMuscle || 'Tap any muscle group'}
            </Text>
          </Text>
        </View>
      </View>

      {/* Quick Selection Horizontal Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillScroll}
      >
        {MUSCLE_DATA.map((item) => {
          const isSelected = selectedMuscle === item.group;
          return (
            <TouchableOpacity
              key={item.group}
              style={[styles.pill, isSelected && styles.pillActive]}
              activeOpacity={0.7}
              onPress={() => onSelectMuscle(item.group)}
            >
              <Text style={styles.pillIcon}>{item.icon}</Text>
              <Text style={[styles.pillLabel, isSelected && styles.pillLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  perspectiveToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: COLORS.emerald,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: '#070B14',
  },
  modelContainer: {
    height: 240,
    backgroundColor: 'rgba(7, 11, 20, 0.65)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  modelGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  hologramAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  hologramHead: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
  upperBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  midBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  lowerBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  calvesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  muscleSegment: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  shoulderLeft: {
    width: 38,
    height: 28,
    borderTopLeftRadius: 12,
  },
  shoulderRight: {
    width: 38,
    height: 28,
    borderTopRightRadius: 12,
  },
  torsoSegment: {
    width: 58,
    height: 34,
    borderRadius: 8,
  },
  armSegment: {
    width: 28,
    height: 38,
    borderRadius: 6,
  },
  absSegment: {
    width: 50,
    height: 42,
    borderRadius: 8,
  },
  legSegment: {
    width: 32,
    height: 46,
    borderRadius: 8,
  },
  calfSegment: {
    width: 28,
    height: 38,
    borderRadius: 6,
  },
  highlightedMuscle: {
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    borderColor: COLORS.emerald,
    shadowColor: COLORS.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  segmentText: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  selectedPill: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(13, 19, 33, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  selectedPillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  pillScroll: {
    paddingTop: 14,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
  },
  pillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.emerald,
  },
  pillIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillLabelActive: {
    color: COLORS.emerald,
    fontWeight: '700',
  },
});

import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Barbell, Calendar, Clock, Lightning, Info, PencilSimple } from "phosphor-react-native";
import { useGymStore } from "../../store/gymStore";
import { EditTitleModal } from "../../components/gym/EditTitleModal";
import { EditDurationModal } from "../../components/gym/EditDurationModal";
import { ExercisePickerModal } from "../../components/gym/ExercisePickerModal";
import { WorkoutSetRow, WorkoutSetTableHeader } from "../../components/gym/WorkoutSetRow";
import { EmptyState } from "../../components/common/EmptyState";
import { SoftActionButton } from "../../components/common/SoftActionButton";
import { useEditableHeaderTitle } from "../../hooks/useEditableHeaderTitle";
import { cardStyle } from "../../theme/styles";
import { colors } from "../../theme/colors";
import {
  exerciseVolume,
  findLastSetForExercise,
  formatDuration,
  formatLongDate,
  totalVolume,
} from "../../utils/workout";
import type {
  GymStackNavigationProp,
  Workout,
  WorkoutDetailRouteProp,
  WorkoutExercise,
} from "../../types";

export default function WorkoutDetailScreen() {
  const navigation = useNavigation<GymStackNavigationProp>();
  const route = useRoute<WorkoutDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const activeWorkout = useGymStore((s) => s.activeWorkout);
  const recentWorkouts = useGymStore((s) => s.recentWorkouts);
  const renameWorkout = useGymStore((s) => s.renameWorkout);
  const editWorkoutSet = useGymStore((s) => s.editWorkoutSet);
  const addWorkoutSet = useGymStore((s) => s.addWorkoutSet);
  const removeWorkoutSet = useGymStore((s) => s.removeWorkoutSet);
  const setWorkoutDuration = useGymStore((s) => s.setWorkoutDuration);
  const addExerciseToWorkout = useGymStore((s) => s.addExerciseToWorkout);

  const [titleEditOpen, setTitleEditOpen] = useState(false);
  const [durationEditOpen, setDurationEditOpen] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);

  const workout = useMemo<Workout | undefined>(() => {
    if (activeWorkout?.id === route.params.workoutId) return activeWorkout;
    return recentWorkouts.find((w) => w.id === route.params.workoutId);
  }, [activeWorkout, recentWorkouts, route.params.workoutId]);

  const workoutName = workout?.name ?? "";
  const openTitleEdit = useCallback(() => setTitleEditOpen(true), []);
  useEditableHeaderTitle(workoutName, openTitleEdit);

  if (!workout) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Entrenamiento no encontrado.</Text>
      </View>
    );
  }

  const handleAddSet = (ex: WorkoutExercise) => {
    const lastInThis = ex.sets[ex.sets.length - 1];
    const fallback = lastInThis
      ? { weight: lastInThis.weight, reps: lastInThis.reps }
      : findLastSetForExercise(ex.exerciseId, recentWorkouts);
    addWorkoutSet(workout.id, ex.id, fallback?.weight ?? 0, fallback?.reps ?? 0);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Lightning size={36} color={colors.navy} weight="fill" />
          </View>
          <View style={styles.metaRow}>
            <Calendar size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatLongDate(workout.startedAt)}</Text>
            <Text style={styles.metaSep}>·</Text>
            <TouchableOpacity
              onPress={() => setDurationEditOpen(true)}
              style={styles.durationBtn}
              activeOpacity={0.7}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Editar duración. Actualmente ${formatDuration(workout.durationSeconds)}`}
            >
              <Clock size={14} color={colors.navy} />
              <Text style={styles.durationBtnText}>{formatDuration(workout.durationSeconds)}</Text>
              <PencilSimple size={11} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.totalChip}>
            <Text style={styles.totalChipText}>
              {totalVolume(workout).toLocaleString()} kg levantados
            </Text>
          </View>
        </View>

        {workout.exercises.length === 0 ? (
          <EmptyState title="Este entrenamiento no tiene ejercicios." />
        ) : (
          workout.exercises.map((ex) => {
            const completedSets = ex.sets.filter((s) => s.completed).length;
            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <TouchableOpacity
                  style={styles.exerciseHeader}
                  onPress={() =>
                    navigation.navigate("ExerciseDetail", { exerciseId: ex.exerciseId })
                  }
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver detalle de ${ex.exerciseName}`}
                >
                  <View style={styles.exerciseIcon}>
                    <Barbell size={18} color={colors.navy} weight="fill" />
                  </View>
                  <View style={styles.exerciseMain}>
                    <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                    <Text style={styles.exerciseSubtitle}>
                      {completedSets} {completedSets === 1 ? "serie" : "series"} ·{" "}
                      {exerciseVolume(ex).toLocaleString()} kg
                    </Text>
                  </View>
                  <Info size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {ex.sets.length > 0 && (
                  <View style={styles.setsTable}>
                    <WorkoutSetTableHeader />
                    {ex.sets.map((s, i) => (
                      <WorkoutSetRow
                        key={s.id}
                        set={s}
                        index={i}
                        onUpdate={(partial) => editWorkoutSet(workout.id, ex.id, s.id, partial)}
                        onDelete={() => removeWorkoutSet(workout.id, ex.id, s.id)}
                      />
                    ))}
                  </View>
                )}

                <SoftActionButton
                  label="Añadir serie"
                  onPress={() => handleAddSet(ex)}
                  size="sm"
                  style={styles.addSetBtn}
                />
              </View>
            );
          })
        )}

        <SoftActionButton
          label="Añadir ejercicio"
          onPress={() => setExercisePickerOpen(true)}
          size="lg"
          style={styles.addExerciseBtn}
        />
      </ScrollView>

      <EditTitleModal
        visible={titleEditOpen}
        initialValue={workoutName}
        onClose={() => setTitleEditOpen(false)}
        onSave={(next) => renameWorkout(workout.id, next)}
        title="Editar entrenamiento"
      />

      <EditDurationModal
        visible={durationEditOpen}
        initialSeconds={workout.durationSeconds ?? 0}
        onClose={() => setDurationEditOpen(false)}
        onSave={(seconds) => setWorkoutDuration(workout.id, seconds)}
        title="Editar duración"
      />

      <ExercisePickerModal
        visible={exercisePickerOpen}
        onClose={() => setExercisePickerOpen(false)}
        onSelect={(ex) => addExerciseToWorkout(workout.id, ex)}
        onShowDetail={(id) => navigation.navigate("ExerciseDetail", { exerciseId: id })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBg },
  content: { padding: 16 },

  notFound: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFoundText: { color: colors.textMuted, fontSize: 14 },

  hero: { alignItems: "center", paddingVertical: 24 },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  metaText: { fontSize: 13, color: colors.textSecondary },
  metaSep: { fontSize: 13, color: colors.textMuted, marginHorizontal: 4 },
  durationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.navySoftBg,
  },
  durationBtnText: { fontSize: 13, color: colors.textPrimary, fontWeight: "600" },
  totalChip: {
    marginTop: 12,
    backgroundColor: colors.navySoftBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  totalChipText: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },

  exerciseCard: { ...cardStyle, marginTop: 12, padding: 14 },
  exerciseHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseMain: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  exerciseSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  setsTable: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: 10,
  },
  addSetBtn: { marginTop: 12 },
  addExerciseBtn: { marginTop: 16 },
});

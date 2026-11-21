import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Barbell, Info, Timer } from "phosphor-react-native";
import { useGymStore } from "../../store/gymStore";
import { DurationPickerModal } from "./DurationPickerModal";
import { WorkoutSetRow, WorkoutSetTableHeader } from "./WorkoutSetRow";
import { SoftActionButton } from "../common/SoftActionButton";
import { cardStyle } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { formatTime } from "../../utils/workout";
import type { WorkoutExercise, WorkoutSet } from "../../types";

interface ExerciseBlockProps {
  workoutId: string;
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onUpdateSet: (
    _setId: string,
    _partial: Partial<Pick<WorkoutSet, "weight" | "reps" | "completed">>,
  ) => void;
  onDeleteSet: (_setId: string) => void;
  onShowDetail?: () => void;
}

export function ExerciseBlock({
  workoutId,
  exercise,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onShowDetail,
}: ExerciseBlockProps) {
  const restDefaultSeconds = useGymStore((s) => s.restDefaultSeconds);
  const setExerciseRest = useGymStore((s) => s.setExerciseRest);

  const [restPickerOpen, setRestPickerOpen] = useState(false);

  const isCustomRest = exercise.restSeconds !== undefined;
  const effectiveRest = exercise.restSeconds ?? restDefaultSeconds;

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <TouchableOpacity
          style={styles.titleArea}
          onPress={onShowDetail}
          disabled={!onShowDetail}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle de ${exercise.exerciseName}`}
        >
          <View style={styles.exerciseIconSmall}>
            <Barbell size={18} color={colors.navy} weight="fill" />
          </View>
          <Text style={styles.exerciseTitle} numberOfLines={1}>
            {exercise.exerciseName}
          </Text>
          {onShowDetail && <Info size={16} color={colors.textMuted} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRestPickerOpen(true)}
          style={[styles.restChip, isCustomRest && styles.restChipCustom]}
          activeOpacity={0.7}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Cambiar descanso. Actualmente ${formatTime(effectiveRest)}`}
        >
          <Timer
            size={13}
            color={isCustomRest ? colors.textOnDark : colors.textSecondary}
            weight={isCustomRest ? "fill" : "regular"}
          />
          <Text style={[styles.restChipText, isCustomRest && styles.restChipTextCustom]}>
            {formatTime(effectiveRest)}
          </Text>
        </TouchableOpacity>
      </View>

      <WorkoutSetTableHeader />

      {exercise.sets.map((s, i) => (
        <WorkoutSetRow
          key={s.id}
          set={s}
          index={i}
          onUpdate={(partial) => onUpdateSet(s.id, partial)}
          onDelete={() => onDeleteSet(s.id)}
        />
      ))}

      <SoftActionButton label="Añadir serie" onPress={onAddSet} size="md" style={styles.addBtn} />

      <DurationPickerModal
        visible={restPickerOpen}
        onClose={() => setRestPickerOpen(false)}
        initialSeconds={effectiveRest}
        onSave={(seconds) => setExerciseRest(workoutId, exercise.id, seconds)}
        onReset={isCustomRest ? () => setExerciseRest(workoutId, exercise.id, null) : undefined}
        title="Descanso de este ejercicio"
        hint={
          isCustomRest
            ? 'Personalizado. Tocá "Usar default global" para volver al default.'
            : `Default global: ${formatTime(restDefaultSeconds)}. Cambialo si querés un descanso distinto para este ejercicio.`
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: { ...cardStyle, borderRadius: 18, padding: 14, marginBottom: 14 },
  exerciseHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  titleArea: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  exerciseIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  exerciseTitle: { fontSize: 16, fontWeight: "600", color: colors.textPrimary, flexShrink: 1 },

  restChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.pageBg,
  },
  restChipCustom: { backgroundColor: colors.navy },
  restChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    fontVariant: ["tabular-nums"],
  },
  restChipTextCustom: { color: colors.textOnDark },

  addBtn: { marginTop: 12 },
});

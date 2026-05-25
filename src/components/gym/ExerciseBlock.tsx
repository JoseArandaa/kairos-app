import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { Plus, Check, Barbell } from "phosphor-react-native";
import { colors } from "../../theme/colors";
import type { WorkoutExercise } from "../../types";

interface ExerciseBlockProps {
  exercise: WorkoutExercise;
  onAddSet: (_weight: number, _reps: number) => void;
  onToggleSet: (_setId: string) => void;
  onRemoveSet: (_setId: string) => void;
}

export function ExerciseBlock({
  exercise,
  onAddSet,
  onToggleSet,
  onRemoveSet,
}: ExerciseBlockProps) {
  const lastSet = exercise.sets[exercise.sets.length - 1];
  const [weight, setWeight] = useState(lastSet ? String(lastSet.weight) : "");
  const [reps, setReps] = useState(lastSet ? String(lastSet.reps) : "");

  const handleAdd = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (Number.isNaN(w) || Number.isNaN(r) || r <= 0) return;
    onAddSet(w, r);
  };

  const handleConfirmRemove = (setId: string) => {
    Alert.alert("Eliminar serie", "¿Seguro que quieres borrar esta serie?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => onRemoveSet(setId) },
    ]);
  };

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseIconSmall}>
          <Barbell size={18} color={colors.navy} weight="fill" />
        </View>
        <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
      </View>

      <View style={styles.setsHeader}>
        <Text style={[styles.setsHeaderText, { flex: 0.5 }]}>SET</Text>
        <Text style={[styles.setsHeaderText, { flex: 1 }]}>KG</Text>
        <Text style={[styles.setsHeaderText, { flex: 1 }]}>REPS</Text>
        <Text style={[styles.setsHeaderText, { flex: 0.6, textAlign: "right" }]}>✓</Text>
      </View>

      {exercise.sets.map((s, i) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.setRow, s.completed && styles.setRowDone]}
          onPress={() => onToggleSet(s.id)}
          onLongPress={() => handleConfirmRemove(s.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.setCell, styles.setCellNum, { flex: 0.5 }]}>{i + 1}</Text>
          <Text style={[styles.setCell, { flex: 1 }]}>{s.weight}</Text>
          <Text style={[styles.setCell, { flex: 1 }]}>{s.reps}</Text>
          <View style={[styles.setCheckWrap, { flex: 0.6 }]}>
            {s.completed ? (
              <View style={styles.checkDone}>
                <Check size={14} color={colors.textOnDark} weight="bold" />
              </View>
            ) : (
              <View style={styles.checkPending} />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.addSetRow}>
        <View style={{ flex: 0.5 }} />
        <TextInput
          style={[styles.addSetInput, { flex: 1 }]}
          placeholder="kg"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={[styles.addSetInput, { flex: 1 }]}
          placeholder="reps"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={reps}
          onChangeText={setReps}
        />
        <TouchableOpacity
          style={styles.addSetBtn}
          onPress={handleAdd}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Añadir serie"
        >
          <Plus size={18} color={colors.textOnDark} weight="bold" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  exerciseIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.navySoftBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  exerciseTitle: { fontSize: 16, fontWeight: "600", color: colors.textPrimary, flex: 1 },

  setsHeader: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 4 },
  setsHeaderText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    borderRadius: 8,
  },
  setRowDone: { backgroundColor: colors.successBg },
  setCell: { fontSize: 15, color: colors.textPrimary, fontWeight: "500" },
  setCellNum: { color: colors.textMuted },
  setCheckWrap: { alignItems: "flex-end" },
  checkDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  checkPending: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
  },

  addSetRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  addSetInput: {
    backgroundColor: colors.pageBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: "center",
  },
  addSetBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});
